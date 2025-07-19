'use client';

import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { SMPClient, Persistence } from 'smp-sdk-ts';
import { User, AuthState, LoginRequest, AuthError } from '@/types/auth';


const storage = new Persistence('localStorage');

const smpClient = new SMPClient({
  appId: process.env.NEXT_PUBLIC_APP_ID || '',
  appSecret: process.env.NEXT_PUBLIC_APP_SECRET || '',
  apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000',
  graphqlUrl: process.env.NEXT_PUBLIC_GRAPHQL_URL || 'http://localhost:4000/graphql',
  defaultLanguage: 'fr_FR',
  appAccessDuration: 30,
  userAccessDuration: 30,
  minUserAccessDuration: 30,
  minAppAccessDuration: 30,
  persistence: 'localStorage', 
  storage: storage, 
});

interface AuthContextType {
  state: AuthState;
  login: (credentials: LoginRequest) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<boolean>;
  getCurrentUser: () => Promise<void>;
  validateSession: () => Promise<boolean>;
  clearError: () => void;
  isTokenExpiringSoon: () => boolean;
  
  // Magic Link integration
  loginWithMagicLink: (token: string) => Promise<{ success: boolean; error?: string }>;
  requestMagicLink: (email: string, action?: 'login' | 'register') => Promise<{ success: boolean; error?: string }>;
  
  // Password reset integration
  requestPasswordReset: (email: string) => Promise<{ success: boolean; error?: string }>;
  resetPassword: (token: string, newPassword: string) => Promise<{ success: boolean; error?: string }>;
}

type AuthAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'SET_TOKENS'; payload: { token: string; refreshToken?: string; sessionId?: string } }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_AUTHENTICATED'; payload: boolean }
  | { type: 'SET_REFRESHING'; payload: boolean }
  | { type: 'UPDATE_LAST_ACTIVITY' }
  | { type: 'CLEAR_AUTH' };

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
  token: null,
  refreshToken: null,
};

interface ExtendedAuthState extends AuthState {
  sessionId: string | null;
  lastActivity: Date | null;
  isRefreshing: boolean;
}

const extendedInitialState: ExtendedAuthState = {
  ...initialState,
  sessionId: null,
  lastActivity: null,
  isRefreshing: false,
};

function authReducer(state: ExtendedAuthState, action: AuthAction): ExtendedAuthState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    
    case 'SET_USER':
      return { 
        ...state, 
        user: action.payload,
        isAuthenticated: !!action.payload,
        isLoading: false,
        error: null
      };
    
    case 'SET_TOKENS':
      return {
        ...state,
        token: action.payload.token,
        refreshToken: action.payload.refreshToken || state.refreshToken,
        sessionId: action.payload.sessionId || state.sessionId,
        isAuthenticated: true,
        error: null
      };
    
    case 'SET_ERROR':
      return { 
        ...state, 
        error: action.payload,
        isLoading: false
      };
    
    case 'SET_AUTHENTICATED':
      return { ...state, isAuthenticated: action.payload };
    
    case 'SET_REFRESHING':
      return { ...state, isRefreshing: action.payload };
    
    case 'UPDATE_LAST_ACTIVITY':
      return { ...state, lastActivity: new Date() };
    
    case 'CLEAR_AUTH':
      return {
        ...extendedInitialState,
        isLoading: false,
      };
    
    default:
      return state;
  }
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, extendedInitialState);

  const handleAutoLogout = useCallback(() => {
    dispatch({ type: 'CLEAR_AUTH' });
  }, []);

  useEffect(() => {
    const initializeAuth = async () => {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      try {
        // Initialiser la SDK
        await smpClient.authenticateApp();
        
        // Vérifier les tokens stockés
        const storedToken = localStorage.getItem('access_token');
        const storedRefreshToken = localStorage.getItem('refresh_token');
        const storedUser = localStorage.getItem('smp_user_0');
        
        if (storedToken && storedUser) {
          try {
            const user = JSON.parse(storedUser);
            
            // Valider le token avec la SDK (si cette fonctionnalité existe)
            // Pour l'instant, on fait confiance au token stocké
            dispatch({ 
              type: 'SET_TOKENS', 
              payload: { 
                token: storedToken, 
                refreshToken: storedRefreshToken || undefined 
              } 
            });
            dispatch({ type: 'SET_USER', payload: user });
            dispatch({ type: 'UPDATE_LAST_ACTIVITY' });
          } catch (error) {
            console.error('Failed to parse stored user data:', error);
            dispatch({ type: 'CLEAR_AUTH' });
          }
        } else {
          dispatch({ type: 'SET_LOADING', payload: false });
        }
      } catch (error: any) {
        console.error('Auth initialization failed:', error);
        dispatch({ type: 'CLEAR_AUTH' });
      }
    };

    initializeAuth();

    window.addEventListener('auth:logout', handleAutoLogout);
    
    return () => {
      window.removeEventListener('auth:logout', handleAutoLogout);
    };
  }, [handleAutoLogout]);

  // Connexion classique avec la SDK
  const login = useCallback(async (credentials: LoginRequest) => {
    console.log('🔄 [SDK] Starting login with:', { username: credentials.username });
    
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      const response = await smpClient.authenticateUser(credentials.username, credentials.password);
      console.log('📝 [SDK] Authentication response received:', response);
      
      if (!response || !response.user) {
        throw new Error('No user data received from authentication');
      }

      // Stocker les tokens
      const accessToken = await smpClient.getUserAccessToken();
      const refreshToken = await smpClient.getUserRefreshToken();

      if (accessToken) {
        localStorage.setItem('access_token', accessToken);
        if (refreshToken) {
          localStorage.setItem('refresh_token', refreshToken);
        }

        dispatch({
          type: 'SET_TOKENS',
          payload: {
            token: accessToken,
            refreshToken: refreshToken || undefined,
          }
        });

        // Créer l'objet utilisateur compatible
        const user = {
          userID: response.user.userID,
          username: response.user.username,
          email: response.user.email,
          profileID: response.user.profileID,
          accessibleOrganizations: [],
          organizations: [],
          sub: response.user.userID,
          roles: [],
        };

        dispatch({ type: 'SET_USER', payload: user });
        
        // Sauvegarder dans localStorage et cookie
        const cookieString = JSON.stringify(user);
        localStorage.setItem("smp_user_0", cookieString);
        
        const cookieValue = encodeURIComponent(cookieString);
        const isSecure = typeof window !== 'undefined' && window.location.protocol === 'https:';
        document.cookie = `smp_user_0=${cookieValue}; path=/; max-age=604800; SameSite=Lax${isSecure ? '; Secure' : ''}`;
        
        console.log('✅ [SDK] Login completed successfully');
        dispatch({ type: 'UPDATE_LAST_ACTIVITY' });
        
        return { success: true };
      } else {
        throw new Error('No access token received');
      }
      
    } catch (error: any) {
      console.error('❌ [SDK] Login error:', error);
      const errorMessage = error.message || 'Erreur de connexion';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      return { success: false, error: errorMessage };
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  // Déconnexion avec la SDK
  const logout = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: true });

    try {
      await smpClient.logoutUser();
    } catch (error) {
      console.warn('SDK logout failed:', error);
    } finally {
      // Nettoyer le stockage local
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('smp_user_0');
      
      // Supprimer le cookie
      document.cookie = 'smp_user_0=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
      
      dispatch({ type: 'CLEAR_AUTH' });
    }
  }, []);

  // Rafraîchissement de token
  const refreshToken = useCallback(async (): Promise<boolean> => {
    if (state.isRefreshing) {
      return false;
    }

    dispatch({ type: 'SET_REFRESHING', payload: true });

    try {
      const newAccessToken = await smpClient.getUserAccessToken();
      
      if (newAccessToken) {
        localStorage.setItem('access_token', newAccessToken);
        
        dispatch({
          type: 'SET_TOKENS',
          payload: {
            token: newAccessToken,
          }
        });
        dispatch({ type: 'UPDATE_LAST_ACTIVITY' });
        return true;
      } else {
        throw new Error('Token refresh failed');
      }
    } catch (error: any) {
      console.error('Token refresh failed:', error);
      dispatch({ type: 'CLEAR_AUTH' });
      return false;
    } finally {
      dispatch({ type: 'SET_REFRESHING', payload: false });
    }
  }, [state.isRefreshing]);

  // Obtenir l'utilisateur actuel
  const getCurrentUser = useCallback(async () => {
    try {
      // Pour l'instant, utiliser les données stockées
      // Plus tard, on pourra implémenter une méthode SDK pour récupérer les infos utilisateur
      const storedUser = localStorage.getItem('smp_user_0');
      if (storedUser) {
        const user = JSON.parse(storedUser);
        dispatch({ type: 'SET_USER', payload: user });
      }
    } catch (error: any) {
      console.error('Failed to get current user:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Erreur lors de la récupération des informations utilisateur' });
    }
  }, []);

  // Validation de session
  const validateSession = useCallback(async (): Promise<boolean> => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        dispatch({ type: 'CLEAR_AUTH' });
        return false;
      }

      // Pour l'instant, on fait confiance au token
      // Plus tard, on pourra implémenter une validation côté serveur
      dispatch({ type: 'UPDATE_LAST_ACTIVITY' });
      return true;
    } catch (error) {
      console.error('Session validation failed:', error);
      dispatch({ type: 'CLEAR_AUTH' });
      return false;
    }
  }, []);

  // Connexion avec Magic Link
  const loginWithMagicLink = useCallback(async (token: string) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      const result = await smpClient.magicLink.verify({ token });
      
      if (result.success) {
        if (result.accessToken) {
          localStorage.setItem('access_token', result.accessToken);
          if (result.refreshToken) {
            localStorage.setItem('refresh_token', result.refreshToken);
          }

          dispatch({
            type: 'SET_TOKENS',
            payload: {
              token: result.accessToken,
              refreshToken: result.refreshToken,
            }
          });
        }

        if (result.user) {
          const user = {
            userID: result.user.sub || result.user.userID,
            username: result.user.preferred_username || result.user.username,
            email: result.user.email,
            profileID: result.user.profileID || result.user.sub,
            accessibleOrganizations: result.user.organization_ids || [],
            sub: result.user.sub,
            roles: result.user.roles || [],
          };

          dispatch({ type: 'SET_USER', payload: user });
          
          // Sauvegarder dans localStorage et cookie
          const cookieString = JSON.stringify(user);
          localStorage.setItem("smp_user_0", cookieString);
          
          const cookieValue = encodeURIComponent(cookieString);
          const isSecure = typeof window !== 'undefined' && window.location.protocol === 'https:';
          document.cookie = `smp_user_0=${cookieValue}; path=/; max-age=604800; SameSite=Lax${isSecure ? '; Secure' : ''}`;
        }
        
        dispatch({ type: 'UPDATE_LAST_ACTIVITY' });
        return { success: true };
      } else {
        const errorMessage = result.message || 'Échec de la connexion Magic Link';
        dispatch({ type: 'SET_ERROR', payload: errorMessage });
        return { success: false, error: errorMessage };
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Erreur de connexion Magic Link';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      return { success: false, error: errorMessage };
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  // Demander un Magic Link
  const requestMagicLink = useCallback(async (email: string, action?: 'login' | 'register') => {
    try {
      const result = await smpClient.magicLink.generate({
        email,
        action: action || 'login',
        redirectUrl: '/account',
        userAgent: typeof window !== 'undefined' ? navigator.userAgent : '',
        referrer: typeof window !== 'undefined' ? window.location.href : '',
      });
      
      return result;
    } catch (error: any) {
      return { 
        success: false, 
        error: error.message || 'Erreur lors de la demande de Magic Link' 
      };
    }
  }, []);

  // Demander un reset de mot de passe
  const requestPasswordReset = useCallback(async (email: string) => {
    try {
      const result = await smpClient.Password.forgotPassword(email);
      
      return {
        success: result.success,
        error: result.success ? undefined : result.message
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Erreur lors de la demande de reset'
      };
    }
  }, []);

  // Reset de mot de passe
  const resetPassword = useCallback(async (token: string, newPassword: string) => {
    try {
      const result = await smpClient.Password.resetPassword({ token, newPassword });
      
      return {
        success: result.success,
        error: result.success ? undefined : result.message
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Erreur lors du reset du mot de passe'
      };
    }
  }, []);

  const clearError = useCallback(() => {
    dispatch({ type: 'SET_ERROR', payload: null });
  }, []);

  const isTokenExpiringSoon = useCallback((): boolean => {
    // Implémentation simplifiée - toujours retourner false
    // Plus tard, on pourra analyser l'expiration du JWT
    return false;
  }, []);

  const publicState: AuthState = {
    user: state.user,
    isAuthenticated: state.isAuthenticated,
    isLoading: state.isLoading,
    error: state.error,
    token: state.token,
    refreshToken: state.refreshToken,
  };

  const contextValue: AuthContextType = {
    state: publicState,
    login,
    logout,
    refreshToken,
    getCurrentUser,
    validateSession,
    clearError,
    isTokenExpiringSoon,
    loginWithMagicLink,
    requestMagicLink,
    requestPasswordReset,
    resetPassword,
  };

  return React.createElement(
    AuthContext.Provider,
    { value: contextValue },
    children
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within a AuthProvider');
  }
  return context;
}

// Hook de compatibilité pour l'ancien useEnhancedAuth
export function useEnhancedAuth() {
  return useAuth();
}