// dashboard/src/services/api/authAPI.ts
import { AUTH_CONFIG } from '@/src/config/auth.config';

class AuthAPI {
  private baseURL = AUTH_CONFIG.GRAPHQL_URL;

  /**
   * Test de l'authentification de l'application
   */
  async testAppAuth(): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('🔧 [DASHBOARD-API] Test authentification app via Gateway...');
      
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

      if (result.errors) {
        console.error('❌ [DASHBOARD-API] GraphQL errors:', result.errors);
        throw new Error(result.errors[0].message);
      }

      const authData = result.data?.authenticateApp;
      if (authData?.accessToken) {
        // Stocker le token app
        localStorage.setItem('smp_app_access_token', authData.accessToken);
        console.log('🔑 [DASHBOARD-API] Token app stocké');
        
        return { success: true };
      } else {
        throw new Error('Aucun token reçu');
      }

    } catch (error: any) {
      console.error('❌ [DASHBOARD-API] Échec auth app:', error);
      return { 
        success: false, 
        error: error.message || 'Authentification application échouée' 
      };
    }
  }

  /**
   * Validation de token utilisateur
   */
  async validateUserToken(token: string): Promise<{ valid: boolean; user?: any; error?: string }> {
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
            }
            userId
            email
            givenName
            familyName
            roles
          }
        }
      `;

      const appToken = localStorage.getItem('smp_app_access_token');
      
      const response = await fetch(this.baseURL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-App-ID': AUTH_CONFIG.APP_ID,
          'X-App-Secret': AUTH_CONFIG.APP_SECRET,
          ...(appToken && { 'X-App-Token': appToken }),
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
        
        // Convertir les données utilisateur au format attendu par le dashboard
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
          email_verified: validation.userInfo.email_verified
        };

        return { 
          valid: true, 
          user 
        };
      } else {
        return { 
          valid: false, 
          error: 'Token invalide ou expiré' 
        };
      }

    } catch (error: any) {
      console.error('❌ [DASHBOARD-API] Erreur validation token:', error);
      return { 
        valid: false, 
        error: error.message || 'Erreur de validation' 
      };
    }
  }

  /**
   * Récupération des informations utilisateur étendues
   */
  async getUserInfo(userId: string): Promise<any> {
    try {
      const query = `
        query GetUserInfo($userId: String!) {
          getUserInfo(userId: $userId) {
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
        }
      `;

      const appToken = localStorage.getItem('smp_app_access_token');
      const userToken = localStorage.getItem('access_token');
      
      const response = await fetch(this.baseURL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-App-ID': AUTH_CONFIG.APP_ID,
          'X-App-Secret': AUTH_CONFIG.APP_SECRET,
          ...(appToken && { 'X-App-Token': appToken }),
          ...(userToken && { 'Authorization': `Bearer ${userToken}` }),
          'X-Request-ID': this.generateRequestId(),
        },
        body: JSON.stringify({ 
          query, 
          variables: { userId } 
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to get user info: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.errors) {
        throw new Error(result.errors[0].message);
      }

      return result.data?.getUserInfo;

    } catch (error: any) {
      console.error('❌ [DASHBOARD-API] Erreur getUserInfo:', error);
      return null;
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

      const appToken = localStorage.getItem('smp_app_access_token');
      
      const response = await fetch(this.baseURL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-App-ID': AUTH_CONFIG.APP_ID,
          'X-App-Secret': AUTH_CONFIG.APP_SECRET,
          ...(appToken && { 'X-App-Token': appToken }),
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

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

const authAPI = new AuthAPI();
export default authAPI;