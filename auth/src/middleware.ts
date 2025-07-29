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

  // Route racine "/" - redirection conditionnelle
  if (pathname === "/") {
    if (userCookie?.value) {
      try {
        const user = JSON.parse(decodeURIComponent(userCookie.value));
        if (user?.userID && !user.userID.startsWith('temp-')) {
          console.log(`🔄 [MIDDLEWARE] Utilisateur connecté, redirection vers /account`);
          const accountURL = req.nextUrl.clone();
          accountURL.pathname = "/account";
          return NextResponse.redirect(accountURL);
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

  // Routes protégées (/account et ses sous-routes)
  if (pathname.startsWith("/account")) {
    console.log('🔒 [MIDDLEWARE] Route protégée accédée');
    
    if (!userCookie?.value) {
      console.log('❌ [MIDDLEWARE] Pas de cookie utilisateur, redirection vers signin');
      const loginURL = req.nextUrl.clone();
      loginURL.pathname = "/signin";
      loginURL.searchParams.set("message", "Veuillez vous connecter pour accéder à cette page");
      return NextResponse.redirect(loginURL);
    }

    try {
      const user = JSON.parse(decodeURIComponent(userCookie.value));
      
      if (!user?.userID) {
        throw new Error("Invalid user data - missing userID");
      }
      
      if (user.userID.startsWith('temp-')) {
        throw new Error("Temporary user session detected");
      }
      
      console.log(`✅ [MIDDLEWARE] Utilisateur authentifié: ${user.userID}`);
      
    } catch (error) {
      console.log('❌ [MIDDLEWARE] Session invalide:', error);
      const loginURL = req.nextUrl.clone();
      loginURL.pathname = "/signin";
      loginURL.searchParams.set("message", "Session invalide, veuillez vous reconnecter");
      return NextResponse.redirect(loginURL);
    }
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