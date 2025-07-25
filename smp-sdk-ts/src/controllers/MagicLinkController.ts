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


export class MagicLink {
  private client: APIClient;

  constructor(client: APIClient) {
    this.client = client;
  }

  async generate(request: MagicLinkGenerateRequest): Promise<MagicLinkGenerateResponse> {
    try {
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

      return response.generateMagicLink;

    } catch (error: any) {
      throw new Error(error.message || 'Failed to generate Magic Link');
    }
  }

  async verify(request: MagicLinkVerifyRequest): Promise<MagicLinkVerifyResponse> {
    try {

      const mutation = magicLinkMutations.VERIFY_MAGIC_LINK;
      const response = await this.client.mutate(mutation, { token: request.token }) as { verifyMagicLink: MagicLinkVerifyResponse };
      return response.verifyMagicLink;

    } catch (error: any) {
      throw new Error(error.message || 'Failed to verify Magic Link');
    }
  }

  async getStatus(email: string): Promise<MagicLinkStatusResponse> {
    try {
      const query = magicLinkQueries.GET_MAGIC_LINK_STATUS;
      const response = await this.client.query(query, { email }) as { getMagicLinkStatus: MagicLinkStatusResponse };

      return response.getMagicLinkStatus;

    } catch (error: any) {
      throw new Error(error.message || 'Failed to get Magic Link status');
    }
  }

  async revoke(linkId: string): Promise<{ success: boolean; message: string }> {
    try {
      const mutation = magicLinkMutations.REVOKE_MAGIC_LINK;
      const response = await this.client.mutate(mutation, { linkId }) as { revokeMagicLink: { success: boolean; message: string } };

      return response.revokeMagicLink;

    } catch (error: any) {
      throw new Error(error.message || 'Failed to revoke Magic Link');
    }
  }

  async isEnabled(): Promise<boolean> {
    try {
      const query = magicLinkQueries.IS_MAGIC_LINK_ENABLED;
      const response = await this.client.query(query) as { isMagicLinkEnabled: { enabled: boolean } };

      return response.isMagicLinkEnabled.enabled;
    } catch (error) {
      return true;
    }
  }

  validateTokenFormat(token: string): boolean {
    return /^[a-f0-9]{32,64}$/.test(token);
  }

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

  buildMagicLinkUrl(token: string, baseUrl?: string, redirectUrl?: string): string {
    const base = baseUrl || (typeof window !== 'undefined' ? window.location.origin : '');
    let url = `${base}/magic-link?token=${encodeURIComponent(token)}`;
    
    if (redirectUrl) {
      url += `&redirect=${encodeURIComponent(redirectUrl)}`;
    }
    
    return url;
  }

  maskEmail(email: string): string {
    const [username, domain] = email.split('@');
    if (username.length <= 2) return email;
    
    const visibleChars = Math.min(2, username.length);
    const maskedPart = '*'.repeat(username.length - visibleChars);
    
    return `${username.slice(0, visibleChars)}${maskedPart}@${domain}`;
  }
}