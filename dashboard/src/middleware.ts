// dashboard/src/middleware.ts
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

  console.log(`🔍 [DASHBOARD-MIDDLEWARE] Processing: ${pathname}`);

  // Routes publiques qui ne nécessitent pas d'authentification
  const publicRoutes = [
    '/api/auth/session',
    '/api/auth/signin', 
    '/api/auth/logout',
    '/api/hello',
    '/health',
    '/transition',      // Page de transition cross-app
    '/_next',
    '/favicon.ico',
    '/images',
    '/css',
    '/js',
    '/styles'
  ];

  if (publicRoutes.some(route => pathname.startsWith(route))) {
    console.log(`✅ [DASHBOARD-MIDDLEWARE] Route publique: ${pathname}`);
    return NextResponse.next();
  }

  // Page d'accueil - redirection intelligente
  if (pathname === '/' || pathname === '/index') {
    const sessionValidation = await validateUserSession(req);
    
    if (sessionValidation.isValid) {
      console.log('✅ [DASHBOARD-MIDDLEWARE] Session valide, redirection vers /account');
      const accountURL = req.nextUrl.clone();
      accountURL.pathname = "/account";
      return NextResponse.redirect(accountURL);
    } else {
      console.log('❌ [DASHBOARD-MIDDLEWARE] Pas de session, redirection vers auth app');
      // Redirection vers l'app d'authentification sur le port 3000
      const authURL = new URL('/signin', AUTH_CONFIG.AUTH_URL);
      authURL.searchParams.set('returnUrl', `${AUTH_CONFIG.DASHBOARD_URL}/account`);
      authURL.searchParams.set('from', 'dashboard');
      return NextResponse.redirect(authURL);
    }
  }

  // Routes protégées qui nécessitent une authentification
  if (pathname.startsWith("/account")) {
    const sessionValidation = await validateUserSession(req);
    
    if (!sessionValidation.isValid) {
      console.log('❌ [DASHBOARD-MIDDLEWARE] Session invalide pour route protégée');
      
      // Redirection vers l'app d'authentification avec return URL
      const authURL = new URL('/signin', AUTH_CONFIG.AUTH_URL);
      authURL.searchParams.set('returnUrl', `${AUTH_CONFIG.DASHBOARD_URL}${pathname}`);
      authURL.searchParams.set('message', 'Veuillez vous connecter pour accéder à cette page');
      authURL.searchParams.set('from', 'dashboard');
      
      return NextResponse.redirect(authURL);
    }

    // Validation spécifique pour les routes d'organisation
    if (pathname.startsWith("/account/o/")) {
      const orgValidation = await validateOrganizationAccess(req, sessionValidation.user);
      
      if (!orgValidation.isValid) {
        console.log('❌ [DASHBOARD-MIDDLEWARE] Accès organisation refusé');
        
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

    console.log(`✅ [DASHBOARD-MIDDLEWARE] Accès autorisé: ${pathname}`);
    
    // Headers de sécurité pour les routes protégées
    const response = NextResponse.next();
    response.headers.set("Cache-Control", "no-store, must-revalidate");
    response.headers.set("X-Frame-Options", "DENY");
    response.headers.set("X-Content-Type-Options", "nosniff");
    
    return response;
  }

  console.log(`✅ [DASHBOARD-MIDDLEWARE] Route autorisée: ${pathname}`);
  return NextResponse.next();
}

/**
 * Valider la session utilisateur depuis les cookies
 */
async function validateUserSession(req: NextRequest): Promise<{ isValid: boolean; user?: any }> {
  try {
    const userCookie = req.cookies.get("smp_user_0");
    const accessTokenCookie = req.cookies.get("smp_user_token") || req.cookies.get("access_token");
    
    if (!userCookie?.value) {
      console.log('❌ [DASHBOARD-MIDDLEWARE] Cookie utilisateur manquant');
      return { isValid: false };
    }

    const user = JSON.parse(decodeURIComponent(userCookie.value));
    
    if (!user?.userID || user.userID.startsWith('temp-')) {
      console.log('❌ [DASHBOARD-MIDDLEWARE] Utilisateur invalide ou temporaire');
      return { isValid: false };
    }

    console.log(`✅ [DASHBOARD-MIDDLEWARE] Session valide pour: ${user.userID}`);
    return { isValid: true, user };
  } catch (error) {
    console.error('❌ [DASHBOARD-MIDDLEWARE] Erreur validation session:', error);
    return { isValid: false };
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
          console.log('✅ [DASHBOARD-MIDDLEWARE] Accès organisation validé via cache');
          return { isValid: true };
        }
      } catch (error) {
        console.warn('⚠️ [DASHBOARD-MIDDLEWARE] Cache organisations corrompu');
      }
    }

    // 2. Pour l'instant, on autorise l'accès (à améliorer avec validation API)
    console.log('⚠️ [DASHBOARD-MIDDLEWARE] Validation organisation ignorée - accès autorisé');
    return { isValid: true };

  } catch (error) {
    console.error('❌ [DASHBOARD-MIDDLEWARE] Erreur validation organisation:', error);
    return { 
      isValid: false, 
      redirectTo: '/account',
      error: 'Organization validation error' 
    };
  }
}

export const config = {
  matcher: [
    '/',
    '/account/:path*',
    '/api/:path*'
  ],
};