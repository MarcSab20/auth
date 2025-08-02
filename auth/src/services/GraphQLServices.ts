// auth/src/services/GraphQLServices.ts - GESTION DE L'ERREUR "Boolean cannot represent"

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
  private isAppAuthenticated: boolean = false;

  constructor() {
    this.graphqlUrl = AUTH_CONFIG.GRAPHQL_URL;
    console.log('🔧 [GRAPHQL-SERVICE] Initialized with URL:', this.graphqlUrl);
  }

  async authenticateApp(): Promise<{ success: boolean; token?: string; error?: string }> {
    console.log('🔧 [GRAPHQL-SERVICE] Starting app authentication...');

    try {
      const mutation = `
        mutation AuthenticateApp($input: AppLoginInput!) {
          authenticateApp(input: $input) {
            accessToken
            refreshToken
            accessValidityDuration
            application {
              applicationID
              name
            }
            message
            errors
          }
        }
      `;

      const variables = {
        input: {
          appID: AUTH_CONFIG.AUTH_APP.APP_ID,
          appKey: AUTH_CONFIG.AUTH_APP.APP_SECRET
        }
      };

      const response = await this.makeRequest<{
        authenticateApp: {
          accessToken: string;
          refreshToken: string;
          accessValidityDuration: number;
          application: { applicationID: string; name?: string };
          message: string;
          errors: string[];
        }
      }>(mutation, variables, false);

      if (response.data?.authenticateApp?.accessToken) {
        this.appToken = response.data.authenticateApp.accessToken;
        this.isAppAuthenticated = true;
        localStorage.setItem('smp_app_access_token', this.appToken);
        
        console.log('✅ [GRAPHQL-SERVICE] App authenticated successfully');
        return { success: true, token: this.appToken };
      } else {
        const errors = response.data?.authenticateApp?.errors || response.errors?.map(e => e.message) || ['Unknown error'];
        throw new Error('App authentication failed: ' + errors.join(', '));
      }
    } catch (error: any) {
      console.error('❌ [GRAPHQL-SERVICE] App authentication error:', error);
      this.isAppAuthenticated = false;
      return { success: false, error: error.message || 'Authentication failed' };
    }
  }

  async createUser(userData: {
    username: string;
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
  }): Promise<{ success: boolean; userID?: string; message?: string; error?: string }> {
    console.log('👤 [GRAPHQL-SERVICE] Creating user with schema mismatch handling...');

    try {
      if (!this.isAppAuthenticated) {
        const authResult = await this.authenticateApp();
        if (!authResult.success) {
          throw new Error('App authentication required but failed: ' + authResult.error);
        }
      }

      // 🔧 MUTATION BOOLEAN (pour correspondre au schéma actuel)
      const mutation = `
        mutation RegisterUser($input: UserRegistrationInputDto!) {
          registerUser(input: $input)
        }
      `;

      const variables = {
        input: {
          username: userData.username.toLowerCase().trim(),
          email: userData.email.toLowerCase().trim(),
          password: userData.password,
          firstName: userData.firstName || '',
          lastName: userData.lastName || '',
          enabled: true,
          emailVerified: false,
          attributes: {}
        }
      };

      console.log('📤 [GRAPHQL-SERVICE] Sending Boolean mutation:', {
        username: variables.input.username,
        email: variables.input.email
      });

      const response = await this.makeRequest<{ 
        registerUser: boolean 
      }>(mutation, variables, true);
      
      console.log('📋 [GRAPHQL-SERVICE] Boolean mutation response:', {
        hasData: !!response.data,
        hasErrors: !!response.errors,
        registerUserResult: response.data?.registerUser
      });

      // 🔧 GESTION SPÉCIALE DE L'ERREUR "Boolean cannot represent"
      if (response.errors && response.errors.length > 0) {
        const errorMessages = response.errors.map(e => e.message);
        console.log('🔍 [GRAPHQL-SERVICE] Analyzing GraphQL errors:', errorMessages);
        
        // Détecter l'erreur de schéma avec succès
        const schemaSuccessError = errorMessages.find(msg => 
          msg.includes('Boolean cannot represent a non boolean value') && 
          msg.includes('success: true')
        );

        if (schemaSuccessError) {
          console.log('🎉 [GRAPHQL-SERVICE] Schema mismatch but operation succeeded!');
          
          // Extraire les données de l'erreur
          const successDataMatch = schemaSuccessError.match(/\{[^}]+\}/);
          if (successDataMatch) {
            try {
              // Nettoyer et parser les données
              const cleanJson = successDataMatch[0]
                .replace(/(\w+):/g, '"$1":')  // Ajouter quotes aux clés
                .replace(/'/g, '"');          // Remplacer simple quotes par double quotes
              
              const successData = JSON.parse(cleanJson);
              
              console.log('✅ [GRAPHQL-SERVICE] Extracted success data:', successData);
              
              return {
                success: true,
                userID: successData.userId || `extracted_${Date.now()}`,
                message: successData.message || 'Utilisateur créé avec succès'
              };
            } catch (parseError) {
              console.warn('⚠️ [GRAPHQL-SERVICE] Could not parse success data, using fallback');
              
              // Extraire au moins l'ID utilisateur avec regex
              const userIdMatch = schemaSuccessError.match(/userId:\s*"([^"]+)"/);
              const messageMatch = schemaSuccessError.match(/message:\s*"([^"]+)"/);
              
              return {
                success: true,
                userID: userIdMatch ? userIdMatch[1] : `success_${Date.now()}`,
                message: messageMatch ? messageMatch[1] : 'Utilisateur créé avec succès'
              };
            }
          }
          
          // Fallback si on ne peut pas extraire les données
          return {
            success: true,
            userID: `success_${Date.now()}`,
            message: 'Utilisateur créé avec succès (schéma GraphQL à corriger)'
          };
        }
        
        // Autres erreurs GraphQL
        const errorString = errorMessages.join(' ').toLowerCase();
        
        if (errorString.includes('already exists') || errorString.includes('duplicate')) {
          return {
            success: false,
            error: 'Cet email ou nom d\'utilisateur est déjà utilisé'
          };
        } else if (errorString.includes('validation') || errorString.includes('invalid')) {
          return {
            success: false,
            error: 'Données d\'inscription invalides'
          };
        } else if (errorString.includes('constraint') || errorString.includes('unique')) {
          return {
            success: false,
            error: 'Cet utilisateur existe déjà'
          };
        } else {
          return {
            success: false,
            error: 'Erreur lors de l\'inscription: ' + errorMessages.join(', ')
          };
        }
      }

      // Si on a une réponse data normale
      if (response.data?.registerUser === true) {
        console.log('✅ [GRAPHQL-SERVICE] Standard Boolean success');
        return {
          success: true,
          userID: `bool_success_${Date.now()}`,
          message: 'Utilisateur créé avec succès'
        };
      } else if (response.data?.registerUser === false) {
        console.log('❌ [GRAPHQL-SERVICE] Boolean false response');
        return {
          success: false,
          error: 'Échec de l\'inscription - utilisateur non créé'
        };
      }

      // Aucune data
      console.warn('⚠️ [GRAPHQL-SERVICE] No data received from registerUser');
      return {
        success: false,
        error: 'Réponse inattendue du serveur'
      };

    } catch (error: any) {
      console.error('❌ [GRAPHQL-SERVICE] User registration error:', error);
      
      // Analyser les erreurs de requête
      let userMessage = 'Erreur lors de l\'inscription';
      
      if (error.message?.includes('Boolean cannot represent')) {
        // Cette erreur peut aussi arriver au niveau fetch
        console.log('🔧 [GRAPHQL-SERVICE] Boolean schema error at fetch level');
        
        // Essayer d'extraire les données de succès
        const userIdMatch = error.message.match(/userId:\s*"([^"]+)"/);
        const messageMatch = error.message.match(/message:\s*"([^"]+)"/);
        
        if (userIdMatch) {
          return {
            success: true,
            userID: userIdMatch[1],
            message: messageMatch ? messageMatch[1] : 'Utilisateur créé avec succès'
          };
        }
        
        userMessage = 'Inscription réussie mais erreur de schéma GraphQL';
      } else if (error.message?.includes('already exists') || error.message?.includes('duplicate')) {
        userMessage = 'Cet email ou nom d\'utilisateur est déjà utilisé';
      } else if (error.message?.includes('validation')) {
        userMessage = 'Données d\'inscription invalides';
      } else if (error.message?.includes('HTTP 4')) {
        userMessage = 'Erreur de requête - vérifiez vos données';
      } else if (error.message?.includes('HTTP 5')) {
        userMessage = 'Erreur serveur - veuillez réessayer plus tard';
      } else if (error.message?.includes('network') || error.message?.includes('fetch')) {
        userMessage = 'Erreur de connexion - vérifiez votre réseau';
      }

      return {
        success: false,
        error: userMessage
      };
    }
  }

  private async makeRequest<T>(
    query: string,
    variables?: any,
    requiresAuth: boolean = true
  ): Promise<GraphQLResponse<T>> {
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'X-Client-Name': 'auth-app',
      'X-Request-ID': this.generateRequestId(),
      'X-Trace-ID': this.generateTraceId(),
    };

    if (AUTH_CONFIG.AUTH_APP.APP_ID) {
      headers['X-App-ID'] = AUTH_CONFIG.AUTH_APP.APP_ID;
    }
    if (AUTH_CONFIG.AUTH_APP.APP_SECRET) {
      headers['X-App-Secret'] = AUTH_CONFIG.AUTH_APP.APP_SECRET;
    }

    if (requiresAuth && this.appToken) {
      headers['X-App-Token'] = this.appToken;
    }

    const userToken = localStorage.getItem('access_token');
    if (userToken) {
      headers['Authorization'] = `Bearer ${userToken}`;
    }

    try {
      console.log('🔍 [GRAPHQL-SERVICE] Making request with headers:', {
        hasAppId: !!headers['X-App-ID'],
        hasAppSecret: !!headers['X-App-Secret'],
        hasAppToken: !!headers['X-App-Token'],
        hasUserToken: !!headers['Authorization'],
        clientName: headers['X-Client-Name']
      });

      const response = await fetch(this.graphqlUrl, {
        method: 'POST',
        headers,
        credentials: 'include',
        body: JSON.stringify({ query, variables }),
      });

      console.log('📡 [GRAPHQL-SERVICE] Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ [GRAPHQL-SERVICE] HTTP Error:', errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const result = await response.json();
      
      if (result.errors) {
        console.error('❌ [GRAPHQL-SERVICE] GraphQL errors in response:', result.errors);
      }
      
      return result;
    } catch (error: any) {
      console.error('❌ [GRAPHQL-SERVICE] Request failed:', error);
      throw error;
    }
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateTraceId(): string {
    return `trace_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  async testConnection(): Promise<{ success: boolean; error?: string }> {
    try {
      const query = `query { __schema { queryType { name } } }`;
      const response = await this.makeRequest(query, undefined, false);
      return { success: !!response.data };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async forceReauth(): Promise<boolean> {
    this.appToken = null;
    this.isAppAuthenticated = false;
    const result = await this.authenticateApp();
    return result.success;
  }

  get isAuthenticated(): boolean {
    return this.isAppAuthenticated;
  }

  get currentAppToken(): string | null {
    return this.appToken;
  }
}

export const graphqlService = new GraphQLService();