// src/services/api/magicLinkAPI.ts
import { API_CONFIG } from '@/src/config/api.config';

interface MagicLinkGenerateRequest {
  email: string;
  action?: 'login' | 'register' | 'reset_password' | 'verify_email';
  redirectUrl?: string;
  ip?: string;
  userAgent?: string;
  deviceFingerprint?: string;
  referrer?: string;
}

interface MagicLinkGenerateResponse {
  success: boolean;
  linkId?: string;
  message: string;
  expiresAt?: string;
  emailSent?: boolean;
}

interface MagicLinkVerifyRequest {
  token: string;
}

interface MagicLinkVerifyResponse {
  success: boolean;
  status: string;
  message?: string;
  accessToken?: string;
  refreshToken?: string;
  tokenType?: string;
  expiresIn?: number;
  requiresMFA?: boolean;
  user?: any;
}

interface MagicLinkStatusResponse {
  success: boolean;
  data?: {
    email: string;
    links: Array<{
      id: string;
      status: string;
      action: string;
      createdAt: string;
      expiresAt: string;
      usedAt?: string;
    }>;
    count: number;
  };
}

class MagicLinkAPI {
  private baseURL = API_CONFIG.BASE_URL;

  /**
   * Générer un Magic Link
   */
  async generateMagicLink(request: MagicLinkGenerateRequest): Promise<MagicLinkGenerateResponse> {
    try {
      console.log('🔗 Generating Magic Link for:', request.email);

      const response = await fetch('/api/auth/magic-link/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Request-ID': this.generateRequestId(),
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Magic Link generation failed');
      }

      return {
        success: result.success,
        linkId: result.data?.linkId,
        message: result.data?.message || 'Magic Link sent successfully',
        expiresAt: result.data?.expiresAt,
        emailSent: result.data?.emailSent,
      };

    } catch (error: any) {
      console.error('❌ Magic Link generation error:', error);
      throw new Error(error.message || 'Failed to generate Magic Link');
    }
  }

  /**
   * Vérifier un Magic Link
   */
  async verifyMagicLink(request: MagicLinkVerifyRequest): Promise<MagicLinkVerifyResponse> {
    try {
      console.log('🔗 Verifying Magic Link token:', request.token.substring(0, 8) + '...');

      const response = await fetch('/api/auth/magic-link/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Request-ID': this.generateRequestId(),
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const result = await response.json();
      
      return {
        success: result.success,
        status: result.data?.status || 'unknown',
        message: result.data?.message,
        accessToken: result.data?.accessToken,
        refreshToken: result.data?.refreshToken,
        tokenType: result.data?.tokenType,
        expiresIn: result.data?.expiresIn,
        requiresMFA: result.data?.requiresMFA,
        user: result.data?.user,
      };

    } catch (error: any) {
      console.error('❌ Magic Link verification error:', error);
      throw new Error(error.message || 'Failed to verify Magic Link');
    }
  }

  /**
   * Obtenir le statut des Magic Links pour un email
   */
  async getMagicLinkStatus(email: string): Promise<MagicLinkStatusResponse> {
    try {
      const response = await fetch(`/api/auth/magic-link/status?email=${encodeURIComponent(email)}`, {
        method: 'GET',
        headers: {
          'X-Request-ID': this.generateRequestId(),
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const result = await response.json();
      return result;

    } catch (error: any) {
      console.error('❌ Magic Link status error:', error);
      throw new Error(error.message || 'Failed to get Magic Link status');
    }
  }

  /**
   * Révoquer un Magic Link
   */
  async revokeMagicLink(linkId: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(`/api/auth/magic-link/${linkId}`, {
        method: 'DELETE',
        headers: {
          'X-Request-ID': this.generateRequestId(),
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const result = await response.json();
      return result;

    } catch (error: any) {
      console.error('❌ Magic Link revoke error:', error);
      throw new Error(error.message || 'Failed to revoke Magic Link');
    }
  }

  /**
   * Initier une authentification passwordless
   */
  async initiatePasswordlessAuth(request: {
    email: string;
    action?: 'login' | 'register';
    redirectUrl?: string;
  }): Promise<{
    success: boolean;
    method: string;
    linkId?: string;
    message: string;
    expiresAt?: string;
    maskedDestination?: string;
  }> {
    try {
      const response = await fetch('/api/auth/passwordless/initiate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Request-ID': this.generateRequestId(),
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const result = await response.json();
      return result.data || result;

    } catch (error: any) {
      console.error('❌ Passwordless auth error:', error);
      throw new Error(error.message || 'Failed to initiate passwordless authentication');
    }
  }

  /**
   * Vérifier si Magic Link est activé
   */
  async isEnabled(): Promise<boolean> {
    try {
      const response = await fetch('/api/auth/magic-link/config', {
        method: 'GET',
        headers: {
          'X-Request-ID': this.generateRequestId(),
        },
      });

      if (response.ok) {
        const result = await response.json();
        return result.enabled !== false;
      }
      
      return true; // Par défaut, considérer comme activé
    } catch (error) {
      console.warn('Could not check Magic Link status, assuming enabled');
      return true;
    }
  }

  // Méthodes utilitaires
  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Extraire le token depuis l'URL
   */
  extractTokenFromUrl(url?: string): string | null {
    const urlToCheck = url || (typeof window !== 'undefined' ? window.location.href : '');
    const urlParams = new URLSearchParams(new URL(urlToCheck).search);
    return urlParams.get('token');
  }

  /**
   * Construire l'URL de redirection avec le token
   */
  buildMagicLinkUrl(token: string, baseUrl?: string): string {
    const base = baseUrl || (typeof window !== 'undefined' ? window.location.origin : '');
    return `${base}/magic-link?token=${encodeURIComponent(token)}`;
  }

  /**
   * Valider le format d'un token Magic Link
   */
  validateTokenFormat(token: string): boolean {
    // Format attendu : chaîne hexadécimale de 32 à 64 caractères
    return /^[a-f0-9]{32,64}$/.test(token);
  }
}

// Instance singleton
const magicLinkAPI = new MagicLinkAPI();
export default magicLinkAPI;

// Types exportés
export type {
  MagicLinkGenerateRequest,
  MagicLinkGenerateResponse,
  MagicLinkVerifyRequest,
  MagicLinkVerifyResponse,
  MagicLinkStatusResponse,
};