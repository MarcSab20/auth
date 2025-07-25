import axios, { AxiosRequestConfig, AxiosInstance } from 'axios';
import { GraphQLClient, ClientError } from 'graphql-request'; 
import { ConfigManager } from '../config/ConfigManager.js';
import { ErrorHandler } from "../utils/ErrorHandler.js";
import { logger } from '../utils/Logger.js';

/**
 * Interface unifiée pour interagir avec les API REST et GraphQL.
 */
export class APIClient {
  private restClient: AxiosInstance;
  private graphqlClient: GraphQLClient;
  private config: ConfigManager; 
  private requestCount: number = 0;
  private requestWindowStart: number = Date.now(); 
  private dataSent: number = 0;
  private dataReceived: number = 0;
  private dataWindowStart: number = Date.now();
  constructor(config: ConfigManager) {
    this.config = config; 
    this.restClient = axios.create({
      baseURL: config.apiUrl,
    }); 
    this.graphqlClient = new GraphQLClient(config.graphqlUrl);
    this.setupInitialHeaders();
  }

  private setupInitialHeaders(): void {
    this.graphqlClient = this.graphqlClient.setHeaders({
      'Content-Type': 'application/json',
      'X-Client-Name': 'smp-sdk-ts',
      'X-Client-Version': '1.0.0'
    });
  }

  /**
   * updateHeaderAppSecret  
  */
   public updateHeaderAppSecret(secret: string): GraphQLClient {
    this.graphqlClient = this.graphqlClient.setHeader("X-App-Secret", secret);
    return this.graphqlClient;
  }

  public updateHeaderAppID(appId: string): GraphQLClient {
    this.graphqlClient = this.graphqlClient.setHeader("X-App-ID", appId);
    return this.graphqlClient;
  }

  public updateHeaderAppAccessToken(token: string): GraphQLClient {
    if (token) {
      this.graphqlClient = this.graphqlClient.setHeader("X-App-Token", token);
    }
    return this.graphqlClient;
  }

    public resetHeaderAppSecret(): void {
    this.graphqlClient = this.graphqlClient.setHeader("x-services-app-token", "");
  }

  public resetHeaderAppID(): void {
    this.graphqlClient = this.graphqlClient.setHeader("x-services-app-id", "");
  }

  public resetHeaderAppAccessToken(): void {
    this.graphqlClient = this.graphqlClient.setHeader("x-services-app-access", "");
  }

  public resetHeadersForApplication(): void {
    this.graphqlClient = this.graphqlClient.setHeader("X-App-Token", "");
    this.graphqlClient = this.graphqlClient.setHeader("X-App-ID", "");
    this.graphqlClient = this.graphqlClient.setHeader("X-App-Secret", "");
  }

  /**
  * updateHeaderAppAuthN
  */
  public updateHeaderUserAccessToken(accessToken: string): GraphQLClient {
    if (accessToken) {
      this.graphqlClient = this.graphqlClient.setHeader("Authorization", `Bearer ${accessToken}`);
    }
    return this.graphqlClient;
  }


  public resetHeadersForUser(): void {
    this.graphqlClient = this.graphqlClient.setHeader("Authorization", "");
  }

  public debugHeaders(): void {
    console.log(" Headers actuels:", this.graphqlClient.requestConfig.headers);
  }

  async mutate<T>(mutation: string, variables?: any): Promise<T> {
    try {
      this.checkRateLimit(); 
      const body = JSON.stringify({ mutation, variables });
      this.trackDataSent(body.length);
      this.debugHeaders(); 
      
      const response = await this.graphqlClient.request<T>(mutation, variables);
      console.log(response);
      
      const respJson = JSON.stringify(response);
      this.trackDataReceived(respJson.length);
      logger.info(`${this.dataReceived}`);
      
      return response;
    } catch (error: any) {
      console.error(error);
      
      if (error.response?.errors) {
        console.error( error.response.errors);
      }
      
      const ce: ClientError = error;
      throw ce;
    }
  }
  
  async query<T>(query: string, variables?: any): Promise<T> {
    try {
      this.checkRateLimit();
      const body = JSON.stringify({ query, variables });
      this.trackDataSent(body.length);
      this.debugHeaders(); 
      
      const response = await this.graphqlClient.request<T>(query, variables);
      
      const respJson = JSON.stringify(response);
      this.trackDataReceived(respJson.length);
      logger.info(`${this.dataReceived}`);
      
      return response;
    } catch (error: any) {
      console.error(error);
      
      if (error.response?.errors) {
        console.error(error.response.errors);
      }
      
      const ce: ClientError = error;
      throw ce;
    }
  }

  async post<T>(url: string = this.config.apiUrl, data: any, config?: AxiosRequestConfig): Promise<T> {
    try {
      this.checkRateLimit(); // Check rate limit before making the request
      const body = JSON.stringify(data);
      this.trackDataSent(body.length);
      const response = await this.restClient.post<T>(url, data, config);
      const respJson = JSON.stringify(response.data);
      logger.info(`POST ClientResponse:++++++++++-----%%%%%%%% ${respJson}`);
      this.trackDataReceived(respJson.length);
      return response.data;
    } catch (error) {
      ErrorHandler.handleError(error, "POST_ERROR");
      throw error;
    }
  }

  async get<T>(url: string = this.config.apiUrl, config?: AxiosRequestConfig): Promise<T> {
    try {
      this.checkRateLimit(); // Check rate limit before making the request
      const response = await this.restClient.get<T>(url, config);
      const respJson = JSON.stringify(response.data);
      logger.info(` GET ClientResponse:##########-----%%%%%%%% ${respJson}`);
      this.trackDataReceived(respJson.length);
      return response.data;
    } catch (error) {
      ErrorHandler.handleError(error, 'NETWORK_ERROR');
      throw error;
    }
  }

  // Méthode pour vérifier la limite de débit avant d'effectuer une requête
  public checkRateLimit(): boolean {
    const now = Date.now();
    if (this.config.rateLimits && now - this.requestWindowStart > this.config.rateLimits!.windowMs) {
      this.requestCount = 0;
      this.requestWindowStart = now;
    }

    if (this.config.rateLimits && this.requestCount >= this.config.rateLimits!.maxRequests) {
      throw new Error(this.config.rateLimits!.message || 'Rate limit exceeded');
    }

    this.requestCount += 1;
    return true;
  }

  // Méthode pour suivre la quantité de données envoyées
  public trackDataSent(dataSize: number): boolean {
    const now = Date.now();

    if (this.config.dataLimits && now - this.dataWindowStart > this.config.dataLimits!.windowMs) {
      this.dataSent = 0;
      this.dataWindowStart = now;
    }

    if (this.config.dataLimits && this.dataSent + dataSize > this.config.dataLimits!.maxDataSent) {
      this.dataSent += dataSize;
      throw new Error('Data sent limit exceeded');
    }

    this.dataSent += dataSize;
    return true;
  }

  // Méthode pour suivre la quantité de données reçues
  public trackDataReceived(dataSize: number): boolean {
    const now = Date.now();

    if (this.config.dataLimits && now - this.dataWindowStart > this.config.dataLimits!.windowMs) {
      this.dataReceived = 0;
      this.dataWindowStart = now;
    }

    if (this.config.dataLimits && this.dataReceived + dataSize > this.config.dataLimits!.maxDataReceived) {
      throw new Error('Data received limit exceeded');
    }

    this.dataReceived += dataSize;
    return true;
  }

}