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
    RESET_PASSWORD: '/api/auth/reset-password'
  },
  
  // GraphQL endpoint
  GRAPHQL: '/graphql',
  
  // Health check
  HEALTH: '/health'
};