// auth/src/services/GraphQLService.ts - Service GraphQL adaptatif

import { AUTH_CONFIG } from '@/src/config/auth.config';

export interface GraphQLResponse<T> {
  data?: T;
  errors?: Array<{
    message: string;
    locations?: Array<{ line: number; column: number }>;
    path?: Array<string | number>;
  }>;
}

export class GraphQLService {
  private graphqlUrl: string;
  private appToken: string | null = null;

  constructor() {
    this.graphqlUrl = AUTH_CONFIG.GRAPHQL_URL;
  }

  // 🔧 Authentification de l'application avec votre backend
  async authenticateApp(): Promise<{ success: boolean; token?: string; error?: string }> {
    console.log('🔧 [GRAPHQL] Authenticating app...');

    try {
      const mutation = `
        mutation AuthenticateApp($appLoginInput: AppLoginInput!) {
          authenticateApp(input: $appLoginInput) {
            accessToken
            refreshToken
            accessValidityDuration
            application {
              applicationID
            }
            message
            errors
          }
        }
      `;

      const variables = {
        appLoginInput: {
          appID: AUTH_CONFIG.AUTH_APP.APP_ID,
          appKey: AUTH_CONFIG.AUTH_APP.APP_SECRET
        }
      };

      const response = await this.makeRequest<{
        authenticateApp: {
          accessToken: string;
          refreshToken: string;
          accessValidityDuration: number;
          application: { applicationID: string };
          message: string;
          errors: string[];
        }
      }>(mutation, variables);

      if (response.data?.authenticateApp?.accessToken) {
        this.appToken = response.data.authenticateApp.accessToken;
        console.log('✅ [GRAPHQL] App authenticated successfully');
        
        // Stocker le token pour les futures requêtes
        localStorage.setItem('smp_app_access_token', this.appToken);
        
        return { 
          success: true, 
          token: this.appToken 
        };
      } else {
        const errors = response.data?.authenticateApp?.errors || response.errors?.map(e => e.message) || ['Unknown error'];
        throw new Error('App authentication failed: ' + errors.join(', '));
      }
    } catch (error: any) {
      console.error('❌ [GRAPHQL] App authentication failed:', error);
      return { 
        success: false, 
        error: error.message || 'Authentication failed' 
      };
    }
  }

  // 🔧 Création d'utilisateur avec les bons noms selon votre backend
  async createUser(userData: {
    username: string;
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
  }): Promise<{ success: boolean; userID?: string; message?: string; error?: string }> {
    console.log('🔧 [GRAPHQL] Creating user:', { username: userData.username, email: userData.email });

    try {
      // 🔧 CORRECTION: Utiliser les bons noms selon l'erreur GraphQL
      const mutation = `
        mutation RegisterUser($input: UserRegistrationInputDto!) {
          registerUser(input: $input) {
            success
            userId
            message
            errors
            verificationEmailSent
          }
        }
      `;

      const variables = {
        input: {
          username: userData.username,
          email: userData.email,
          password: userData.password,
          firstName: userData.firstName || '',
          lastName: userData.lastName || '',
          enabled: true,
          emailVerified: false
        }
      };

      console.log('📤 [GRAPHQL] Sending mutation with variables:', variables);

      const response = await this.makeRequest<{
        registerUser: {
          success: boolean;
          userId: string;
          message: string;
          errors: string[];
          verificationEmailSent: boolean;
        }
      }>(mutation, variables);

      console.log('📋 [GRAPHQL] Registration response:', response);

      if (response.data?.registerUser?.success) {
        console.log('✅ [GRAPHQL] User registered successfully');
        return {
          success: true,
          userID: response.data.registerUser.userId,
          message: response.data.registerUser.message
        };
      } else {
        const errors = response.data?.registerUser?.errors || response.errors?.map(e => e.message) || ['Unknown error'];
        throw new Error('User registration failed: ' + errors.join(', '));
      }
    } catch (error: any) {
      console.error('❌ [GRAPHQL] User registration failed:', error);
      return {
        success: false,
        error: error.message || 'User registration failed'
      };
    }
  }

  // 🔧 Requête GraphQL générique
  private async makeRequest<T>(
    query: string,
    variables?: any
  ): Promise<GraphQLResponse<T>> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'X-Client-Name': 'auth-app',
      'X-Request-ID': this.generateRequestId(),
      'Origin': window.location.origin,
    };

    // Ajouter les headers d'authentification
    if (AUTH_CONFIG.AUTH_APP.APP_ID) {
      headers['X-App-ID'] = AUTH_CONFIG.AUTH_APP.APP_ID;
    }
    if (AUTH_CONFIG.AUTH_APP.APP_SECRET) {
      headers['X-App-Secret'] = AUTH_CONFIG.AUTH_APP.APP_SECRET;
    }
    if (this.appToken) {
      headers['X-App-Token'] = this.appToken;
    }

    console.log('📤 [GRAPHQL] Making request:', {
      url: this.graphqlUrl,
      hasAppId: !!headers['X-App-ID'],
      hasAppSecret: !!headers['X-App-Secret'],
      hasAppToken: !!this.appToken,
      query: query.split('\n')[1]?.trim() // Log first line of query
    });

    try {
      const response = await fetch(this.graphqlUrl, {
        method: 'POST',
        headers,
        credentials: 'include',
        body: JSON.stringify({ query, variables }),
      });

      console.log('📡 [GRAPHQL] Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ [GRAPHQL] HTTP Error:', errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const result = await response.json();
      console.log('📋 [GRAPHQL] Response received:', {
        hasData: !!result.data,
        hasErrors: !!result.errors,
        errorCount: result.errors?.length || 0
      });

      // Log errors if any
      if (result.errors) {
        console.error('❌ [GRAPHQL] GraphQL Errors:', result.errors);
      }

      return result;
    } catch (error: any) {
      console.error('❌ [GRAPHQL] Request failed:', error);
      throw error;
    }
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Méthode utilitaire pour tester la connectivité
  async testConnection(): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('🧪 [GRAPHQL] Testing connection...');
      
      const query = `
        query TestConnection {
          __schema {
            queryType {
              name
            }
          }
        }
      `;

      const response = await this.makeRequest(query);
      
      if (response.data) {
        console.log('✅ [GRAPHQL] Connection test successful');
        return { success: true };
      } else {
        throw new Error('No data returned from introspection query');
      }
    } catch (error: any) {
      console.error('❌ [GRAPHQL] Connection test failed:', error);
      return { 
        success: false, 
        error: error.message || 'Connection test failed' 
      };
    }
  }
}

// Export singleton instance
export const graphqlService = new GraphQLService();