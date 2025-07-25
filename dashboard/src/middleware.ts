// middleware.ts
import { NextRequest, NextResponse } from "next/server";
import { smpClient, initializeSMPClient } from "@/smpClient";

interface UserOrganization {
  userRole: {
    roleName: string;
    roleID: string;
  };
  organizationName: string;
  organizationID: string;
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const userCookie = req.cookies.get("smp_user_0");

  // Vérification du cookie utilisateur pour /account
  if (pathname.startsWith("/account") && !userCookie?.value) {
    const loginURL = req.nextUrl.clone();
    loginURL.pathname = "/signin";
    return NextResponse.redirect(loginURL);
  }

  // Vérification de l'organisation
  if (pathname.startsWith("/account/o/")) {
    try {
      if (!userCookie?.value) {
        throw new Error("Missing user cookie");
      }

      const user = JSON.parse(decodeURIComponent(userCookie.value));
      const userID = user?.userID;
      const orgIDMatch = pathname.match(/^\/account\/o\/([^/]+)/);
      const organizationID = orgIDMatch?.[1];

      if (!userID || !organizationID) {
        throw new Error("Missing userID or organizationID");
      }

      // Initialisation du client SMP
      await initializeSMPClient();

      // Récupération directe des organisations de l'utilisateur sans cache
      const organizations = await smpClient.manageOrganization.getUserOrganizations(userID);

      // Vérification de l'accès
      const isAuthorized = organizations.some(
        (org) => org.organizationID === organizationID
      );

      if (!isAuthorized) {
        console.warn(`Unauthorized access attempt: User ${userID} trying to access organization ${organizationID}`);
        const unauthorizedURL = req.nextUrl.clone();
        unauthorizedURL.pathname = "/unauthorized";
        return NextResponse.redirect(unauthorizedURL);
      }

      // Ajout des headers pour le cache et la sécurité
      const responseHeaders = NextResponse.next();
      responseHeaders.headers.set("Cache-Control", "no-store, must-revalidate");
      responseHeaders.headers.set("X-Frame-Options", "DENY");
      return responseHeaders;

    } catch (error) {
      console.error("Error in middleware:", error);
      const errorURL = req.nextUrl.clone();
      errorURL.pathname = "/error";
      return NextResponse.redirect(errorURL);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/account/:path*",
    "/api/organizations/:path*"
  ],
};
