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
  scopes?: string[];
  authUrl?: string;
  supportsRefresh?: boolean;
  description?: string;
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
      return { ...state, isLoading: action.payload, error: action.payload ? null : state.error };
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false, isRedirecting: false };
    case 'SET_REDIRECTING':
      return { ...state, isRedirecting: action.payload, error: action.payload ? null : state.error };
    case 'SET_PROVIDERS':
      return { ...state, providers: action.payload };
    default:
      return state;
  }
}

const OAuthContext = createContext<OAuthContextType | undefined>(undefined);

export function OAuthProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(oauthReducer, initialState);

  // 🔧 FIX: Fonction pour générer un état sécurisé
  const generateSecureState = useCallback((): string => {
    const array = new Uint8Array(32);
    if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
      window.crypto.getRandomValues(array);
    } else {
      // Fallback pour les environnements sans crypto API
      for (let i = 0; i < array.length; i++) {
        array[i] = Math.floor(Math.random() * 256);
      }
    }
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }, []);

  // Obtenir les providers disponibles depuis le backend
  const getAvailableProviders = useCallback(async (): Promise<OAuthProvider[]> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      console.log('🔄 [OAUTH-CONTEXT] Loading providers from backend...');

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
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (result.errors) {
        throw new Error(result.errors[0].message);
      }

      const providers = result.data?.getAvailableOAuthProviders || [];
      
      // Convertir vers le format attendu
      const formattedProviders: OAuthProvider[] = providers.map((p: any) => ({
        name: p.name,
        displayName: p.displayName,
        enabled: p.enabled && p.configured,
        configured: p.configured,
        iconUrl: p.iconUrl,
        scopes: p.scopes,
        authUrl: p.authUrl,
        supportsRefresh: p.supportsRefresh,
        description: p.description
      }));

      dispatch({ type: 'SET_PROVIDERS', payload: formattedProviders });
      console.log('✅ [OAUTH-CONTEXT] Providers loaded from backend:', formattedProviders.length);
      
      return formattedProviders;

    } catch (error: any) {
      console.error('❌ [OAUTH-CONTEXT] Error fetching providers from backend:', error);
      
      // 🔧 FIX: Fallback vers des providers par défaut basés sur la configuration
      const fallbackProviders: OAuthProvider[] = [];
      
      // Vérifier GitHub OAuth depuis la config
      if (AUTH_CONFIG.AUTH_APP.APP_ID && process.env.NEXT_PUBLIC_GITHUB_OAUTH_ENABLED === 'true') {
        fallbackProviders.push({
          name: 'github',
          displayName: 'GitHub',
          enabled: true,
          configured: true,
          scopes: ['user:email', 'read:user'],
          description: 'Connexion avec GitHub'
        });
      }
      
      // Vérifier Google OAuth depuis la config
      if (AUTH_CONFIG.AUTH_APP.APP_ID && process.env.NEXT_PUBLIC_GOOGLE_OAUTH_ENABLED === 'true') {
        fallbackProviders.push({
          name: 'google',
          displayName: 'Google',
          enabled: true,
          configured: true,
          scopes: ['openid', 'email', 'profile'],
          description: 'Connexion avec Google'
        });
      }

      dispatch({ type: 'SET_ERROR', payload: 'Backend OAuth temporairement indisponible - mode fallback actif' });
      dispatch({ type: 'SET_PROVIDERS', payload: fallbackProviders });
      
      return fallbackProviders;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  // Initier la connexion OAuth via le backend
  const initiateOAuth = useCallback(async (
    provider: 'github' | 'google', 
    action: 'login' | 'register' = 'login'
  ) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });

      console.log(`🔐 [OAUTH-CONTEXT] Initiating ${provider} OAuth via backend for ${action}...`);

      // 🔧 FIX: Générer un état sécurisé
      const secureState = generateSecureState();
      console.log('🔒 [OAUTH-CONTEXT] Generated secure state:', secureState.substring(0, 8) + '...');

      // 1. Générer l'URL d'autorisation via le backend
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
                expiresAt
                message
              }
            }
          `,
          variables: {
            input: {
              provider,
              redirectUri: `${window.location.origin}/oauth/callback`,
              scopes: provider === 'github' ? ['user:email', 'read:user'] : ['openid', 'email', 'profile'],
              originalUrl: `/oauth/success?action=${action}`,
            },
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (result.errors) {
        throw new Error(result.errors[0].message);
      }

      const oauthData = result.data?.generateOAuthUrl;
      
      if (oauthData?.success && oauthData.authUrl) {
        console.log(`🚀 [OAUTH-CONTEXT] Backend generated URL for ${provider}:`, oauthData.authUrl);
        
        // 2. Stocker l'action et le state dans localStorage pour le callback
        if (typeof window !== 'undefined') {
          localStorage.setItem('oauth_action', action);
          localStorage.setItem('oauth_provider', provider);
          // 🔧 FIX: Utiliser l'état retourné par le backend ou notre état sécurisé comme fallback
          localStorage.setItem('oauth_state', oauthData.state || secureState);
          
          console.log('💾 [OAUTH-CONTEXT] OAuth data stored in localStorage');
        }
        
        dispatch({ type: 'SET_REDIRECTING', payload: true });
        
        // 3. Redirection vers l'URL générée par le backend
        window.location.href = oauthData.authUrl;
      } else {
        throw new Error(oauthData?.message || 'Failed to generate OAuth URL');
      }

    } catch (error: any) {
      console.error(`❌ [OAUTH-CONTEXT] Direct OAuth fallback failed for ${provider}:`, error);
      dispatch({ 
        type: 'SET_ERROR', 
        payload: `Échec de l'OAuth direct pour ${provider}: ${error.message}` 
      });
    }
  }, [generateSecureState]);

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