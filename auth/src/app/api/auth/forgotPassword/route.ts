import { NextRequest, NextResponse } from "next/server";
import { smpClient, initializeSMPClient } from "@/smpClient";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required." }, { status: 400 });
    }

    await initializeSMPClient();
    await smpClient.Password.forgotPassword(email);

    // Toujours un message générique pour la sécurité
    return NextResponse.json({
      message: "If this email address is recognized, a password reset email will be sent shortly."
    });
  } catch (error) {
    console.error("Erreur API /forgotPassword:", error);
    return NextResponse.json({
      message: "If this email address is recognized, a password reset email will be sent shortly."
    });
  }
}
