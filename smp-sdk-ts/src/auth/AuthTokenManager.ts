
import { ConfigManager } from "../config/ConfigManager.js"; 
import { AuthTokenStorage } from "./AuthTokenStorage.js";
import { TokenStorage, TokenStorageKind } from "./TokenStorageType.js"; 
import { APIClient } from "../api/APIClient.js";
import { MUTATION_AUTH_APP, MUTATION_AUTH_LOGOUT_APP, MUTATION_AUTH_LOGOUT_USER, MUTATION_AUTH_USER, 
  MUTATION_REFRESH_APP_TOKEN, MUTATION_REFRESH_USER_TOKEN } from "../api/graphql/mutations/authMutations.js";
import { ErrorHandler } from "../utils/ErrorHandler.js";
import { logger } from '../utils/Logger.js';

interface TokenDataResponse {
    accessToken: string;
    refreshToken?: string;
    expiresIn: number;
}

export class AuthTokenManager {
  private appTokenStorage: TokenStorage;
  private userTokenStorage: TokenStorage;
  private configManager: ConfigManager;
  private apiClient: APIClient;
  // private userTokenRefreshExpiresAt?: number; // TODO use it to invalidate user refresh token
  // private appTokenRefreshExpiresAt?: number; // TODO use it to invalidate app refresh token 
  private userTokenExpiresAt?: number;
  private appTokenExpiresAt?: number;
  private appRefreshInterval?: NodeJS.Timeout;
  private userRefreshInterval?: NodeJS.Timeout;

  constructor(configManager: ConfigManager, apiClient: APIClient) { 
    this.apiClient = apiClient;
    this.configManager = configManager; 
    this.appTokenStorage = new AuthTokenStorage(AuthTokenStorage.AppKind, configManager.storage!);
    this.userTokenStorage = new AuthTokenStorage(AuthTokenStorage.UserKind, configManager.storage!);
    this.apiClient.updateHeaderAppID(this.configManager.appId);
    this.apiClient.updateHeaderAppSecret(this.configManager.appSecret);
  }

  private isUserTokenExpired(): boolean {
    if (!this.userTokenExpiresAt) {
      return true;
    }
    const now = Date.now();
    return now >= this.userTokenExpiresAt;
  }

  private isAppTokenExpired(): boolean {
    if (!this.appTokenExpiresAt) {
      return true;
    }
    const now = Date.now();
    return now >= this.appTokenExpiresAt;
  }

  public async authenticateApp(appId: string, appSecret: string): Promise<AppLogIn> { 
    try {
      const appLogin = { appID: appId, appKey: appSecret };
      const response = await this.apiClient.query<AppLoginResponse>(MUTATION_AUTH_APP, { appLoginInput: appLogin });

      const accessToken = response.authenticateApp.accessToken;
      const refreshToken = response.authenticateApp.refreshToken;
      const expiresInMilli = 1000 * response.authenticateApp.accessValidityDuration;
      this.appTokenStorage.saveRefreshToken(refreshToken);
      this.appTokenStorage.saveAccessToken(accessToken);
      // Register the new access to the future queries
      this.apiClient.updateHeaderAppAccessToken(accessToken);

      const refreshDuration = this.configManager.appAccessDuration < expiresInMilli ? 
      this.configManager.appAccessDuration : expiresInMilli;

      this.appTokenExpiresAt = Date.now() + expiresInMilli;
      this.scheduleTokenRefresh(refreshDuration, AuthTokenStorage.AppKind);
      return response.authenticateApp;
    } catch (error) {
      throw ErrorHandler.handleError(error, "APP_AUTH_FAILED");
    }
  }

  public async authenticateUser(username: string, password: string): Promise<LogIn> { 
    try {
      const response = await this.apiClient.query<LoginResponse>(MUTATION_AUTH_USER, { loginInput: { email: username, password } });
      // const { accessToken, refreshToken, accessValidityDuration } = response.user;
      const accessToken = response.login.accessToken;
      const refreshToken = response.login.refreshToken;
      const expiresInMilli = 1000 * response.login.accessValidityDuration;
      this.userTokenStorage.saveRefreshToken(refreshToken);
      this.userTokenStorage.saveAccessToken(accessToken);
      // Register the new access to the future queries
      this.apiClient.updateHeaderUserAccessToken(accessToken);

      const refreshDuration = this.configManager.userAccessDuration < expiresInMilli ? 
      this.configManager.userAccessDuration : expiresInMilli;

      this.userTokenExpiresAt = Date.now() + expiresInMilli;
      this.scheduleTokenRefresh(refreshDuration, AuthTokenStorage.UserKind);
      return response.login
    } catch (error) {
      throw ErrorHandler.handleError(error, "USER_AUTH_FAILED");
    }
  }

  public getAppRefreshToken(): string | null {
    return this.appTokenStorage.getRefreshToken()
  }

  public getUserRefreshToken(): string | null {
    return this.userTokenStorage.getRefreshToken()
  }

    // Récupérer le token d'accès actuel ou rafraîchir s'il a expiré
  public async getUserAccessToken(): Promise<string>{
    const accessToken = this.userTokenStorage.getAccessToken() || '';
    if (this.isUserTokenExpired() || !accessToken) {
      logger.info('User Access token expired, refreshing...');
      await this.refreshUserAccessToken(); 
    }
    return accessToken;
  }

  public async getAppAccessToken(): Promise<string> {
    const accessToken = this.appTokenStorage.getAccessToken() || '';
     if (this.isAppTokenExpired() ||  !accessToken) {
      logger.info('App Access token expired, refreshing...');
      await this.refreshAppAccessToken();
      return this.appTokenStorage.getAccessToken() || '';
    }
    return accessToken;
  }

  /**
  *
  */
  private async refreshUserAccessToken(): Promise<void> { 
    const refreshToken = this.userTokenStorage.getRefreshToken();
    if (!refreshToken) {
      throw new Error('No user refresh token available');
    } else {
      logger.info(`Refresh Token USED ${Date.now().toLocaleString()}: ${refreshToken}\n\n`);
    }

      const response = await this.apiClient.query<{refreshUserToken: TokenDataResponse}>(MUTATION_REFRESH_USER_TOKEN, {refreshToken});
      
      console.log("REFRESH TOKEN RESPONSE", JSON.stringify(response.refreshUserToken, null, 2));
      const accessToken  = response.refreshUserToken.accessToken;
      const expiresIn = response.refreshUserToken.expiresIn;
      const expiresInMilli  = expiresIn * 1000;
      const refreshDuration = this.configManager.userAccessDuration < expiresInMilli ? 
      this.configManager.userAccessDuration : expiresInMilli;
  
      this.userTokenStorage.saveAccessToken(accessToken);
      this.apiClient.updateHeaderUserAccessToken(accessToken);
      logger.info(`Refresh User token, new token: ${accessToken}`);
      this.userTokenExpiresAt = Date.now() + expiresInMilli;
      this.scheduleTokenRefresh(refreshDuration, AuthTokenStorage.UserKind);
      return;

  }

  /**
   * 
   */
  private async refreshAppAccessToken(): Promise<void> { 
    const refreshToken = this.userTokenStorage.getRefreshToken();

    if (!refreshToken) {
      throw new Error('No app refresh token available');
    }

    const response = await this.apiClient.query<TokenDataResponse>(MUTATION_REFRESH_APP_TOKEN, {refreshToken});
    const { accessToken, expiresIn } = response;
    const expiresInMilli  = expiresIn * 1000;
    const refreshDuration = this.configManager.userAccessDuration < expiresInMilli ? 
    this.configManager.userAccessDuration : expiresInMilli;

    this.userTokenStorage.saveAccessToken(accessToken);
    // Register the new access to the future queries
    this.apiClient.updateHeaderAppAccessToken(accessToken);
    this.userTokenExpiresAt = Date.now() + expiresInMilli;
    this.scheduleTokenRefresh(refreshDuration, AuthTokenStorage.UserKind);
  }

  /**
   * scheduleAppTokenRefresh
   */
  private scheduleTokenRefresh(refreshDuration: number, type: TokenStorageKind): void { 
    const tokenExpiresAt  = type === AuthTokenStorage.AppKind ? this.appTokenExpiresAt : this.userTokenExpiresAt;
    const refreshInterval = type === AuthTokenStorage.AppKind ? this.appRefreshInterval : this.userRefreshInterval
    if (!tokenExpiresAt) {
      return;
    }

    const now = Date.now();
    const timeUntilExpiration = tokenExpiresAt - now ;

    if (refreshInterval) {
      clearTimeout(refreshInterval);
    }
    const triggerTime = 3600 // timeUntilExpiration - refreshDuration;
    console.error(`tokenExpiresAt: ${tokenExpiresAt} TimeUntilExpiration: ${timeUntilExpiration} Refresh Token ${refreshDuration} milli second`)
    console.error(`SCHEDULE TO RUN ${triggerTime} milli second`)
    // Rafraîchir le token juste avant son expiration
    const timeOutInterval = setTimeout(() => type === AuthTokenStorage.AppKind ? console.warn("Refraiching APP TOKEN") : this.refreshUserAccessToken(), 
    triggerTime);
  }

    // Déconnexion de l'utilisateur
 // Déconnexion de l'utilisateur
 async logoutUser(userID: number, refreshToken: string) {
  try {
      const query = MUTATION_AUTH_LOGOUT_USER;
      const variables = {
          input: { userID, refreshToken },
      };

      console.log("LOGOUT USER - Start of logout ");
      await this.apiClient.query(query, variables);

      // Suppression des tokens
      this.userTokenStorage.clearTokens();
      this.clearScheduledRefresh(AuthTokenStorage.UserKind);

      this.apiClient.resetHeadersForUser();
      this.userTokenExpiresAt = undefined;

      console.log("logout successful");
  } catch (error) {
      console.error("Error during logout", error);
      throw new Error("logout failed, please try again");
  }
}
  
    // Déconnexion de l'app
  public async logoutApp(appID: string): Promise<void> {
    const query = MUTATION_AUTH_LOGOUT_APP;

    await this.apiClient.query(query, { appID });

    this.appTokenStorage.clearTokens();
    this.clearScheduledRefresh(AuthTokenStorage.AppKind);
    this.apiClient.resetHeadersForApplication();
    this.appTokenExpiresAt = undefined;
  }

  // Clean planed tasj
  private clearScheduledRefresh(storageType: TokenStorageKind = AuthTokenStorage.UserKind): void {
    if(storageType === AuthTokenStorage.AppKind) {
      if (this.appRefreshInterval) {
      clearTimeout(this.appRefreshInterval);
      this.appRefreshInterval = undefined;
      }
    } else {
      if (this.userRefreshInterval) {
        clearTimeout(this.userRefreshInterval);
        this.userRefreshInterval = undefined;
      }
    }
  }
}

