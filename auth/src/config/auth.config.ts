export const AUTH_CONFIG = {
  APP_ID: process.env.NEXT_PUBLIC_APP_ID!,
  APP_SECRET: process.env.NEXT_PUBLIC_APP_SECRET!,
  API_URL: process.env.NEXT_PUBLIC_API_URL!,
  GRAPHQL_URL: process.env.NEXT_PUBLIC_GRAPHQL_URL!,
  
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
  const required = ['APP_ID', 'APP_SECRET', 'API_URL', 'GRAPHQL_URL'];
  
  for (const key of required) {
    if (!AUTH_CONFIG[key as keyof typeof AUTH_CONFIG]) {
      throw new Error(`Configuration manquante: ${key}`);
    }
  }
}