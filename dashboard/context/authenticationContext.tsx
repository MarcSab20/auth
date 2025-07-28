// dashboard/src/context/authenticationContext.tsx
'use client';

import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import authAPI from '@/src/services/api/authAPI';
import { AUTH_CONFIG, validateAuthConfig } from '@/src/config/auth.config';

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

  // Test de l'authentification app
  const testAppAuth = useCallback(async () => {
    try {
      console.log('🔧 [DASHBOARD-AUTH] Test authentification application...');
      
      validateAuthConfig();
      console.log('✅ [DASHBOARD-AUTH] Configuration validée');
      
      const result = await authAPI.testAppAuth();
      
      if (result.success) {
        console.log('✅ [DASHBOARD-AUTH] Authentification app réussie');
        return { success: true };
      } else {
        throw new Error(result.error);
      }
      
    } catch (error: any) {
      console.error('❌ [DASHBOARD-AUTH] Échec auth app:', error);
      return { 
        success: false, 
        error: error.message || 'Authentification application échouée' 
      };
    }
  }, []);

  // Initialisation et récupération de session existante
  useEffect(() => {
    const initializeAuth = async () => {
      console.log('🔧 [DASHBOARD-AUTH] Initialisation authentification...');
      dispatch({ type: 'SET_LOADING', payload: true });
      
      try {
        // 1. Test de l'authentification app
        const appAuthResult = await testAppAuth();
        if (!appAuthResult.success) {
          throw new Error(`Authentification app échouée: ${appAuthResult.error}`);
        }
        
        // 2. Vérifier les tokens utilisateur stockés
        const storedToken = localStorage.getItem('access_token');
        const storedRefreshToken = localStorage.getItem('refresh_token');
        const storedUser = localStorage.getItem('smp_user_0');
        
        console.log('🔧 [DASHBOARD-AUTH] Tokens stockés:', {
          accessToken: storedToken ? 'PRÉSENT' : 'MANQUANT',
          refreshToken: storedRefreshToken ? 'PRÉSENT' : 'MANQUANT',
          user: storedUser ? 'PRÉSENT' : 'MANQUANT'
        });
        
        if (storedToken) {
          // 3. Valider le token avec le backend
          const validation = await authAPI.validateUserToken(storedToken);
          
          if (validation.valid && validation.user) {
            console.log('✅ [DASHBOARD-AUTH] Session restaurée depuis localStorage');
            
            // Restaurer les tokens
            dispatch({ 
              type: 'SET_TOKENS', 
              payload: { 
                token: storedToken, 
                refreshToken: storedRefreshToken || undefined 
              } 
            });
            
            // Restaurer l'utilisateur
            dispatch({ type: 'SET_USER', payload: validation.user });
            
            // Mettre à jour le cookie smp_user_0 pour compatibilité
            const cookieUser = {
              userID: validation.user.userID,
              username: validation.user.username,
              email: validation.user.email,
              profileID: validation.user.profileID,
              accessibleOrganizations: validation.user.accessibleOrganizations,
              organizations: validation.user.organizations,
              sub: validation.user.sub,
              roles: validation.user.roles
            };
            
            const cookieString = JSON.stringify(cookieUser);
            localStorage.setItem("smp_user_0", cookieString);
            
            // Créer le cookie pour le serveur
            const cookieValue = encodeURIComponent(cookieString);
            const isSecure = typeof window !== 'undefined' && window.location.protocol === 'https:';
            document.cookie = `smp_user_0=${cookieValue}; path=/; max-age=604800; SameSite=Lax${isSecure ? '; Secure' : ''}`;
            
          } else {
            console.log('❌ [DASHBOARD-AUTH] Token invalide, nettoyage');
            // Token invalide, nettoyer
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            localStorage.removeItem('smp_user_0');
            dispatch({ type: 'CLEAR_AUTH' });
          }
        } else {
          console.log('ℹ️ [DASHBOARD-AUTH] Aucune session trouvée');
          dispatch({ type: 'SET_LOADING', payload: false });
        }
      } catch (error: any) {
        console.error('❌ [DASHBOARD-AUTH] Erreur initialisation:', error);
        dispatch({ type: 'CLEAR_AUTH' });
        dispatch({ type: 'SET_ERROR', payload: error.message });
      }
    };

    initializeAuth();

    // Écouter les événements de déconnexion automatique
    window.addEventListener('auth:logout', handleAutoLogout);
    
    return () => {
      window.removeEventListener('auth:logout', handleAutoLogout);
    };
  }, [handleAutoLogout, testAppAuth]);

  // Déconnexion
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
      // Nettoyer le stockage local
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('smp_user_0');
      localStorage.removeItem('smp_app_access_token');
      
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
      const storedUser = localStorage.getItem('smp_user_0');
      if (storedUser) {
        const user = JSON.parse(storedUser);
        dispatch({ type: 'SET_USER', payload: user });
      }
    } catch (error: any) {
      console.error('❌ [DASHBOARD-AUTH] Erreur getCurrentUser:', error);
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

      const validation = await authAPI.validateUserToken(token);
      if (validation.valid) {
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