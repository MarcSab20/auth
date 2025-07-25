import { NextResponse } from "next/server";
import { smpClient, initializeSMPClient } from "@/smpClient";

export async function GET(request: Request, { params }: { params: { serviceID: string } }) {
  try {
    await initializeSMPClient();
    // Récupère le service par son ID
    const service = await smpClient.service.getById(params.serviceID);
    return NextResponse.json(service);
  } catch (error) {
    console.error("Erreur lors de la récupération du service:", error);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}
