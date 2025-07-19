
import { SupportedLang, defaultLanguage } from '../i18n/languages.js';
import { Persistence, PersistenceKind, PersistenceType } from './Persistence.js';
import { DataLimitOptions, RateLimitOptions, SMPClientOptions, SMPToken } from './SMPConfig.js';

/**
 * Gère la configuration de la SDK.
 */
export class ConfigManager {
  appId                 : string = "";
  appSecret             : string = "";
  apiUrl                : string = "";
  graphqlUrl            : string = "https://dev-catalog.sh1.hidora.net/";
  defaultLanguage       : SupportedLang = defaultLanguage;
  persistence           : PersistenceKind = Persistence.LocalStorageKind;
  rateLimits?           : RateLimitOptions;  // Limit de frequentes d'appel de l'API
  dataLimits?           : DataLimitOptions; // Limites de quantité de données échangées
  storage?              : PersistenceType;
  requestWindowStart    : number  = Date.now();
  dataWindowStart       : number  = Date.now();
  wsEnabled             : boolean = false;
  appToken?             : SMPToken;
  userToken?            : SMPToken;
  loggedUser?           : UserLoggedIn;
  wsClient?             : WebSocket;
  requestCount          : number  = 0;
  dataSent              : number  = 0;
  dataReceived          : number  = 0;
  appAccessDuration     : number  = 0; // configurable duration for app token refresh
  userAccessDuration    : number  = 0; // configurable duration for user token refresh
  minUserAccessDuration : number  = 0; // enforced by backend
  minAppAccessDuration  : number  = 0; // enforced by backend

  constructor(options:SMPClientOptions) {
    this.appId = options.appId;
    this.appSecret = options.appSecret;
    this.appAccessDuration = options.appAccessDuration;
    this.userAccessDuration = options.userAccessDuration;
    this.minUserAccessDuration = options.minUserAccessDuration;
    this.minAppAccessDuration = options.minAppAccessDuration;
    this.apiUrl = options.apiUrl;
    this.graphqlUrl = options.graphqlUrl;
    this.defaultLanguage = options.defaultLanguage ?? defaultLanguage;
    this.persistence = options.persistence;
    this.storage = options.storage; 
    this.rateLimits = options.rateLimits || { maxRequests: 1000, windowMs: 60000 };
    this.dataLimits = options.dataLimits || { maxDataSent: 1024 * 1024, maxDataReceived: 1024 * 1024, windowMs: 60000 };
    this.wsEnabled = options.wsEnabled || false;
    const now = new Date();
    this.loggedUser = {   
        userID: 0,
        uniqRef: '',
        slug: '',
        username: '',
        email: '',
        plan: '',
        profileID: 0,
        lastLogin: now,
        loginDuration: 0,
        state: '',
        createdAt: now,
        updatedAt: now,
        twoFactorEnabled: false, 
    };  
    this.appToken = {
      accessToken: '',
      refreshToken: '',
      expiresIn: 0,
    }
    this.appToken = {
      accessToken: '',
      refreshToken: '',
      expiresIn: 0,
    };
  }

  /**
   * setLoggedUser
    */
  public setUser(user: UserLoggedIn) {
    this.loggedUser = user;
  }

  /**
   * setUserTokens
    */
  public setUserTokens(userTokens: SMPToken) {
    this.userToken = userTokens;
  }

  /**
   * setAppTokens
    */
  public setAppTokens(appTokens: SMPToken) {
    this.appToken = appTokens;
  }

  public getLoggedUser(): UserLoggedIn | undefined {
    return this.loggedUser;
  }

  /**
   * getStorage
   */
  public getStorage() {
    return this.storage;
  }

  public getUrl(){
    return this.apiUrl;
  }
}
