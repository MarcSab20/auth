// dashboard/context/authenticationContext.tsx - FIX STABILITÉ ET TIMING
'use client';

import React, { createContext, useContext, useReducer, useEffect, useCallback, useRef } from 'react';
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
  appAuthFailed: boolean;
  retryCount: number;
  canUseExistingSession: boolean;
  initializationPhase: 'starting' | 'checking_session' | 'app_auth' | 'user_validation' | 'completed' | 'failed';
}

interface AuthContextType {
  state: AuthState;
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  logout: () => Promise<void>;
  refreshToken: () => Promise<boolean>;
  getCurrentUser: () => Promise<void>;
  validateSession: () => Promise<boolean>;
  clearError: () => void;
  
  getUserID: () => string | null;
  testAppAuth: () => Promise<{ success: boolean; error?: string }>;
  redirectToAuth: (returnUrl?: string) => void;
  
  retryAuth: () => Promise<void>;
  skipAppAuth: () => void;
  
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
  | { type: 'SET_INITIALIZATION_PHASE'; payload: AuthState['initializationPhase'] }
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
  initializationPhase: 'starting',
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
        error: null,
        initializationPhase: action.payload ? 'completed' : state.initializationPhase
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
        isLoading: false,
        initializationPhase: action.payload ? 'failed' : state.initializationPhase
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

    case 'SET_INITIALIZATION_PHASE':
      return { ...state, initializationPhase: action.payload };
    
    case 'CLEAR_AUTH':
      SharedSessionManager.clearSession();
      return {
        ...initialState,
        isLoading: false,
        initializationPhase: 'completed',
      };
    
    default:
      return state;
  }
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const initializationRef = useRef<boolean>(false);
  const retryTimeoutRef = useRef<NodeJS.Timeout>();

  const handleAutoLogout = useCallback(() => {
    dispatch({ type: 'CLEAR_AUTH' });
  }, []);

  // 🔧 Test de l'authentification app Dashboard avec gestion d'échecs AMÉLIORÉE
  const testAppAuth = useCallback(async (): Promise<{ success: boolean; error?: string }> => {
    try {
      console.log('🔧 [DASHBOARD-AUTH] Test authentification application Dashboard...');
      dispatch({ type: 'SET_INITIALIZATION_PHASE', payload: 'app_auth' });
      
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

  // 🔧 AMÉLIORATION: Session existante avec validation plus robuste
  const tryUseExistingSession = useCallback(async (): Promise<boolean> => {
    try {
      console.log('🔄 [DASHBOARD-AUTH] Tentative utilisation session existante...');
      dispatch({ type: 'SET_INITIALIZATION_PHASE', payload: 'checking_session' });
      
      const existingSession = SharedSessionManager.getSession();
      
      if (existingSession && SharedSessionManager.isSessionValid(existingSession)) {
        console.log('✅ [DASHBOARD-AUTH] Session existante trouvée, validation...');
        dispatch({ type: 'SET_INITIALIZATION_PHASE', payload: 'user_validation' });
        
        // 🔧 AMÉLIORATION: Validation directe sans app auth préalable
        try {
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
          } else {
            console.log('❌ [DASHBOARD-AUTH] Token invalide lors de la validation');
            SharedSessionManager.clearSession();
            return false;
          }
        } catch (validationError: any) {
          console.log('⚠️ [DASHBOARD-AUTH] Erreur validation token, essai avec app auth');
          
          // Si la validation échoue, essayer avec app auth d'abord
          const appAuthResult = await testAppAuth();
          if (appAuthResult.success) {
            // Réessayer la validation après app auth
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
              return true;
            }
          }
          return false;
        }
      }
      
      return false;
    } catch (error: any) {
      console.warn('⚠️ [DASHBOARD-AUTH] Échec validation session existante:', error);
      return false;
    }
  }, [testAppAuth]);

  // Nouvelle méthode pour réessayer l'authentification avec délai
  const retryAuth = useCallback(async (): Promise<void> => {
    if (state.retryCount >= 3) {
      console.log('🚫 [DASHBOARD-AUTH] Trop de tentatives, utilisation session existante ou redirection');
      
      const sessionWorked = await tryUseExistingSession();
      if (!sessionWorked) {
        dispatch({ type: 'SET_ERROR', payload: 'Trop de tentatives d\'authentification. Veuillez vous reconnecter.' });
        // Redirection automatique après 3 secondes
        retryTimeoutRef.current = setTimeout(() => {
          redirectToAuth();
        }, 3000);
      }
      return;
    }

    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });
    
    // 🔧 AMÉLIORATION: Délai progressif entre les tentatives
    const retryDelay = state.retryCount * 1000; // 0s, 1s, 2s
    if (retryDelay > 0) {
      console.log(`⏳ [DASHBOARD-AUTH] Attente ${retryDelay}ms avant nouvelle tentative...`);
      await new Promise(resolve => setTimeout(resolve, retryDelay));
    }
    
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
        dispatch({ type: 'SET_ERROR', payload: 'Aucune session valide trouvée' });
        retryTimeoutRef.current = setTimeout(() => {
          redirectToAuth();
        }, 2000);
      }
    });
  }, [tryUseExistingSession, redirectToAuth]);

  // 🔧 INITIALISATION ROBUSTE ET SÉQUENTIELLE
  useEffect(() => {
    if (initializationRef.current) {
      return; // Empêcher les initialisations multiples
    }
    initializationRef.current = true;

    const initializeAuth = async (): Promise<void> => {
      console.log('🔧 [DASHBOARD-AUTH] Initialisation authentification...');
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_INITIALIZATION_PHASE', payload: 'starting' });
      
      try {
        // 🔧 PHASE 1: Essayer d'utiliser une session existante d'abord
        console.log('📋 [DASHBOARD-AUTH] Phase 1: Vérification session existante');
        const existingSessionWorked = await tryUseExistingSession();
        if (existingSessionWorked) {
          console.log('✅ [DASHBOARD-AUTH] Session existante validée - initialisation terminée');
          return;
        }

        // 🔧 PHASE 2: Si pas de session, essayer l'authentification app (avec limites)
        console.log('📋 [DASHBOARD-AUTH] Phase 2: Authentification application');
        if (state.retryCount < 3 && !state.canUseExistingSession) {
          const appAuthResult = await testAppAuth();
          
          if (!appAuthResult.success) {
            console.error('❌ [DASHBOARD-AUTH] Authentification app échouée:', appAuthResult.error);
            
            // 🔧 AMÉLIORATION: Ne pas abandonner tout de suite, essayer une dernière fois avec session
            console.log('🔄 [DASHBOARD-AUTH] Tentative finale avec session existante...');
            const finalAttempt = await tryUseExistingSession();
            
            if (!finalAttempt) {
              dispatch({ type: 'SET_ERROR', payload: appAuthResult.error || 'Erreur authentification app' });
              dispatch({ type: 'SET_LOADING', payload: false });
              
              // Auto-retry après délai si c'est la première tentative
              if (state.retryCount === 0) {
                console.log('⏳ [DASHBOARD-AUTH] Première tentative échouée, retry automatique dans 2s...');
                retryTimeoutRef.current = setTimeout(() => {
                  retryAuth();
                }, 2000);
              }
              return;
            }
          }
        }
        
        // 🔧 PHASE 3: Après auth app réussie, récupérer session
        console.log('📋 [DASHBOARD-AUTH] Phase 3: Récupération session après auth app');
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
            dispatch({ type: 'SET_ERROR', payload: 'Token de session invalide' });
            dispatch({ type: 'SET_LOADING', payload: false });
          }
        } else {
          // 🔧 PHASE 4: Essayer de finaliser une transition
          console.log('📋 [DASHBOARD-AUTH] Phase 4: Finalisation transition');
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
              dispatch({ type: 'SET_ERROR', payload: 'Transition échouée - token invalide' });
              dispatch({ type: 'SET_LOADING', payload: false });
            }
          } else {
            // 🔧 PHASE 5: Aucune session trouvée - décision finale
            console.log('📋 [DASHBOARD-AUTH] Phase 5: Aucune session trouvée');
            dispatch({ type: 'SET_LOADING', payload: false });
            
            // Si on a déjà essayé plusieurs fois l'auth app, rediriger
            if (state.retryCount >= 2 || state.appAuthFailed) {
              console.log('🔄 [DASHBOARD-AUTH] Redirection vers auth après échecs multiples');
              dispatch({ type: 'SET_ERROR', payload: 'Session introuvable. Redirection vers l\'authentification...' });
              retryTimeoutRef.current = setTimeout(() => {
                redirectToAuth();
              }, 1500);
            } else {
              // Première tentative, proposer options à l'utilisateur
              dispatch({ type: 'SET_ERROR', payload: 'Aucune session active trouvée' });
            }
          }
        }
      } catch (error: any) {
        console.error('❌ [DASHBOARD-AUTH] Erreur initialisation:', error);
        dispatch({ type: 'SET_ERROR', payload: error.message || 'Erreur initialisation' });
        dispatch({ type: 'SET_LOADING', payload: false });
        dispatch({ type: 'SET_INITIALIZATION_PHASE', payload: 'failed' });
      }
    };

    initializeAuth();

    // Cleanup sur démontage
    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, []); // Dépendances vides pour exécution unique

  // 🔧 ÉCOUTEUR CHANGEMENTS SESSION - Amélioré pour éviter les boucles
  useEffect(() => {
    const unsubscribe = SharedSessionManager.onSessionChange((sessionData: SessionData | null) => {
      // Éviter les mises à jour si on est en cours d'initialisation
      if (state.initializationPhase === 'starting' || state.initializationPhase === 'checking_session') {
        console.log('⚠️ [DASHBOARD-AUTH] Changement session ignoré - initialisation en cours');
        return;
      }

      if (sessionData && SharedSessionManager.isSessionValid(sessionData)) {
        console.log('🔄 [DASHBOARD-AUTH] Session mise à jour depuis autre app');
        if (sessionData.user.userID !== state.user?.userID) {
          dispatch({ 
            type: 'SET_TOKENS', 
            payload: { 
              token: sessionData.tokens.accessToken, 
              refreshToken: sessionData.tokens.refreshToken
            } 
          });
          dispatch({ type: 'SET_USER', payload: sessionData.user });
        }
      } else {
        console.log('🚪 [DASHBOARD-AUTH] Déconnexion depuis autre app');
        if (state.isAuthenticated) {
          dispatch({ type: 'CLEAR_AUTH' });
        }
      }
    });

    window.addEventListener('auth:logout', handleAutoLogout);
    
    return () => {
      unsubscribe();
      window.removeEventListener('auth:logout', handleAutoLogout);
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, [handleAutoLogout, state.initializationPhase, state.user?.userID, state.isAuthenticated]);

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
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
    }
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