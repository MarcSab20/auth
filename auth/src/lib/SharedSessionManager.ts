// shared/lib/SharedSessionManager.ts
export interface SessionData {
  user: {
    userID: string;
    username: string;
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
  };
  tokens: {
    accessToken: string;
    refreshToken?: string;
    appToken?: string;
  };
  sessionId: string;
  expiresAt: string;
  lastActivity: string;
  source: 'auth' | 'dashboard';
}

export class SharedSessionManager {
  private static readonly STORAGE_KEYS = {
    ACCESS_TOKEN: 'access_token',
    REFRESH_TOKEN: 'refresh_token',
    USER_DATA: 'smp_user_0',
    SESSION_ID: 'smp_session_id',
    LAST_ACTIVITY: 'smp_last_activity',
    SESSION_SOURCE: 'smp_session_source',
    TRANSITION_DATA: 'smp_transition_data'
  };

  private static readonly COOKIE_DOMAIN = process.env.NODE_ENV === 'production' ? '.services.com' : 'localhost';
  private static readonly COOKIE_SECURE = process.env.NODE_ENV === 'production';
  private static readonly SESSION_DURATION = 8 * 60 * 60 * 1000; // 8 heures

  /**
   * Stocker une session complète (localStorage + cookies cross-domain)
   */
  static storeSession(sessionData: SessionData): void {
    try {
      console.log('🔐 [SESSION-MANAGER] Stockage session cross-app...', sessionData.source);

      // 1. Stocker dans localStorage
      localStorage.setItem(this.STORAGE_KEYS.ACCESS_TOKEN, sessionData.tokens.accessToken);
      
      if (sessionData.tokens.refreshToken) {
        localStorage.setItem(this.STORAGE_KEYS.REFRESH_TOKEN, sessionData.tokens.refreshToken);
      }

      localStorage.setItem(this.STORAGE_KEYS.USER_DATA, JSON.stringify(sessionData.user));
      localStorage.setItem(this.STORAGE_KEYS.SESSION_ID, sessionData.sessionId);
      localStorage.setItem(this.STORAGE_KEYS.LAST_ACTIVITY, sessionData.lastActivity);
      localStorage.setItem(this.STORAGE_KEYS.SESSION_SOURCE, sessionData.source);

      // 2. Stocker dans cookies cross-domain
      this.setCrossDomainCookie('smp_user_token', sessionData.tokens.accessToken);
      
      if (sessionData.tokens.refreshToken) {
        this.setCrossDomainCookie('smp_user_refresh', sessionData.tokens.refreshToken);
      }
      
      this.setCrossDomainCookie('smp_session_id', sessionData.sessionId);

      // 3. Cookie user standard pour compatibilité serveur
      const userCookieValue = encodeURIComponent(JSON.stringify(sessionData.user));
      this.setCrossDomainCookie('smp_user_0', userCookieValue);

      // 4. Déclencher l'événement de changement de session
      this.broadcastSessionChange(sessionData);

      console.log('✅ [SESSION-MANAGER] Session cross-app stockée avec succès');

    } catch (error) {
      console.error('❌ [SESSION-MANAGER] Erreur stockage session:', error);
      throw error;
    }
  }

  /**
   * Récupérer une session existante
   */
  static getSession(): SessionData | null {
    try {
      const accessToken = localStorage.getItem(this.STORAGE_KEYS.ACCESS_TOKEN);
      const userDataStr = localStorage.getItem(this.STORAGE_KEYS.USER_DATA);
      const sessionId = localStorage.getItem(this.STORAGE_KEYS.SESSION_ID);
      const source = localStorage.getItem(this.STORAGE_KEYS.SESSION_SOURCE) as 'auth' | 'dashboard' || 'auth';

      if (!accessToken || !userDataStr || !sessionId) {
        console.log('ℹ️ [SESSION-MANAGER] Session incomplète');
        return null;
      }

      const userData = JSON.parse(userDataStr);
      const refreshToken = localStorage.getItem(this.STORAGE_KEYS.REFRESH_TOKEN);
      const lastActivity = localStorage.getItem(this.STORAGE_KEYS.LAST_ACTIVITY) || new Date().toISOString();

      const sessionData: SessionData = {
        user: userData,
        tokens: {
          accessToken,
          refreshToken: refreshToken || undefined,
        },
        sessionId,
        expiresAt: new Date(Date.now() + this.SESSION_DURATION).toISOString(),
        lastActivity,
        source
      };

      // Vérifier si la session n'est pas expirée
      if (!this.isSessionValid(sessionData)) {
        console.log('⏰ [SESSION-MANAGER] Session expirée');
        this.clearSession();
        return null;
      }

      return sessionData;

    } catch (error) {
      console.error('❌ [SESSION-MANAGER] Erreur récupération session:', error);
      return null;
    }
  }

  /**
   * Vérifier si la session est valide
   */
  static isSessionValid(sessionData: SessionData): boolean {
    const now = new Date();
    const expiresAt = new Date(sessionData.expiresAt);
    const lastActivity = new Date(sessionData.lastActivity);

    // Vérifier expiration
    if (now > expiresAt) {
      console.log('⏰ [SESSION-MANAGER] Session expirée');
      return false;
    }

    // Vérifier inactivité (2 heures)
    const inactivityLimit = 2 * 60 * 60 * 1000; // 2 heures
    if (now.getTime() - lastActivity.getTime() > inactivityLimit) {
      console.log('⏰ [SESSION-MANAGER] Session inactive trop longtemps');
      return false;
    }

    return true;
  }

  /**
   * Mettre à jour l'activité de session
   */
  static updateActivity(): void {
    const now = new Date().toISOString();
    localStorage.setItem(this.STORAGE_KEYS.LAST_ACTIVITY, now);
    
    // Mettre à jour aussi dans la session complète
    const currentSession = this.getSession();
    if (currentSession) {
      currentSession.lastActivity = now;
      this.storeSession(currentSession);
    }
  }

  /**
   * Nettoyer complètement la session
   */
  static clearSession(): void {
    try {
      console.log('🧹 [SESSION-MANAGER] Nettoyage session cross-app...');

      // Nettoyer localStorage
      Object.values(this.STORAGE_KEYS).forEach(key => {
        localStorage.removeItem(key);
      });

      // Nettoyer cookies cross-domain
      this.removeCookie('smp_user_token');
      this.removeCookie('smp_user_refresh');
      this.removeCookie('smp_session_id');
      this.removeCookie('smp_user_0');

      // Diffuser la déconnexion
      this.broadcastSessionChange(null);

      console.log('✅ [SESSION-MANAGER] Session nettoyée');
    } catch (error) {
      console.error('❌ [SESSION-MANAGER] Erreur nettoyage session:', error);
    }
  }

  /**
   * Créer une session à partir d'une authentification
   */
  static createSessionFromAuth(authData: {
    user: any;
    accessToken: string;
    refreshToken?: string;
  }, source: 'auth' | 'dashboard'): SessionData {
    
    const sessionData: SessionData = {
      user: authData.user,
      tokens: {
        accessToken: authData.accessToken,
        refreshToken: authData.refreshToken,
      },
      sessionId: this.generateSessionId(),
      expiresAt: new Date(Date.now() + this.SESSION_DURATION).toISOString(),
      lastActivity: new Date().toISOString(),
      source
    };

    this.storeSession(sessionData);
    return sessionData;
  }

  /**
   * Préparer la transition entre applications
   */
  static prepareTransition(targetApp: 'auth' | 'dashboard', returnUrl?: string): string {
    const currentSession = this.getSession();
    
    if (!currentSession) {
      throw new Error('Aucune session active pour la transition');
    }

    const transitionData = {
      sessionId: currentSession.sessionId,
      targetApp,
      returnUrl,
      timestamp: Date.now(),
      fromApp: currentSession.source
    };

    localStorage.setItem(this.STORAGE_KEYS.TRANSITION_DATA, JSON.stringify(transitionData));
    
    // Créer un token de transition temporaire (5 minutes)
    const transitionToken = this.generateTransitionToken();
    this.setCrossDomainCookie('smp_transition_token', transitionToken, { maxAge: 300 });

    return transitionToken;
  }

  /**
   * Finaliser la transition
   */
  static completeTransition(): SessionData | null {
    try {
      const transitionDataStr = localStorage.getItem(this.STORAGE_KEYS.TRANSITION_DATA);
      const transitionToken = this.getCookie('smp_transition_token');

      if (!transitionDataStr || !transitionToken) {
        console.log('ℹ️ [SESSION-MANAGER] Aucune transition en cours');
        return this.getSession(); // Retourner la session normale
      }

      const transitionData = JSON.parse(transitionDataStr);
      
      // Vérifier que la transition n'est pas expirée (5 minutes)
      const transitionAge = Date.now() - transitionData.timestamp;
      if (transitionAge > 5 * 60 * 1000) {
        console.log('⏰ [SESSION-MANAGER] Transition expirée');
        this.cleanupTransition();
        return this.getSession();
      }

      // Récupérer la session actuelle
      const currentSession = this.getSession();
      if (!currentSession) {
        console.log('❌ [SESSION-MANAGER] Aucune session pour la transition');
        this.cleanupTransition();
        return null;
      }

      // Mettre à jour la source de la session
      currentSession.source = transitionData.targetApp;
      this.storeSession(currentSession);

      // Nettoyer les données de transition
      this.cleanupTransition();

      console.log('✅ [SESSION-MANAGER] Transition complétée');
      return currentSession;

    } catch (error) {
      console.error('❌ [SESSION-MANAGER] Erreur transition:', error);
      this.cleanupTransition();
      return this.getSession();
    }
  }

  /**
   * Nettoyer les données de transition
   */
  private static cleanupTransition(): void {
    localStorage.removeItem(this.STORAGE_KEYS.TRANSITION_DATA);
    this.removeCookie('smp_transition_token');
  }

  /**
   * Écouter les changements de session (cross-tab)
   */
  static onSessionChange(callback: (sessionData: SessionData | null) => void): () => void {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === this.STORAGE_KEYS.ACCESS_TOKEN || e.key === this.STORAGE_KEYS.USER_DATA) {
        console.log('🔄 [SESSION-MANAGER] Changement session détecté');
        const sessionData = this.getSession();
        callback(sessionData);
      }
    };

    const handleCustomEvent = (e: CustomEvent) => {
      console.log('🔄 [SESSION-MANAGER] Événement session reçu');
      callback(e.detail);
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('smp-session-change', handleCustomEvent as EventListener);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('smp-session-change', handleCustomEvent as EventListener);
    };
  }

  /**
   * Diffuser les changements de session
   */
  private static broadcastSessionChange(sessionData: SessionData | null): void {
    const event = new CustomEvent('smp-session-change', {
      detail: sessionData
    });
    window.dispatchEvent(event);
  }

  // Utilitaires
  static generateSessionId(): string {
    return `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private static generateTransitionToken(): string {
    return `trans_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private static setCrossDomainCookie(
    name: string, 
    value: string, 
    options: { maxAge?: number } = {}
  ): void {
    if (typeof document === 'undefined') return;

    const maxAge = options.maxAge || 7 * 24 * 60 * 60; // 7 jours par défaut
    
    let cookieString = `${name}=${encodeURIComponent(value)}`;
    cookieString += `; Path=/`;
    cookieString += `; Domain=${this.COOKIE_DOMAIN}`;
    cookieString += `; Max-Age=${maxAge}`;
    cookieString += `; SameSite=Lax`;
    
    if (this.COOKIE_SECURE) {
      cookieString += `; Secure`;
    }

    document.cookie = cookieString;
  }

  private static getCookie(name: string): string | null {
    if (typeof document === 'undefined') return null;
    
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    
    if (parts.length === 2) {
      const cookieValue = parts.pop()?.split(';').shift();
      return cookieValue ? decodeURIComponent(cookieValue) : null;
    }
    
    return null;
  }

  private static removeCookie(name: string): void {
    this.setCrossDomainCookie(name, '', { maxAge: 0 });
  }
}