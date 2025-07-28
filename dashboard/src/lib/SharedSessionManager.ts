// dashboard/src/lib/SharedSessionManager.ts
import { AUTH_CONFIG } from '@/src/config/auth.config';

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

  private static readonly COOKIE_KEYS = {
    USER_TOKEN: AUTH_CONFIG.COOKIES.USER_TOKEN,
    USER_REFRESH: AUTH_CONFIG.COOKIES.USER_REFRESH,
    APP_TOKEN: AUTH_CONFIG.COOKIES.APP_TOKEN,
    SESSION_ID: AUTH_CONFIG.COOKIES.SESSION_ID,
  };

  /**
   * Stocker une session complète (localStorage + cookies)
   */
  static storeSession(sessionData: SessionData): void {
    try {
      console.log('🔐 [SESSION-MANAGER] Stockage session complète...');

      // 1. Stocker dans localStorage
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

      // 2. Stocker dans les cookies pour partage cross-domain
      this.setCookie(this.COOKIE_KEYS.USER_TOKEN, sessionData.tokens.accessToken, {
        httpOnly: false, // Accessible par JS pour le partage
        maxAge: AUTH_CONFIG.COOKIES.MAX_AGE,
        sameSite: 'lax',
        secure: AUTH_CONFIG.COOKIES.SECURE,
        domain: AUTH_CONFIG.COOKIES.DOMAIN
      });

      if (sessionData.tokens.refreshToken) {
        this.setCookie(this.COOKIE_KEYS.USER_REFRESH, sessionData.tokens.refreshToken, {
          httpOnly: false,
          maxAge: AUTH_CONFIG.COOKIES.MAX_AGE,
          sameSite: 'lax',
          secure: AUTH_CONFIG.COOKIES.SECURE,
          domain: AUTH_CONFIG.COOKIES.DOMAIN
        });
      }

      if (sessionData.tokens.appToken) {
        this.setCookie(this.COOKIE_KEYS.APP_TOKEN, sessionData.tokens.appToken, {
          httpOnly: false,
          maxAge: AUTH_CONFIG.COOKIES.MAX_AGE,
          sameSite: 'lax',
          secure: AUTH_CONFIG.COOKIES.SECURE,
          domain: AUTH_CONFIG.COOKIES.DOMAIN
        });
      }

      this.setCookie(this.COOKIE_KEYS.SESSION_ID, sessionData.sessionId, {
        httpOnly: false,
        maxAge: AUTH_CONFIG.COOKIES.MAX_AGE,
        sameSite: 'lax',
        secure: AUTH_CONFIG.COOKIES.SECURE,
        domain: AUTH_CONFIG.COOKIES.DOMAIN
      });

      // 3. Cookie user classique pour compatibilité serveur
      const userCookieValue = encodeURIComponent(JSON.stringify(sessionData.user));
      document.cookie = `smp_user_0=${userCookieValue}; path=/; max-age=${AUTH_CONFIG.COOKIES.MAX_AGE}; SameSite=Lax${AUTH_CONFIG.COOKIES.SECURE ? '; Secure' : ''}${AUTH_CONFIG.COOKIES.DOMAIN ? `; Domain=${AUTH_CONFIG.COOKIES.DOMAIN}` : ''}`;

      console.log('✅ [SESSION-MANAGER] Session stockée avec succès');
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
      console.log('🔍 [SESSION-MANAGER] Récupération session...');

      // Vérifier localStorage d'abord
      const accessToken = localStorage.getItem(this.STORAGE_KEYS.ACCESS_TOKEN);
      const userDataStr = localStorage.getItem(this.STORAGE_KEYS.USER_DATA);
      const sessionId = localStorage.getItem(this.STORAGE_KEYS.SESSION_ID);

      if (!accessToken || !userDataStr || !sessionId) {
        console.log('ℹ️ [SESSION-MANAGER] Session incomplète dans localStorage');
        
        // Fallback: essayer les cookies
        return this.getSessionFromCookies();
      }

      const userData = JSON.parse(userDataStr);
      const refreshToken = localStorage.getItem(this.STORAGE_KEYS.REFRESH_TOKEN);
      const appToken = localStorage.getItem(this.STORAGE_KEYS.APP_TOKEN);
      const lastActivity = localStorage.getItem(this.STORAGE_KEYS.LAST_ACTIVITY) || new Date().toISOString();

      const sessionData: SessionData = {
        user: userData,
        tokens: {
          accessToken,
          refreshToken: refreshToken || undefined,
          appToken: appToken || undefined,
        },
        sessionId,
        expiresAt: new Date(Date.now() + AUTH_CONFIG.USER_ACCESS_DURATION).toISOString(),
        lastActivity,
      };

      console.log('✅ [SESSION-MANAGER] Session récupérée depuis localStorage');
      return sessionData;

    } catch (error) {
      console.error('❌ [SESSION-MANAGER] Erreur récupération session:', error);
      return null;
    }
  }

  /**
   * Récupérer session depuis les cookies (fallback)
   */
  private static getSessionFromCookies(): SessionData | null {
    try {
      console.log('🔍 [SESSION-MANAGER] Tentative récupération depuis cookies...');

      const accessToken = this.getCookie(this.COOKIE_KEYS.USER_TOKEN);
      const sessionId = this.getCookie(this.COOKIE_KEYS.SESSION_ID);
      const userCookie = this.getCookie('smp_user_0');

      if (!accessToken || !sessionId || !userCookie) {
        console.log('ℹ️ [SESSION-MANAGER] Session incomplète dans cookies');
        return null;
      }

      const userData = JSON.parse(decodeURIComponent(userCookie));
      const refreshToken = this.getCookie(this.COOKIE_KEYS.USER_REFRESH);
      const appToken = this.getCookie(this.COOKIE_KEYS.APP_TOKEN);

      const sessionData: SessionData = {
        user: userData,
        tokens: {
          accessToken,
          refreshToken: refreshToken || undefined,
          appToken: appToken || undefined,
        },
        sessionId,
        expiresAt: new Date(Date.now() + AUTH_CONFIG.USER_ACCESS_DURATION).toISOString(),
        lastActivity: new Date().toISOString(),
      };

      console.log('✅ [SESSION-MANAGER] Session récupérée depuis cookies');
      
      // Synchroniser vers localStorage
      this.syncToLocalStorage(sessionData);
      
      return sessionData;

    } catch (error) {
      console.error('❌ [SESSION-MANAGER] Erreur récupération cookies:', error);
      return null;
    }
  }

  /**
   * Synchroniser session vers localStorage
   */
  private static syncToLocalStorage(sessionData: SessionData): void {
    try {
      localStorage.setItem(this.STORAGE_KEYS.ACCESS_TOKEN, sessionData.tokens.accessToken);
      localStorage.setItem(this.STORAGE_KEYS.USER_DATA, JSON.stringify(sessionData.user));
      localStorage.setItem(this.STORAGE_KEYS.SESSION_ID, sessionData.sessionId);
      localStorage.setItem(this.STORAGE_KEYS.LAST_ACTIVITY, sessionData.lastActivity);

      if (sessionData.tokens.refreshToken) {
        localStorage.setItem(this.STORAGE_KEYS.REFRESH_TOKEN, sessionData.tokens.refreshToken);
      }

      if (sessionData.tokens.appToken) {
        localStorage.setItem(this.STORAGE_KEYS.APP_TOKEN, sessionData.tokens.appToken);
      }

      console.log('✅ [SESSION-MANAGER] Session synchronisée vers localStorage');
    } catch (error) {
      console.warn('⚠️ [SESSION-MANAGER] Erreur sync localStorage:', error);
    }
  }

  /**
   * Mettre à jour l'activité de session
   */
  static updateActivity(): void {
    const now = new Date().toISOString();
    localStorage.setItem(this.STORAGE_KEYS.LAST_ACTIVITY, now);
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

    // Vérifier inactivité (30 minutes)
    const inactivityLimit = 30 * 60 * 1000; // 30 minutes
    if (now.getTime() - lastActivity.getTime() > inactivityLimit) {
      console.log('⏰ [SESSION-MANAGER] Session inactive trop longtemps');
      return false;
    }

    return true;
  }

  /**
   * Nettoyer complètement la session
   */
  static clearSession(): void {
    try {
      console.log('🧹 [SESSION-MANAGER] Nettoyage session complète...');

      // Nettoyer localStorage
      Object.values(this.STORAGE_KEYS).forEach(key => {
        localStorage.removeItem(key);
      });

      // Nettoyer cookies
      Object.values(this.COOKIE_KEYS).forEach(cookieName => {
        this.removeCookie(cookieName);
      });

      // Nettoyer cookie user classique
      this.removeCookie('smp_user_0');

      console.log('✅ [SESSION-MANAGER] Session nettoyée');
    } catch (error) {
      console.error('❌ [SESSION-MANAGER] Erreur nettoyage session:', error);
    }
  }

  /**
   * Détecter changement de session (cross-tab)
   */
  static onSessionChange(callback: (sessionData: SessionData | null) => void): () => void {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === this.STORAGE_KEYS.ACCESS_TOKEN || e.key === this.STORAGE_KEYS.USER_DATA) {
        console.log('🔄 [SESSION-MANAGER] Changement session détecté');
        const sessionData = this.getSession();
        callback(sessionData);
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }

  /**
   * Créer un ID de session unique
   */
  static generateSessionId(): string {
    return `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Utilitaires cookies
  private static setCookie(name: string, value: string, options: {
    httpOnly?: boolean;
    maxAge?: number;
    sameSite?: 'strict' | 'lax' | 'none';
    secure?: boolean;
    domain?: string;
  }): void {
    if (typeof document === 'undefined') return;

    let cookieString = `${name}=${encodeURIComponent(value)}`;
    cookieString += `; Path=/`;
    
    if (options.domain) {
      cookieString += `; Domain=${options.domain}`;
    }
    
    if (options.maxAge) {
      cookieString += `; Max-Age=${options.maxAge}`;
    }
    
    if (options.secure) {
      cookieString += `; Secure`;
    }
    
    if (options.sameSite) {
      cookieString += `; SameSite=${options.sameSite}`;
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
    this.setCookie(name, '', { maxAge: 0 });
  }
}