// src/services/graphql/client.ts
import { GraphQLClient } from 'graphql-request';
import { API_ENDPOINTS } from '@/types/api';

class GraphQLService {
  private client: GraphQLClient;

  constructor() {
    this.client = new GraphQLClient(`${API_ENDPOINTS.KRAKEND_BASE}${API_ENDPOINTS.GRAPHQL}`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Intercepteur pour ajouter le token automatiquement
    this.client.setHeaders({
      ...this.client.requestConfig.headers,
      get authorization() {
        const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
        return token ? `Bearer ${token}` : '';
      }
    });
  }

  async request<T = any>(query: string, variables?: any): Promise<T> {
    try {
      const result = await this.client.request<T>(query, variables);
      return result;
    } catch (error: any) {
      // Transformer les erreurs GraphQL
      if (error.response?.errors) {
        const graphqlError = error.response.errors[0];
        throw new Error(graphqlError.message || 'GraphQL Error');
      }
      throw error;
    }
  }

  setAuthToken(token: string) {
    this.client.setHeader('authorization', `Bearer ${token}`);
  }

  clearAuthToken() {
    this.client.setHeader('authorization', '');
  }
}

export const graphqlClient = new GraphQLService();

// src/services/graphql/queries.ts
export const AUTH_QUERIES = {
  // Validation de token enrichie
  VALIDATE_TOKEN_ENRICHED: `
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
  `,

  // Validation simple de token
  VALIDATE_TOKEN: `
    query ValidateToken($token: String!) {
      validateToken(token: $token) {
        valid
        userId
        email
        givenName
        familyName
        roles
        expiresAt
        issuedAt
        clientId
        scope
      }
    }
  `,

  // Informations utilisateur
  GET_USER_INFO: `
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
          firstName
          lastName
          phoneNumber
          nationality
          dateOfBirth
          gender
          additionalAttributes
        }
        resource_access
        realm_access
        created_at
        updated_at
      }
    }
  `,

  // Rôles utilisateur
  GET_USER_ROLES: `
    query GetUserRoles($userId: String!) {
      getUserRoles(userId: $userId)
    }
  `,

  // Tests de connectivité
  TEST_REDIS_CONNECTION: `
    query TestRedisConnection {
      testRedisConnection {
        connected
        info
        error
        latency
        details
        timestamp
        version
      }
    }
  `,

  TEST_KEYCLOAK_CONNECTION: `
    query TestKeycloakConnection {
      testKeycloakConnection {
        connected
        info
        error
        latency
        details
        timestamp
        version
      }
    }
  `,

  TEST_OPA_CONNECTION: `
    query TestOPAConnection {
      testOPAConnection {
        connected
        info
        error
        latency
        details
        timestamp
        version
      }
    }
  `,

  // Validation de champs
  VALIDATE_USERNAME: `
    query ValidateUsername($username: String!) {
      validateUsername(username: $username) {
        valid
        available
        errors
        suggestions
      }
    }
  `,

  VALIDATE_EMAIL: `
    query ValidateEmail($email: String!) {
      validateEmail(email: $email) {
        valid
        available
        deliverable
        errors
      }
    }
  `,

  VALIDATE_PASSWORD: `
    query ValidatePassword($password: String!) {
      validatePassword(password: $password) {
        valid
        score
        errors
        suggestions
      }
    }
  `,

  // Génération de suggestions
  GENERATE_USERNAME_SUGGESTIONS: `
    query GenerateUsernameSuggestions($email: String!, $firstName: String, $lastName: String) {
      generateUsernameSuggestions(email: $email, firstName: $firstName, lastName: $lastName)
    }
  `,

  // Politique de mot de passe
  GET_PASSWORD_POLICY: `
    query GetPasswordPolicy {
      getPasswordPolicy {
        minLength
        requireUppercase
        requireLowercase
        requireNumbers
        requireSpecialChars
        forbiddenPatterns
      }
    }
  `,

  // Statut d'enregistrement
  IS_REGISTRATION_ENABLED: `
    query IsRegistrationEnabled {
      isRegistrationEnabled
    }
  `,

  // Statistiques d'authentification
  GET_AUTHENTICATION_STATS: `
    query GetAuthenticationStats {
      getAuthenticationStats {
        connected
        info
        details
        timestamp
      }
    }
  `,

  // Vérification de permissions
  CHECK_PERMISSION: `
    query CheckPermission($token: String!, $resourceId: String!, $resourceType: String!, $action: String!, $context: JSONObject) {
      checkPermission(token: $token, resourceId: $resourceId, resourceType: $resourceType, action: $action, context: $context)
    }
  `
};

export const AUTH_MUTATIONS = {
  // Connexion
  LOGIN: `
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
  `,

  // Rafraîchissement de token
  REFRESH_TOKEN: `
    mutation RefreshToken($input: RefreshTokenInputDto!) {
      refreshToken(input: $input) {
        accessToken
        refreshToken
        tokenType
        expiresIn
        scope
        sessionId
      }
    }
  `,

  // Token client credentials
  GET_CLIENT_CREDENTIALS_TOKEN: `
    mutation GetClientCredentialsToken {
      getClientCredentialsToken {
        accessToken
        refreshToken
        tokenType
        expiresIn
        scope
      }
    }
  `,

  // Déconnexion
  LOGOUT: `
    mutation Logout($token: String!) {
      logout(token: $token)
    }
  `,

  // Enregistrement d'utilisateur
  REGISTER_USER: `
    mutation RegisterUser($input: UserRegistrationInputDto!) {
      registerUser(input: $input) {
        success
        userId
        message
        errors
        verificationToken
        verificationEmailSent
      }
    }
  `,

  // Vérification d'email
  VERIFY_EMAIL: `
    mutation VerifyEmail($input: VerifyEmailInputDto!) {
      verifyEmail(input: $input) {
        success
        message
        errorCode
      }
    }
  `,

  // Renvoi de vérification d'email
  RESEND_VERIFICATION_EMAIL: `
    mutation ResendVerificationEmail($input: ResendVerificationInputDto!) {
      resendVerificationEmail(input: $input) {
        success
        message
        errorCode
      }
    }
  `,

  // Reset de mot de passe
  REQUEST_PASSWORD_RESET: `
    mutation RequestPasswordReset($input: ResetPasswordInputDto!) {
      requestPasswordReset(input: $input) {
        success
        message
        requestId
      }
    }
  `,

  // Changement de mot de passe
  CHANGE_PASSWORD: `
    mutation ChangePassword($input: ChangePasswordInputDto!) {
      changePassword(input: $input) {
        success
        message
        requiresReauth
      }
    }
  `,

  // Invalidation du cache utilisateur
  INVALIDATE_USER_CACHE: `
    mutation InvalidateUserCache($userId: String!) {
      invalidateUserCache(userId: $userId)
    }
  `
};



