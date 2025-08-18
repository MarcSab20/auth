import { AUTH_CONFIG } from "../config/auth.config";

export interface TransitionData {
  user: any;
  accessToken: string;
  refreshToken?: string;
  sessionId: string;
  source: 'auth' | 'dashboard';
  returnUrl?: string;
  timestamp: number;
}

export class TransitionService {
  private static readonly TRANSITION_KEY = 'smp_transition_data';
  private static readonly SESSION_KEYS = {
    ACCESS_TOKEN: 'access_token',
    REFRESH_TOKEN: 'refresh_token',
    USER_DATA: 'smp_user_0',
    SESSION_ID: 'smp_session_id',
  };

  /**
   * 🔄 Préparer la transition depuis Auth vers Dashboard
   */
  static prepareTransition(
    user: any, 
    accessToken: string, 
    refreshToken?: string,
    returnUrl: string = '/account'
  ): string {
    const transitionData: TransitionData = {
      user,
      accessToken,
      refreshToken,
      sessionId: this.generateSessionId(),
      source: 'auth',
      returnUrl,
      timestamp: Date.now()
    };

    // Stocker dans localStorage pour la transition
    localStorage.setItem(this.TRANSITION_KEY, JSON.stringify(transitionData));
    
    // Stocker aussi les tokens pour compatibilité
    localStorage.setItem(this.SESSION_KEYS.ACCESS_TOKEN, accessToken);
    if (refreshToken) {
      localStorage.setItem(this.SESSION_KEYS.REFRESH_TOKEN, refreshToken);
    }
    localStorage.setItem(this.SESSION_KEYS.USER_DATA, JSON.stringify(user));
    localStorage.setItem(this.SESSION_KEYS.SESSION_ID, transitionData.sessionId);


    const userCookie = {
      userID: user.userID,
      username: user.username,
      email: user.email,
      profileID: user.profileID,
      accessibleOrganizations: user.accessibleOrganizations,
      organizations: user.organizations,
      sub: user.sub,
      roles: user.roles
    };

    this.setCrossDomainCookie('smp_user_0', JSON.stringify(userCookie));
    this.setCrossDomainCookie('smp_session_id', transitionData.sessionId);
    this.setCrossDomainCookie('smp_access_token', accessToken);

    const transitionToken = this.generateTransitionToken();
    this.setCrossDomainCookie('smp_transition_token', transitionToken, { maxAge: 300 }); // 5 minutes

    return transitionToken;
  }

  /**
   * 🏁 Finaliser la transition côté Dashboard
   */
  static completeTransition(): TransitionData | null {
    try {
      const transitionDataStr = localStorage.getItem(this.TRANSITION_KEY);
      const transitionToken = this.getCookie('smp_transition_token');

      if (!transitionDataStr) {
        console.log('ℹ️ [TRANSITION] Aucune transition en cours, vérification session normale');
        return this.getExistingSession();
      }

      const transitionData: TransitionData = JSON.parse(transitionDataStr);
      
      // Vérifier que la transition n'est pas expirée (10 minutes)
      const transitionAge = Date.now() - transitionData.timestamp;
      if (transitionAge > 10 * 60 * 1000) {
        console.log('⏰ [TRANSITION] Transition expirée');
        this.cleanupTransition();
        return this.getExistingSession();
      }

      // Vérifier le token de transition
      if (transitionToken) {
        console.log('✅ [TRANSITION] Transition validée avec token');
      } else {
        console.log('⚠️ [TRANSITION] Transition sans token, mais données valides');
      }

      // Mettre à jour la source
      transitionData.source = 'dashboard';
      transitionData.timestamp = Date.now();

      // Re-stocker avec la nouvelle source
      this.storeSession(transitionData);
      
      // Nettoyer les données de transition
      this.cleanupTransition();

      console.log('✅ [TRANSITION] Transition complétée avec succès');
      return transitionData;

    } catch (error) {
      console.error('❌ [TRANSITION] Erreur lors de la finalisation:', error);
      this.cleanupTransition();
      return this.getExistingSession();
    }
  }

  /**
   * 📦 Récupérer une session existante (sans transition)
   */
  private static getExistingSession(): TransitionData | null {
    try {
      const accessToken = localStorage.getItem(this.SESSION_KEYS.ACCESS_TOKEN);
      const userDataStr = localStorage.getItem(this.SESSION_KEYS.USER_DATA);
      const sessionId = localStorage.getItem(this.SESSION_KEYS.SESSION_ID);

      if (!accessToken || !userDataStr || !sessionId) {
        return null;
      }

      const user = JSON.parse(userDataStr);
      const refreshToken = localStorage.getItem(this.SESSION_KEYS.REFRESH_TOKEN);

      return {
        user,
        accessToken,
        refreshToken: refreshToken || undefined,
        sessionId,
        source: 'dashboard',
        timestamp: Date.now()
      };
    } catch (error) {
      console.error('❌ [TRANSITION] Erreur récupération session existante:', error);
      return null;
    }
  }

  /**
   * 💾 Stocker la session complète
   */
  private static storeSession(data: TransitionData): void {
    localStorage.setItem(this.SESSION_KEYS.ACCESS_TOKEN, data.accessToken);
    if (data.refreshToken) {
      localStorage.setItem(this.SESSION_KEYS.REFRESH_TOKEN, data.refreshToken);
    }
    localStorage.setItem(this.SESSION_KEYS.USER_DATA, JSON.stringify(data.user));
    localStorage.setItem(this.SESSION_KEYS.SESSION_ID, data.sessionId);
  }

  /**
   * 🧹 Nettoyer les données de transition
   */
  private static cleanupTransition(): void {
    localStorage.removeItem(this.TRANSITION_KEY);
    this.removeCookie('smp_transition_token');
  }

  /**
   * 🗑️ Nettoyer complètement la session
   */
  static clearSession(): void {
    Object.values(this.SESSION_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
    
    this.cleanupTransition();
    
    // Nettoyer les cookies
    this.removeCookie('smp_user_0');
    this.removeCookie('smp_session_id');
    this.removeCookie('smp_access_token');
  }

  /**
   * 🚀 Rediriger vers Dashboard avec transition
   */
  static redirectToDashboard(
    user: any,
    accessToken: string,
    refreshToken?: string,
    returnUrl: string = '/account'
  ): void {
    const transitionToken = this.prepareTransition(user, accessToken, refreshToken, returnUrl);
    
    const dashboardUrl = new URL('/transition', AUTH_CONFIG.DASHBOARD_URL);
    dashboardUrl.searchParams.set('token', transitionToken);
    dashboardUrl.searchParams.set('returnUrl', returnUrl);
    dashboardUrl.searchParams.set('from', 'auth');
    
    console.log('🚀 [TRANSITION] Redirection vers Dashboard:', dashboardUrl.toString());
    window.location.href = dashboardUrl.toString();
  }

  // Utilitaires
  private static generateSessionId(): string {
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
    cookieString += `; Domain=${AUTH_CONFIG.COOKIE_DOMAIN}`;
    cookieString += `; Max-Age=${maxAge}`;
    cookieString += `; SameSite=Lax`;
    
    if (AUTH_CONFIG.COOKIE_SECURE) {
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
