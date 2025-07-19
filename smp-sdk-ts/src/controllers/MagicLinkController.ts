import { APIClient } from '../api/APIClient';

export interface MagicLinkGenerateRequest {
  email: string;
  action?: 'login' | 'register' | 'reset_password' | 'verify_email';
  redirectUrl?: string;
  ip?: string;
  userAgent?: string;
  deviceFingerprint?: string;
  referrer?: string;
}

export interface MagicLinkGenerateResponse {
  success: boolean;
  linkId?: string;
  message: string;
  expiresAt?: string;
  emailSent?: boolean;
}

export interface MagicLinkVerifyRequest {
  token: string;
}

export interface MagicLinkVerifyResponse {
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

export interface MagicLinkStatusResponse {
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

const magicLinkMutations = {
  GENERATE_MAGIC_LINK: `
    mutation GenerateMagicLink($input: MagicLinkRequestDto!) {
      generateMagicLink(input: $input) {
        success
        linkId
        message
        expiresAt
        emailSent
      }
    }
  `,

  VERIFY_MAGIC_LINK: `
    mutation VerifyMagicLink($token: String!) {
      verifyMagicLink(token: $token) {
        success
        status
        message
        accessToken
        refreshToken
        tokenType
        expiresIn
        requiresMFA
        userInfo
      }
    }
  `,

  REVOKE_MAGIC_LINK: `
    mutation RevokeMagicLink($linkId: String!) {
      revokeMagicLink(linkId: $linkId) {
        success
        message
      }
    }
  `
};

const magicLinkQueries = {
  GET_MAGIC_LINK_STATUS: `
    query GetMagicLinkStatus($email: String!) {
      getMagicLinkStatus(email: $email) {
        success
        data {
          email
          links {
            id
            status
            action
            createdAt
            expiresAt
            usedAt
          }
          count
        }
      }
    }
  `,

  IS_MAGIC_LINK_ENABLED: `
    query IsMagicLinkEnabled {
      isMagicLinkEnabled {
        enabled
        config {
          tokenLength
          expiryMinutes
          maxUsesPerDay
        }
      }
    }
  `
};

/**
 * The `MagicLink` class manages Magic Link authentication within the application.
 * Provides methods to generate, verify, and manage Magic Links.
 */
export class MagicLink {
  private client: APIClient;

  constructor(client: APIClient) {
    this.client = client;
  }

  /**
   * Generates a Magic Link for passwordless authentication
   */
  async generate(request: MagicLinkGenerateRequest): Promise<MagicLinkGenerateResponse> {
    try {
      console.log('🔗 [SDK] Generating Magic Link for:', request.email);

      const context = {
        ip: request.ip,
        userAgent: request.userAgent,
        deviceFingerprint: request.deviceFingerprint,
        referrer: request.referrer,
        action: request.action || 'login'
      };

      const input = {
        email: request.email,
        redirectUrl: request.redirectUrl,
        context
      };

      const mutation = magicLinkMutations.GENERATE_MAGIC_LINK;
      const response = await this.client.mutate(mutation, { input }) as { generateMagicLink: MagicLinkGenerateResponse };

      console.log('✅ [SDK] Magic Link generated:', response.generateMagicLink);
      return response.generateMagicLink;

    } catch (error: any) {
      console.error('❌ [SDK] Magic Link generation failed:', error);
      throw new Error(error.message || 'Failed to generate Magic Link');
    }
  }

  /**
   * Verifies a Magic Link token
   */
  async verify(request: MagicLinkVerifyRequest): Promise<MagicLinkVerifyResponse> {
    try {
      console.log('🔗 [SDK] Verifying Magic Link token:', request.token.substring(0, 8) + '...');

      const mutation = magicLinkMutations.VERIFY_MAGIC_LINK;
      const response = await this.client.mutate(mutation, { token: request.token }) as { verifyMagicLink: MagicLinkVerifyResponse };

      console.log('✅ [SDK] Magic Link verified:', response.verifyMagicLink);
      return response.verifyMagicLink;

    } catch (error: any) {
      console.error('❌ [SDK] Magic Link verification failed:', error);
      throw new Error(error.message || 'Failed to verify Magic Link');
    }
  }

  /**
   * Gets Magic Link status for an email
   */
  async getStatus(email: string): Promise<MagicLinkStatusResponse> {
    try {
      const query = magicLinkQueries.GET_MAGIC_LINK_STATUS;
      const response = await this.client.query(query, { email }) as { getMagicLinkStatus: MagicLinkStatusResponse };

      return response.getMagicLinkStatus;

    } catch (error: any) {
      console.error('❌ [SDK] Magic Link status failed:', error);
      throw new Error(error.message || 'Failed to get Magic Link status');
    }
  }

  /**
   * Revokes a Magic Link
   */
  async revoke(linkId: string): Promise<{ success: boolean; message: string }> {
    try {
      const mutation = magicLinkMutations.REVOKE_MAGIC_LINK;
      const response = await this.client.mutate(mutation, { linkId }) as { revokeMagicLink: { success: boolean; message: string } };

      return response.revokeMagicLink;

    } catch (error: any) {
      console.error('❌ [SDK] Magic Link revoke failed:', error);
      throw new Error(error.message || 'Failed to revoke Magic Link');
    }
  }

  /**
   * Checks if Magic Link is enabled
   */
  async isEnabled(): Promise<boolean> {
    try {
      const query = magicLinkQueries.IS_MAGIC_LINK_ENABLED;
      const response = await this.client.query(query) as { isMagicLinkEnabled: { enabled: boolean } };

      return response.isMagicLinkEnabled.enabled;
    } catch (error) {
      console.warn('Could not check Magic Link status, assuming enabled');
      return true;
    }
  }

  /**
   * Validates Magic Link token format
   */
  validateTokenFormat(token: string): boolean {
    // Format attendu : chaîne hexadécimale de 32 à 64 caractères
    return /^[a-f0-9]{32,64}$/.test(token);
  }

  /**
   * Extracts Magic Link token from URL
   */
  extractTokenFromUrl(url?: string): string | null {
    try {
      const urlToCheck = url || (typeof window !== 'undefined' ? window.location.href : '');
      const urlObj = new URL(urlToCheck);
      const token = urlObj.searchParams.get('token');
      
      return token && this.validateTokenFormat(token) ? token : null;
    } catch {
      return null;
    }
  }

  /**
   * Builds Magic Link URL
   */
  buildMagicLinkUrl(token: string, baseUrl?: string, redirectUrl?: string): string {
    const base = baseUrl || (typeof window !== 'undefined' ? window.location.origin : '');
    let url = `${base}/magic-link?token=${encodeURIComponent(token)}`;
    
    if (redirectUrl) {
      url += `&redirect=${encodeURIComponent(redirectUrl)}`;
    }
    
    return url;
  }

  /**
   * Masks email address for display
   */
  maskEmail(email: string): string {
    const [username, domain] = email.split('@');
    if (username.length <= 2) return email;
    
    const visibleChars = Math.min(2, username.length);
    const maskedPart = '*'.repeat(username.length - visibleChars);
    
    return `${username.slice(0, visibleChars)}${maskedPart}@${domain}`;
  }
}