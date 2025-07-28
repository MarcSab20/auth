// auth/src/lib/SharedSessionManager.ts
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
  };
  tokens: {
    accessToken: string;
    refreshToken?: string;
    appToken?: string;
  };
  sessionId: string;
  expiresAt: string;
  lastActivity: string;
}

export class SharedSessionManager {
  private static readonly STORAGE_KEYS = {
    ACCESS_TOKEN: 'access_token',
    REFRESH_TOKEN: 'refresh_token',
    APP_TOKEN: 'smp_app_access_token',
    USER_DATA: 'smp_user_0',
    SESSION_ID: 'smp_session_id',
    LAST_ACTIVITY: 'smp_last_activity',
  };

  private static readonly COOKIE_DOMAIN = process.env.NODE_ENV === 'production' ? '.services.com' : 'localhost';
  private static readonly COOKIE_SECURE = process.env.NODE_ENV === 'production';
  private static readonly COOKIE_MAX_AGE = 7 * 24 * 60 * 60; // 7 jours

  /**
   * Stocker une session complète (localStorage + cookies cross-domain)
   */
  static storeSession(sessionData: SessionData): void {
    try {
      console.log('🔐 [AUTH-SESSION-MANAGER] Stockage session cross-app...');

      // 1. Stocker dans localStorage pour l'app courante
      localStorage.setItem(this.STORAGE_KEYS.ACCESS_TOKEN, sessionData.tokens.accessToken);
      
      if (sessionData.tokens.refreshToken) {
        localStorage.setItem(this.STORAGE_KEYS.REFRESH_TOKEN, sessionData.tokens.refreshToken);
      }
      
      if (sessionData.tokens.appToken) {
        localStorage.setItem(this.STORAGE_KEYS.APP_TOKEN, sessionData.tokens.appToken);
      }

      localStorage.setItem(this.STORAGE_KEYS.USER_DATA, JSON.stringify(sessionData.user));
      localStorage.setItem(this.STORAGE_KEYS.SESSION_ID, sessionData.sessionId);
      localStorage.setItem(this.STORAGE_KEYS.LAST_ACTIVITY, sessionData.lastActivity);

      // 2. Stocker dans cookies cross-domain pour partage avec dashboard
      this.setCrossDomainCookie('smp_user_token', sessionData.tokens.accessToken);
      
      if (sessionData.tokens.refreshToken) {
        this.setCrossDomainCookie('smp_user_refresh', sessionData.tokens.refreshToken);
      }
      
      if (sessionData.tokens.appToken) {
        this.setCrossDomainCookie('smp_app_token', sessionData.tokens.appToken);
      }

      this.setCrossDomainCookie('smp_session_id', sessionData.sessionId);

      // 3. Cookie user standard pour compatibilité
      const userCookieValue = encodeURIComponent(JSON.stringify(sessionData.user));
      this.setCrossDomainCookie('smp_user_0', userCookieValue);

      // 4. Cookie de transition spécial avec timestamp
      const transitionData = {
        sessionId: sessionData.sessionId,
        timestamp: Date.now(),
        from: 'auth'
      };
      this.setCrossDomainCookie('smp_transition', JSON.stringify(transitionData), {
        maxAge: 300 // 5 minutes seulement
      });

      console.log('✅ [AUTH-SESSION-MANAGER] Session cross-app stockée avec succès');

    } catch (error) {
      console.error('❌ [AUTH-SESSION-MANAGER] Erreur stockage session:', error);
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

      if (!accessToken || !userDataStr || !sessionId) {
        console.log('ℹ️ [AUTH-SESSION-MANAGER] Session incomplète');
        return null;
      }

      const userData = JSON.parse(userDataStr);
      const refreshToken = localStorage.getItem(this.STORAGE_KEYS.REFRESH_TOKEN);
      const appToken = localStorage.getItem(this.STORAGE_KEYS.APP_TOKEN);
      const lastActivity = localStorage.getItem(this.STORAGE_KEYS.LAST_ACTIVITY) || new Date().toISOString();

      return {
        user: userData,
        tokens: {
          accessToken,
          refreshToken: refreshToken || undefined,
          appToken: appToken || undefined,
        },
        sessionId,
        expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
        lastActivity,
      };

    } catch (error) {
      console.error('❌ [AUTH-SESSION-MANAGER] Erreur récupération session:', error);
      return null;
    }
  }

  /**
   * Nettoyer complètement la session
   */
  static clearSession(): void {
    try {
      console.log('🧹 [AUTH-SESSION-MANAGER] Nettoyage session cross-app...');

      // Nettoyer localStorage
      Object.values(this.STORAGE_KEYS).forEach(key => {
        localStorage.removeItem(key);
      });

      // Nettoyer cookies cross-domain
      const cookiesToClear = [
        'smp_user_token',
        'smp_user_refresh', 
        'smp_app_token',
        'smp_session_id',
        'smp_user_0',
        'smp_transition'
      ];

      cookiesToClear.forEach(cookieName => {
        this.removeCookie(cookieName);
      });

      console.log('✅ [AUTH-SESSION-MANAGER] Session nettoyée');
    } catch (error) {
      console.error('❌ [AUTH-SESSION-MANAGER] Erreur nettoyage session:', error);
    }
  }

  /**
   * Générer un ID de session unique
   */
  static generateSessionId(): string {
    return `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Vérifier si la session est partageable avec le dashboard
   */
  static canShareWithDashboard(): boolean {
    const accessToken = localStorage.getItem(this.STORAGE_KEYS.ACCESS_TOKEN);
    const userData = localStorage.getItem(this.STORAGE_KEYS.USER_DATA);
    
    if (!accessToken || !userData) {
      return false;
    }

    try {
      const user = JSON.parse(userData);
      return !!(user.userID && user.sub);
    } catch {
      return false;
    }
  }

  /**
   * Marquer la session comme prête pour la transition
   */
  static markReadyForTransition(targetUrl: string): void {
    const transitionMarker = {
      ready: true,
      targetUrl,
      timestamp: Date.now(),
      sessionId: localStorage.getItem(this.STORAGE_KEYS.SESSION_ID)
    };

    localStorage.setItem('smp_transition_ready', JSON.stringify(transitionMarker));
    
    // Cookie de transition temporaire
    this.setCrossDomainCookie('smp_transition_ready', JSON.stringify(transitionMarker), {
      maxAge: 60 // 1 minute
    });
  }

  /**
   * Vérifier si la transition est prête
   */
  static isTransitionReady(): boolean {
    const marker = localStorage.getItem('smp_transition_ready');
    
    if (!marker) {
      return false;
    }

    try {
      const data = JSON.parse(marker);
      const age = Date.now() - data.timestamp;
      
      // Transition valide si moins de 1 minute
      return age < 60000;
    } catch {
      return false;
    }
  }

  /**
   * Nettoyer les données de transition
   */
  static clearTransitionData(): void {
    localStorage.removeItem('smp_transition_ready');
    this.removeCookie('smp_transition_ready');
    this.removeCookie('smp_transition');
  }

  // Utilitaires cookies cross-domain
  private static setCrossDomainCookie(
    name: string, 
    value: string, 
    options: { maxAge?: number } = {}
  ): void {
    if (typeof document === 'undefined') return;

    const maxAge = options.maxAge || this.COOKIE_MAX_AGE;
    
    let cookieString = `${name}=${encodeURIComponent(value)}`;
    cookieString += `; Path=/`;
    cookieString += `; Domain=${this.COOKIE_DOMAIN}`;
    cookieString += `; Max-Age=${maxAge}`;
    cookieString += `; SameSite=Lax`;
    
    if (this.COOKIE_SECURE) {
      cookieString += `; Secure`;
    }

    document.cookie = cookieString;
    
    console.log(`🍪 [AUTH-SESSION-MANAGER] Cookie défini: ${name} (domaine: ${this.COOKIE_DOMAIN})`);
  }

  private static removeCookie(name: string): void {
    if (typeof document === 'undefined') return;
    
    // Supprimer pour le domaine courant
    document.cookie = `${name}=; Path=/; Max-Age=0`;
    
    // Supprimer pour le domaine partagé
    document.cookie = `${name}=; Path=/; Domain=${this.COOKIE_DOMAIN}; Max-Age=0`;
    
    console.log(`🗑️ [AUTH-SESSION-MANAGER] Cookie supprimé: ${name}`);
  }

  /**
   * Diagnostiquer l'état de la session pour debug
   */
  static diagnose(): Record<string, any> {
    const diagnosis = {
      localStorage: {},
      cookies: {},
      readyForTransition: this.isTransitionReady(),
      canShare: this.canShareWithDashboard(),
      timestamp: new Date().toISOString()
    };

    // État localStorage
    Object.entries(this.STORAGE_KEYS).forEach(([key, storageKey]) => {
      const value = localStorage.getItem(storageKey);
      //diagnosis.localStorage[key] = value ? 'PRÉSENT' : 'MANQUANT';
    });

    // État cookies
    const cookiesToCheck = ['smp_user_0', 'smp_user_token', 'smp_session_id', 'smp_transition'];
    cookiesToCheck.forEach(cookieName => {
      const value = this.getCookie(cookieName);
     // diagnosis.cookies[cookieName] = value ? 'PRÉSENT' : 'MANQUANT';
    });

    console.log('🔍 [AUTH-SESSION-MANAGER] Diagnostic:', diagnosis);
    return diagnosis;
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
}