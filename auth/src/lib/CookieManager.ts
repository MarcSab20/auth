import { AUTH_CONFIG } from "../config/auth.config";

export class CookieManager {
  private static domain = AUTH_CONFIG.COOKIES.DOMAIN;
  private static secure = AUTH_CONFIG.COOKIES.SECURE;
  private static maxAge = AUTH_CONFIG.COOKIES.MAX_AGE;

  static setAppToken(token: string): void {
    this.setCookie(AUTH_CONFIG.COOKIES.APP_TOKEN, token, {
      httpOnly: false, // Accessible par JS pour les autres frontends
      maxAge: this.maxAge,
      sameSite: 'lax'
    });
  }

  static setUserToken(token: string): void {
    this.setCookie(AUTH_CONFIG.COOKIES.USER_TOKEN, token, {
      httpOnly: true, // Sécurisé
      maxAge: this.maxAge,
      sameSite: 'lax'
    });
  }

  static setUserRefreshToken(token: string): void {
    this.setCookie(AUTH_CONFIG.COOKIES.USER_REFRESH, token, {
      httpOnly: true,
      maxAge: this.maxAge,
      sameSite: 'lax'
    });
  }

  static setSessionId(sessionId: string): void {
    this.setCookie(AUTH_CONFIG.COOKIES.SESSION_ID, sessionId, {
      httpOnly: false, // Accessible pour la validation cross-frontend
      maxAge: this.maxAge,
      sameSite: 'lax'
    });
  }

  private static setCookie(name: string, value: string, options: {
    httpOnly?: boolean;
    maxAge?: number;
    sameSite?: 'strict' | 'lax' | 'none';
  }): void {
    if (typeof document === 'undefined') return;

    let cookieString = `${name}=${encodeURIComponent(value)}`;
    cookieString += `; Path=/`;
    cookieString += `; Domain=${this.domain}`;
    
    if (options.maxAge) {
      cookieString += `; Max-Age=${options.maxAge}`;
    }
    
    if (this.secure) {
      cookieString += `; Secure`;
    }
    
    if (options.sameSite) {
      cookieString += `; SameSite=${options.sameSite}`;
    }

    document.cookie = cookieString;
  }

  static getCookie(name: string): string | null {
    if (typeof document === 'undefined') return null;
    
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    
    if (parts.length === 2) {
      const cookieValue = parts.pop()?.split(';').shift();
      return cookieValue ? decodeURIComponent(cookieValue) : null;
    }
    
    return null;
  }

  static removeCookie(name: string): void {
    this.setCookie(name, '', { maxAge: 0 });
  }

  static clearAllAuthCookies(): void {
    this.removeCookie(AUTH_CONFIG.COOKIES.APP_TOKEN);
    this.removeCookie(AUTH_CONFIG.COOKIES.USER_TOKEN);
    this.removeCookie(AUTH_CONFIG.COOKIES.USER_REFRESH);
    this.removeCookie(AUTH_CONFIG.COOKIES.SESSION_ID);
  }
}