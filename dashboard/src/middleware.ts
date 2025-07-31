// dashboard/src/middleware.ts - FIX POUR COOKIES INSTABLES
import { NextRequest, NextResponse } from "next/server";
import { AUTH_CONFIG } from "@/src/config/auth.config";

interface SessionValidation {
  isValid: boolean;
  user?: any;
  redirectTo?: string;
  error?: string;
  cookieSource?: string;
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
    '/transition',
    '/_next',
    '/favicon.ico',
    '/images',
    '/css',
    '/js',
    '/styles',
    '/fonts',
    '/public' // AJOUT pour les assets statiques
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
      console.log(`❌ [DASHBOARD-MIDDLEWARE] Pas de session (${sessionValidation.error}), redirection vers auth app`);
      
      const authURL = `${AUTH_CONFIG.AUTH_URL}/signin?returnUrl=${encodeURIComponent(`${AUTH_CONFIG.DASHBOARD_URL}/account`)}&from=dashboard`;
      
      console.log('🔄 [DASHBOARD-MIDDLEWARE] Redirection vers:', authURL);
      return NextResponse.redirect(authURL);
    }
  }

  // Routes protégées qui nécessitent une authentification
  if (pathname.startsWith("/account")) {
    const sessionValidation = await validateUserSession(req);
    
    if (!sessionValidation.isValid) {
      console.log(`❌ [DASHBOARD-MIDDLEWARE] Session invalide pour route protégée (${sessionValidation.error})`);
      
      // 🔧 AMÉLIORATION: Vérifier si c'est un problème temporaire de cookie
      const cookieDebug = debugCookies(req);
      console.log('🍪 [DASHBOARD-MIDDLEWARE] Cookie debug:', cookieDebug);
      
      // Si on a des cookies mais qu'ils sont mal formatés, essayer de les nettoyer
      if (cookieDebug.hasAnyCookie && !sessionValidation.isValid) {
        console.log('⚠️ [DASHBOARD-MIDDLEWARE] Cookies détectés mais session invalide - possible corruption');
        
        // Créer une réponse qui nettoie les cookies corrompus
        const response = NextResponse.redirect(`${AUTH_CONFIG.AUTH_URL}/signin?returnUrl=${encodeURIComponent(`${AUTH_CONFIG.DASHBOARD_URL}${pathname}`)}&message=${encodeURIComponent('Session expirée, reconnexion nécessaire')}&from=dashboard`);
        
        // Nettoyer les cookies corrompus
        response.cookies.delete('smp_user_0');
        response.cookies.delete('smp_user_token');
        response.cookies.delete('smp_session_id');
        
        return response;
      }
      
      const authURL = `${AUTH_CONFIG.AUTH_URL}/signin?returnUrl=${encodeURIComponent(`${AUTH_CONFIG.DASHBOARD_URL}${pathname}`)}&message=${encodeURIComponent('Veuillez vous connecter pour accéder à cette page')}&from=dashboard`;
      
      console.log('🔄 [DASHBOARD-MIDDLEWARE] Redirection vers auth:', authURL);
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
    
    // 🔧 Headers de sécurité pour les routes protégées + Cache control
    const response = NextResponse.next();
    response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    response.headers.set("Pragma", "no-cache");
    response.headers.set("Expires", "0");
    response.headers.set("X-Frame-Options", "DENY");
    response.headers.set("X-Content-Type-Options", "nosniff");
    
    return response;
  }

  console.log(`✅ [DASHBOARD-MIDDLEWARE] Route autorisée: ${pathname}`);
  return NextResponse.next();
}

/**
 * 🔧 VALIDATION SESSION AMÉLIORÉE avec debugging
 */
async function validateUserSession(req: NextRequest): Promise<SessionValidation> {
  try {
    // 🔧 AMÉLIORATION: Chercher dans plusieurs sources de cookies
    const cookieSources = [
      { name: 'smp_user_0', cookie: req.cookies.get("smp_user_0") },
      { name: 'user_data', cookie: req.cookies.get("user_data") },
      { name: 'auth_user', cookie: req.cookies.get("auth_user") }
    ];

    console.log('🔍 [DASHBOARD-MIDDLEWARE] Recherche cookies utilisateur...');
    
    let userCookie = null;
    let cookieSource = 'none';
    
    for (const source of cookieSources) {
      if (source.cookie?.value) {
        userCookie = source.cookie;
        cookieSource = source.name;
        console.log(`✅ [DASHBOARD-MIDDLEWARE] Cookie trouvé via: ${source.name}`);
        break;
      }
    }

    if (!userCookie?.value) {
      console.log('❌ [DASHBOARD-MIDDLEWARE] Cookie utilisateur manquant');
      return { 
        isValid: false, 
        error: 'Cookie utilisateur manquant',
        cookieSource 
      };
    }

    // 🔧 AMÉLIORATION: Validation et parsing plus robuste
    let user;
    try {
      // Essayer de décoder directement
      user = JSON.parse(userCookie.value);
    } catch (directParseError) {
      try {
        // Essayer avec décodage URI
        user = JSON.parse(decodeURIComponent(userCookie.value));
      } catch (decodeParseError) {
        try {
          // Essayer avec double décodage (parfois nécessaire)
          user = JSON.parse(decodeURIComponent(decodeURIComponent(userCookie.value)));
        } catch (doubleDecodeError) {
          console.log('❌ [DASHBOARD-MIDDLEWARE] Erreur parsing cookie utilisateur:', {
            //directError: directParseError.message,
            //decodeError: decodeParseError.message,
            //doubleDecodeError: doubleDecodeError.message,
            cookieValue: userCookie.value.substring(0, 100) + '...'
          });
          return { 
            isValid: false, 
            error: 'Cookie utilisateur corrompu',
            cookieSource 
          };
        }
      }
    }
    
    // 🔧 VALIDATION: Vérifier la structure de l'utilisateur
    if (!user || typeof user !== 'object') {
      console.log('❌ [DASHBOARD-MIDDLEWARE] Structure utilisateur invalide:', typeof user);
      return { 
        isValid: false, 
        error: 'Structure utilisateur invalide',
        cookieSource 
      };
    }

    // 🔧 VALIDATION: Vérifier les champs requis
    const requiredFields = ['userID', 'email'];
    for (const field of requiredFields) {
      if (!user[field]) {
        console.log(`❌ [DASHBOARD-MIDDLEWARE] Champ requis manquant: ${field}`);
        return { 
          isValid: false, 
          error: `Champ utilisateur manquant: ${field}`,
          cookieSource 
        };
      }
    }

    // 🔧 VALIDATION: Vérifier que ce n'est pas un utilisateur temporaire
    if (user.userID.startsWith('temp-') || user.userID === 'anonymous') {
      console.log('❌ [DASHBOARD-MIDDLEWARE] Utilisateur temporaire ou anonyme:', user.userID);
      return { 
        isValid: false, 
        error: 'Utilisateur temporaire',
        cookieSource 
      };
    }

    // 🔧 VALIDATION: Vérifier la fraîcheur du cookie (optionnel)
    if (user.timestamp) {
      const cookieAge = Date.now() - new Date(user.timestamp).getTime();
      const maxAge = 24 * 60 * 60 * 1000; // 24 heures
      
      if (cookieAge > maxAge) {
        console.log('⏰ [DASHBOARD-MIDDLEWARE] Cookie utilisateur trop ancien');
        return { 
          isValid: false, 
          error: 'Cookie expiré',
          cookieSource 
        };
      }
    }

    console.log(`✅ [DASHBOARD-MIDDLEWARE] Session valide pour: ${user.userID} (via ${cookieSource})`);
    return { isValid: true, user, cookieSource };
    
  } catch (error: any) {
    console.error('❌ [DASHBOARD-MIDDLEWARE] Erreur validation session:', error);
    return { 
      isValid: false, 
      error: `Erreur validation: ${error.message}`,
      cookieSource: 'error'
    };
  }
}

/**
 * 🔧 DEBUGGING: Analyser l'état des cookies
 */
function debugCookies(req: NextRequest): {
  hasAnyCookie: boolean;
  cookieCount: number;
  smpCookies: string[];
  allCookies: string[];
} {
  const allCookies = Array.from(req.cookies.getAll().map(c => c.name));
  const smpCookies = allCookies.filter(name => name.startsWith('smp_') || name.includes('user') || name.includes('auth'));
  
  return {
    hasAnyCookie: allCookies.length > 0,
    cookieCount: allCookies.length,
    smpCookies,
    allCookies
  };
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

  } catch (error: any) {
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
    // 🔧 AMÉLIORATION: Exclure plus précisément les routes statiques
    '/((?!api|_next/static|_next/image|favicon.ico|images|css|js|styles|fonts|public).*)',
  ],
};