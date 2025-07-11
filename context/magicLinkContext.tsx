// src/context/magicLinkContext.tsx
'use client';

import React, { createContext, useContext, useReducer, useCallback } from 'react';
import magicLinkAPI, { 
  MagicLinkGenerateRequest, 
  MagicLinkVerifyRequest 
} from '@/src/services/api/magicLinkAPI';

interface MagicLinkContextType {
  state: MagicLinkState;
  generateMagicLink: (request: MagicLinkGenerateRequest) => Promise<{ success: boolean; error?: string }>;
  verifyMagicLink: (request: MagicLinkVerifyRequest) => Promise<{ success: boolean; error?: string; data?: any }>;
  getMagicLinkStatus: (email: string) => Promise<void>;
  revokeMagicLink: (linkId: string) => Promise<void>;
  clearError: () => void;
  clearSuccess: () => void;
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

  const generateMagicLink = useCallback(async (request: MagicLinkGenerateRequest) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      const result = await magicLinkAPI.generateMagicLink(request);
      
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
        
        return { success: true };
      } else {
        dispatch({ type: 'SET_ERROR', payload: result.message || 'Échec de la génération' });
        return { success: false, error: result.message };
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Erreur lors de la génération du Magic Link';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      return { success: false, error: errorMessage };
    }
  }, []);

  const verifyMagicLink = useCallback(async (request: MagicLinkVerifyRequest) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      const result = await magicLinkAPI.verifyMagicLink(request);
      
      if (result.success) {
        dispatch({
          type: 'SET_VERIFICATION_RESULT',
          payload: {
            status: result.status,
            requiresMFA: result.requiresMFA,
            user: result.user,
          }
        });
        
        dispatch({ 
          type: 'SET_SUCCESS', 
          payload: result.message || 'Magic Link vérifié avec succès' 
        });
        
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
      const errorMessage = error.message || 'Erreur lors de la vérification du Magic Link';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      return { success: false, error: errorMessage };
    }
  }, []);

  const getMagicLinkStatus = useCallback(async (email: string) => {
    dispatch({ type: 'SET_LOADING', payload: true });

    try {
      const result = await magicLinkAPI.getMagicLinkStatus(email);
      
      if (result.success && result.data) {
        dispatch({ type: 'SET_LINK_STATUS', payload: result.data.links });
      }
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const revokeMagicLink = useCallback(async (linkId: string) => {
    dispatch({ type: 'SET_LOADING', payload: true });

    try {
      const result = await magicLinkAPI.revokeMagicLink(linkId);
      
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
      dispatch({ type: 'SET_ERROR', payload: error.message });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [state.linkStatus]);

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

