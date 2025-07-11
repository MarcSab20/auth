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
  if (userCookie?.value && ["/signin", "/signup", "/forgot-password"].includes(pathname)) {
    const accountURL = req.nextUrl.clone();
    accountURL.pathname = "/account";
    return NextResponse.redirect(accountURL);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/account/:path*",
    "/signin",
    "/signup", 
    "/forgot-password"
  ],
};

