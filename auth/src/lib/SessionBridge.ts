import { AUTH_CONFIG } from "../config/auth.config";
import { CookieManager } from "./CookieManager";

export class SessionBridge {
  /**
   * Synchronise les tokens entre localStorage et cookies
   */
  static syncTokensToStorage(): void {
    // App token - accessible cross-frontend
    const appToken = CookieManager.getCookie(AUTH_CONFIG.COOKIES.APP_TOKEN);
    if (appToken) {
      localStorage.setItem('smp_app_access_token', appToken);
    }

    // User tokens - sécurisés
    const userToken = CookieManager.getCookie(AUTH_CONFIG.COOKIES.USER_TOKEN);
    if (userToken) {
      localStorage.setItem('access_token', userToken);
    }

    const sessionId = CookieManager.getCookie(AUTH_CONFIG.COOKIES.SESSION_ID);
    if (sessionId) {
      localStorage.setItem('smp_session_id', sessionId);
    }
  }

  /**
   * Synchronise les tokens de localStorage vers les cookies
   */
  static syncTokensToCookies(): void {
    const appToken = localStorage.getItem('smp_app_access_token');
    if (appToken) {
      CookieManager.setAppToken(appToken);
    }

    const userToken = localStorage.getItem('access_token');
    if (userToken) {
      CookieManager.setUserToken(userToken);
    }

    const refreshToken = localStorage.getItem('refresh_token');
    if (refreshToken) {
      CookieManager.setUserRefreshToken(refreshToken);
    }

    const sessionId = localStorage.getItem('smp_session_id') || this.generateSessionId();
    CookieManager.setSessionId(sessionId);
    localStorage.setItem('smp_session_id', sessionId);
  }

  /**
   * Génère un ID de session unique - MÉTHODE PUBLIQUE
   */
  static generateSessionId(): string {
    return `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Permet à d'autres frontends de récupérer les tokens
   */
  static getSharedTokens(): {
    appToken: string | null;
    sessionId: string | null;
    isAuthenticated: boolean;
  } {
    return {
      appToken: CookieManager.getCookie(AUTH_CONFIG.COOKIES.APP_TOKEN),
      sessionId: CookieManager.getCookie(AUTH_CONFIG.COOKIES.SESSION_ID),
      isAuthenticated: !!CookieManager.getCookie(AUTH_CONFIG.COOKIES.USER_TOKEN)
    };
  }
}
