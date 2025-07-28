// dashboard/src/services/api/authAPI.ts
import { AUTH_CONFIG } from '@/src/config/auth.config';

interface AppAuthResult {
  success: boolean;
  accessToken?: string;
  refreshToken?: string;
  error?: string;
}

interface UserValidationResult {
  valid: boolean;
  user?: any;
  error?: string;
}

class AuthAPI {
  private baseURL = AUTH_CONFIG.GRAPHQL_URL;

  /**
   * Authentification de l'application Dashboard via Gateway
   */
  async testAppAuth(): Promise<AppAuthResult> {
    try {
      console.log('🔧 [DASHBOARD-API] Authentification app Dashboard via Gateway...');
      
      const query = `
        mutation AuthenticateApp($appLoginInput: AppLoginInput!) {
          authenticateApp(input: $appLoginInput) {
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
        appLoginInput: {
          appID: AUTH_CONFIG.APP_ID,
          appKey: AUTH_CONFIG.APP_SECRET
        }
      };

      const response = await fetch(this.baseURL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-App-ID': AUTH_CONFIG.APP_ID,
          'X-App-Secret': AUTH_CONFIG.APP_SECRET,
          'X-Request-ID': this.generateRequestId(),
          'X-Client-Name': 'dashboard-app',
          'X-Client-Version': '1.0.0'
        },
        body: JSON.stringify({ query, variables }),
      });

      console.log('📡 [DASHBOARD-API] Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ [DASHBOARD-API] Error response:', errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const result = await response.json();
      console.log('📋 [DASHBOARD-API] App auth result:', result);

      if (result.errors && result.errors.length > 0) {
        console.error('❌ [DASHBOARD-API] GraphQL errors:', result.errors);
        throw new Error(result.errors[0]);
      }

      const authData = result.data?.authenticateApp;
      if (authData?.accessToken) {
        // Stocker le token app pour le dashboard
        localStorage.setItem('dashboard_app_token', authData.accessToken);
        if (authData.refreshToken) {
          localStorage.setItem('dashboard_app_refresh', authData.refreshToken);
        }
        
        console.log('🔑 [DASHBOARD-API] Token app Dashboard stocké');
        return { 
          success: true, 
          accessToken: authData.accessToken,
          refreshToken: authData.refreshToken
        };
      } else {
        throw new Error('Aucun token reçu du serveur');
      }

    } catch (error: any) {
      console.error('❌ [DASHBOARD-API] Échec auth app Dashboard:', error);
      return { 
        success: false, 
        error: error.message || 'Authentification application Dashboard échouée' 
      };
    }
  }

  /**
   * Validation de token utilisateur avec enrichissement
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
          'X-App-ID': AUTH_CONFIG.APP_ID,
          'X-App-Secret': AUTH_CONFIG.APP_SECRET,
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
          username: validation.userInfo.preferred_username,
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

  /**
   * Déconnexion utilisateur
   */
  async logout(token: string): Promise<{ success: boolean }> {
    try {
      const query = `
        mutation Logout($token: String!) {
          logout(token: $token)
        }
      `;

      const dashboardAppToken = localStorage.getItem('dashboard_app_token');
      
      const response = await fetch(this.baseURL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-App-ID': AUTH_CONFIG.APP_ID,
          'X-App-Secret': AUTH_CONFIG.APP_SECRET,
          'X-Client-Name': 'dashboard-app',
          ...(dashboardAppToken && { 'X-App-Token': dashboardAppToken }),
          'X-Request-ID': this.generateRequestId(),
        },
        body: JSON.stringify({ 
          query, 
          variables: { token } 
        }),
      });

      if (response.ok) {
        console.log('✅ [DASHBOARD-API] Déconnexion réussie');
        return { success: true };
      } else {
        console.warn('⚠️ [DASHBOARD-API] Déconnexion partielle');
        return { success: false };
      }

    } catch (error: any) {
      console.error('❌ [DASHBOARD-API] Erreur déconnexion:', error);
      return { success: false };
    }
  }

  /**
   * Récupérer les organisations utilisateur
   */
  async getUserOrganizations(userId: string): Promise<any[]> {
    try {
      const query = `
        query GetUserOrganizations($userId: String!) {
          getUserOrganizations(userId: $userId) {
            organizationID
            name
            role
            permissions
          }
        }
      `;

      const dashboardAppToken = localStorage.getItem('dashboard_app_token');
      const userToken = localStorage.getItem('access_token');
      
      const response = await fetch(this.baseURL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-App-ID': AUTH_CONFIG.APP_ID,
          'X-App-Secret': AUTH_CONFIG.APP_SECRET,
          'X-Client-Name': 'dashboard-app',
          ...(dashboardAppToken && { 'X-App-Token': dashboardAppToken }),
          ...(userToken && { 'Authorization': `Bearer ${userToken}` }),
          'X-Request-ID': this.generateRequestId(),
        },
        body: JSON.stringify({ 
          query, 
          variables: { userId } 
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to get organizations: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.errors) {
        throw new Error(result.errors[0].message);
      }

      return result.data?.getUserOrganizations || [];

    } catch (error: any) {
      console.error('❌ [DASHBOARD-API] Erreur getUserOrganizations:', error);
      return [];
    }
  }

  private generateRequestId(): string {
    return `dashboard_req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

const authAPI = new AuthAPI();
export default authAPI;