// auth/context/oauthContext.tsx
'use client';

import React, { createContext, useContext, useReducer, useCallback } from 'react';
import { AUTH_CONFIG } from '@/src/config/auth.config';

interface OAuthState {
  isLoading: boolean;
  error: string | null;
  isRedirecting: boolean;
  providers: OAuthProvider[];
}

interface OAuthProvider {
  configured: boolean;
  name: 'github' | 'google';
  displayName: string;
  enabled: boolean;
  iconUrl?: string;
}

interface OAuthContextType {
  state: OAuthState;
  
  // Actions
  initiateOAuth: (provider: 'github' | 'google', action?: 'login' | 'register') => Promise<void>;
  getAvailableProviders: () => Promise<OAuthProvider[]>;
  clearError: () => void;
}

type OAuthAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_REDIRECTING'; payload: boolean }
  | { type: 'SET_PROVIDERS'; payload: OAuthProvider[] };

const initialState: OAuthState = {
  isLoading: false,
  error: null,
  isRedirecting: false,
  providers: [],
};

function oauthReducer(state: OAuthState, action: OAuthAction): OAuthState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    case 'SET_REDIRECTING':
      return { ...state, isRedirecting: action.payload };
    case 'SET_PROVIDERS':
      return { ...state, providers: action.payload };
    default:
      return state;
  }
}

const OAuthContext = createContext<OAuthContextType | undefined>(undefined);

export function OAuthProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(oauthReducer, initialState);

  // Obtenir les providers disponibles
  const getAvailableProviders = useCallback(async (): Promise<OAuthProvider[]> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });

      const response = await fetch(`${AUTH_CONFIG.GRAPHQL_URL}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-App-ID': AUTH_CONFIG.AUTH_APP.APP_ID,
          'X-App-Secret': AUTH_CONFIG.AUTH_APP.APP_SECRET,
          'X-Client-Name': 'auth-app-oauth',
        },
        credentials: 'include',
        body: JSON.stringify({
          query: `
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
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const result = await response.json();
      
      if (result.errors) {
        throw new Error(result.errors[0].message);
      }

      const providers = result.data?.getAvailableOAuthProviders || [];
      dispatch({ type: 'SET_PROVIDERS', payload: providers });
      
      return providers;
    } catch (error: any) {
      console.error('❌ [OAUTH] Error fetching providers:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Impossible de charger les providers OAuth' });
      return [];
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  // Initier la connexion OAuth
  const initiateOAuth = useCallback(async (
    provider: 'github' | 'google', 
    action: 'login' | 'register' = 'login'
  ) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });

      console.log(`🔐 [OAUTH] Initiating ${provider} OAuth for ${action}...`);

      // Générer l'URL d'autorisation via GraphQL
      const response = await fetch(`${AUTH_CONFIG.GRAPHQL_URL}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-App-ID': AUTH_CONFIG.AUTH_APP.APP_ID,
          'X-App-Secret': AUTH_CONFIG.AUTH_APP.APP_SECRET,
          'X-Client-Name': 'auth-app-oauth',
        },
        credentials: 'include',
        body: JSON.stringify({
          query: `
            mutation GenerateOAuthUrl($input: OAuthAuthorizationInput!) {
              generateOAuthUrl(input: $input) {
                success
                authUrl
                state
                provider
                message
              }
            }
          `,
          variables: {
            input: {
              provider,
              redirectUri: `${AUTH_CONFIG.AUTH_URL}/oauth/callback`,
              scopes: provider === 'github' ? ['user:email', 'read:user'] : ['openid', 'email', 'profile'],
              originalUrl: `/oauth/success?action=${action}`,
            },
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const result = await response.json();
      
      if (result.errors) {
        throw new Error(result.errors[0].message);
      }

      const oauthData = result.data?.generateOAuthUrl;
      
      if (oauthData?.success && oauthData.authUrl) {
        console.log(`🚀 [OAUTH] Redirecting to ${provider}:`, oauthData.authUrl);
        
        // Stocker l'action dans localStorage pour après callback
        localStorage.setItem('oauth_action', action);
        localStorage.setItem('oauth_provider', provider);
        
        dispatch({ type: 'SET_REDIRECTING', payload: true });
        
        // Redirection vers le provider OAuth
        window.location.href = oauthData.authUrl;
      } else {
        throw new Error(oauthData?.message || 'Failed to generate OAuth URL');
      }

    } catch (error: any) {
      console.error(`❌ [OAUTH] Error initiating ${provider} OAuth:`, error);
      dispatch({ type: 'SET_ERROR', payload: error.message || `Erreur lors de l'initialisation OAuth ${provider}` });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const clearError = useCallback(() => {
    dispatch({ type: 'SET_ERROR', payload: null });
  }, []);

  const contextValue: OAuthContextType = {
    state,
    initiateOAuth,
    getAvailableProviders,
    clearError,
  };

  return (
    <OAuthContext.Provider value={contextValue}>
      {children}
    </OAuthContext.Provider>
  );
}

export function useOAuth(): OAuthContextType {
  const context = useContext(OAuthContext);
  if (context === undefined) {
    throw new Error('useOAuth must be used within an OAuthProvider');
  }
  return context;
}