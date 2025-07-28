// src/config/api.config.ts - VERSION ÉTENDUE AVEC MAGIC LINK
export const API_CONFIG = {
  // Backend principal via KrakenD
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000',
  
  // Endpoints d'authentification via Gateway
  AUTH: {
    SIGN_UP: '/graphql', 
    SIGN_IN: '/graphql', 
    REFRESH: '/graphql', 
    LOGOUT: '/graphql', 
    VERIFY_EMAIL: '/graphql',
    RESET_PASSWORD: '/graphql',
    VALIDATE_USERNAME: '/graphql',
    VALIDATE_EMAIL: '/graphql',
    VALIDATE_PASSWORD: '/graphql',
    MAGIC_LINK_GENERATE: '/graphql',
    MAGIC_LINK_VERIFY: '/graphql',
  },
  
  // GraphQL endpoint
  GRAPHQL: process.env.NEXT_PUBLIC_GRAPHQL_URL || 'http://localhost:4000/graphql',
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
  },

  // Headers requis
  HEADERS: {
    APP_ID: 'X-App-ID',
    APP_SECRET: 'X-App-Secret',
    AUTHORIZATION: 'Authorization',
    CONTENT_TYPE: 'application/json',
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

