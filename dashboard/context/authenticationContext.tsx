// dashboard/context/authenticationContext.tsx - VERSION ROBUSTE AVEC GESTION D'ÉCHECS
'use client';

import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import authAPI from '@/src/services/api/authAPI';
import { AUTH_CONFIG, validateAuthConfig } from '@/src/config/auth.config';
import { SharedSessionManager, SessionData } from '@/src/lib/SharedSessionManager';

interface User {
  userID: string;
  username: string | undefined;
  email?: string;
  profileID: string;
  accessibleOrganizations: any[];
  organizations: string[];
  sub: string;
  roles: string[];
  given_name?: string;
  family_name?: string;
  state?: string;
  email_verified?: boolean;
  attributes?: any;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  token: string | null;
  refreshToken: string | null;
  // Nouveaux états pour gestion robuste
  appAuthFailed: boolean;
  retryCount: number;
  canUseExistingSession: boolean;
}

interface AuthContextType {
  state: AuthState;
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Méthodes principales
  logout: () => Promise<void>;
  refreshToken: () => Promise<boolean>;
  getCurrentUser: () => Promise<void>;
  validateSession: () => Promise<boolean>;
  clearError: () => void;
  
  // Méthodes utilitaires
  getUserID: () => string | null;
  testAppAuth: () => Promise<{ success: boolean; error?: string }>;
  redirectToAuth: (returnUrl?: string) => void;
  
  // Nouvelles méthodes pour gestion robuste
  retryAuth: () => Promise<void>;
  skipAppAuth: () => void;
  
  // Compatibilité legacy
  authLoading: boolean;
}

type AuthAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'SET_TOKENS'; payload: { token: string; refreshToken?: string } }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_AUTHENTICATED'; payload: boolean }
  | { type: 'SET_APP_AUTH_FAILED'; payload: boolean }
  | { type: 'INCREMENT_RETRY'; }
  | { type: 'RESET_RETRY'; }
  | { type: 'SET_CAN_USE_EXISTING_SESSION'; payload: boolean }
  | { type: 'CLEAR_AUTH' };

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
  token: null,
  refreshToken: null,
  appAuthFailed: false,
  retryCount: 0,
  canUseExistingSession: false,
};

function authReducer(state: AuthState, action: AuthAction): AuthState {
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

    case 'SET_APP_AUTH_FAILED':
      return { ...state, appAuthFailed: action.payload };

    case 'INCREMENT_RETRY':
      return { ...state, retryCount: state.retryCount + 1 };

    case 'RESET_RETRY':
      return { ...state, retryCount: 0 };

    case 'SET_CAN_USE_EXISTING_SESSION':
      return { ...state, canUseExistingSession: action.payload };
    
    case 'CLEAR_AUTH':
      SharedSessionManager.clearSession();
      return {
        ...initialState,
        isLoading: false,
      };
    
    default:
      return state;
  }
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  const handleAutoLogout = useCallback(() => {
    dispatch({ type: 'CLEAR_AUTH' });
  }, []);

  // Test de l'authentification app Dashboard avec gestion d'échecs
  const testAppAuth = useCallback(async (): Promise<{ success: boolean; error?: string }> => {
    try {
      console.log('🔧 [DASHBOARD-AUTH] Test authentification application Dashboard...');
      
      validateAuthConfig();
      console.log('✅ [DASHBOARD-AUTH] Configuration validée');
      
      const result = await authAPI.testAppAuth();
      
      if (result.success) {
        console.log('✅ [DASHBOARD-AUTH] Authentification app Dashboard réussie');
        dispatch({ type: 'SET_APP_AUTH_FAILED', payload: false });
        dispatch({ type: 'RESET_RETRY' });
        return { success: true };
      } else {
        throw new Error(result.error || 'Erreur inconnue');
      }
      
    } catch (error: any) {
      console.error('❌ [DASHBOARD-AUTH] Échec auth app Dashboard:', error);
      dispatch({ type: 'SET_APP_AUTH_FAILED', payload: true });
      dispatch({ type: 'INCREMENT_RETRY' });
      
      return { 
        success: false, 
        error: error.message || 'Authentification application Dashboard échouée' 
      };
    }
  }, []);

  // Redirection vers l'app d'authentification
  const redirectToAuth = useCallback((returnUrl: string = '/account'): void => {
    const authUrl = new URL('/signin', AUTH_CONFIG.AUTH_URL);
    authUrl.searchParams.set('returnUrl', returnUrl);
    authUrl.searchParams.set('from', 'dashboard');
    
    console.log('🔄 [DASHBOARD-AUTH] Redirection vers auth:', authUrl.toString());
    window.location.href = authUrl.toString();
  }, []);

  // Essayer d'utiliser une session existante sans authentification app
  const tryUseExistingSession = useCallback(async (): Promise<boolean> => {
    try {
      console.log('🔄 [DASHBOARD-AUTH] Tentative utilisation session existante...');
      
      const existingSession = SharedSessionManager.getSession();
      
      if (existingSession && SharedSessionManager.isSessionValid(existingSession)) {
        console.log('✅ [DASHBOARD-AUTH] Session existante trouvée, validation...');
        
        // Essayer de valider directement avec le token existant
        // (sans authentification app au préalable)
        const validation = await authAPI.validateUserToken(existingSession.tokens.accessToken);
        
        if (validation.valid && validation.user) {
          dispatch({ 
            type: 'SET_TOKENS', 
            payload: { 
              token: existingSession.tokens.accessToken,
              refreshToken: existingSession.tokens.refreshToken
            }
          });
          dispatch({ type: 'SET_USER', payload: validation.user });
          SharedSessionManager.updateActivity();
          
          console.log('✅ [DASHBOARD-AUTH] Session existante validée avec succès');
          return true;
        }
      }
      
      return false;
    } catch (error: any) {
      console.warn('⚠️ [DASHBOARD-AUTH] Échec validation session existante:', error);
      return false;
    }
  }, []);

  // Nouvelle méthode pour réessayer l'authentification
  const retryAuth = useCallback(async (): Promise<void> => {
    if (state.retryCount >= 3) {
      console.log('🚫 [DASHBOARD-AUTH] Trop de tentatives, utilisation session existante ou redirection');
      
      const sessionWorked = await tryUseExistingSession();
      if (!sessionWorked) {
        redirectToAuth();
      }
      return;
    }

    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });
    
    const result = await testAppAuth();
    if (!result.success) {
      dispatch({ type: 'SET_ERROR', payload: result.error || 'Échec authentification' });
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [state.retryCount, testAppAuth, tryUseExistingSession, redirectToAuth]);

  // Ignorer l'authentification app et utiliser session existante
  const skipAppAuth = useCallback((): void => {
    console.log('⏭️ [DASHBOARD-AUTH] Ignorer auth app, utiliser session existante');
    dispatch({ type: 'SET_CAN_USE_EXISTING_SESSION', payload: true });
    
    tryUseExistingSession().then((success) => {
      if (!success) {
        redirectToAuth();
      }
    });
  }, [tryUseExistingSession, redirectToAuth]);

  // INITIALISATION ROBUSTE avec gestion d'échecs
  useEffect(() => {
    const initializeAuth = async (): Promise<void> => {
      console.log('🔧 [DASHBOARD-AUTH] Initialisation authentification...');
      dispatch({ type: 'SET_LOADING', payload: true });
      
      try {
        // 1. D'abord essayer d'utiliser une session existante
        const existingSessionWorked = await tryUseExistingSession();
        if (existingSessionWorked) {
          return; // Session existante validée, terminé !
        }

        // 2. Essayer l'authentification app (avec limites de retry)
        if (state.retryCount < 3 && !state.canUseExistingSession) {
          const appAuthResult = await testAppAuth();
          
          if (!appAuthResult.success) {
            console.error('❌ [DASHBOARD-AUTH] Authentification app échouée:', appAuthResult.error);
            dispatch({ type: 'SET_ERROR', payload: appAuthResult.error || 'Erreur authentification app' });
            dispatch({ type: 'SET_LOADING', payload: false });
            
            // Ne pas rediriger immédiatement, laisser l'utilisateur choisir
            return;
          }
        }
        
        // 3. Après auth app réussie, récupérer session
        const existingSession = SharedSessionManager.getSession();
        
        if (existingSession && SharedSessionManager.isSessionValid(existingSession)) {
          console.log('✅ [DASHBOARD-AUTH] Session partagée valide trouvée');
          
          const validation = await authAPI.validateUserToken(existingSession.tokens.accessToken);
          
          if (validation.valid && validation.user) {
            dispatch({ 
              type: 'SET_TOKENS', 
              payload: { 
                token: existingSession.tokens.accessToken,
                refreshToken: existingSession.tokens.refreshToken
              }
            });
            dispatch({ type: 'SET_USER', payload: validation.user });
            SharedSessionManager.updateActivity();
            
            console.log('✅ [DASHBOARD-AUTH] Session établie avec succès');
          } else {
            console.log('❌ [DASHBOARD-AUTH] Token invalide, nettoyage');
            SharedSessionManager.clearSession();
            dispatch({ type: 'SET_LOADING', payload: false });
            redirectToAuth();
          }
        } else {
          // 4. Essayer de finaliser une transition
          const transitionData = SharedSessionManager.completeTransition();
          
          if (transitionData && SharedSessionManager.isSessionValid(transitionData)) {
            console.log('✅ [DASHBOARD-AUTH] Transition complétée');
            
            const validation = await authAPI.validateUserToken(transitionData.tokens.accessToken);
            
            if (validation.valid && validation.user) {
              dispatch({ 
                type: 'SET_TOKENS', 
                payload: { 
                  token: transitionData.tokens.accessToken,
                  refreshToken: transitionData.tokens.refreshToken
                }
              });
              dispatch({ type: 'SET_USER', payload: validation.user });
              
              console.log('✅ [DASHBOARD-AUTH] Session établie via transition');
            } else {
              console.log('❌ [DASHBOARD-AUTH] Token transition invalide');
              SharedSessionManager.clearSession();
              dispatch({ type: 'SET_LOADING', payload: false });
              redirectToAuth();
            }
          } else {
            console.log('ℹ️ [DASHBOARD-AUTH] Aucune session trouvée');
            dispatch({ type: 'SET_LOADING', payload: false });
            
            // Si on a déjà essayé plusieurs fois l'auth app, rediriger directement
            if (state.retryCount >= 3 || state.appAuthFailed) {
              redirectToAuth();
            }
          }
        }
      } catch (error: any) {
        console.error('❌ [DASHBOARD-AUTH] Erreur initialisation:', error);
        dispatch({ type: 'SET_ERROR', payload: error.message || 'Erreur initialisation' });
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    initializeAuth();

    // Écouter les changements de session cross-app
    const unsubscribe = SharedSessionManager.onSessionChange((sessionData: SessionData | null) => {
      if (sessionData && SharedSessionManager.isSessionValid(sessionData)) {
        console.log('🔄 [DASHBOARD-AUTH] Session mise à jour depuis autre app');
        dispatch({ 
          type: 'SET_TOKENS', 
          payload: { 
            token: sessionData.tokens.accessToken, 
            refreshToken: sessionData.tokens.refreshToken
          } 
        });
        dispatch({ type: 'SET_USER', payload: sessionData.user });
      } else {
        console.log('🚪 [DASHBOARD-AUTH] Déconnexion depuis autre app');
        dispatch({ type: 'CLEAR_AUTH' });
      }
    });

    window.addEventListener('auth:logout', handleAutoLogout);
    
    return () => {
      unsubscribe();
      window.removeEventListener('auth:logout', handleAutoLogout);
    };
  }, [testAppAuth, redirectToAuth, handleAutoLogout, tryUseExistingSession, state.retryCount, state.appAuthFailed, state.canUseExistingSession]);

  // Déconnexion avec nettoyage session partagée
  const logout = useCallback(async (): Promise<void> => {
    dispatch({ type: 'SET_LOADING', payload: true });

    try {
      const token = localStorage.getItem('access_token');
      if (token) {
        await authAPI.logout(token);
      }
    } catch (error) {
      console.warn('❌ [DASHBOARD-AUTH] Échec déconnexion API:', error);
    } finally {
      SharedSessionManager.clearSession();
      
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('smp_user_0');
      localStorage.removeItem('dashboard_app_token');
      
      document.cookie = 'smp_user_0=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
      
      dispatch({ type: 'CLEAR_AUTH' });
      
      console.log('✅ [DASHBOARD-AUTH] Déconnexion terminée');
    }
  }, []);

  // Autres méthodes (refreshToken, getCurrentUser, validateSession, clearError, getUserID)
  const refreshToken = useCallback(async (): Promise<boolean> => {
    try {
      const currentSession = SharedSessionManager.getSession();
      if (!currentSession?.tokens.refreshToken) {
        console.log('❌ [DASHBOARD-AUTH] Pas de refresh token disponible');
        return false;
      }

      const validation = await authAPI.validateUserToken(currentSession.tokens.accessToken);
      
      if (validation.valid) {
        SharedSessionManager.updateActivity();
        console.log('✅ [DASHBOARD-AUTH] Token revalidé');
        return true;
      } else {
        console.log('❌ [DASHBOARD-AUTH] Échec revalidation token');
        return false;
      }
    } catch (error: any) {
      console.error('❌ [DASHBOARD-AUTH] Erreur rafraîchissement:', error);
      return false;
    }
  }, []);

  const getCurrentUser = useCallback(async (): Promise<void> => {
    try {
      const currentSession = SharedSessionManager.getSession();
      if (currentSession?.user) {
        dispatch({ type: 'SET_USER', payload: currentSession.user });
      }
    } catch (error: any) {
      console.error('❌ [DASHBOARD-AUTH] Erreur getCurrentUser:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Erreur lors de la récupération des informations utilisateur' });
    }
  }, []);

  const validateSession = useCallback(async (): Promise<boolean> => {
    try {
      const currentSession = SharedSessionManager.getSession();
      if (!currentSession || !SharedSessionManager.isSessionValid(currentSession)) {
        dispatch({ type: 'CLEAR_AUTH' });
        return false;
      }

      const validation = await authAPI.validateUserToken(currentSession.tokens.accessToken);
      if (validation.valid) {
        SharedSessionManager.updateActivity();
        return true;
      } else {
        dispatch({ type: 'CLEAR_AUTH' });
        return false;
      }
    } catch (error) {
      console.error('❌ [DASHBOARD-AUTH] Erreur validation session:', error);
      dispatch({ type: 'CLEAR_AUTH' });
      return false;
    }
  }, []);

  const clearError = useCallback((): void => {
    dispatch({ type: 'SET_ERROR', payload: null });
  }, []);

  const getUserID = useCallback((): string | null => {
    return state.user?.userID || null;
  }, [state.user]);

  const contextValue: AuthContextType = {
    state,
    user: state.user,
    isAuthenticated: state.isAuthenticated,
    isLoading: state.isLoading,
    error: state.error,
    
    logout,
    refreshToken,
    getCurrentUser,
    validateSession,
    clearError,
    
    getUserID,
    testAppAuth,
    redirectToAuth,
    retryAuth,
    skipAppAuth,
    
    authLoading: state.isLoading,
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

export function useEnhancedAuth(): AuthContextType {
  return useAuth();
}