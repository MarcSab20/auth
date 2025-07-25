import { APIClient } from "./api/APIClient.js"; 
import { AuthTokenManager } from "./auth/AuthTokenManager.js";
import { ErrorHandler } from "./utils/ErrorHandler.js";
import { logger } from './utils/Logger.js';
import { i18n } from './i18n/index.js'; 
import { SMPClientOptions } from "./config/SMPConfig.js";
import { ConfigManager } from "./config/ConfigManager.js";
import { Persistence, PersistenceKind } from "./config/Persistence.js";
import { AxiosRequestConfig } from "axios";
import { GraphQLClient, ClientError } from 'graphql-request'; 
import { Service, Organization,Invoice, Estimate, Contract, SMPPayment, Signup, Password, Profile, Location , ManageOrganization, Asset, ServiceAsset, Mailing, Order, Media, WaitingList } from "./controllers/index.js";
import { MagicLink } from "./controllers/MagicLinkController.js";
export class SMPClient {
  public httpApiClient: APIClient; 
  public authTokenManager: AuthTokenManager;
  // [Class]  
  public service: Service;
  public organization: Organization;
  public estimate: Estimate;
  public contract: Contract;
  public invoice: Invoice;
  public smpPayment:SMPPayment
  public signup: Signup;
  public Password: Password;
  public profile: Profile;
  public location: Location;
  public manageOrganization: ManageOrganization;
  public asset: Asset;
  public serviceAsset: ServiceAsset;
  public mailing: Mailing;
  public order: Order;
  public media: Media;
  public waitingList: WaitingList;
  public magicLink: MagicLink;
  


  // public notificationManager: AuthTokenManager;
  private loggedUser?: LogIn;  /// A créer account et mettre en loggedUser dedans
  private loggedApp?: AppLogIn; /// A créer application et mettre en loggedApp dedans
  private wsClient?: WebSocket; 
  private configManager: ConfigManager; 
  constructor(options: SMPClientOptions) { 
    this.configManager = new ConfigManager(options)
    this.httpApiClient    = new APIClient(this.configManager);
     
    // [Class]
    this.service = new Service(this.httpApiClient);
    this.organization = new Organization(this.httpApiClient);
    this.estimate = new Estimate(this.httpApiClient);
    this.contract = new Contract(this.httpApiClient);
    this.invoice = new Invoice(this.httpApiClient);
    this.smpPayment = new SMPPayment(this.httpApiClient);
    this.signup = new Signup(this.httpApiClient);
    this.Password = new Password(this.httpApiClient);
    this.profile = new Profile(this.httpApiClient);
    this.location = new Location(this.httpApiClient);
    this.manageOrganization = new ManageOrganization(this.httpApiClient);
    this.asset = new Asset(this.httpApiClient);
    this.serviceAsset = new ServiceAsset(this.httpApiClient);
    this.mailing = new Mailing(this.httpApiClient);
    this.order = new Order(this.httpApiClient);
    this.media = new Media(this.httpApiClient);
    this.waitingList = new WaitingList(this.httpApiClient);
    this.magicLink = new MagicLink(this.httpApiClient);

    
    this.authTokenManager = new AuthTokenManager(this.configManager, this.httpApiClient);
    this.httpApiClient.updateHeaderAppID(this.configManager.appId);
    this.httpApiClient.updateHeaderAppSecret(this.configManager.appSecret);
    this.httpApiClient.updateHeaderAppAccessToken("");
    if (this.configManager.wsEnabled) {
      this.initWebSocket();
    }
    logger.info(i18n.t('smp_client_init'));
  }

  async authenticateApp(): Promise<void> {
    try {
      const access = await this.getAppAccessToken();
      if (access) {
        logger.info("App already authenticated");
        return;
      }
      const app = await this.authTokenManager.authenticateApp(this.configManager.appId, this.configManager.appSecret);
    } catch (error) {
      ErrorHandler.handleError(error, "APP_AUTH_FAILED");
    }
  }

  async authenticateUser(username: string, password: string) {
    try {
        const access = await this.getUserAccessToken();
        if (access) {
            logger.info("User already authenticated");
        }
        const login = await this.authTokenManager.authenticateUser(username, password);
        console.log("Login succeed");
        console.log(JSON.stringify(login));
        if (login) {
            this.loggedUser = login;
            this.configManager.loggedUser = login.user;
        }
    }
    catch (error) {
        ErrorHandler.handleError(error, "USER_AUTH_FAILED");
    }
    return this.loggedUser;
}

  async getAppAccessToken(){
    try {
      return await this.authTokenManager.getAppAccessToken();
    } catch (error) {
      return "";
    }
  }

  async getUserAccessToken(){
    try {
      return await this.authTokenManager.getUserAccessToken();
    } catch (error) {
      return null
    }
  }

  async getAppRefreshToken(){
    try {
      return await this.authTokenManager.getAppRefreshToken();
    } catch (error) {
      ErrorHandler.handleError(error, "APP_RETRIEVED_REFRESH_TOKEN_FAILED");
    }
  }

  async getUserRefreshToken(){
    try {
      return await this.authTokenManager.getUserRefreshToken();
    } catch (error) {
      ErrorHandler.handleError(error, "USER_RETRIEVED_REFRESH_TOKEN_FAILED");
    }
  }

  async logoutApp(){
    try {
      if (!this.loggedApp?.app?.applicationID) {
        throw new Error("Application ID non trouvé dans les données récupérées !");
      }
      return await this.authTokenManager.logoutApp(this.loggedApp.app.applicationID);
    } catch (error) {
      ErrorHandler.handleError(error, "USER_RETRIEVED_REFRESH_TOKEN_FAILED");
    }
  }


  async logoutUser() {
    try {
        // Récupération des données utilisateur  le localStorage
        const storedUser = localStorage.getItem("smp_user_0");
        const refreshToken = localStorage.getItem("smp_user_refresh_token");

        if (!storedUser) {
            throw new Error("No user data found in local storage !");
        }

        if (!refreshToken) {
            throw new Error("No refresh token found in local storage !");
        }
        const parsedUser = JSON.parse(storedUser);

        if (!parsedUser || !parsedUser.userID) {
            throw new Error("No user ID found in user data !");
        }
        await this.authTokenManager.logoutUser(parsedUser.userID, refreshToken);
        // Supprime les données utilisateur connecté
        localStorage.removeItem("smp_user_0");
        this.loggedUser = undefined;
        console.log("Déconnexion réussie");
    } catch (error) {
        ErrorHandler.handleError(error, "USER_RETRIEVED_REFRESH_TOKEN_FAILED");
        throw error;
    }
}

  // Méthode pour initier une connexion WebSocket pour les notifications
  private initWebSocket() {
    this.wsClient = new WebSocket(`wss://${this.configManager.apiUrl}/subscriptions`);
    
    this.wsClient.onopen = () => {
      console.log('WebSocket connection established.');
      this.wsClient?.send(JSON.stringify({
        query: `
          subscription {
            notificationReceived {
              message
              timestamp
            }
          }
        `
      }));
    };

    this.wsClient.onmessage = (event) => {
      const data = JSON.parse(event.data);
      this.httpApiClient.trackDataReceived(event.data.length);
      console.log('Notification received:', data);
    };

    this.wsClient.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    this.wsClient.onclose = () => {
      console.log('WebSocket connection closed.');
    };
  }

  public updateHeaderUserAccessToken(accesToken: string): GraphQLClient {
    return this.httpApiClient.updateHeaderUserAccessToken(accesToken);
  }


  public resetHeadersForUser(): void {
    this.httpApiClient.resetHeadersForUser();
  }

  async query<T>(query: string, variables?: any): Promise<T> {
    return await this.httpApiClient.query<T>(query, variables);
  }

  async post<T>(url: string = this.configManager.apiUrl, data: any, config?: AxiosRequestConfig): Promise<T> {
    return await this.httpApiClient.post<T>(url, data, config);
  }

  async get<T>(url: string = this.configManager.apiUrl, config?: AxiosRequestConfig): Promise<T> {
    return await this.httpApiClient.get<T>(url, config);
  }

  // Méthode pour vérifier la limite de débit avant d'effectuer une requête
  public checkRateLimit(): boolean {
    return this.httpApiClient.checkRateLimit();
  }

  // Méthode pour suivre la quantité de données envoyées
  public trackDataSent(dataSize: number): boolean {
    return this.httpApiClient.trackDataSent(dataSize);
  }

  // Méthode pour suivre la quantité de données reçues
  public trackDataReceived(dataSize: number): boolean {
    return this.httpApiClient.trackDataReceived(dataSize);
  }

  printState(){
    console.log("SMPClient State:");
    console.log("  AppId: ", this.configManager.appId);
    console.log("  AppSecret: ", this.configManager.appSecret);
    console.log("  AuthToken: ", this.authTokenManager);
    console.log("  Persistence: ", this.configManager.persistence);
    console.log("  Default Language: ", this.configManager.defaultLanguage);
  }
  
  clean(){
    
  }
}

