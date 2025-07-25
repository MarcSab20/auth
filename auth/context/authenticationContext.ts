'use client';

import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { SMPClient, Persistence } from 'smp-sdk-ts';
import { User, AuthState, LoginRequest, AuthError } from '@/types/auth';
import { AUTH_CONFIG, validateAuthConfig } from '@/src/config/auth.config';
import { CookieManager} from '@/src/lib/CookieManager';
import { SessionBridge } from '@/src/lib/SessionBridge';

const storage = new Persistence('localStorage');

// Configuration SDK avec logs de debug
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
  
  // Debug methods améliorés
  testAppAuth: () => Promise<{ success: boolean; error?: string }>;
  getAppToken: () => Promise<string | null>;
  getSharedTokens: () => ReturnType<typeof SessionBridge.getSharedTokens>;
  
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
      // Nettoyer aussi les cookies lors du clear
      CookieManager.clearAllAuthCookies();
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

  // Test de l'authentification app - VERSION CORRIGÉE
  const testAppAuth = useCallback(async () => {
    try {
      console.log('🔧 [AUTH] Test authentification application...');
      
      // Valider la configuration
      validateAuthConfig();
      console.log('✅ [AUTH] Configuration validée');
      
      console.log('🔧 [AUTH] Appel smpClient.authenticateApp()...');
      
      const result = await smpClient.authenticateApp();
      console.log(result);
      
      const appToken = await smpClient.getAppAccessToken();
      console.log('✅ [AUTH] Token app récupéré:', appToken ? 'OUI' : 'NON');
      
      if (appToken) {
        // Sauvegarder le token dans les cookies pour partage cross-frontend
        CookieManager.setAppToken(appToken);
        console.log('🍪 [AUTH] Token app sauvegardé en cookie');
      }
      
      return { success: true };
    } catch (error: any) {
      console.error(error);
      
      // Debug détaillé de l'erreur
      if (error.response?.errors) {
        console.error(error.response.errors);
      }
      
      return { 
        success: false, 
        error: error.message || 'Authentification application échouée' 
      };
    }
  }, []);


  // Obtenir le token app
  const getAppToken = useCallback(async () => {
    try {
      return await smpClient.getAppAccessToken();
    } catch (error) {
      console.error('❌ [AUTH] Échec récupération token app:', error);
      return null;
    }
  }, []);

  const getSharedTokens = useCallback(() => {
    return SessionBridge.getSharedTokens();
  }, []);

  useEffect(() => {
    const initializeAuth = async () => {
      console.log('🔧 [AUTH] Initialisation authentification...');
      dispatch({ type: 'SET_LOADING', payload: true });
      
      try {
        // 1. Synchroniser depuis les cookies si disponibles
        SessionBridge.syncTokensToStorage();
        
        // 2. Test de l'authentification app
        const appAuthResult = await testAppAuth();
        if (!appAuthResult.success) {
          throw new Error(`Authentification app échouée: ${appAuthResult.error}`);
        }
        
        // 3. Vérifier les tokens utilisateur stockés
        const storedToken = localStorage.getItem('access_token');
        const storedRefreshToken = localStorage.getItem('refresh_token');
        const storedUser = localStorage.getItem('smp_user_0');
        
        console.log('🔧 [AUTH] Tokens stockés:', {
          accessToken: storedToken ? 'PRÉSENT' : 'MANQUANT',
          refreshToken: storedRefreshToken ? 'PRÉSENT' : 'MANQUANT',
          user: storedUser ? 'PRÉSENT' : 'MANQUANT'
        });
        
        if (storedToken && storedUser) {
          try {
            const user = JSON.parse(storedUser);
            
            dispatch({ 
              type: 'SET_TOKENS', 
              payload: { 
                token: storedToken, 
                refreshToken: storedRefreshToken || undefined 
              } 
            });
            dispatch({ type: 'SET_USER', payload: user });
            dispatch({ type: 'UPDATE_LAST_ACTIVITY' });
            
            // Synchroniser vers les cookies
            SessionBridge.syncTokensToCookies();
            
            console.log('✅ [AUTH] Utilisateur restauré depuis le storage');
          } catch (error) {
            console.error( error);
            dispatch({ type: 'CLEAR_AUTH' });
          }
        } else {
          console.log('ℹ️ [AUTH] Aucune donnée auth stockée trouvée');
          dispatch({ type: 'SET_LOADING', payload: false });
        }
      } catch (error: any) {
        console.error(error);
        dispatch({ type: 'CLEAR_AUTH' });
        dispatch({ type: 'SET_ERROR', payload: error.message });
      }
    };

    initializeAuth();

    window.addEventListener('auth:logout', handleAutoLogout);
    
    return () => {
      window.removeEventListener('auth:logout', handleAutoLogout);
    };
  }, [handleAutoLogout, testAppAuth]);

  // Connexion avec logs de debug étendus
  const login = useCallback(async (credentials: LoginRequest) => {
      console.log('🔄 [AUTH] Début processus connexion...');
      console.log('🔄 [AUTH] Identifiants:', { username: credentials.username });
      
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });

      try {
        // Étape 1: Authentification app
        console.log('🔄 [AUTH] Étape 1: Authentification app...');
        const appAuthResult = await testAppAuth();
        
        if (!appAuthResult.success) {
          throw new Error(`ÉCHEC_AUTH_APP: ${appAuthResult.error}`);
        }
        
        console.log('✅ [AUTH] Authentification app réussie');
        
        // Étape 2: Authentification utilisateur
        console.log('🔄 [AUTH] Étape 2: Authentification utilisateur...');
        const result = await smpClient.authenticateUser(credentials.username, credentials.password);
        console.log('📝 [AUTH] Réponse authentification utilisateur:', result);

        if (!result || !result.user) {
          throw new Error('Aucune donnée utilisateur reçue de l\'authentification');
        }

        // Étape 3: Récupération des tokens
        console.log('🔄 [AUTH] Étape 3: Récupération tokens...');
        const accessToken = await smpClient.getUserAccessToken();
        const refreshToken = await smpClient.getUserRefreshToken();
        
        console.log('🔑 [AUTH] Tokens:', {
          accessToken: accessToken ? 'RÉCUPÉRÉ' : 'MANQUANT',
          refreshToken: refreshToken ? 'RÉCUPÉRÉ' : 'MANQUANT'
        });

        if (accessToken) {
          // Sauvegarder en localStorage
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
            userID: result.user.userID,
            username: result.user.username,
            email: result.user.email,
            profileID: result.user.profileID,
            accessibleOrganizations: [],
            organizations: [],
            sub: result.user.userID,
            roles: [],
          };

          dispatch({ type: 'SET_USER', payload: user });
          
          const cookieString = JSON.stringify(user);
          localStorage.setItem("smp_user_0", cookieString);
          
          // Sauvegarder dans les cookies sécurisés
          CookieManager.setUserToken(accessToken);
          if (refreshToken) {
            CookieManager.setUserRefreshToken(refreshToken);
          }
          
          const sessionId = SessionBridge.generateSessionId();
          CookieManager.setSessionId(sessionId);
          
          // Cookie utilisateur standard pour compatibilité
          const isSecure = typeof window !== 'undefined' && window.location.protocol === 'https:';
          document.cookie = `smp_user_0=${encodeURIComponent(cookieString)}; path=/; max-age=604800; SameSite=Lax${isSecure ? '; Secure' : ''}`;

          console.log('✅ [AUTH] Connexion terminée avec succès');
          console.log('🍪 [AUTH] Cookies définis:', {
            userCookie: document.cookie.includes('smp_user_0'),
            userToken: !!CookieManager.getCookie(AUTH_CONFIG.COOKIES.USER_TOKEN),
            sessionId: !!CookieManager.getCookie(AUTH_CONFIG.COOKIES.SESSION_ID)
          });
          
          dispatch({ type: 'UPDATE_LAST_ACTIVITY' });
          
          return { success: true };
        } else {
          throw new Error('Aucun token d\'accès reçu');
        }
        
      } catch (error: any) {
        console.error('❌ [AUTH] Erreur connexion:', error);
        let errorMessage = 'Erreur de connexion';
      
        if (error.message) {
          if (error.message.includes('ÉCHEC_AUTH_APP')) {
            errorMessage = `Erreur d'authentification de l'application: ${error.message}`;
          } else if (error.message.includes('401') || error.message.includes('Unauthorized')) {
            errorMessage = 'Identifiants incorrects';
          } else if (error.message.includes('Network') || error.message.includes('ENOTFOUND')) {
            errorMessage = 'Erreur de connexion au serveur';
          } else {
            errorMessage = error.message;
          }
        }
        
        dispatch({ type: 'SET_ERROR', payload: errorMessage });
        return { success: false, error: errorMessage };
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    }, [testAppAuth]);

  // Déconnexion avec la SDK
  const logout = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: true });

    try {
      await smpClient.logoutUser();
    } catch (error) {
      console.warn('❌ [AUTH] Échec déconnexion SDK:', error);
    } finally {
      // Nettoyer le stockage local
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('smp_user_0');
      
      // Supprimer les cookies standard
      document.cookie = 'smp_user_0=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
      
      // Nettoyer tous les cookies d'authentification
      CookieManager.clearAllAuthCookies();
      
      dispatch({ type: 'CLEAR_AUTH' });
      
      console.log('✅ [AUTH] Déconnexion terminée');
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
        
        // Mettre à jour les cookies
        CookieManager.setUserToken(newAccessToken);
        
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
      const storedUser = localStorage.getItem('smp_user_0');
      if (storedUser) {
        const user = JSON.parse(storedUser);
        dispatch({ type: 'SET_USER', payload: user });
      }
    } catch (error: any) {
      console.error( error);
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

    // Debug methods
    testAppAuth,
    getAppToken,

    loginWithMagicLink,
    requestMagicLink,
    requestPasswordReset,
    resetPassword,
    getSharedTokens: function (): ReturnType<typeof SessionBridge.getSharedTokens> {
      throw new Error('Function not implemented.');
    }
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