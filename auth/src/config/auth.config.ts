export const AUTH_CONFIG = {
  // App IDs distincts pour chaque application
  AUTH_APP: {
    APP_ID: process.env.NEXT_PUBLIC_AUTH_APP_ID || 'f2655ffda8594852',
    APP_SECRET: process.env.NEXT_PUBLIC_AUTH_APP_SECRET || 'TA7Vin/JY0YIp9sGpiy6d7ade351Ub+Ia3Pj1acdMb7AxKL/t1vVCcXt6NSaEiTfYbCes1b4Qs8l54buR17oQdsP9p0lpx0ojKaSdjzER9ftagPpr/5byPZhyxsQNU/V9dzoIx4eVV2sSiuFq4XFNL48v6wZz3znX4IlLenGji8=',
  },
  DASHBOARD_APP: {
    APP_ID: process.env.NEXT_PUBLIC_DASHBOARD_APP_ID || 'f2655ffda8594853',
    APP_SECRET: process.env.NEXT_PUBLIC_DASHBOARD_APP_SECRET || 'TA7Vin/JY0YIp9sGpiy6d7ade351Ub+Ia3Pj1acdMb7AxKL/t1vVCcXt6NSaEiTfYbCes1b4Qs8l54buR17oQdsP9p0lpx0ojKaSdjzER9ftagPpr/5byPZhyxsQNU/V9dzoIx4eVV2sSiuFq4XFNL48v6wZz3znX4IlLenGji8=',
  },
  
  // Gateway partagé - URL FIXE
  GATEWAY_URL: process.env.NEXT_PUBLIC_GATEWAY_URL || 'http://localhost:4000',
  GRAPHQL_URL: process.env.NEXT_PUBLIC_GRAPHQL_URL || 'http://localhost:4000/graphql',
  
  // URLs des applications - NOUVEAUX PORTS
  AUTH_URL: process.env.NEXT_PUBLIC_AUTH_URL || 'http://localhost:3000',      // Auth sur port 3000
  DASHBOARD_URL: process.env.NEXT_PUBLIC_DASHBOARD_URL || 'http://localhost:3002', // Dashboard sur port 3002
  
  // Alias pour compatibilité
  API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000',
  
  // Configuration de session
  SESSION_DURATION: 8 * 60 * 60 * 1000, // 8 heures
  INACTIVITY_LIMIT: 2 * 60 * 60 * 1000, // 2 heures
  
  // Cookies cross-domain
  COOKIE_DOMAIN: process.env.NODE_ENV === 'production' ? '.services.com' : 'localhost',
  COOKIE_SECURE: process.env.NODE_ENV === 'production',
  
  APP_ACCESS_DURATION: 30 * 60 * 1000, // 30 minutes
  USER_ACCESS_DURATION: 30 * 60 * 1000, // 30 minutes
  MIN_ACCESS_DURATION: 5 * 60 * 1000,   // 5 minutes minimum
  
  COOKIES: {
    APP_TOKEN: 'smp_app_token',
    USER_TOKEN: 'smp_user_token',
    USER_REFRESH: 'smp_user_refresh',
    SESSION_ID: 'smp_session_id',
    DOMAIN: process.env.NODE_ENV === 'production' ? '.services.com' : 'localhost',
    SECURE: process.env.NODE_ENV === 'production',
    MAX_AGE: 7 * 24 * 60 * 60, // 7 jours
  },
  
  HEADERS: {
    APP_ID: 'X-App-ID',
    APP_SECRET: 'X-App-Secret', 
    APP_TOKEN: 'X-App-Token',
    USER_TOKEN: 'Authorization',
  }
} as const;

export function validateAuthConfig(): void {
  const required = [
    { key: 'AUTH_APP.APP_ID', value: AUTH_CONFIG.AUTH_APP.APP_ID },
    { key: 'AUTH_APP.APP_SECRET', value: AUTH_CONFIG.AUTH_APP.APP_SECRET },
    { key: 'GRAPHQL_URL', value: AUTH_CONFIG.GRAPHQL_URL },
    { key: 'AUTH_URL', value: AUTH_CONFIG.AUTH_URL },
    { key: 'DASHBOARD_URL', value: AUTH_CONFIG.DASHBOARD_URL }
  ];
  
  for (const { key, value } of required) {
    if (!value) {
      throw new Error(`Configuration manquante: ${key}`);
    }
  }
  
  console.log('✅ [CONFIG] Configuration Auth validée:', {
    AUTH_URL: AUTH_CONFIG.AUTH_URL,      // http://localhost:3000
    DASHBOARD_URL: AUTH_CONFIG.DASHBOARD_URL, // http://localhost:3002
    GRAPHQL_URL: AUTH_CONFIG.GRAPHQL_URL,
    COOKIE_DOMAIN: AUTH_CONFIG.COOKIE_DOMAIN
  });
}