import { NextRequest, NextResponse } from "next/server";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const userCookie = req.cookies.get("smp_user_0");
  
  // Chemins protégés nécessitant une authentification
  if (pathname.startsWith("/account")) {
    if (!userCookie?.value) {
      const loginURL = req.nextUrl.clone();
      loginURL.pathname = "/signin";
      loginURL.searchParams.set("message", "Veuillez vous connecter pour accéder à cette page");
      return NextResponse.redirect(loginURL);
    }

    try {
      const user = JSON.parse(decodeURIComponent(userCookie.value));
      if (!user?.userID) {
        throw new Error("Invalid user data");
      }
    } catch (error) {
      console.error("Invalid user cookie:", error);
      const loginURL = req.nextUrl.clone();
      loginURL.pathname = "/signin";
      loginURL.searchParams.set("message", "Session invalide, veuillez vous reconnecter");
      return NextResponse.redirect(loginURL);
    }
  }

  // Redirection des utilisateurs connectés depuis les pages d'auth
  if (userCookie?.value && ["/signin", "/signup", "/forgot-password", "/magic-link-request"].includes(pathname)) {
    const accountURL = req.nextUrl.clone();
    accountURL.pathname = "/account";
    return NextResponse.redirect(accountURL);
  }

  // Gestion spéciale pour la page Magic Link
  if (pathname === "/magic-link") {
    const token = req.nextUrl.searchParams.get("token");
    
    // Si pas de token, rediriger vers la demande de Magic Link
    if (!token) {
      const magicLinkRequestURL = req.nextUrl.clone();
      magicLinkRequestURL.pathname = "/magic-link-request";
      magicLinkRequestURL.searchParams.set("error", "Token manquant dans l'URL");
      return NextResponse.redirect(magicLinkRequestURL);
    }

    // Validation basique du format du token
    if (!/^[a-f0-9]{32,64}$/.test(token)) {
      const magicLinkRequestURL = req.nextUrl.clone();
      magicLinkRequestURL.pathname = "/magic-link-request";
      magicLinkRequestURL.searchParams.set("error", "Format de token invalide");
      return NextResponse.redirect(magicLinkRequestURL);
    }

    // Si l'utilisateur est déjà connecté avec un token valide, rediriger vers le dashboard
    if (userCookie?.value) {
      try {
        const user = JSON.parse(decodeURIComponent(userCookie.value));
        if (user?.userID) {
          const accountURL = req.nextUrl.clone();
          accountURL.pathname = "/account";
          accountURL.searchParams.set("message", "Vous êtes déjà connecté");
          return NextResponse.redirect(accountURL);
        }
      } catch {
        // Cookie invalide, continuer avec la vérification du Magic Link
      }
    }
  }

  // Headers de sécurité pour les routes Magic Link
  if (pathname.startsWith("/api/auth/magic-link") || pathname === "/magic-link") {
    const response = NextResponse.next();
    
    // Headers de sécurité supplémentaires
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/account/:path*",
    "/signin",
    "/signup", 
    "/forgot-password",
    "/magic-link",
    "/magic-link-request",
    "/api/auth/magic-link/:path*"
  ],
};
