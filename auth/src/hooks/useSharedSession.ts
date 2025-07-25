'use client';

import { useState, useEffect, useCallback } from 'react';

interface SharedSessionData {
  isAuthenticated: boolean;
  user?: any;
  appToken?: string;
  sessionId?: string;
  expiresAt?: string;
}

interface UseSharedSessionReturn {
  session: SharedSessionData | null;
  isLoading: boolean;
  error: string | null;
  refreshSession: () => Promise<void>;
  checkSession: () => Promise<void>;
}

export function useSharedSession(): UseSharedSessionReturn {
  const [session, setSession] = useState<SharedSessionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const checkSession = useCallback(async () => {
    try {
      setError(null);
      console.log('🔍 [SHARED] Vérification session partagée...');
      
      const response = await fetch('/api/auth/session', {
        method: 'GET',
        credentials: 'include', // Important pour inclure les cookies
      });

      if (!response.ok) {
        if (response.status === 401) {
          setSession({ isAuthenticated: false });
          return;
        }
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const sessionData = await response.json();
      setSession(sessionData);
      
      console.log('✅ [SHARED] Session récupérée:', {
        authenticated: sessionData.isAuthenticated,
        user: sessionData.user?.email || 'N/A'
      });

    } catch (err: any) {
      console.error('❌ [SHARED] Erreur vérification session:', err);
      setError(err.message || 'Erreur de session');
      setSession({ isAuthenticated: false });
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refreshSession = useCallback(async () => {
    try {
      setError(null);
      console.log('🔄 [SHARED] Rafraîchissement session...');
      
      const response = await fetch('/api/auth/session/refresh', {
        method: 'POST',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`Erreur rafraîchissement: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        // Re-vérifier la session après rafraîchissement
        await checkSession();
        console.log('✅ [SHARED] Session rafraîchie');
      } else {
        throw new Error(result.error || 'Échec rafraîchissement');
      }

    } catch (err: any) {
      console.error('❌ [SHARED] Erreur rafraîchissement:', err);
      setError(err.message || 'Erreur rafraîchissement');
    }
  }, [checkSession]);

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  return {
    session,
    isLoading,
    error,
    refreshSession,
    checkSession,
  };
}

