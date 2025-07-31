// dashboard/src/lib/SharedSessionManager.ts - FIX PERSISTANCE COOKIES
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
  timestamp: string; // 🔧 AJOUT: timestamp de création
}

export class SharedSessionManager {
  private static readonly STORAGE_KEYS = {
    ACCESS_TOKEN: 'access_token',
    REFRESH_TOKEN: 'refresh_token',
    USER_DATA: 'smp_user_0',
    SESSION_ID: 'smp_session_id',
    LAST_ACTIVITY: 'smp_last_activity',
    SESSION_SOURCE: 'smp_session_source',
    TRANSITION_DATA: 'smp_transition_data',
    SESSION_TIMESTAMP: 'smp_session_timestamp' // 🔧 AJOUT
  };

  // 🔧 AMÉLIORATION: Configuration cookies plus robuste
  private static readonly COOKIE_CONFIG = {
    DOMAIN: process.env.NODE_ENV === 'production' ? '.services.com' : undefined, // undefined pour localhost
    SECURE: process.env.NODE_ENV === 'production',
    SAME_SITE: 'Lax' as const,
    MAX_AGE: 7 * 24 * 60 * 60, // 7 jours
    PATH: '/'
  };
  
  private static readonly SESSION_DURATION = 8 * 60 * 60 * 1000; // 8 heures
  private static readonly INACTIVITY_LIMIT = 2 * 60 * 60 * 1000; // 2 heures

  /**
   * 🔧 Stocker une session complète avec validation et retry
   */
  static storeSession(sessionData: SessionData): void {
    try {
      console.log('🔐 [SESSION-MANAGER] Stockage session cross-app...', sessionData.source);

      // 🔧 AMÉLIORATION: Ajouter timestamp si manquant
      if (!sessionData.timestamp) {
        sessionData.timestamp = new Date().toISOString();
      }

      // 1. Stocker dans localStorage avec validation
      this.storeInLocalStorage(sessionData);

      // 2. Stocker dans cookies cross-domain avec retry
      this.storeInCookies(sessionData);

      // 3. Vérifier que le stockage a fonctionné
      this.validateStorage(sessionData);

      // 4. Déclencher l'événement de changement de session
      this.broadcastSessionChange(sessionData);

      console.log('✅ [SESSION-MANAGER] Session cross-app stockée avec succès');

    } catch (error) {
      console.error('❌ [SESSION-MANAGER] Erreur stockage session:', error);
      throw error;
    }
  }

  /**
   * 🔧 Stockage localStorage sécurisé
   */
  private static storeInLocalStorage(sessionData: SessionData): void {
    try {
      localStorage.setItem(this.STORAGE_KEYS.ACCESS_TOKEN, sessionData.tokens.accessToken);
      
      if (sessionData.tokens.refreshToken) {
        localStorage.setItem(this.STORAGE_KEYS.REFRESH_TOKEN, sessionData.tokens.refreshToken);
      }

      localStorage.setItem(this.STORAGE_KEYS.USER_DATA, JSON.stringify(sessionData.user));
      localStorage.setItem(this.STORAGE_KEYS.SESSION_ID, sessionData.sessionId);
      localStorage.setItem(this.STORAGE_KEYS.LAST_ACTIVITY, sessionData.lastActivity);
      localStorage.setItem(this.STORAGE_KEYS.SESSION_SOURCE, sessionData.source);
      localStorage.setItem(this.STORAGE_KEYS.SESSION_TIMESTAMP, sessionData.timestamp);

      console.log('✅ [SESSION-MANAGER] LocalStorage mise à jour');
    } catch (error) {
      console.error('❌ [SESSION-MANAGER] Erreur localStorage:', error);
      throw new Error('Impossible de stocker en localStorage');
    }
  }

  /**
   * 🔧 Stockage cookies avec retry et validation
   */
  private static storeInCookies(sessionData: SessionData): void {
    try {
      // Cookies essentiels avec retry
      this.setCookieWithRetry('smp_user_token', sessionData.tokens.accessToken);
      
      if (sessionData.tokens.refreshToken) {
        this.setCookieWithRetry('smp_user_refresh', sessionData.tokens.refreshToken);
      }
      
      this.setCookieWithRetry('smp_session_id', sessionData.sessionId);

      // 🔧 Cookie utilisateur - format sécurisé et compatible
      const userCookieData = {
        userID: sessionData.user.userID,
        username: sessionData.user.username,
        email: sessionData.user.email,
        profileID: sessionData.user.profileID,
        sub: sessionData.user.sub,
        timestamp: sessionData.timestamp,
        // Données minimales pour éviter les problèmes de taille
        organizations: sessionData.user.organizations?.slice(0, 10) || [], // Limiter à 10
        roles: sessionData.user.roles?.slice(0, 5) || [] // Limiter à 5
      };

      const userCookieValue = JSON.stringify(userCookieData);
      
      // 🔧 Vérifier la taille du cookie (limite 4KB)
      if (userCookieValue.length > 4000) {
        console.warn('⚠️ [SESSION-MANAGER] Cookie utilisateur trop volumineux, compression...');
        const compressedUserData = {
          userID: sessionData.user.userID,
          username: sessionData.user.username,
          email: sessionData.user.email,
          profileID: sessionData.user.profileID,
          sub: sessionData.user.sub,
          timestamp: sessionData.timestamp
        };
        this.setCookieWithRetry('smp_user_0', JSON.stringify(compressedUserData));
      } else {
        this.setCookieWithRetry('smp_user_0', userCookieValue);
      }

      console.log('✅ [SESSION-MANAGER] Cookies cross-domain stockés');
    } catch (error) {
      console.error('❌ [SESSION-MANAGER] Erreur stockage cookies:', error);
      // Ne pas faire échouer tout le processus pour les cookies
    }
  }

  /**
   * 🔧 Définir cookie avec retry et validation
   */
  private static setCookieWithRetry(name: string, value: string, maxRetries: number = 3): void {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        this.setCrossDomainCookie(name, value);
        
        // Vérifier que le cookie a été défini
        setTimeout(() => {
          const checkValue = this.getCookie(name);
          if (!checkValue) {
            console.warn(`⚠️ [SESSION-MANAGER] Cookie ${name} non défini, tentative ${attempt}/${maxRetries}`);
            if (attempt < maxRetries) {
              this.setCrossDomainCookie(name, value);
            }
          } else {
            console.log(`✅ [SESSION-MANAGER] Cookie ${name} vérifié`);
          }
        }, 100);
        
        break; // Succès
      } catch (error) {
        console.error(`❌ [SESSION-MANAGER] Erreur cookie ${name} (tentative ${attempt}):`, error);
        if (attempt === maxRetries) {
          throw error;
        }
      }
    }
  }

  /**
   * 🔧 Valider que le stockage a fonctionné
   */
  private static validateStorage(originalData: SessionData): void {
    try {
      // Vérifier localStorage
      const storedToken = localStorage.getItem(this.STORAGE_KEYS.ACCESS_TOKEN);
      const storedUser = localStorage.getItem(this.STORAGE_KEYS.USER_DATA);
      
      if (!storedToken || !storedUser) {
        throw new Error('LocalStorage validation failed');
      }

      // Vérifier cookies (avec délai pour la propagation)
      setTimeout(() => {
        const cookieUser = this.getCookie('smp_user_0');
        const cookieSession = this.getCookie('smp_session_id');
        
        if (!cookieUser || !cookieSession) {
          console.warn('⚠️ [SESSION-MANAGER] Cookies validation failed, but continuing...');
        } else {
          console.log('✅ [SESSION-MANAGER] Storage validation passed');
        }
      }, 200);

    } catch (error) {
      console.error('❌ [SESSION-MANAGER] Storage validation failed:', error);
      throw error;
    }
  }

  /**
   * 🔧 Récupérer une session existante avec fallback
   */
  static getSession(): SessionData | null {
    try {
      // 1. Essayer localStorage d'abord
      const sessionFromStorage = this.getSessionFromLocalStorage();
      if (sessionFromStorage) {
        return sessionFromStorage;
      }

      // 2. Fallback vers cookies si localStorage échoue
      console.log('ℹ️ [SESSION-MANAGER] Fallback vers cookies...');
      const sessionFromCookies = this.getSessionFromCookies();
      if (sessionFromCookies) {
        // Restaurer dans localStorage
        this.storeInLocalStorage(sessionFromCookies);
        return sessionFromCookies;
      }

      console.log('ℹ️ [SESSION-MANAGER] Aucune session trouvée');
      return null;

    } catch (error) {
      console.error('❌ [SESSION-MANAGER] Erreur récupération session:', error);
      return null;
    }
  }

  /**
   * 🔧 Récupérer session depuis localStorage
   */
  private static getSessionFromLocalStorage(): SessionData | null {
    try {
      const accessToken = localStorage.getItem(this.STORAGE_KEYS.ACCESS_TOKEN);
      const userDataStr = localStorage.getItem(this.STORAGE_KEYS.USER_DATA);
      const sessionId = localStorage.getItem(this.STORAGE_KEYS.SESSION_ID);
      const source = localStorage.getItem(this.STORAGE_KEYS.SESSION_SOURCE) as 'auth' | 'dashboard' || 'dashboard';
      const timestamp = localStorage.getItem(this.STORAGE_KEYS.SESSION_TIMESTAMP) || new Date().toISOString();

      if (!accessToken || !userDataStr || !sessionId) {
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
        source,
        timestamp
      };

      // Vérifier validité
      if (this.isSessionValid(sessionData)) {
        return sessionData;
      } else {
        console.log('⏰ [SESSION-MANAGER] Session localStorage expirée');
        this.clearSession();
        return null;
      }

    } catch (error) {
      console.error('❌ [SESSION-MANAGER] Erreur localStorage:', error);
      return null;
    }
  }

  /**
   * 🔧 Récupérer session depuis cookies (fallback)
   */
  private static getSessionFromCookies(): SessionData | null {
    try {
      const userCookie = this.getCookie('smp_user_0');
      const sessionIdCookie = this.getCookie('smp_session_id');
      const tokenCookie = this.getCookie('smp_user_token');

      if (!userCookie || !sessionIdCookie || !tokenCookie) {
        return null;
      }

      const userData = JSON.parse(userCookie);
      const refreshToken = this.getCookie('smp_user_refresh');

      const sessionData: SessionData = {
        user: userData,
        tokens: {
          accessToken: tokenCookie,
          refreshToken: refreshToken || undefined,
        },
        sessionId: sessionIdCookie,
        expiresAt: new Date(Date.now() + this.SESSION_DURATION).toISOString(),
        lastActivity: new Date().toISOString(),
        source: 'dashboard',
        timestamp: userData.timestamp || new Date().toISOString()
      };

      if (this.isSessionValid(sessionData)) {
        console.log('✅ [SESSION-MANAGER] Session récupérée depuis cookies');
        return sessionData;
      } else {
        console.log('⏰ [SESSION-MANAGER] Session cookies expirée');
        return null;
      }

    } catch (error) {
      console.error('❌ [SESSION-MANAGER] Erreur récupération cookies:', error);
      return null;
    }
  }

  /**
   * 🔧 Validation session améliorée
   */
  static isSessionValid(sessionData: SessionData): boolean {
    try {
      const now = new Date();
      
      // 1. Vérifier les champs requis
      if (!sessionData.user?.userID || !sessionData.tokens?.accessToken || !sessionData.sessionId) {
        console.log('❌ [SESSION-MANAGER] Champs requis manquants');
        return false;
      }

      // 2. Vérifier que ce n'est pas un utilisateur temporaire
      if (sessionData.user.userID.startsWith('temp-') || sessionData.user.userID === 'anonymous') {
        console.log('❌ [SESSION-MANAGER] Utilisateur temporaire');
        return false;
      }

      // 3. Vérifier expiration globale
      const expiresAt = new Date(sessionData.expiresAt);
      if (now > expiresAt) {
        console.log('⏰ [SESSION-MANAGER] Session expirée (globale)');
        return false;
      }

      // 4. Vérifier inactivité
      const lastActivity = new Date(sessionData.lastActivity);
      if (now.getTime() - lastActivity.getTime() > this.INACTIVITY_LIMIT) {
        console.log('⏰ [SESSION-MANAGER] Session inactive trop longtemps');
        return false;
      }

      // 5. Vérifier l'âge du timestamp de création (24h max)
      if (sessionData.timestamp) {
        const createdAt = new Date(sessionData.timestamp);
        const maxAge = 24 * 60 * 60 * 1000; // 24 heures
        if (now.getTime() - createdAt.getTime() > maxAge) {
          console.log('⏰ [SESSION-MANAGER] Session trop ancienne');
          return false;
        }
      }

      return true;
    } catch (error) {
      console.error('❌ [SESSION-MANAGER] Erreur validation:', error);
      return false;
    }
  }

  /**
   * 🔧 Mettre à jour l'activité de session
   */
  static updateActivity(): void {
    try {
      const now = new Date().toISOString();
      localStorage.setItem(this.STORAGE_KEYS.LAST_ACTIVITY, now);
      
      // Mettre à jour aussi dans la session complète
      const currentSession = this.getSession();
      if (currentSession) {
        currentSession.lastActivity = now;
        this.storeSession(currentSession);
      }
    } catch (error) {
      console.error('❌ [SESSION-MANAGER] Erreur mise à jour activité:', error);
    }
  }

  /**
   * 🔧 Nettoyer complètement la session
   */
  static clearSession(): void {
    try {
      console.log('🧹 [SESSION-MANAGER] Nettoyage session cross-app...');

      // Nettoyer localStorage
      Object.values(this.STORAGE_KEYS).forEach(key => {
        try {
          localStorage.removeItem(key);
        } catch (error) {
          console.warn(`⚠️ [SESSION-MANAGER] Erreur suppression ${key}:`, error);
        }
      });

      // Nettoyer cookies cross-domain
      const cookiesToClear = [
        'smp_user_token',
        'smp_user_refresh', 
        'smp_session_id',
        'smp_user_0',
        'access_token', // Cookies alternatifs
        'user_data',
        'auth_user'
      ];

      cookiesToClear.forEach(cookieName => {
        this.removeCookie(cookieName);
      });

      // Diffuser la déconnexion
      this.broadcastSessionChange(null);

      console.log('✅ [SESSION-MANAGER] Session nettoyée');
    } catch (error) {
      console.error('❌ [SESSION-MANAGER] Erreur nettoyage session:', error);
    }
  }

  /**
   * 🔧 Créer une session à partir d'une authentification
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
      source,
      timestamp: new Date().toISOString()
    };

    this.storeSession(sessionData);
    return sessionData;
  }

  /**
   * Finaliser la transition
   */
  static completeTransition(): SessionData | null {
    try {
      const transitionDataStr = localStorage.getItem(this.STORAGE_KEYS.TRANSITION_DATA);

      if (!transitionDataStr) {
        console.log('ℹ️ [SESSION-MANAGER] Aucune transition en cours');
        return this.getSession();
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

  /**
   * 🔧 Cookie cross-domain amélioré avec gestion d'erreurs
   */
  private static setCrossDomainCookie(
    name: string, 
    value: string, 
    options: { maxAge?: number } = {}
  ): void {
    if (typeof document === 'undefined') return;

    const maxAge = options.maxAge || this.COOKIE_CONFIG.MAX_AGE;
    
    try {
      let cookieString = `${name}=${encodeURIComponent(value)}`;
      cookieString += `; Path=${this.COOKIE_CONFIG.PATH}`;
      
      // 🔧 Domaine conditionnel pour localhost
      if (this.COOKIE_CONFIG.DOMAIN) {
        cookieString += `; Domain=${this.COOKIE_CONFIG.DOMAIN}`;
      }
      
      cookieString += `; Max-Age=${maxAge}`;
      cookieString += `; SameSite=${this.COOKIE_CONFIG.SAME_SITE}`;
      
      if (this.COOKIE_CONFIG.SECURE) {
        cookieString += `; Secure`;
      }

      document.cookie = cookieString;
      
      // Log pour debugging
      if (process.env.NODE_ENV === 'development') {
        console.log(`🍪 [SESSION-MANAGER] Cookie set: ${name} (${value.length} chars)`);
      }
    } catch (error) {
      console.error(`❌ [SESSION-MANAGER] Erreur setting cookie ${name}:`, error);
      throw error;
    }
  }

  private static getCookie(name: string): string | null {
    if (typeof document === 'undefined') return null;
    
    try {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      
      if (parts.length === 2) {
        const cookieValue = parts.pop()?.split(';').shift();
        return cookieValue ? decodeURIComponent(cookieValue) : null;
      }
      
      return null;
    } catch (error) {
      console.error(`❌ [SESSION-MANAGER] Erreur reading cookie ${name}:`, error);
      return null;
    }
  }

  private static removeCookie(name: string): void {
    try {
      // Essayer plusieurs variations pour s'assurer de la suppression
      const variations = [
        `${name}=; expires=Thu, 01 Jan 1970 00:00:01 GMT; path=/`,
        `${name}=; expires=Thu, 01 Jan 1970 00:00:01 GMT; path=/; domain=localhost`,
        `${name}=; expires=Thu, 01 Jan 1970 00:00:01 GMT; path=/; domain=.localhost`,
      ];

      if (this.COOKIE_CONFIG.DOMAIN) {
        variations.push(`${name}=; expires=Thu, 01 Jan 1970 00:00:01 GMT; path=/; domain=${this.COOKIE_CONFIG.DOMAIN}`);
      }

      variations.forEach(cookieString => {
        document.cookie = cookieString;
      });

      if (process.env.NODE_ENV === 'development') {
        console.log(`🗑️ [SESSION-MANAGER] Cookie removed: ${name}`);
      }
    } catch (error) {
      console.error(`❌ [SESSION-MANAGER] Erreur removing cookie ${name}:`, error);
    }
  }

  /**
   * 🔧 DIAGNOSTIC: Obtenir l'état complet de la session
   */
  static getSessionDiagnostics(): {
    localStorage: Record<string, string | null>;
    cookies: Record<string, string | null>;
    session: SessionData | null;
    isValid: boolean;
    issues: string[];
  } {
    const localStorage: Record<string, string | null> = {};
    const cookies: Record<string, string | null> = {};
    const issues: string[] = [];

    // Check localStorage
    Object.entries(this.STORAGE_KEYS).forEach(([key, storageKey]) => {
      localStorage[key] = window.localStorage.getItem(storageKey);
    });

    // Check cookies
    const cookieNames = [
      'smp_user_0', 'smp_user_token', 'smp_user_refresh', 
      'smp_session_id', 'access_token', 'user_data'
    ];
    cookieNames.forEach(name => {
      cookies[name] = this.getCookie(name);
    });

    // Get session
    const session = this.getSession();
    const isValid = session ? this.isSessionValid(session) : false;

    // Identify issues
    if (!localStorage.ACCESS_TOKEN) issues.push('Missing access token in localStorage');
    if (!localStorage.USER_DATA) issues.push('Missing user data in localStorage');
    if (!cookies['smp_user_0']) issues.push('Missing user cookie');
    if (!cookies['smp_session_id']) issues.push('Missing session cookie');
    if (session && !isValid) issues.push('Session exists but is invalid');
    if (!session) issues.push('No session found');

    return {
      localStorage,
      cookies,
      session,
      isValid,
      issues
    };
  }
}