// src/types/api.ts
export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  errors?: string[];
}

export class APIError extends Error {
  public code?: string;
  public status?: number;
  public details?: Record<string, any>;

  constructor(message: string, code?: string, status?: number, details?: Record<string, any>) {
    super(message);
    this.name = 'APIError';
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

export interface RequestConfig {
  timeout?: number;
  retries?: number;
  baseURL?: string;
  headers?: Record<string, string>;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// Configuration des endpoints
export const API_ENDPOINTS = {
  // KrakenD Gateway (port 8090) - SEUL POINT D'ENTRÉE
  KRAKEND_BASE: process.env.NEXT_PUBLIC_KRAKEND_URL || 'http://localhost:8090',
  
  // Endpoints d'authentification via KrakenD
  AUTH: {
    SIGN_UP: process.env.NEXT_PUBLIC_AUTH_SIGN_UP || '/api/auth/sign-up',
    SIGN_IN: process.env.NEXT_PUBLIC_AUTH_SIGN_IN || '/api/auth/sign-in',
    REFRESH: process.env.NEXT_PUBLIC_AUTH_REFRESH || '/api/auth/refresh',
    LOGOUT: process.env.NEXT_PUBLIC_AUTH_LOGOUT || '/api/auth/logout',
    VERIFY_EMAIL: '/api/auth/verify-email',
    RESET_PASSWORD: '/api/auth/reset-password',
    VALIDATE_USERNAME: '/api/auth/validate-username',
    VALIDATE_EMAIL: '/api/auth/validate-email',
    VALIDATE_PASSWORD: '/api/auth/validate-password',
    SUGGESTIONS: '/api/auth/generate-username-suggestions',
    POLICY: '/api/auth/password-policy',
    REGISTRATION_STATUS: '/api/auth/registration-status',
  },
  
  // GraphQL via KrakenD
  GRAPHQL: process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT || '/graphql'
} as const;

export interface GraphQLResponse<T = any> {
  data?: T;
  errors?: Array<{
    message: string;
    locations?: Array<{ line: number; column: number }>;
    path?: Array<string | number>;
    extensions?: Record<string, any>;
  }>;
}

export interface ValidationConfig {
  enabled: boolean;
  debounceMs: number;
  cacheMs: number;
  retryAttempts: number;
}

// Configuration par défaut
export const DEFAULT_VALIDATION_CONFIG: ValidationConfig = {
  enabled: true,
  debounceMs: 500,
  cacheMs: 30000,
  retryAttempts: 3,
};