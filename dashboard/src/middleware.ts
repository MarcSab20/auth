// dashboard/src/middleware.ts (version améliorée)
import { NextRequest, NextResponse } from "next/server";
import { AUTH_CONFIG } from "@/src/config/auth.config";

interface SessionValidation {
  isValid: boolean;
  user?: any;
  redirectTo?: string;
  error?: string;
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  console.log(`🔒 [MIDDLEWARE] Checking route: ${pathname}`);

  // Routes publiques qui ne nécessitent pas d'authentification
  const publicRoutes = [
    '/api/auth/session',
    '/api/auth/signin', 
    '/api/auth/logout',
    '/api/hello',
    '/health'
  ];

  if (publicRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Pages d'accueil - redirection intelligente
  if (pathname === '/' || pathname === '/index') {
    const sessionValidation = await validateUserSession(req);
    
    if (sessionValidation.isValid) {
      console.log('✅ [MIDDLEWARE] Session valide, redirection vers /account');
      const accountURL = req.nextUrl.clone();
      accountURL.pathname = "/account";
      return NextResponse.redirect(accountURL);
    } else {
      console.log('❌ [MIDDLEWARE] Pas de session, redirection vers auth app');
      const authURL = new URL('/signin', process.env.NEXT_PUBLIC_AUTH_URL || 'http://localhost:3001');
      return NextResponse.redirect(authURL);
    }
  }

  // Routes protégées qui nécessitent une authentification
  if (pathname.startsWith("/account")) {
    const sessionValidation = await validateUserSession(req);
    
    if (!sessionValidation.isValid) {
      console.log('❌ [MIDDLEWARE] Session invalide pour route protégée');
      
      // Redirection vers l'app d'authentification avec return URL
      const authURL = new URL('/signin', process.env.NEXT_PUBLIC_AUTH_URL || 'http://localhost:3001');
      authURL.searchParams.set('returnUrl', req.url);
      authURL.searchParams.set('message', 'Veuillez vous connecter pour accéder à cette page');
      
      return NextResponse.redirect(authURL);
    }

    // Validation spécifique pour les routes d'organisation
    if (pathname.startsWith("/account/o/")) {
      const orgValidation = await validateOrganizationAccess(req, sessionValidation.user);
      
      if (!orgValidation.isValid) {
        console.log('❌ [MIDDLEWARE] Accès organisation refusé');
        
        if (orgValidation.redirectTo) {
          const redirectURL = req.nextUrl.clone();
          redirectURL.pathname = orgValidation.redirectTo;
          return NextResponse.redirect(redirectURL);
        } else {
          const unauthorizedURL = req.nextUrl.clone();
          unauthorizedURL.pathname = "/unauthorized";
          return NextResponse.redirect(unauthorizedURL);
        }
      }
    }

    // Headers de sécurité pour les routes protégées
    const response = NextResponse.next();
    response.headers.set("Cache-Control", "no-store, must-revalidate");
    response.headers.set("X-Frame-Options", "DENY");
    response.headers.set("X-Content-Type-Options", "nosniff");
    
    return response;
  }

  return NextResponse.next();
}

/**
 * Valider la session utilisateur depuis les cookies et localStorage
 */
async function validateUserSession(req: NextRequest): Promise<SessionValidation> {
  try {
    // 1. Vérifier le cookie utilisateur classique
    const userCookie = req.cookies.get("smp_user_0");
    
    if (!userCookie?.value) {
      console.log('❌ [MIDDLEWARE] Cookie utilisateur manquant');
      return { isValid: false, error: 'No user cookie' };
    }

    // 2. Parser les données utilisateur
    let user;
    try {
      user = JSON.parse(decodeURIComponent(userCookie.value));
    } catch (error) {
      console.log('❌ [MIDDLEWARE] Cookie utilisateur corrompu');
      return { isValid: false, error: 'Corrupted user cookie' };
    }

    if (!user?.userID || !user?.sub) {
      console.log('❌ [MIDDLEWARE] Données utilisateur invalides');
      return { isValid: false, error: 'Invalid user data' };
    }

    // 3. Vérifier le token d'accès
    const accessTokenCookie = req.cookies.get(AUTH_CONFIG.COOKIES.USER_TOKEN);
    const sessionIdCookie = req.cookies.get(AUTH_CONFIG.COOKIES.SESSION_ID);

    if (!accessTokenCookie?.value || !sessionIdCookie?.value) {
      console.log('❌ [MIDDLEWARE] Tokens d\'authentification manquants');
      return { isValid: false, error: 'Missing auth tokens' };
    }

    // 4. Validation optionnelle côté serveur (si configurée)
    if (process.env.VALIDATE_TOKENS_SERVER_SIDE === 'true') {
      const tokenValidation = await validateTokenWithAuthService(accessTokenCookie.value);
      
      if (!tokenValidation.valid) {
        console.log('❌ [MIDDLEWARE] Token invalide côté serveur');
        return { isValid: false, error: 'Invalid token' };
      }
    }

    console.log('✅ [MIDDLEWARE] Session utilisateur valide');
    return { 
      isValid: true, 
      user: {
        ...user,
        sessionId: sessionIdCookie.value
      }
    };

  } catch (error) {
    console.error('❌ [MIDDLEWARE] Erreur validation session:', error);
    return { isValid: false, error: 'Session validation error' };
  }
}

/**
 * Valider l'accès à une organisation spécifique
 */
async function validateOrganizationAccess(req: NextRequest, user: any): Promise<SessionValidation> {
  try {
    const orgIDMatch = req.nextUrl.pathname.match(/^\/account\/o\/([^/]+)/);
    const organizationID = orgIDMatch?.[1];

    if (!organizationID || !user?.userID) {
      return { isValid: false, error: 'Missing organization ID or user ID' };
    }

    // 1. Vérifier le cache d'organisations (cookie temporaire)
    const orgNavCookie = req.cookies.get('orgNav');
    
    if (orgNavCookie?.value) {
      try {
        const organizations = JSON.parse(orgNavCookie.value);
        const hasAccess = organizations.some((org: any) => org.organizationID === organizationID);
        
        if (hasAccess) {
          console.log('✅ [MIDDLEWARE] Accès organisation validé via cache');
          return { isValid: true };
        }
      } catch (error) {
        console.warn('⚠️ [MIDDLEWARE] Cache organisations corrompu');
      }
    }

    // 2. Fallback: validation via API (coûteux, à éviter)
    if (process.env.VALIDATE_ORG_ACCESS_API === 'true') {
      console.log('🔄 [MIDDLEWARE] Validation organisation via API...');
      
      const orgValidation = await validateOrganizationAccessAPI(user.userID, organizationID);
      
      if (orgValidation.isValid) {
        console.log('✅ [MIDDLEWARE] Accès organisation validé via API');
        return { isValid: true };
      }
    }

    console.log('❌ [MIDDLEWARE] Accès organisation refusé');
    return { 
      isValid: false, 
      redirectTo: '/account/organizations',
      error: 'Organization access denied' 
    };

  } catch (error) {
    console.error('❌ [MIDDLEWARE] Erreur validation organisation:', error);
    return { 
      isValid: false, 
      redirectTo: '/account',
      error: 'Organization validation error' 
    };
  }
}

/**
 * Valider un token avec le service d'authentification
 */
async function validateTokenWithAuthService(token: string): Promise<{ valid: boolean }> {
  try {
    const response = await fetch(`${AUTH_CONFIG.GRAPHQL_URL}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-App-ID': AUTH_CONFIG.APP_ID,
        'X-App-Secret': AUTH_CONFIG.APP_SECRET,
      },
      body: JSON.stringify({
        query: `
          query ValidateToken($token: String!) {
            validateToken(token: $token) {
              valid
              userId
            }
          }
        `,
        variables: { token }
      }),
      // Timeout court pour éviter de bloquer les requêtes
      signal: AbortSignal.timeout(2000)
    });

    if (!response.ok) {
      return { valid: false };
    }

    const result = await response.json();
    
    if (result.errors) {
      return { valid: false };
    }

    return { valid: result.data?.validateToken?.valid || false };

  } catch (error) {
    console.warn('⚠️ [MIDDLEWARE] Timeout validation token:', error);
    // En cas d'erreur/timeout, on fait confiance au cookie (dégradation gracieuse)
    return { valid: true };
  }
}

/**
 * Valider l'accès à une organisation via API
 */
async function validateOrganizationAccessAPI(userID: string, organizationID: string): Promise<SessionValidation> {
  try {
    // Utiliser l'API interne du dashboard
    const response = await fetch(`${AUTH_CONFIG.API_URL}/api/user/${userID}/organizations`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-Internal-Request': 'true', // Marquer comme requête interne
      },
      signal: AbortSignal.timeout(3000)
    });

    if (!response.ok) {
      return { isValid: false };
    }

    const organizations = await response.json();
    const hasAccess = organizations.some((org: any) => org.organizationID === organizationID);

    return { isValid: hasAccess };

  } catch (error) {
    console.warn('⚠️ [MIDDLEWARE] Timeout validation organisation API:', error);
    // En cas d'erreur, on refuse l'accès par sécurité
    return { isValid: false };
  }
}

export const config = {
  matcher: [
    '/',
    '/account/:path*',
    '/api/:path*'
  ],
};