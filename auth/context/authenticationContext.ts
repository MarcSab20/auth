'use client';

import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import authAPI from '@/src/services/api/authAPI';
import { User, AuthState, LoginRequest, AuthError } from '@/types/auth';
import magicLinkAPI from '@/src/services/api/magicLinkAPI';

interface AuthContextType {
  state: AuthState;
  login: (credentials: LoginRequest) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<boolean>;
  getCurrentUser: () => Promise<void>;
  validateSession: () => Promise<boolean>;
  clearError: () => void;
  isTokenExpiringSoon: () => boolean;
  loginWithMagicLink: (token: string) => Promise<{ success: boolean; error?: string }>;
  requestMagicLink: (email: string, action?: 'login' | 'register') => Promise<{ success: boolean; error?: string }>;
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

export function EnhancedAuthProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, extendedInitialState);

  const handleAutoLogout = useCallback(() => {
    dispatch({ type: 'CLEAR_AUTH' });
  }, []);

  useEffect(() => {
    const initializeAuth = async () => {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      try {
        const storedToken = authAPI.getStoredToken();
        const storedRefreshToken = authAPI.getStoredRefreshToken();
        
        if (storedToken) {
          const validation = await authAPI.validateCurrentToken();
          
          if (validation.valid && validation.user) {
            dispatch({ 
              type: 'SET_TOKENS', 
              payload: { 
                token: storedToken, 
                refreshToken: storedRefreshToken || undefined 
              } 
            });
            dispatch({ type: 'SET_USER', payload: validation.user });
            dispatch({ type: 'UPDATE_LAST_ACTIVITY' });
          } else {
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
  
const login = useCallback(async (credentials: LoginRequest) => {
  console.log('🔄 [AUTH] Starting login with:', { username: credentials.username });
  
  dispatch({ type: 'SET_LOADING', payload: true });
  dispatch({ type: 'SET_ERROR', payload: null });

  try {
    const response = await authAPI.signIn(credentials);
    console.log('📝 [AUTH] AuthAPI response received:', response);
    console.log('📝 [AUTH] Response keys:', Object.keys(response));
    
    // Vérifier que nous avons un token d'accès
    if (!response.accessToken) {
      console.error('❌ [AUTH] No access token in response');
      throw new Error('No access token received from server');
    }
    
    // Stocker les tokens
    dispatch({
      type: 'SET_TOKENS',
      payload: {
        token: response.accessToken,
        refreshToken: response.refreshToken,
        sessionId: response.sessionId
      }
    });

    console.log('🔑 [AUTH] Tokens stored in context');

    // Créer l'objet utilisateur compatible avec le middleware SEULEMENT si on a un vrai utilisateur
    if (response.user) {
      console.log('👤 [AUTH] User data from response:', response.user);
      console.log('👤 [AUTH] User keys:', Object.keys(response.user));
      
      // Construire l'objet utilisateur pour le cookie
      const userForCookie = {
        userID: response.user.sub || response.user.userID || response.user.userID,
        username: response.user.preferred_username || response.user.username || credentials.username,
        email: response.user.email || '',
        profileID: response.user.sub || response.user.profileID || response.user.profileID,
        accessibleOrganizations: response.user.organization_ids || response.user.organizations || []
      };
      
      console.log('🍪 [AUTH] User object for cookie:', userForCookie);
      
      // Vérifier que nous avons un userID valide
      if (!userForCookie.userID) {
        console.error('❌ [AUTH] No valid userID found in response');
        throw new Error('No valid user ID received from server');
      }
      
      dispatch({ type: 'SET_USER', payload: response.user });
      
      // Sauvegarder dans localStorage ET cookie de manière synchrone
      const cookieString = JSON.stringify(userForCookie);
      localStorage.setItem("smp_user_0", cookieString);
      
      // Créer le cookie avec tous les attributs nécessaires
      const cookieValue = encodeURIComponent(cookieString);
      const isSecure = typeof window !== 'undefined' && window.location.protocol === 'https:';
      document.cookie = `smp_user_0=${cookieValue}; path=/; max-age=604800; SameSite=Lax${isSecure ? '; Secure' : ''}`;
      
      console.log('✅ [AUTH] Cookie created successfully');
      console.log('📋 [AUTH] localStorage content:', localStorage.getItem("smp_user_0"));
      
      // Vérifier que le cookie a été créé
      const cookieCheck = document.cookie.includes('smp_user_0');
      console.log('🍪 [AUTH] Cookie verification:', cookieCheck);
      
    } else {
      console.error('⚠️ [AUTH] No user data in response');
      throw new Error('No user data received from server');
    }
    
    dispatch({ type: 'UPDATE_LAST_ACTIVITY' });
    
    console.log('✅ [AUTH] Login process completed successfully');
    return { success: true };
    
  } catch (error: any) {
    console.error('❌ [AUTH] Login error:', error);
    console.error('❌ [AUTH] Error stack:', error.stack);
    const errorMessage = error.message || 'Erreur de connexion';
    dispatch({ type: 'SET_ERROR', payload: errorMessage });
    return { success: false, error: errorMessage };
  } finally {
    dispatch({ type: 'SET_LOADING', payload: false });
  }
}, []);
// getCurrentUser est défini après login
const getCurrentUser = useCallback(async () => {
  try {
    const user = await authAPI.getCurrentUser();
    dispatch({ type: 'SET_USER', payload: user });
  } catch (error: any) {
    console.error('Failed to get current user:', error);
    dispatch({ type: 'SET_ERROR', payload: 'Erreur lors de la récupération des informations utilisateur' });
  }
}, []);

const loginAndGetUser = useCallback(async (credentials: LoginRequest) => {
  const loginResult = await login(credentials);
  
  if (loginResult.success) {
    try {
      await getCurrentUser();
    } catch (error) {
      console.warn('Could not fetch user details after login:', error);
    }
  }
  
  return loginResult;
}, [login, getCurrentUser]);

  const logout = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: true });

    try {
      await authAPI.logout();
    } catch (error) {
      console.warn('Logout API call failed:', error);
    } finally {
      dispatch({ type: 'CLEAR_AUTH' });
    }
  }, []);

  const refreshToken = useCallback(async (): Promise<boolean> => {
    if (state.isRefreshing) {
      return false;
    }

    const storedRefreshToken = authAPI.getStoredRefreshToken();
    if (!storedRefreshToken) {
      dispatch({ type: 'CLEAR_AUTH' });
      return false;
    }

    dispatch({ type: 'SET_REFRESHING', payload: true });

    try {
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken: storedRefreshToken }),
      });

      if (response.ok) {
        const data = await response.json();
        dispatch({
          type: 'SET_TOKENS',
          payload: {
            token: data.accessToken,
            refreshToken: data.refreshToken
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


  const validateSession = useCallback(async (): Promise<boolean> => {
    try {
      const validation = await authAPI.validateCurrentToken();
      
      if (validation.valid) {
        if (validation.user) {
          dispatch({ type: 'SET_USER', payload: validation.user });
        }
        dispatch({ type: 'UPDATE_LAST_ACTIVITY' });
        return true;
      } else {
        dispatch({ type: 'CLEAR_AUTH' });
        return false;
      }
    } catch (error) {
      console.error('Session validation failed:', error);
      dispatch({ type: 'CLEAR_AUTH' });
      return false;
    }
  }, []);

  const clearError = useCallback(() => {
    dispatch({ type: 'SET_ERROR', payload: null });
  }, []);

  const isTokenExpiringSoon = useCallback((): boolean => {
    return false;
  }, []);

  const loginWithMagicLink = useCallback(async (token: string) => {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
  
      try {
        const result = await magicLinkAPI.verifyMagicLink({ token });
        
        if (result.success) {
          if (result.accessToken) {
            dispatch({
              type: 'SET_TOKENS',
              payload: {
                token: result.accessToken,
                refreshToken: result.refreshToken,
              }
            });
          }
  
          if (result.user) {
            dispatch({ type: 'SET_USER', payload: result.user });
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
  
    const requestMagicLink = useCallback(async (email: string, action?: 'login' | 'register') => {
      try {
        const result = await magicLinkAPI.generateMagicLink({ 
          email, 
          action: action || 'login' 
        });
        return result;
      } catch (error: any) {
        return { 
          success: false, 
          error: error.message || 'Erreur lors de la demande de Magic Link' 
        };
      }
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
  };

  return React.createElement(
    AuthContext.Provider,
    { value: contextValue },
    children
  );
}

export function useEnhancedAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useEnhancedAuth must be used within an EnhancedAuthProvider');
  }
  return context;
}

export function useAuth() {
  const { state, login, logout } = useEnhancedAuth();
  
  return {
    user: state.user,
    isAuthenticated: state.isAuthenticated,
    loading: state.isLoading,
    error: state.error,
    login: async (username: string, password: string) => {
      const result = await login({ username, password });
      return result;
    },
    logout,
    checkAuth: async () => {
      return state.isAuthenticated;
    }
  };
}