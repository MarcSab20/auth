// app/api/logout/route.tsx
import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({ message: "Déconnexion réussie." });

  // Suppression des cookies en définissant une date d'expiration passée
  response.cookies.set("smp_user_0", "", { expires: new Date(0), path: "/" });
  response.cookies.set("orgFormData", "", { expires: new Date(0), path: "/" });
  response.cookies.set("serviceFormData", "", { expires: new Date(0), path: "/" });

  return response;
}
