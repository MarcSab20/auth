'use client';

import React, { createContext, useContext, useReducer, useCallback } from 'react';
import { SMPClient } from 'smp-sdk-ts';
import type { 
  MagicLinkGenerateRequest, 
  MagicLinkVerifyRequest,
  MagicLinkGenerateResponse,
  MagicLinkVerifyResponse,
  MagicLinkStatusResponse
} from 'smp-sdk-ts';

// Configuration SDK
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
  persistence: {
    kind: 'localStorage',
    set: (key: string, value: string) => localStorage.setItem(key, value),
    get: (key: string) => localStorage.getItem(key),
    remove: (key: string) => localStorage.removeItem(key),
  },
});

interface MagicLinkContextType {
  state: MagicLinkState;
  generateMagicLink: (request: MagicLinkGenerateRequest) => Promise<{ success: boolean; error?: string }>;
  verifyMagicLink: (request: MagicLinkVerifyRequest) => Promise<{ success: boolean; error?: string; data?: any }>;
  getMagicLinkStatus: (email: string) => Promise<void>;
  revokeMagicLink: (linkId: string) => Promise<void>;
  clearError: () => void;
  clearSuccess: () => void;
  isEnabled: () => Promise<boolean>;
}

interface MagicLinkState {
  isLoading: boolean;
  error: string | null;
  success: string | null;
  lastGeneratedLink: {
    linkId?: string;
    email?: string;
    expiresAt?: string;
    emailSent?: boolean;
  } | null;
  verificationResult: {
    status?: string;
    requiresMFA?: boolean;
    user?: any;
    accessToken?: string;
    refreshToken?: string;
  } | null;
  linkStatus: Array<{
    id: string;
    status: string;
    action: string;
    createdAt: string;
    expiresAt: string;
    usedAt?: string;
  }>;
}

type MagicLinkAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_SUCCESS'; payload: string | null }
  | { type: 'SET_GENERATED_LINK'; payload: MagicLinkState['lastGeneratedLink'] }
  | { type: 'SET_VERIFICATION_RESULT'; payload: MagicLinkState['verificationResult'] }
  | { type: 'SET_LINK_STATUS'; payload: MagicLinkState['linkStatus'] }
  | { type: 'CLEAR_STATE' };

const initialState: MagicLinkState = {
  isLoading: false,
  error: null,
  success: null,
  lastGeneratedLink: null,
  verificationResult: null,
  linkStatus: [],
};

function magicLinkReducer(state: MagicLinkState, action: MagicLinkAction): MagicLinkState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    
    case 'SET_SUCCESS':
      return { ...state, success: action.payload, error: null };
    
    case 'SET_GENERATED_LINK':
      return { ...state, lastGeneratedLink: action.payload, isLoading: false };
    
    case 'SET_VERIFICATION_RESULT':
      return { ...state, verificationResult: action.payload, isLoading: false };
    
    case 'SET_LINK_STATUS':
      return { ...state, linkStatus: action.payload };
    
    case 'CLEAR_STATE':
      return { ...initialState };
    
    default:
      return state;
  }
}

const MagicLinkContext = createContext<MagicLinkContextType | undefined>(undefined);

export function MagicLinkProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(magicLinkReducer, initialState);

  // Générer un Magic Link
  const generateMagicLink = useCallback(async (request: MagicLinkGenerateRequest) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      // Initialiser la SDK si nécessaire
      await smpClient.authenticateApp();

      console.log('🔗 [SDK] Generating Magic Link for:', request.email);

      // Ajouter le contexte de la requête
      const enrichedRequest = {
        ...request,
        ip: request.ip || (typeof window !== 'undefined' ? '' : ''),
        userAgent: request.userAgent || (typeof window !== 'undefined' ? navigator.userAgent : ''),
        referrer: request.referrer || (typeof window !== 'undefined' ? window.location.href : ''),
      };

      const result = await smpClient.magicLink.generate(enrichedRequest);
      
      if (result.success) {
        dispatch({
          type: 'SET_GENERATED_LINK',
          payload: {
            linkId: result.linkId,
            email: request.email,
            expiresAt: result.expiresAt,
            emailSent: result.emailSent,
          }
        });
        
        dispatch({ 
          type: 'SET_SUCCESS', 
          payload: result.message || 'Magic Link généré avec succès' 
        });
        
        console.log('✅ [SDK] Magic Link generated successfully');
        return { success: true };
      } else {
        dispatch({ type: 'SET_ERROR', payload: result.message || 'Échec de la génération' });
        return { success: false, error: result.message };
      }
    } catch (error: any) {
      console.error('❌ [SDK] Magic Link generation failed:', error);
      const errorMessage = error.message || 'Erreur lors de la génération du Magic Link';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      return { success: false, error: errorMessage };
    }
  }, []);

  // Vérifier un Magic Link
  const verifyMagicLink = useCallback(async (request: MagicLinkVerifyRequest) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      console.log('🔗 [SDK] Verifying Magic Link token:', request.token.substring(0, 8) + '...');

      const result = await smpClient.magicLink.verify(request);
      
      if (result.success) {
        dispatch({
          type: 'SET_VERIFICATION_RESULT',
          payload: {
            status: result.status,
            requiresMFA: result.requiresMFA,
            user: result.user,
            accessToken: result.accessToken,
            refreshToken: result.refreshToken,
          }
        });
        
        dispatch({ 
          type: 'SET_SUCCESS', 
          payload: result.message || 'Magic Link vérifié avec succès' 
        });

        // Stocker les tokens si fournis
        if (result.accessToken) {
          localStorage.setItem('access_token', result.accessToken);
          
          if (result.refreshToken) {
            localStorage.setItem('refresh_token', result.refreshToken);
          }

          // Créer le cookie utilisateur si on a les données utilisateur
          if (result.user) {
            const userCookie = {
              userID: result.user.sub || result.user.userID,
              username: result.user.preferred_username || result.user.username,
              email: result.user.email,
              profileID: result.user.profileID || result.user.sub,
              accessibleOrganizations: result.user.organization_ids || []
            };

            const cookieString = JSON.stringify(userCookie);
            localStorage.setItem("smp_user_0", cookieString);
            
            // Créer le cookie HTTP
            const cookieValue = encodeURIComponent(cookieString);
            const isSecure = typeof window !== 'undefined' && window.location.protocol === 'https:';
            document.cookie = `smp_user_0=${cookieValue}; path=/; max-age=604800; SameSite=Lax${isSecure ? '; Secure' : ''}`;
          }
        }
        
        console.log('✅ [SDK] Magic Link verified successfully');
        return { 
          success: true, 
          data: {
            accessToken: result.accessToken,
            refreshToken: result.refreshToken,
            tokenType: result.tokenType,
            expiresIn: result.expiresIn,
            requiresMFA: result.requiresMFA,
            user: result.user,
          }
        };
      } else {
        dispatch({ type: 'SET_ERROR', payload: result.message || 'Échec de la vérification' });
        return { success: false, error: result.message };
      }
    } catch (error: any) {
      console.error('❌ [SDK] Magic Link verification failed:', error);
      const errorMessage = error.message || 'Erreur lors de la vérification du Magic Link';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      return { success: false, error: errorMessage };
    }
  }, []);

  // Obtenir le statut des Magic Links
  const getMagicLinkStatus = useCallback(async (email: string) => {
    dispatch({ type: 'SET_LOADING', payload: true });

    try {
      const result = await smpClient.magicLink.getStatus(email);
      
      if (result.success && result.data) {
        dispatch({ type: 'SET_LINK_STATUS', payload: result.data.links });
      }
    } catch (error: any) {
      console.error('❌ [SDK] Magic Link status failed:', error);
      dispatch({ type: 'SET_ERROR', payload: error.message });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  // Révoquer un Magic Link
  const revokeMagicLink = useCallback(async (linkId: string) => {
    dispatch({ type: 'SET_LOADING', payload: true });

    try {
      const result = await smpClient.magicLink.revoke(linkId);
      
      if (result.success) {
        dispatch({ type: 'SET_SUCCESS', payload: result.message });
        // Mettre à jour la liste des liens si disponible
        const updatedLinks = state.linkStatus.map(link => 
          link.id === linkId ? { ...link, status: 'revoked' } : link
        );
        dispatch({ type: 'SET_LINK_STATUS', payload: updatedLinks });
      } else {
        dispatch({ type: 'SET_ERROR', payload: 'Échec de la révocation' });
      }
    } catch (error: any) {
      console.error('❌ [SDK] Magic Link revoke failed:', error);
      dispatch({ type: 'SET_ERROR', payload: error.message });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [state.linkStatus]);

  // Vérifier si Magic Link est activé
  const isEnabled = useCallback(async (): Promise<boolean> => {
    try {
      return await smpClient.magicLink.isEnabled();
    } catch (error) {
      console.warn('Could not check Magic Link status, assuming enabled');
      return true;
    }
  }, []);

  const clearError = useCallback(() => {
    dispatch({ type: 'SET_ERROR', payload: null });
  }, []);

  const clearSuccess = useCallback(() => {
    dispatch({ type: 'SET_SUCCESS', payload: null });
  }, []);

  const contextValue: MagicLinkContextType = {
    state,
    generateMagicLink,
    verifyMagicLink,
    getMagicLinkStatus,
    revokeMagicLink,
    clearError,
    clearSuccess,
    isEnabled,
  };

  return React.createElement(
    MagicLinkContext.Provider,
    { value: contextValue },
    children
  );
}

export function useMagicLink(): MagicLinkContextType {
  const context = useContext(MagicLinkContext);
  if (context === undefined) {
    throw new Error('useMagicLink must be used within a MagicLinkProvider');
  }
  return context;
}

// Hook simplifié pour l'usage de base
export function useMagicLinkAuth() {
  const { state, generateMagicLink, verifyMagicLink, clearError } = useMagicLink();
  
  return {
    isLoading: state.isLoading,
    error: state.error,
    success: state.success,
    lastGeneratedLink: state.lastGeneratedLink,
    
    requestMagicLink: async (email: string, action?: 'login' | 'register') => {
      const result = await generateMagicLink({ 
        email, 
        action: action || 'login',
        redirectUrl: '/account' 
      });
      return result;
    },
    
    authenticateWithMagicLink: async (token: string) => {
      const result = await verifyMagicLink({ token });
      return result;
    },
    
    clearError,
  };
}