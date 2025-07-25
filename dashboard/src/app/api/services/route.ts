// app/api/services/route.ts
import { NextResponse } from "next/server";
import { smpClient, initializeSMPClient } from "@/smpClient";

export async function GET() {
  try {
    await initializeSMPClient();
    const services = await smpClient.service.list();
    return NextResponse.json(services);
  } catch (error) {
    console.error("Erreur API services:", error);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}
