import { NextRequest, NextResponse } from "next/server";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const userCookie = req.cookies.get("smp_user_0");
  
  if (pathname.startsWith("/account")) {
    console.log('🔒 [MIDDLEWARE] Protected route accessed');
    
    if (!userCookie?.value) {
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
      
    } catch (error) {
      
      const loginURL = req.nextUrl.clone();
      loginURL.pathname = "/signin";
      loginURL.searchParams.set("message", "Session invalide, veuillez vous reconnecter");
      return NextResponse.redirect(loginURL);
    }
  }

  if (userCookie?.value && ["/signin", "/signup", "/forgot-password", "/magic-link-request"].includes(pathname)) {
    try {
      const user = JSON.parse(decodeURIComponent(userCookie.value));
      if (user?.userID) {
        const accountURL = req.nextUrl.clone();
        accountURL.pathname = "/account";
        return NextResponse.redirect(accountURL);
      }
    } catch (error) {
    }
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