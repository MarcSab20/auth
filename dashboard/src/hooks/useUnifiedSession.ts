// dashboard/src/hooks/useUnifiedSession.ts
import { useState, useEffect, useCallback, useRef } from 'react';
import { SharedSessionManager, SessionData } from '@/src/lib/SharedSessionManager';
import authAPI from '@/src/services/api/authAPI';

interface SessionState {
  isLoading: boolean;
  isAuthenticated: boolean;
  user: any | null;
  sessionId: string | null;
  error: string | null;
  lastActivity: Date | null;
}

interface UseUnifiedSessionReturn extends SessionState {
  refreshSession: () => Promise<boolean>;
  logout: () => Promise<void>;
  updateActivity: () => void;
  checkSession: () => Promise<boolean>;
  isSessionExpiring: () => boolean;
  getTimeUntilExpiry: () => number;
}

export function useUnifiedSession(): UseUnifiedSessionReturn {
  const [state, setState] = useState<SessionState>({
    isLoading: true,
    isAuthenticated: false,
    user: null,
    sessionId: null,
    error: null,
    lastActivity: null,
  });

  const sessionCheckInterval = useRef<NodeJS.Timeout>();
  const activityUpdateInterval = useRef<NodeJS.Timeout>();
  const sessionData = useRef<SessionData | null>(null);

  /**
   * Initialiser ou récupérer la session existante
   */
  const initializeSession = useCallback(async () => {
    console.log('🔧 [UNIFIED-SESSION] Initialisation session...');
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // 1. Tenter de récupérer session existante
      const existingSession = SharedSessionManager.getSession();
      
      if (existingSession && SharedSessionManager.isSessionValid(existingSession)) {
        console.log('✅ [UNIFIED-SESSION] Session existante valide trouvée');
        
        // Valider le token avec le backend
        const validation = await authAPI.validateUserToken(existingSession.tokens.accessToken);
        
        if (validation.valid && validation.user) {
          sessionData.current = existingSession;
          setState({
            isLoading: false,
            isAuthenticated: true,
            user: validation.user,
            sessionId: existingSession.sessionId,
            error: null,
            lastActivity: new Date(existingSession.lastActivity),
          });
          
          // Mettre à jour l'activité
          SharedSessionManager.updateActivity();
          
          console.log('✅ [UNIFIED-SESSION] Session restaurée avec succès');
          return;
        } else {
          console.log('❌ [UNIFIED-SESSION] Token invalide, nettoyage session');
          SharedSessionManager.clearSession();
        }
      } else if (existingSession) {
        console.log('⏰ [UNIFIED-SESSION] Session expirée, nettoyage');
        SharedSessionManager.clearSession();
      }

      // 2. Pas de session valide trouvée
      console.log('ℹ️ [UNIFIED-SESSION] Aucune session valide trouvée');
      setState({
        isLoading: false,
        isAuthenticated: false,
        user: null,
        sessionId: null,
        error: null,
        lastActivity: null,
      });

    } catch (error: any) {
      console.error('❌ [UNIFIED-SESSION] Erreur initialisation:', error);
      setState({
        isLoading: false,
        isAuthenticated: false,
        user: null,
        sessionId: null,
        error: error.message || 'Erreur d\'initialisation de session',
        lastActivity: null,
      });
    }
  }, []);

  /**
   * Rafraîchir la session
   */
  const refreshSession = useCallback(async (): Promise<boolean> => {
    try {
      console.log('🔄 [UNIFIED-SESSION] Rafraîchissement session...');
      
      if (!sessionData.current?.tokens.refreshToken) {
        console.log('❌ [UNIFIED-SESSION] Pas de refresh token disponible');
        return false;
      }

      // Logique de refresh à implémenter avec votre backend
      // Pour l'instant, on revalide le token existant
      const validation = await authAPI.validateUserToken(sessionData.current.tokens.accessToken);
      
      if (validation.valid) {
        // Mettre à jour l'activité
        SharedSessionManager.updateActivity();
        setState(prev => ({ 
          ...prev, 
          lastActivity: new Date(),
          error: null 
        }));
        
        console.log('✅ [UNIFIED-SESSION] Session rafraîchie');
        return true;
      } else {
        console.log('❌ [UNIFIED-SESSION] Échec rafraîchissement');
        await logout();
        return false;
      }

    } catch (error: any) {
      console.error('❌ [UNIFIED-SESSION] Erreur rafraîchissement:', error);
      setState(prev => ({ ...prev, error: error.message }));
      return false;
    }
  }, []);

  /**
   * Déconnexion
   */
  const logout = useCallback(async (): Promise<void> => {
    try {
      console.log('🚪 [UNIFIED-SESSION] Déconnexion...');
      
      // Appeler l'API de déconnexion si on a un token
      if (sessionData.current?.tokens.accessToken) {
        await authAPI.logout(sessionData.current.tokens.accessToken);
      }

    } catch (error) {
      console.warn('⚠️ [UNIFIED-SESSION] Erreur API déconnexion:', error);
    } finally {
      // Nettoyer toujours la session locale
      SharedSessionManager.clearSession();
      sessionData.current = null;
      
      setState({
        isLoading: false,
        isAuthenticated: false,
        user: null,
        sessionId: null,
        error: null,
        lastActivity: null,
      });
      
      console.log('✅ [UNIFIED-SESSION] Déconnexion terminée');
    }
  }, []);

  /**
   * Mettre à jour l'activité utilisateur
   */
  const updateActivity = useCallback(() => {
    if (state.isAuthenticated) {
      SharedSessionManager.updateActivity();
      setState(prev => ({ ...prev, lastActivity: new Date() }));
    }
  }, [state.isAuthenticated]);

  /**
   * Vérifier l'état de la session
   */
  const checkSession = useCallback(async (): Promise<boolean> => {
    if (!sessionData.current) {
      return false;
    }

    // Vérifier la validité côté client
    if (!SharedSessionManager.isSessionValid(sessionData.current)) {
      console.log('⏰ [UNIFIED-SESSION] Session expirée localement');
      await logout();
      return false;
    }

    // Vérification légère côté serveur (optionnelle)
    try {
      const validation = await authAPI.validateUserToken(sessionData.current.tokens.accessToken);
      
      if (!validation.valid) {
        console.log('❌ [UNIFIED-SESSION] Session invalide côté serveur');
        await logout();
        return false;
      }

      return true;
    } catch (error) {
      console.warn('⚠️ [UNIFIED-SESSION] Erreur vérification serveur:', error);
      // En cas d'erreur réseau, on garde la session (dégradation gracieuse)
      return true;
    }
  }, [logout]);

  /**
   * Vérifier si la session expire bientôt
   */
  const isSessionExpiring = useCallback((): boolean => {
    if (!sessionData.current) return false;
    
    const now = new Date();
    const expiresAt = new Date(sessionData.current.expiresAt);
    const timeUntilExpiry = expiresAt.getTime() - now.getTime();
    
    // Considérer comme "expirant" si moins de 5 minutes restantes
    return timeUntilExpiry <= 5 * 60 * 1000;
  }, []);

  /**
   * Obtenir le temps jusqu'à expiration (en millisecondes)
   */
  const getTimeUntilExpiry = useCallback((): number => {
    if (!sessionData.current) return 0;
    
    const now = new Date();
    const expiresAt = new Date(sessionData.current.expiresAt);
    
    return Math.max(0, expiresAt.getTime() - now.getTime());
  }, []);

  // Initialisation au montage
  useEffect(() => {
    initializeSession();
  }, [initializeSession]);

  // Écouter les changements de session cross-tab
  useEffect(() => {
    const unsubscribe = SharedSessionManager.onSessionChange((newSessionData) => {
      if (newSessionData && SharedSessionManager.isSessionValid(newSessionData)) {
        console.log('🔄 [UNIFIED-SESSION] Session mise à jour depuis autre onglet');
        sessionData.current = newSessionData;
        setState({
          isLoading: false,
          isAuthenticated: true,
          user: newSessionData.user,
          sessionId: newSessionData.sessionId,
          error: null,
          lastActivity: new Date(newSessionData.lastActivity),
        });
      } else {
        console.log('🚪 [UNIFIED-SESSION] Déconnexion depuis autre onglet');
        sessionData.current = null;
        setState({
          isLoading: false,
          isAuthenticated: false,
          user: null,
          sessionId: null,
          error: null,
          lastActivity: null,
        });
      }
    });

    return unsubscribe;
  }, []);

  // Vérification périodique de session
  useEffect(() => {
    if (state.isAuthenticated) {
      // Vérifier la session toutes les 60 secondes
      sessionCheckInterval.current = setInterval(() => {
        checkSession();
      }, 60 * 1000);

      // Mettre à jour l'activité toutes les 30 secondes
      activityUpdateInterval.current = setInterval(() => {
        updateActivity();
      }, 30 * 1000);
    }

    return () => {
      if (sessionCheckInterval.current) {
        clearInterval(sessionCheckInterval.current);
      }
      if (activityUpdateInterval.current) {
        clearInterval(activityUpdateInterval.current);
      }
    };
  }, [state.isAuthenticated, checkSession, updateActivity]);

  // Nettoyer les intervalles au démontage
  useEffect(() => {
    return () => {
      if (sessionCheckInterval.current) {
        clearInterval(sessionCheckInterval.current);
      }
      if (activityUpdateInterval.current) {
        clearInterval(activityUpdateInterval.current);
      }
    };
  }, []);

  return {
    ...state,
    refreshSession,
    logout,
    updateActivity,
    checkSession,
    isSessionExpiring,
    getTimeUntilExpiry,
  };
}