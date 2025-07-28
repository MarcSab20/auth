import { AUTH_CONFIG } from '@/src/config/auth.config';

interface UserValidationResult {
  valid: boolean;
  user?: {
    userID: string;
    username: string;
    email?: string;
    profileID: string;
    accessibleOrganizations: any[];
    organizations: string[];
    sub: string;
    roles: string[];
    given_name?: string;
    family_name?: string;
    state?: string;
    email_verified?: boolean;
    attributes?: any;
  };
  error?: string;
}

class AuthAPI {
  private baseURL = AUTH_CONFIG.GRAPHQL_URL; // Utilise la Gateway

  async testAppAuth(): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('🔧 [API] Test authentification app via Gateway...');
      
      const query = `
        mutation AuthenticateApp($appLoginInput: AppLoginInput!) {
          authenticateApp(input: $appLoginInput) {
            accessToken
            refreshToken
            accessValidityDuration
            application {
              applicationID
            }
          }
        }
      `;

      const variables = {
        appLoginInput: {
          appID: AUTH_CONFIG.AUTH_APP.APP_ID,
          appKey: AUTH_CONFIG.AUTH_APP.APP_SECRET
        }
      };

      const response = await fetch(this.baseURL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-App-ID': AUTH_CONFIG.AUTH_APP.APP_ID,
          'X-App-Secret': AUTH_CONFIG.AUTH_APP.APP_SECRET,
          'X-Request-ID': this.generateRequestId(),
        },
        body: JSON.stringify({ query, variables }),
      });

      console.log('📡 [API] Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ [API] Error response:', errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const result = await response.json();
      console.log('📋 [API] App auth result:', result);

      if (result.errors) {
        console.error('❌ [API] GraphQL errors:', result.errors);
        throw new Error(result.errors[0].message);
      }

      const authData = result.data?.authenticateApp;
      if (authData?.accessToken) {
        // Stocker le token app
        localStorage.setItem('smp_app_access_token', authData.accessToken);
        console.log('🔑 [API] Token app stocké');
        
        return { success: true };
      } else {
        throw new Error('Aucun token reçu');
      }

    } catch (error: any) {
      console.error('❌ [API] Échec auth app:', error);
      return { 
        success: false, 
        error: error.message || 'Authentification application échouée' 
      };
    }
  }

  async signIn(credentials: { username: string; password: string }) {
    try {
      console.log('🌐 [API] Connexion utilisateur via Gateway...');
      
      const query = `
        mutation Login($input: LoginInputDto!) {
          login(input: $input) {
            accessToken
            refreshToken
            tokenType
            expiresIn
            scope
            sessionId
          }
        }
      `;

      const variables = {
        input: {
          username: credentials.username,
          password: credentials.password
        }
      };

      // Récupérer le token app
      const appToken = localStorage.getItem('smp_app_access_token');
      
      const response = await fetch(this.baseURL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-App-ID': AUTH_CONFIG.AUTH_APP.APP_ID,
          'X-App-Secret': AUTH_CONFIG.AUTH_APP.APP_SECRET,
          ...(appToken && { 'X-App-Token': appToken }),
          'X-Request-ID': this.generateRequestId(),
        },
        body: JSON.stringify({ query, variables }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('❌ [API] Error response:', errorData);
        throw new Error(`HTTP ${response.status}: ${errorData}`);
      }

      const result = await response.json();
      
      if (result.errors) {
        console.error('❌ [API] GraphQL errors:', result.errors);
        throw new Error(result.errors[0].message);
      }

      const loginData = result.data?.login;
      if (loginData?.accessToken) {
        // Stocker les tokens utilisateur
        localStorage.setItem('access_token', loginData.accessToken);
        if (loginData.refreshToken) {
          localStorage.setItem('refresh_token', loginData.refreshToken);
        }
        
        console.log('✅ [API] Connexion utilisateur réussie');
        return {
          accessToken: loginData.accessToken,
          refreshToken: loginData.refreshToken,
          tokenType: loginData.tokenType || 'Bearer',
          expiresIn: loginData.expiresIn,
        };
      } else {
        throw new Error('Aucun token utilisateur reçu');
      }

    } catch (error: any) {
      console.error('❌ [API] Échec connexion utilisateur:', error);
      throw new Error(error.message || 'Identifiants incorrects');
    }
  }

  /**
   * 🔍 Validation de token utilisateur avec enrichissement (CORRECTION)
   */
  async validateUserToken(token: string): Promise<UserValidationResult> {
    try {
      console.log('🔍 [DASHBOARD-API] Validation token utilisateur...');
      
      const query = `
        query ValidateTokenEnriched($token: String!) {
          validateTokenEnriched(token: $token) {
            valid
            userInfo {
              sub
              email
              given_name
              family_name
              preferred_username
              roles
              organization_ids
              state
              email_verified
              attributes {
                department
                clearanceLevel
                jobTitle
                businessUnit
                workLocation
                employmentType
              }
            }
            userId
            email
            givenName
            familyName
            roles
          }
        }
      `;

      const dashboardAppToken = localStorage.getItem('dashboard_app_token');
      
      const response = await fetch(this.baseURL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-App-ID': AUTH_CONFIG.DASHBOARD_APP.APP_ID,
          'X-App-Secret': AUTH_CONFIG.DASHBOARD_APP.APP_SECRET,
          'X-Client-Name': 'dashboard-app',
          ...(dashboardAppToken && { 'X-App-Token': dashboardAppToken }),
          'X-Request-ID': this.generateRequestId(),
        },
        body: JSON.stringify({ 
          query, 
          variables: { token } 
        }),
      });

      if (!response.ok) {
        throw new Error(`Validation failed: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.errors) {
        throw new Error(result.errors[0].message);
      }

      const validation = result.data?.validateTokenEnriched;
      
      if (validation?.valid && validation.userInfo) {
        console.log('✅ [DASHBOARD-API] Token valide, utilisateur récupéré');
        
        // Convertir au format Dashboard
        const user = {
          userID: validation.userInfo.sub,
          username: validation.userInfo.preferred_username || validation.userInfo.email,
          email: validation.userInfo.email,
          profileID: validation.userInfo.sub, // À adapter selon votre logique
          accessibleOrganizations: validation.userInfo.organization_ids || [],
          organizations: validation.userInfo.organization_ids || [],
          sub: validation.userInfo.sub,
          roles: validation.userInfo.roles || [],
          given_name: validation.userInfo.given_name,
          family_name: validation.userInfo.family_name,
          state: validation.userInfo.state,
          email_verified: validation.userInfo.email_verified,
          
          // Attributs étendus
          attributes: validation.userInfo.attributes
        };

        return { valid: true, user };
      } else {
        return { valid: false, error: 'Token invalide ou expiré' };
      }

    } catch (error: any) {
      console.error('❌ [DASHBOARD-API] Erreur validation token:', error);
      return { valid: false, error: error.message || 'Erreur de validation' };
    }
  }


  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

const authAPI = new AuthAPI();
export default authAPI;
