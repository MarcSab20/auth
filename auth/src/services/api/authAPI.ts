import {
  LoginRequest,
  LoginResponse,
  SignupRequest,
  SignupResponse,
  User,
} from '@/types/auth';

import { API_CONFIG } from '@/src/config/api.config';

class AuthAPI {
  private baseURL = API_CONFIG.BASE_URL;

  async signUp(data: SignupRequest): Promise<SignupResponse> {
    try {
      const response = await fetch(`${this.baseURL}${API_CONFIG.AUTH.SIGN_UP}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Request-ID': this.generateRequestId(),
          'X-Trace-ID': this.generateTraceId(),
        },
        body: JSON.stringify({
          username: data.username,
          email: data.email,
          password: data.password,
          firstName: data.firstName,
          lastName: data.lastName,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP ${response.status}`);
      }

      const result = await response.json();
      
      return {
        success: result.success || true,
        userId: result.data?.userId || result.userId,
        message: result.message || 'Inscription réussie',
        verificationEmailSent: result.data?.verificationEmailSent || false,
      };
    } catch (error: any) {
      console.error('SignUp Error:', error);
      return {
        success: false,
        message: error.message || 'Erreur lors de l\'inscription',
        errors: [error.message || 'NETWORK_ERROR'],
      };
    }
  }

  async signIn(credentials: LoginRequest): Promise<LoginResponse> {
  try {
    console.log('🌐 [API] Calling KrakenD signin endpoint...');
    
    const response = await fetch(`${this.baseURL}${API_CONFIG.AUTH.SIGN_IN}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Request-ID': this.generateRequestId(),
        'X-Trace-ID': this.generateTraceId(),
      },
      body: JSON.stringify(credentials),
    });

    console.log('📡 [API] Response status:', response.status);
    console.log('📡 [API] Response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ [API] Error response:', errorData);
      throw new Error(errorData.message || 'Identifiants incorrects');
    }

    const result = await response.json();
    console.log('📋 [API] Raw result:', result);
    
    // Stocker les tokens
    if (result.success && result.data?.accessToken) {
      console.log('🔑 [API] Storing tokens...');
      this.storeTokens(result.data.accessToken, result.data.refreshToken);
    }

    const loginResponse = {
      accessToken: result.data?.accessToken || '',
      refreshToken: result.data?.refreshToken,
      tokenType: 'Bearer',
      expiresIn: result.data?.expiresIn,
      user: result.data?.user || result.user,
    };
    
    console.log('📤 [API] Returning login response:', loginResponse);
    return loginResponse;
    
  } catch (error: any) {
    console.error('❌ [API] SignIn Error:', error);
    throw new Error(error.message || 'Identifiants incorrects');
  }
}

  async requestPasswordReset(email: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseURL}${API_CONFIG.AUTH.FORGOT_PASSWORD}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Request-ID': this.generateRequestId(),
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors de la demande');
      }
    } catch (error: any) {
      console.error('Password Reset Error:', error);
      throw new Error(error.message || 'Erreur lors de la demande de reset');
    }
  }

  async logout(): Promise<void> {
    try {
      const token = this.getStoredToken();
      if (token) {
        await fetch(`${this.baseURL}${API_CONFIG.AUTH.LOGOUT}`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'X-Request-ID': this.generateRequestId(),
          },
        });
      }
    } catch (error) {
      console.warn('Logout server call failed:', error);
    } finally {
      this.clearTokens();
    }
  }

  // Méthodes utilitaires
  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateTraceId(): string {
    return `trace_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private storeTokens(accessToken: string, refreshToken?: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('access_token', accessToken);
      if (refreshToken) {
        localStorage.setItem('refresh_token', refreshToken);
      }
    }
  }

  private clearTokens(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
    }
  }

  async refreshToken(refreshToken: string): Promise<LoginResponse> {
    try {
        const response = await fetch(`${this.baseURL}${API_CONFIG.AUTH.REFRESH}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-Request-ID': this.generateRequestId(),
            'X-Trace-ID': this.generateTraceId(),
        },
        body: JSON.stringify({ refreshToken }),
        });

        if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Token refresh failed');
        }

        const result = await response.json();
        
        // Stocker les nouveaux tokens
        if (result.success && result.data?.accessToken) {
        this.storeTokens(result.data.accessToken, result.data.refreshToken);
        }

        return {
        accessToken: result.data?.accessToken || '',
        refreshToken: result.data?.refreshToken,
        tokenType: 'Bearer',
        expiresIn: result.data?.expiresIn,
        user: result.data?.user,
        };
    } catch (error: any) {
        console.error('Token Refresh Error:', error);
        throw new Error(error.message || 'Token refresh failed');
    }
    }

    getStoredRefreshToken(): string | null {
    if (typeof window !== 'undefined') {
        return localStorage.getItem('refresh_token');
    }
    return null;
    }

    async validateCurrentToken(): Promise<{ valid: boolean; user?: User }> {
    const token = this.getStoredToken();
    if (!token) {
        return { valid: false };
    }

    try {
        const response = await fetch(`${this.baseURL}/api/auth/validate`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            'X-Request-ID': this.generateRequestId(),
        },
        body: JSON.stringify({ token }),
        });

        if (!response.ok) {
        return { valid: false };
        }

        const result = await response.json();
        
        if (result.success && result.data?.valid) {
        return {
            valid: true,
            user: result.data.user
        };
        }

        return { valid: false };
    } catch (error) {
        console.error('Token validation error:', error);
        return { valid: false };
    }
    }

    async getCurrentUser(): Promise<User | null> {
    const token = this.getStoredToken();
    if (!token) {
        return null;
    }

    try {
        // D'abord valider le token et récupérer les infos utilisateur
        const validation = await this.validateCurrentToken();
        
        if (validation.valid && validation.user) {
        return validation.user;
        }

        // Fallback: essayer de récupérer les infos utilisateur via une autre route
        const response = await fetch(`${this.baseURL}/graphql`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            'X-Request-ID': this.generateRequestId(),
        },
        body: JSON.stringify({
            query: `
            query GetCurrentUser {
                validateTokenEnriched(token: "${token}") {
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
                }
            }
            `
        }),
        });

        if (!response.ok) {
        return null;
        }

        const result = await response.json();
        
        if (result.data?.validateTokenEnriched?.valid && result.data.validateTokenEnriched.userInfo) {
        const userInfo = result.data.validateTokenEnriched.userInfo;
        
        return {
            sub: userInfo.sub,
            email: userInfo.email,
            profileID:userInfo.profileID,
            username:userInfo.username,
            userID:userInfo.username,
            given_name: userInfo.given_name,
            family_name: userInfo.family_name,
            preferred_username: userInfo.preferred_username,
            roles: userInfo.roles || [],
            organization_ids: userInfo.organization_ids || [],
            state: userInfo.state,
            email_verified: userInfo.email_verified,
            attributes: userInfo.attributes
        };
        }

        return null;
    } catch (error) {
        console.error('Get current user error:', error);
        return null;
    }
    }

    isAuthenticated(): boolean {
    const token = this.getStoredToken();
    return !!token;
    }

  getStoredToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('access_token');
    }
    return null;
  }
}

const authAPI = new AuthAPI();
export default authAPI;
