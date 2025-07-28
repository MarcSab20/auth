// dashboard/context/authenticationContext.tsx - VERSION AVEC SESSION PARTAGÉE
'use client';

import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import authAPI from '@/src/services/api/authAPI';
import { AUTH_CONFIG, validateAuthConfig } from '@/src/config/auth.config';
import { SharedSessionManager, SessionData } from '@/src/lib/SharedSessionManager';
import { TransitionService } from '@/src/lib/TransitionService';

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
  
  // Compatibilité legacy
  authLoading: boolean;
}

type AuthAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'SET_TOKENS'; payload: { token: string; refreshToken?: string } }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_AUTHENTICATED'; payload: boolean }
  | { type: 'CLEAR_AUTH' };

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
  token: null,
  refreshToken: null,
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

  // Test de l'authentification app Dashboard
  const testAppAuth = useCallback(async () => {
    try {
      console.log('🔧 [DASHBOARD-AUTH] Test authentification application Dashboard...');
      
      validateAuthConfig();
      console.log('✅ [DASHBOARD-AUTH] Configuration validée');
      
      const result = await authAPI.testAppAuth();
      
      if (result.success) {
        console.log('✅ [DASHBOARD-AUTH] Authentification app Dashboard réussie');
        return { success: true };
      } else {
        throw new Error(result.error);
      }
      
    } catch (error: any) {
      console.error('❌ [DASHBOARD-AUTH] Échec auth app Dashboard:', error);
      return { 
        success: false, 
        error: error.message || 'Authentification application Dashboard échouée' 
      };
    }
  }, []);

  // Finaliser la transition depuis Auth
  const completeTransitionFromAuth = useCallback(async (): Promise<SessionData | null> => {
    try {
      console.log('🔄 [DASHBOARD-AUTH] Finalisation transition depuis Auth...');
      
      const sessionData = SharedSessionManager.completeTransition();
      
      if (sessionData && SharedSessionManager.isSessionValid(sessionData)) {
        console.log('✅ [DASHBOARD-AUTH] Transition depuis Auth complétée');
        
        // Valider le token avec le backend Dashboard
        const validation = await authAPI.validateUserToken(sessionData.tokens.accessToken);
        
        if (validation.valid && validation.user) {
          return sessionData;
        } else {
          console.log('❌ [DASHBOARD-AUTH] Token invalide après transition, nettoyage');
          SharedSessionManager.clearSession();
          return null;
        }
      }
      
      return sessionData;
      
    } catch (error: any) {
      console.error('❌ [DASHBOARD-AUTH] Erreur transition:', error);
      SharedSessionManager.clearSession();
      return null;
    }
  }, []);

  // Initialisation et récupération de session partagée
 useEffect(() => {
  const initializeAuth = async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      // 1. Authentifier l'app Dashboard
      const appAuthResult = await testAppAuth();
      if (!appAuthResult.success) {
        throw new Error(`Authentification app Dashboard échouée: ${appAuthResult.error}`);
      }
      
      // 2. Finaliser la transition ou récupérer session existante
      const transitionData = TransitionService.completeTransition();
      
      if (transitionData) {
        // Valider le token avec le backend
        const validation = await authAPI.validateUserToken(transitionData.accessToken);
        
        if (validation.valid && validation.user) {
          dispatch({ type: 'SET_TOKENS', payload: { 
            token: transitionData.accessToken,
            refreshToken: transitionData.refreshToken
          }});
          dispatch({ type: 'SET_USER', payload: validation.user });
          
          console.log('✅ [DASHBOARD-AUTH] Session établie avec succès');
        } else {
          console.log('❌ [DASHBOARD-AUTH] Token invalide, nettoyage');
          TransitionService.clearSession();
          redirectToAuth();
        }
      } else {
        console.log('ℹ️ [DASHBOARD-AUTH] Aucune session trouvée');
        redirectToAuth();
      }
    } catch (error: any) {
      console.error('❌ [DASHBOARD-AUTH] Erreur initialisation:', error);
      dispatch({ type: 'SET_ERROR', payload: error.message });
      redirectToAuth();
    }
  };

  initializeAuth();
}, []);

  // Redirection vers l'app d'authentification
   const redirectToAuth = useCallback((returnUrl: string = '/account') => {
  const authUrl = new URL('/signin', AUTH_CONFIG.AUTH_URL);
  authUrl.searchParams.set('returnUrl', returnUrl);
  authUrl.searchParams.set('from', 'dashboard');
  
  window.location.href = authUrl.toString();
}, []);

  // Déconnexion avec nettoyage session partagée
  const logout = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: true });

    try {
      const token = localStorage.getItem('access_token');
      if (token) {
        await authAPI.logout(token);
      }
    } catch (error) {
      console.warn('❌ [DASHBOARD-AUTH] Échec déconnexion API:', error);
    } finally {
      // Nettoyer la session partagée
      SharedSessionManager.clearSession();
      
      // Nettoyer le stockage local
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('smp_user_0');
      localStorage.removeItem('dashboard_app_token');
      
      // Supprimer les cookies
      document.cookie = 'smp_user_0=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
      
      dispatch({ type: 'CLEAR_AUTH' });
      
      console.log('✅ [DASHBOARD-AUTH] Déconnexion terminée');
    }
  }, []);

  // Rafraîchissement de token (placeholder)
  const refreshToken = useCallback(async (): Promise<boolean> => {
    console.log('🔄 [DASHBOARD-AUTH] Rafraîchissement token non implémenté');
    return false;
  }, []);

  // Obtenir l'utilisateur actuel
  const getCurrentUser = useCallback(async () => {
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

  // Validation de session
  const validateSession = useCallback(async (): Promise<boolean> => {
    try {
      const currentSession = SharedSessionManager.getSession();
      if (!currentSession || !SharedSessionManager.isSessionValid(currentSession)) {
        dispatch({ type: 'CLEAR_AUTH' });
        return false;
      }

      const validation = await authAPI.validateUserToken(currentSession.tokens.accessToken);
      if (validation.valid) {
        // Mettre à jour l'activité
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

 

  const clearError = useCallback(() => {
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
    
    // Compatibilité legacy
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

// Export pour compatibilité
export function useEnhancedAuth() {
  return useAuth();
}