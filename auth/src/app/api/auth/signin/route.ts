// app/api/signin/route.ts
import { NextRequest, NextResponse } from "next/server";
import { smpClient, initializeSMPClient } from "@/smpClient";

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();

    if (!username || !password) {
      return NextResponse.json({ error: "Champs manquants." }, { status: 400 });
    }

    await initializeSMPClient();
    const authResponse = await smpClient.authenticateUser(username, password);

    if (!authResponse || !authResponse.user) {
      return NextResponse.json({ error: "Identifiants incorrects." }, { status: 401 });
    }

    return NextResponse.json({ user: authResponse.user });
  } catch (error) {
    console.error("Erreur API /signin:", error);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}
