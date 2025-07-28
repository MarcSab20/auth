import { AUTH_CONFIG } from '@/src/config/auth.config';

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
          'X-App-ID': AUTH_CONFIG.APP_ID,
          'X-App-Secret': AUTH_CONFIG.APP_SECRET,
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

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

const authAPI = new AuthAPI();
export default authAPI;
