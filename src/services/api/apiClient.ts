// src/services/api/apiClient.ts
import axios, { AxiosInstance, AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
import { APIResponse, APIError, RequestConfig, API_ENDPOINTS } from '@/types/api';

class APIClient {
  private client: AxiosInstance;

  constructor() {
    // Client unique pour KrakenD
    this.client = this.createClient(API_ENDPOINTS.KRAKEND_BASE, {
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Request-ID': this.generateRequestId(),
        'X-Trace-ID': this.generateTraceId(),
      }
    });

    this.setupInterceptors();
  }

  private createClient(baseURL: string, config: AxiosRequestConfig): AxiosInstance {
    return axios.create({
      baseURL,
      ...config,
    });
  }

  private setupInterceptors(): void {
    this.setupTokenInterceptors();
    this.setupErrorInterceptors();
  }

  private setupTokenInterceptors(): void {
    // Request interceptor - ajouter le token automatiquement
    this.client.interceptors.request.use(
      (config) => {
        const token = this.getStoredToken();
        if (token) {
          config.headers.set('Authorization', `Bearer ${token}`);
        }
        
        // Ajouter des headers de traçabilité
        config.headers.set('X-Request-ID', this.generateRequestId());
        config.headers.set('X-Trace-ID', this.generateTraceId());
        
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor - gérer refresh token
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

        if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const newToken = await this.refreshTokenIfNeeded();
            if (newToken) {
              // Créer une nouvelle requête avec le nouveau token
              const newRequest = {
                ...originalRequest,
                headers: {
                  ...originalRequest.headers,
                  Authorization: `Bearer ${newToken}`
                }
              };
              return this.client(newRequest);
            }
          } catch (refreshError) {
            // Refresh failed, redirect to login
            this.handleAuthenticationFailure();
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );
  }

  private setupErrorInterceptors(): void {
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        const apiError = this.handleAPIError(error);
        return Promise.reject(apiError);
      }
    );
  }

  private handleAPIError(error: AxiosError): APIError {
    const response = error.response;
    
    // Erreur réseau
    if (!response) {
      return new APIError(
        'Erreur de connexion au serveur',
        'NETWORK_ERROR',
        0
      );
    }

    // Erreur du serveur avec réponse structurée
    const data = response.data as any;
    
    if (data && typeof data === 'object') {
      return new APIError(
        data.message || data.error || 'Une erreur est survenue',
        data.code || `HTTP_${response.status}`,
        response.status,
        {
          errors: data.errors,
          field: data.field,
          ...data
        }
      );
    }

    // Erreur HTTP standard
    const statusMessages: Record<number, string> = {
      400: 'Requête invalide',
      401: 'Non autorisé',
      403: 'Accès interdit',
      404: 'Ressource non trouvée',
      409: 'Conflit de données',
      422: 'Données invalides',
      429: 'Trop de requêtes',
      500: 'Erreur interne du serveur',
      502: 'Service temporairement indisponible',
      503: 'Service indisponible',
    };

    return new APIError(
      statusMessages[response.status] || 'Erreur inconnue',
      `HTTP_${response.status}`,
      response.status
    );
  }

  private async refreshTokenIfNeeded(): Promise<string | null> {
    const refreshToken = this.getStoredRefreshToken();
    
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    try {
      // Faire l'appel de refresh directement avec axios pour éviter les intercepteurs
      const response = await axios.post(
        `${API_ENDPOINTS.KRAKEND_BASE}${API_ENDPOINTS.AUTH.REFRESH}`,
        { refreshToken },
        {
          headers: { 'Content-Type': 'application/json' }
        }
      );

      const data = response.data as APIResponse<{ accessToken: string; refreshToken?: string }>;
      
      if (data.success && data.data) {
        const { accessToken, refreshToken: newRefreshToken } = data.data;
        this.storeTokens(accessToken, newRefreshToken);
        return accessToken;
      }
      
      throw new Error('Token refresh failed');
    } catch (error) {
      this.clearStoredTokens();
      throw error;
    }
  }

  private getStoredToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('access_token');
    }
    return null;
  }

  private getStoredRefreshToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('refresh_token');
    }
    return null;
  }

  private storeTokens(accessToken: string, refreshToken?: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('access_token', accessToken);
      if (refreshToken) {
        localStorage.setItem('refresh_token', refreshToken);
      }
    }
  }

  private clearStoredTokens(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
    }
  }

  private handleAuthenticationFailure(): void {
    this.clearStoredTokens();
    
    // Émettre un événement pour que les contextes puissent réagir
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('auth:logout'));
    }
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateTraceId(): string {
    return `trace_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Méthodes utilitaires publiques
  public async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.get<APIResponse<T>>(url, config);
    return this.extractData(response);
  }

  public async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.post<APIResponse<T>>(url, data, config);
    return this.extractData(response);
  }

  public async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.put<APIResponse<T>>(url, data, config);
    return this.extractData(response);
  }

  public async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.delete<APIResponse<T>>(url, config);
    return this.extractData(response);
  }

  private extractData<T>(response: AxiosResponse<APIResponse<T>>): T {
    const { data } = response;
    
    if (!data.success) {
      throw new APIError(data.error || 'Request failed');
    }
    
    return data.data as T;
  }

  // Accès direct au client Axios si nécessaire
  public get instance(): AxiosInstance {
    return this.client;
  }
}

// Instance singleton
const apiClient = new APIClient();
export default apiClient;