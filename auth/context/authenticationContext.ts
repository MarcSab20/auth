// auth/context/authenticationContext.tsx - VERSION AVEC TRANSITION
'use client';

import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { SMPClient, Persistence } from 'smp-sdk-ts';
import { User, AuthState, LoginRequest, AuthError } from '@/types/auth';
import { AUTH_CONFIG, validateAuthConfig } from '@/src/config/auth.config';
import { SharedSessionManager, SessionData } from '@/src/lib/SharedSessionManager';
import authAPI from '@/src/services/api/authAPI';

const storage = new Persistence('localStorage');

const smpClient = new SMPClient({
  appId: AUTH_CONFIG.APP_ID,
  appSecret: AUTH_CONFIG.APP_SECRET,
  apiUrl: AUTH_CONFIG.API_URL,
  graphqlUrl: AUTH_CONFIG.GRAPHQL_URL,
  defaultLanguage: 'fr_FR',
  appAccessDuration: AUTH_CONFIG.APP_ACCESS_DURATION,
  userAccessDuration: AUTH_CONFIG.USER_ACCESS_DURATION,
  minUserAccessDuration: AUTH_CONFIG.MIN_ACCESS_DURATION,
  minAppAccessDuration: AUTH_CONFIG.MIN_ACCESS_DURATION,
  persistence: 'localStorage', 
  storage: storage, 
});

interface AuthContextType {
  state: AuthState;
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  login: (credentials: LoginRequest) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<boolean>;
  getCurrentUser: () => Promise<void>;
  validateSession: () => Promise<boolean>;
  clearError: () => void;
  isTokenExpiringSoon: () => boolean;
  
  // Méthodes de transition
  redirectToDashboard: (returnUrl?: string) => Promise<void>;
  testAppAuth: () => Promise<{ success: boolean; error?: string }>;
  
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
      SharedSessionManager.clearSession();
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

  // Test de l'authentification app
  const testAppAuth = useCallback(async () => {
    try {
      console.log('🔧 [AUTH] Test authentification application...');
      
      validateAuthConfig();
      console.log('✅ [AUTH] Configuration validée');
      
      const result = await authAPI.testAppAuth();
      
      if (result.success) {
        console.log('✅ [AUTH] Authentification app réussie');
        return { success: true };
      } else {
        throw new Error(result.error);
      }
      
    } catch (error: any) {
      console.error('❌ [AUTH] Échec auth app:', error);
      return { 
        success: false, 
        error: error.message || 'Authentification application échouée' 
      };
    }
  }, []);

  // Initialisation et récupération session existante depuis SharedSessionManager
  useEffect(() => {
    const initializeAuth = async () => {
      console.log('🔧 [AUTH] Initialisation authentification avec session partagée...');
      dispatch({ type: 'SET_LOADING', payload: true });
      
      try {
        // 1. Test de l'authentification app
        const appAuthResult = await testAppAuth();
        if (!appAuthResult.success) {
          throw new Error(`Authentification app échouée: ${appAuthResult.error}`);
        }
        
        // 2. Vérifier session partagée existante
        const existingSession = SharedSessionManager.getSession();
        
        if (existingSession && SharedSessionManager.isSessionValid(existingSession)) {
          console.log('✅ [AUTH] Session partagée valide trouvée');
          
          // Restaurer la session dans le state
          dispatch({ 
            type: 'SET_TOKENS', 
            payload: { 
              token: existingSession.tokens.accessToken, 
              refreshToken: existingSession.tokens.refreshToken,
              sessionId: existingSession.sessionId
            } 
          });
          dispatch({ type: 'SET_USER', payload: existingSession.user });
          dispatch({ type: 'UPDATE_LAST_ACTIVITY' });
          
          console.log('✅ [AUTH] Session restaurée depuis SharedSessionManager');
        } else {
          console.log('ℹ️ [AUTH] Aucune session partagée valide trouvée');
          dispatch({ type: 'SET_LOADING', payload: false });
        }
      } catch (error: any) {
        console.error('❌ [AUTH] Erreur initialisation:', error);
        dispatch({ type: 'CLEAR_AUTH' });
        dispatch({ type: 'SET_ERROR', payload: error.message });
      }
    };

    initializeAuth();

    // Écouter les changements de session cross-app
    const unsubscribe = SharedSessionManager.onSessionChange((sessionData) => {
      if (sessionData && SharedSessionManager.isSessionValid(sessionData)) {
        console.log('🔄 [AUTH] Session mise à jour depuis autre app');
        dispatch({ 
          type: 'SET_TOKENS', 
          payload: { 
            token: sessionData.tokens.accessToken, 
            refreshToken: sessionData.tokens.refreshToken,
            sessionId: sessionData.sessionId
          } 
        });
        dispatch({ type: 'SET_USER', payload: sessionData.user });
      } else {
        console.log('🚪 [AUTH] Déconnexion depuis autre app');
        dispatch({ type: 'CLEAR_AUTH' });
      }
    });

    window.addEventListener('auth:logout', handleAutoLogout);
    
    return () => {
      unsubscribe();
      window.removeEventListener('auth:logout', handleAutoLogout);
    };
  }, [handleAutoLogout, testAppAuth]);

  // Connexion avec création de session partagée
  const login = useCallback(async (credentials: LoginRequest) => {
  console.log('🔄 [AUTH] Début processus connexion...');
  
  dispatch({ type: 'SET_LOADING', payload: true });
  dispatch({ type: 'SET_ERROR', payload: null });

  try {
    // Étape 1: Authentification app
    const appAuthResult = await testAppAuth();
    if (!appAuthResult.success) {
      throw new Error(`ÉCHEC_AUTH_APP: ${appAuthResult.error}`);
    }
    
    // Étape 2: Authentification utilisateur
    const result = await authAPI.signIn({
      username: credentials.username,
      password: credentials.password
    });

    console.log('✅ [AUTH] Connexion utilisateur réussie');

    // CORRECTION : Récupérer les données utilisateur depuis la validation du token
    let user: User;
    
    if (result.accessToken) {
      // Valider le token pour récupérer les informations utilisateur complètes
      const validation = await authAPI.validateUserToken(result.accessToken);
      
      if (validation.valid && validation.user) {
        user = {
          userID: validation.user.userID,
          username: validation.user.username || credentials.username,
          email: validation.user.email || credentials.username,
          profileID: validation.user.profileID,
          accessibleOrganizations: validation.user.accessibleOrganizations || [],
          organizations: validation.user.organizations || [],
          sub: validation.user.sub,
          roles: validation.user.roles || [],
          given_name: validation.user.given_name,
          family_name: validation.user.family_name,
          state: validation.user.state,
          email_verified: validation.user.email_verified,
          attributes: validation.user.attributes
        };
      } else {
        throw new Error('Impossible de récupérer les informations utilisateur');
      }
    } else {
      throw new Error('Aucun token d\'accès reçu');
    }

    // Créer une session partagée
    const sessionData = SharedSessionManager.createSessionFromAuth({
      user,
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
    }, 'auth');

    // Mettre à jour le state local
    dispatch({
      type: 'SET_TOKENS',
      payload: {
        token: result.accessToken,
        refreshToken: result.refreshToken,
        sessionId: sessionData.sessionId
      }
    });
    dispatch({ type: 'SET_USER', payload: user });
    
    console.log('✅ [AUTH] Session partagée créée avec succès');
    return { success: true };
    
  } catch (error: any) {
    console.error('❌ [AUTH] Erreur connexion:', error);
    dispatch({ type: 'SET_ERROR', payload: error.message });
    return { success: false, error: error.message };
  } finally {
    dispatch({ type: 'SET_LOADING', payload: false });
  }
}, [testAppAuth]);

  // Redirection vers Dashboard avec transition
  const redirectToDashboard = useCallback(async (returnUrl: string = '/account') => {
    try {
      console.log('🔄 [AUTH] Préparation redirection vers Dashboard...');
      
      if (!state.isAuthenticated || !state.user) {
        throw new Error('Utilisateur non authentifié');
      }

      // Préparer la transition
      const transitionToken = SharedSessionManager.prepareTransition('dashboard', returnUrl);
      
      // Construire l'URL de transition
      const dashboardUrl = process.env.NEXT_PUBLIC_DASHBOARD_URL || 'http://localhost:3000';
      const transitionUrl = new URL('/transition', dashboardUrl);
      transitionUrl.searchParams.set('returnUrl', returnUrl);
      transitionUrl.searchParams.set('token', transitionToken);
      transitionUrl.searchParams.set('from', 'auth');
      
      console.log('🚀 [AUTH] Redirection vers Dashboard:', transitionUrl.toString());
      
      // Rediriger
      window.location.href = transitionUrl.toString();
      
    } catch (error: any) {
      console.error('❌ [AUTH] Erreur redirection Dashboard:', error);
      dispatch({ type: 'SET_ERROR', payload: error.message });
    }
  }, [state.isAuthenticated, state.user]);

  // Déconnexion avec nettoyage session partagée
  const logout = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: true });

    try {
      await smpClient.logoutUser();
    } catch (error) {
      console.warn('❌ [AUTH] Échec déconnexion SDK:', error);
    } finally {
      // Nettoyer la session partagée
      SharedSessionManager.clearSession();
      dispatch({ type: 'CLEAR_AUTH' });
      
      console.log('✅ [AUTH] Déconnexion terminée');
    }
  }, []);

  // Connexion avec Magic Link (avec session partagée)
  const loginWithMagicLink = useCallback(async (token: string) => {
  dispatch({ type: 'SET_LOADING', payload: true });
  dispatch({ type: 'SET_ERROR', payload: null });

  try {
    const result = await smpClient.magicLink.verify({ token });
    
    if (result.success && result.accessToken && result.user) {
      // CORRECTION : Validation du token pour récupérer les données complètes
      const validation = await authAPI.validateUserToken(result.accessToken);
      
      let user: User;
      if (validation.valid && validation.user) {
        user = {
          userID: validation.user.userID,
          username: validation.user.username || validation.user.email,
          email: validation.user.email,
          profileID: validation.user.profileID,
          accessibleOrganizations: validation.user.accessibleOrganizations || [],
          organizations: validation.user.organizations || [],
          sub: validation.user.sub,
          roles: validation.user.roles || [],
          given_name: validation.user.given_name,
          family_name: validation.user.family_name,
          state: validation.user.state,
          email_verified: validation.user.email_verified,
          attributes: validation.user.attributes
        };
      } else {
        // Fallback avec les données du Magic Link
        user = {
          userID: result.user.sub || result.user.userID || 'temp-user-id',
          username: result.user.preferred_username || result.user.username || result.user.email,
          email: result.user.email,
          profileID: result.user.profileID || result.user.sub || 'temp-profile-id',
          accessibleOrganizations: result.user.organization_ids || [],
          sub: result.user.sub || 'temp-sub',
          roles: result.user.roles || [],
          organizations: result.user.organization_ids || []
        };
      }

      // Créer session partagée
      const sessionData = SharedSessionManager.createSessionFromAuth({
        user,
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
      }, 'auth');

      dispatch({
        type: 'SET_TOKENS',
        payload: {
          token: result.accessToken,
          refreshToken: result.refreshToken,
          sessionId: sessionData.sessionId
        }
      });
      dispatch({ type: 'SET_USER', payload: user });
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


  // Rafraîchissement de token avec mise à jour session partagée
  const refreshToken = useCallback(async (): Promise<boolean> => {
    if (state.isRefreshing) {
      return false;
    }

    dispatch({ type: 'SET_REFRESHING', payload: true });

    try {
      const newAccessToken = await smpClient.getUserAccessToken();
      
      if (newAccessToken) {
        // Mettre à jour la session partagée
        const currentSession = SharedSessionManager.getSession();
        if (currentSession) {
          currentSession.tokens.accessToken = newAccessToken;
          currentSession.lastActivity = new Date().toISOString();
          SharedSessionManager.storeSession(currentSession);
        }
        
        dispatch({
          type: 'SET_TOKENS',
          payload: {
            token: newAccessToken,
          }
        });
        dispatch({ type: 'UPDATE_LAST_ACTIVITY' });
        return true;
      } else {
        throw new Error('Échec rafraîchissement token');
      }
    } catch (error: any) {
      console.error('❌ [AUTH] Échec rafraîchissement token:', error);
      dispatch({ type: 'CLEAR_AUTH' });
      return false;
    } finally {
      dispatch({ type: 'SET_REFRESHING', payload: false });
    }
  }, [state.isRefreshing]);

  // Obtenir l'utilisateur actuel
  const getCurrentUser = useCallback(async () => {
    try {
      const currentSession = SharedSessionManager.getSession();
      if (currentSession?.user) {
        dispatch({ type: 'SET_USER', payload: currentSession.user });
      }
    } catch (error: any) {
      console.error('❌ [AUTH] Erreur getCurrentUser:', error);
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

      // Mettre à jour l'activité
      SharedSessionManager.updateActivity();
      dispatch({ type: 'UPDATE_LAST_ACTIVITY' });
      return true;
    } catch (error) {
      console.error('❌ [AUTH] Erreur validation session:', error);
      dispatch({ type: 'CLEAR_AUTH' });
      return false;
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
    const currentSession = SharedSessionManager.getSession();
    if (!currentSession) return false;
    
    const now = new Date();
    const expiresAt = new Date(currentSession.expiresAt);
    const timeUntilExpiry = expiresAt.getTime() - now.getTime();
    
    // Considérer comme "expirant" si moins de 5 minutes restantes
    return timeUntilExpiry <= 5 * 60 * 1000;
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
    user: state.user,
    isAuthenticated: state.isAuthenticated,
    isLoading: state.isLoading,
    error: state.error,

    login,
    logout,
    refreshToken,
    getCurrentUser,
    validateSession,
    clearError,
    isTokenExpiringSoon,

    // Transition methods
    redirectToDashboard,
    testAppAuth,

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

export function useEnhancedAuth() {
  return useAuth();
}