// src/services/graphql/authGraphQL.ts
import { graphqlClient } from './client';
import { AUTH_QUERIES, AUTH_MUTATIONS } from '@/src/services/graphql/client';
import {
  LoginRequest,
  LoginResponse,
  SignupRequest,
  SignupResponse,
  User,
  TokenRefreshRequest,
  TokenRefreshResponse
} from '@/types/auth';
import {
  PasswordValidationResult,
  UsernameValidationResult,
  EmailValidationResult,
  PasswordPolicy
} from '@/types/validation';

export class AuthGraphQLService {
  
  // Authentification
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const result = await graphqlClient.request(AUTH_MUTATIONS.LOGIN, {
      input: credentials
    });
    
    return {
      accessToken: result.login.accessToken,
      refreshToken: result.login.refreshToken,
      tokenType: result.login.tokenType,
      expiresIn: result.login.expiresIn,
      sessionId: result.login.sessionId
    };
  }

  async refreshToken(request: TokenRefreshRequest): Promise<TokenRefreshResponse> {
    const result = await graphqlClient.request(AUTH_MUTATIONS.REFRESH_TOKEN, {
      input: request
    });
    
    return {
      accessToken: result.refreshToken.accessToken,
      refreshToken: result.refreshToken.refreshToken,
      tokenType: result.refreshToken.tokenType,
      expiresIn: result.refreshToken.expiresIn
    };
  }

  async logout(token: string): Promise<void> {
    await graphqlClient.request(AUTH_MUTATIONS.LOGOUT, { token });
  }

  // Validation de token
  async validateToken(token: string): Promise<{ valid: boolean; user?: User }> {
    try {
      const result = await graphqlClient.request(AUTH_QUERIES.VALIDATE_TOKEN_ENRICHED, { token });
      
      return {
        valid: result.validateTokenEnriched.valid,
        user: result.validateTokenEnriched.userInfo
      };
    } catch (error) {
      return { valid: false };
    }
  }

  // Enregistrement
  async registerUser(data: SignupRequest): Promise<SignupResponse> {
    const input = {
      username: data.username,
      email: data.email,
      password: data.password,
      firstName: data.firstName,
      lastName: data.lastName,
      enabled: data.enabled !== false,
      emailVerified: data.emailVerified || false,
      attributes: {}
    };

    const result = await graphqlClient.request(AUTH_MUTATIONS.REGISTER_USER, { input });
    
    return {
      success: result.registerUser.success,
      userId: result.registerUser.userId,
      message: result.registerUser.message,
      errors: result.registerUser.errors,
      verificationEmailSent: result.registerUser.verificationEmailSent
    };
  }

  // Informations utilisateur
  async getUserInfo(userId: string): Promise<User | null> {
    try {
      const result = await graphqlClient.request(AUTH_QUERIES.GET_USER_INFO, { userId });
      return result.getUserInfo;
    } catch (error) {
      return null;
    }
  }

  async getUserRoles(userId: string): Promise<string[]> {
    try {
      const result = await graphqlClient.request(AUTH_QUERIES.GET_USER_ROLES, { userId });
      return result.getUserRoles || [];
    } catch (error) {
      return [];
    }
  }

  // Validation
  async validateUsername(username: string): Promise<UsernameValidationResult> {
    try {
      const result = await graphqlClient.request(AUTH_QUERIES.VALIDATE_USERNAME, { username });
      return result.validateUsername;
    } catch (error: any) {
      return {
        valid: false,
        available: false,
        errors: [error.message || 'Erreur de validation'],
        suggestions: []
      };
    }
  }

  async validateEmail(email: string): Promise<EmailValidationResult> {
    try {
      const result = await graphqlClient.request(AUTH_QUERIES.VALIDATE_EMAIL, { email });
      return result.validateEmail;
    } catch (error: any) {
      return {
        valid: false,
        available: false,
        deliverable: false,
        errors: [error.message || 'Erreur de validation']
      };
    }
  }

  async validatePassword(password: string): Promise<PasswordValidationResult> {
    try {
      const result = await graphqlClient.request(AUTH_QUERIES.VALIDATE_PASSWORD, { password });
      return result.validatePassword;
    } catch (error: any) {
      return {
        valid: false,
        errors: [error.message || 'Erreur de validation'],
        score: 0,
        suggestions: []
      };
    }
  }

  async generateUsernameSuggestions(email: string, firstName?: string, lastName?: string): Promise<string[]> {
    try {
      const result = await graphqlClient.request(AUTH_QUERIES.GENERATE_USERNAME_SUGGESTIONS, {
        email,
        firstName,
        lastName
      });
      return result.generateUsernameSuggestions || [];
    } catch (error) {
      return [];
    }
  }

  async getPasswordPolicy(): Promise<PasswordPolicy> {
    try {
      const result = await graphqlClient.request(AUTH_QUERIES.GET_PASSWORD_POLICY);
      return result.getPasswordPolicy;
    } catch (error) {
      // Politique par défaut
      return {
        minLength: 8,
        requireUppercase: true,
        requireLowercase: true,
        requireNumbers: true,
        requireSpecialChars: true,
        forbiddenPatterns: []
      };
    }
  }

  async isRegistrationEnabled(): Promise<boolean> {
    try {
      const result = await graphqlClient.request(AUTH_QUERIES.IS_REGISTRATION_ENABLED);
      return result.isRegistrationEnabled;
    } catch (error) {
      return true; // Par défaut
    }
  }

  // Vérification d'email
  async verifyEmail(userId: string, token: string): Promise<{ success: boolean; message: string }> {
    const result = await graphqlClient.request(AUTH_MUTATIONS.VERIFY_EMAIL, {
      input: { userId, token }
    });
    
    return {
      success: result.verifyEmail.success,
      message: result.verifyEmail.message
    };
  }

  // Reset de mot de passe
  async requestPasswordReset(email: string): Promise<{ success: boolean; message: string }> {
    const result = await graphqlClient.request(AUTH_MUTATIONS.REQUEST_PASSWORD_RESET, {
      input: { email }
    });
    
    return {
      success: result.requestPasswordReset.success,
      message: result.requestPasswordReset.message
    };
  }

  // Tests de connectivité
  async testConnections() {
    try {
      const [redis, keycloak, opa] = await Promise.allSettled([
        graphqlClient.request(AUTH_QUERIES.TEST_REDIS_CONNECTION),
        graphqlClient.request(AUTH_QUERIES.TEST_KEYCLOAK_CONNECTION),
        graphqlClient.request(AUTH_QUERIES.TEST_OPA_CONNECTION)
      ]);

      return {
        redis: redis.status === 'fulfilled' ? redis.value.testRedisConnection : { connected: false },
        keycloak: keycloak.status === 'fulfilled' ? keycloak.value.testKeycloakConnection : { connected: false },
        opa: opa.status === 'fulfilled' ? opa.value.testOPAConnection : { connected: false }
      };
    } catch (error) {
      return {
        redis: { connected: false },
        keycloak: { connected: false },
        opa: { connected: false }
      };
    }
  }
}

export const authGraphQL = new AuthGraphQLService();