// auth/types/oauth.ts - Types compatibles avec mu-auth backend

export interface OAuthAuthorizationInput {
  provider: string;
  redirectUri: string;
  scopes?: string[];
  originalUrl?: string;
}

export interface OAuthAuthorizationResponse {
  success: boolean;
  authUrl: string;
  state: string;
  provider: string;
  expiresAt?: string;
  message?: string;
}

export interface OAuthCallbackInput {
  provider: string;
  code: string;
  state: string;
  error?: string;
  errorDescription?: string;
}

export interface OAuthUserInfo {
  id: string;
  email: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  username?: string;
  verified?: boolean;
  provider: string;
  avatarUrl?: string;
}

export interface OAuthTokens {
  accessToken: string;
  refreshToken?: string;
  tokenType: string;
  expiresIn?: number;
  idToken?: string;
}

export interface OAuthCallbackResponse {
  success: boolean;
  userInfo?: OAuthUserInfo;
  tokens?: OAuthTokens;
  message?: string;
}

export interface OAuthProviderInfo {
  name: string;
  displayName: string;
  enabled: boolean;
  scopes?: string[];
  authUrl?: string;
  supportsRefresh?: boolean;
  iconUrl?: string;
  description?: string;
  configured?: boolean;
}

export interface LinkedAccountInfo {
  userId: string;
  provider: string;
  providerUserId: string;
  email?: string;
  username?: string;
  linkedAt: string;
  lastSync?: string;
  metadata?: Record<string, any>;
}

export interface OAuthLinkAccountInput {
  userId: string;
  provider: string;
  providerUserId: string;
}

export interface OAuthUnlinkAccountInput {
  userId: string;
  provider: string;
}

export interface OAuthRefreshTokenInput {
  userId: string;
  provider: string;
}

export interface OAuthTokenInfo {
  accessToken: string;
  tokenType: string;
  expiresIn?: number;
  scope?: string;
  refreshToken?: string;
}

// États pour le contexte OAuth
export interface OAuthState {
  isLoading: boolean;
  error: string | null;
  isRedirecting: boolean;
  providers: OAuthProviderInfo[];
}

// Actions pour le reducer OAuth
export type OAuthAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_REDIRECTING'; payload: boolean }
  | { type: 'SET_PROVIDERS'; payload: OAuthProviderInfo[] };

// Erreurs spécifiques OAuth
export class OAuthError extends Error {
  constructor(
    message: string,
    public code: 'INVALID_STATE' | 'EXPIRED_STATE' | 'PROVIDER_ERROR' | 'NETWORK_ERROR' | 'CALLBACK_ERROR' = 'PROVIDER_ERROR',
    public provider?: string
  ) {
    super(message);
    this.name = 'OAuthError';
  }
}

// Configuration OAuth pour les providers
export interface OAuthProviderConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  scopes: string[];
  authUrl: string;
  tokenUrl: string;
  userInfoUrl: string;
  enabled: boolean;
}

// Réponse d'état OAuth
export interface OAuthStateResponse {
  valid: boolean;
  provider?: string;
  action?: 'login' | 'register';
  originalUrl?: string;
  createdAt?: string;
  expiresAt?: string;
}

// GraphQL queries et mutations pour OAuth
export const OAUTH_QUERIES = {
  GET_AVAILABLE_PROVIDERS: `
    query GetAvailableOAuthProviders {
      getAvailableOAuthProviders {
        name
        displayName
        enabled
        scopes
        authUrl
        supportsRefresh
        iconUrl
        description
        configured
      }
    }
  `,
  
  GET_PROVIDER_STATUS: `
    query GetOAuthProviderStatus($provider: String!) {
      getOAuthProviderStatus(provider: $provider) {
        name
        displayName
        enabled
        scopes
        authUrl
        supportsRefresh
        iconUrl
        description
        configured
      }
    }
  `,
  
  GET_LINKED_ACCOUNTS: `
    query GetLinkedOAuthAccounts($userId: String!) {
      getLinkedOAuthAccounts(userId: $userId) {
        userId
        provider
        providerUserId
        email
        username
        linkedAt
        lastSync
        metadata
      }
    }
  `,
  
  TEST_PROVIDER: `
    query TestOAuthProvider($provider: String!) {
      testOAuthProvider(provider: $provider)
    }
  `
};

export const OAUTH_MUTATIONS = {
  GENERATE_AUTH_URL: `
    mutation GenerateOAuthUrl($input: OAuthAuthorizationInput!) {
      generateOAuthUrl(input: $input) {
        success
        authUrl
        state
        provider
        expiresAt
        message
      }
    }
  `,
  
  HANDLE_CALLBACK: `
    mutation HandleOAuthCallback($input: OAuthCallbackInput!) {
      handleOAuthCallback(input: $input) {
        success
        userInfo {
          id
          email
          name
          firstName
          lastName
          username
          verified
          provider
          avatarUrl
        }
        tokens {
          accessToken
          refreshToken
          tokenType
          expiresIn
          idToken
        }
        message
      }
    }
  `,
  
  LINK_ACCOUNT: `
    mutation LinkOAuthAccount($input: OAuthLinkAccountInput!) {
      linkOAuthAccount(input: $input)
    }
  `,
  
  UNLINK_ACCOUNT: `
    mutation UnlinkOAuthAccount($input: OAuthUnlinkAccountInput!) {
      unlinkOAuthAccount(input: $input)
    }
  `,
  
  REFRESH_TOKEN: `
    mutation RefreshOAuthToken($input: OAuthRefreshTokenInput!) {
      refreshOAuthToken(input: $input) {
        accessToken
        tokenType
        expiresIn
        scope
        refreshToken
      }
    }
  `
};

// Helpers pour la gestion des erreurs OAuth
export function parseOAuthError(error: any): {
  title: string;
  description: string;
  canRetry: boolean;
} {
  const message = error?.message || error || '';
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('invalid') && lowerMessage.includes('state')) {
    return {
      title: "État OAuth invalide",
      description: "Le lien OAuth a expiré ou a été modifié. Veuillez recommencer la connexion.",
      canRetry: true
    };
  }
  
  if (lowerMessage.includes('expired')) {
    return {
      title: "Session OAuth expirée",
      description: "La session OAuth a expiré. Veuillez recommencer la connexion.",
      canRetry: true
    };
  }
  
  if (lowerMessage.includes('access_denied') || lowerMessage.includes('denied')) {
    return {
      title: "Accès refusé",
      description: "Vous avez refusé l'autorisation. Pour vous connecter, vous devez autoriser l'accès.",
      canRetry: true
    };
  }
  
  if (lowerMessage.includes('network') || lowerMessage.includes('fetch')) {
    return {
      title: "Erreur de connexion",
      description: "Impossible de communiquer avec le serveur OAuth. Vérifiez votre connexion.",
      canRetry: true
    };
  }
  
  return {
    title: "Erreur OAuth",
    description: "Une erreur inattendue s'est produite lors de l'authentification OAuth.",
    canRetry: true
  };
}

// Helper pour valider l'état OAuth
export function validateOAuthState(receivedState: string, storedState: string): boolean {
  return receivedState === storedState && receivedState.length > 0;
}

// Helper pour nettoyer les données OAuth du localStorage
export function clearOAuthStorage(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('oauth_action');
    localStorage.removeItem('oauth_provider');
    localStorage.removeItem('oauth_state');
    localStorage.removeItem('oauth_original_url');
  }
}