import { NextRequest, NextResponse } from "next/server";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const userCookie = req.cookies.get("smp_user_0");
  
  console.log('🔍 [MIDDLEWARE] Request:', {
    pathname,
    method: req.method,
    hasCookie: !!userCookie?.value,
    userAgent: req.headers.get('user-agent')?.slice(0, 50),
    timestamp: new Date().toISOString()
  });
  
  // Chemins protégés nécessitant une authentification
  if (pathname.startsWith("/account")) {
    console.log('🔒 [MIDDLEWARE] Protected route accessed');
    
    if (!userCookie?.value) {
      console.log('❌ [MIDDLEWARE] No cookie found, redirecting to login');
      const loginURL = req.nextUrl.clone();
      loginURL.pathname = "/signin";
      loginURL.searchParams.set("message", "Veuillez vous connecter pour accéder à cette page");
      return NextResponse.redirect(loginURL);
    }

    try {
      const user = JSON.parse(decodeURIComponent(userCookie.value));
     console.log('✅ [MIDDLEWARE] User found:', { 
        userID: user?.userID, 
        email: user?.email,
        username: user?.username 
      });
      
      if (!user?.userID) {
        throw new Error("Invalid user data - missing userID");
      }
      
      // Vérifier si c'est un cookie temporaire
      if (user.userID.startsWith('temp-')) {
        console.log('⚠️ [MIDDLEWARE] Temporary user detected, redirecting to login');
        throw new Error("Temporary user session detected");
      }
      
      console.log('✅ [MIDDLEWARE] Access granted to', pathname);
      
    } catch (error) {
      console.error("❌ [MIDDLEWARE] Invalid user cookie:", error);
      console.log("🍪 [MIDDLEWARE] Cookie content:", userCookie.value);
      
      const loginURL = req.nextUrl.clone();
      loginURL.pathname = "/signin";
      loginURL.searchParams.set("message", "Session invalide, veuillez vous reconnecter");
      return NextResponse.redirect(loginURL);
    }
  }

  // Redirection des utilisateurs connectés depuis les pages d'auth
  if (userCookie?.value && ["/signin", "/signup", "/forgot-password", "/magic-link-request"].includes(pathname)) {
    try {
      const user = JSON.parse(decodeURIComponent(userCookie.value));
      if (user?.userID) {
        console.log('✅ [MIDDLEWARE] Authenticated user accessing auth page, redirecting to account');
        const accountURL = req.nextUrl.clone();
        accountURL.pathname = "/account";
        return NextResponse.redirect(accountURL);
      }
    } catch (error) {
      console.log('❌ [MIDDLEWARE] Invalid cookie, allowing access to auth page');
    }
  }

  console.log('✅ [MIDDLEWARE] Request allowed to proceed');
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