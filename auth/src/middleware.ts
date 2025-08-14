// auth/src/middleware.ts - AVEC ROUTES OAUTH
import { NextRequest, NextResponse } from "next/server";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const userCookie = req.cookies.get("smp_user_0");
  
  console.log(`🔍 [MIDDLEWARE] Processing ${pathname}`);
  
  // Routes publiques - AUTORISER COMPLETEMENT
  const publicRoutes = [
    "/signin",
    "/signup", 
    "/forgot-password",
    "/reset-password",
    "/magic-link",
    "/magic-link-request",
    "/oauth",           // AJOUT: Routes OAuth
    "/transition",
    "/api",
    "/_next",
    "/favicon.ico",
    "/images",
    "/css",
    "/js",
    "/styles"
  ];

  // Vérifier si la route est publique
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));
  
  if (isPublicRoute) {
    console.log(`✅ [MIDDLEWARE] Route publique autorisée: ${pathname}`);
    return NextResponse.next();
  }

  // Routes OAuth spécifiques - AUTORISER EXPLICITEMENT
  if (pathname.startsWith('/oauth/')) {
    console.log(`✅ [MIDDLEWARE] Route OAuth autorisée: ${pathname}`);
    return NextResponse.next();
  }

  // Route racine "/" - redirection conditionnelle SANS BOUCLE
  if (pathname === "/") {
    if (userCookie?.value) {
      try {
        const user = JSON.parse(decodeURIComponent(userCookie.value));
        if (user?.userID && !user.userID.startsWith('temp-')) {
          console.log(`🔄 [MIDDLEWARE] Utilisateur connecté, laissant la page gérer la redirection vers Dashboard`);
          // NE PAS REDIRIGER ICI - laisser la page gérer la redirection vers le dashboard
          return NextResponse.next();
        }
      } catch (error) {
        console.log('⚠️ [MIDDLEWARE] Erreur parsing cookie:', error);
      }
    }
    
    // Pas d'utilisateur connecté, redirection vers signin
    console.log(`🔄 [MIDDLEWARE] Pas d'utilisateur, redirection vers /signin`);
    const signinURL = req.nextUrl.clone();
    signinURL.pathname = "/signin";
    return NextResponse.redirect(signinURL);
  }

  // Routes protégées (/account et ses sous-routes) - CES ROUTES NE DEVRAIENT PAS EXISTER DANS L'APP AUTH
  if (pathname.startsWith("/account")) {
    console.log('⚠️ [MIDDLEWARE] Route /account accédée dans l\'app AUTH - ceci ne devrait pas arriver');
    
    // Si quelqu'un essaie d'accéder à /account dans l'app auth, le rediriger vers signin
    const signinURL = req.nextUrl.clone();
    signinURL.pathname = "/signin";
    signinURL.searchParams.set("message", "Veuillez vous connecter pour accéder au dashboard");
    return NextResponse.redirect(signinURL);
  }

  // Pour toutes les autres routes, laisser passer
  console.log(`✅ [MIDDLEWARE] Route autorisée: ${pathname}`);
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};