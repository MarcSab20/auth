// src/config/api.config.ts - VERSION ÉTENDUE AVEC MAGIC LINK
export const API_CONFIG = {
  // Backend principal via KrakenD
  BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8090',
  
  // Endpoints d'authentification
  AUTH: {
    SIGN_UP: '/api/auth/sign-up',
    SIGN_IN: '/api/auth/sign-in',
    REFRESH: '/api/auth/refresh',
    LOGOUT: '/api/auth/logout',
    FORGOT_PASSWORD: '/api/auth/forgot-password',
    RESET_PASSWORD: '/api/auth/reset-password',
    
    // Nouveaux endpoints Magic Link
    MAGIC_LINK_GENERATE: '/api/auth/magic-link/generate',
    MAGIC_LINK_VERIFY: '/api/auth/magic-link/verify',
    MAGIC_LINK_STATUS: '/api/auth/magic-link/status',
    MAGIC_LINK_REVOKE: '/api/auth/magic-link',
    PASSWORDLESS_INITIATE: '/api/auth/passwordless/initiate',
    
    // Validation
    VALIDATE_TOKEN: '/api/auth/validate',
    VALIDATE_USERNAME: '/api/auth/validate-username',
    VALIDATE_EMAIL: '/api/auth/validate-email',
    VALIDATE_PASSWORD: '/api/auth/validate-password',
  },
  
  // GraphQL endpoint
  GRAPHQL: '/graphql',
  GRAPHQL_PUBLIC: '/graphql-public',
  
  // Health check
  HEALTH: '/health',
  
  // Configuration Magic Link
  MAGIC_LINK: {
    ENABLED: process.env.NEXT_PUBLIC_MAGIC_LINK_ENABLED !== 'false',
    TOKEN_LENGTH: parseInt(process.env.NEXT_PUBLIC_MAGIC_LINK_TOKEN_LENGTH || '32'),
    EXPIRY_MINUTES: parseInt(process.env.NEXT_PUBLIC_MAGIC_LINK_EXPIRY_MINUTES || '30'),
    MAX_USES_PER_DAY: parseInt(process.env.NEXT_PUBLIC_MAGIC_LINK_MAX_USES_PER_DAY || '10'),
    REDIRECT_URL: process.env.NEXT_PUBLIC_MAGIC_LINK_REDIRECT_URL || '/account',
  }
} as const;

// Types pour les réponses Magic Link
export interface MagicLinkConfig {
  enabled: boolean;
  tokenLength: number;
  expiryMinutes: number;
  maxUsesPerDay: number;
  redirectUrl: string;
}

// Helper pour vérifier si Magic Link est activé
export function isMagicLinkEnabled(): boolean {
  return API_CONFIG.MAGIC_LINK.ENABLED;
}

// Helper pour construire les URLs
export function buildMagicLinkVerifyUrl(token: string): string {
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  return `${baseUrl}/magic-link?token=${encodeURIComponent(token)}`;
}

// src/types/magicLink.ts - NOUVEAUX TYPES
export interface MagicLinkGeneratePayload {
  email: string;
  action?: 'login' | 'register' | 'reset_password' | 'verify_email';
  redirectUrl?: string;
  context?: {
    ip?: string;
    userAgent?: string;
    deviceFingerprint?: string;
    referrer?: string;
  };
}

export interface MagicLinkVerifyPayload {
  token: string;
}

export interface MagicLinkGenerateResponse {
  success: boolean;
  linkId?: string;
  message: string;
  expiresAt?: string;
  emailSent?: boolean;
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
  mfaChallenge?: any;
}

export interface MagicLinkStatus {
  id: string;
  email: string;
  status: 'pending' | 'used' | 'expired' | 'revoked';
  action: string;
  createdAt: string;
  expiresAt: string;
  usedAt?: string;
}

export interface PasswordlessAuthRequest {
  email: string;
  action?: 'login' | 'register';
  redirectUrl?: string;
  method?: 'magic_link' | 'sms' | 'email_code';
}

export interface PasswordlessAuthResponse {
  success: boolean;
  method: string;
  challengeId?: string;
  linkId?: string;
  message: string;
  expiresAt?: string;
  maskedDestination?: string;
}

// Erreurs spécifiques Magic Link
export class MagicLinkError extends Error {
  constructor(
    message: string,
    public code: 'EXPIRED' | 'USED' | 'INVALID' | 'NETWORK' | 'SERVER' = 'SERVER',
    public linkId?: string
  ) {
    super(message);
    this.name = 'MagicLinkError';
  }
}

// États pour le contexte Magic Link
export interface MagicLinkState {
  isLoading: boolean;
  error: string | null;
  success: string | null;
  lastGeneratedLink: {
    linkId?: string;
    email?: string;
    expiresAt?: string;
    emailSent?: boolean;
  } | null;
  verificationResult: {
    status?: string;
    requiresMFA?: boolean;
    user?: any;
    accessToken?: string;
    refreshToken?: string;
  } | null;
  linkStatus: MagicLinkStatus[];
}

// Actions pour le reducer Magic Link
export type MagicLinkAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_SUCCESS'; payload: string | null }
  | { type: 'SET_GENERATED_LINK'; payload: MagicLinkState['lastGeneratedLink'] }
  | { type: 'SET_VERIFICATION_RESULT'; payload: MagicLinkState['verificationResult'] }
  | { type: 'SET_LINK_STATUS'; payload: MagicLinkStatus[] }
  | { type: 'UPDATE_LINK_STATUS'; payload: { linkId: string; updates: Partial<MagicLinkStatus> } }
  | { type: 'CLEAR_STATE' };

// Validation des tokens Magic Link
export function validateMagicLinkToken(token: string): boolean {
  if (!token || typeof token !== 'string') {
    return false;
  }
  
  // Format attendu : chaîne hexadécimale de longueur appropriée
  const expectedLength = API_CONFIG.MAGIC_LINK.TOKEN_LENGTH;
  const hexPattern = new RegExp(`^[a-f0-9]{${expectedLength}}$`);
  
  return hexPattern.test(token);
}

// Helper pour extraire le token depuis l'URL
export function extractMagicLinkToken(url?: string): string | null {
  try {
    const urlToCheck = url || (typeof window !== 'undefined' ? window.location.href : '');
    const urlObj = new URL(urlToCheck);
    const token = urlObj.searchParams.get('token');
    
    return token && validateMagicLinkToken(token) ? token : null;
  } catch {
    return null;
  }
}

// Helper pour masquer l'email
export function maskEmail(email: string): string {
  const [username, domain] = email.split('@');
  if (username.length <= 2) return email;
  
  const visibleChars = Math.min(2, username.length);
  const maskedPart = '*'.repeat(username.length - visibleChars);
  
  return `${username.slice(0, visibleChars)}${maskedPart}@${domain}`;
}

// Configuration des erreurs Magic Link
export const MAGIC_LINK_ERRORS = {
  EXPIRED: {
    code: 'EXPIRED' as const,
    message: 'Ce Magic Link a expiré',
    suggestions: [
      'Demandez un nouveau Magic Link',
      'Vérifiez que vous utilisez le lien le plus récent'
    ]
  },
  USED: {
    code: 'USED' as const,
    message: 'Ce Magic Link a déjà été utilisé',
    suggestions: [
      'Chaque Magic Link ne peut être utilisé qu\'une seule fois',
      'Demandez un nouveau lien si nécessaire'
    ]
  },
  INVALID: {
    code: 'INVALID' as const,
    message: 'Ce Magic Link est invalide',
    suggestions: [
      'Vérifiez que vous avez copié l\'URL complète',
      'Utilisez le lien directement depuis votre email'
    ]
  },
  NETWORK: {
    code: 'NETWORK' as const,
    message: 'Problème de connexion réseau',
    suggestions: [
      'Vérifiez votre connexion internet',
      'Réessayez dans quelques instants'
    ]
  }
} as const;