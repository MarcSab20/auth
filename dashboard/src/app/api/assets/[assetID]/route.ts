import { NextResponse } from "next/server";
import { smpClient, initializeSMPClient } from "@/smpClient";

export async function GET(
  request: Request,
  { params }: { params: { assetID: string } }
) {
  try {
    await initializeSMPClient();
    const asset = await smpClient.asset.get(params.assetID);
    return NextResponse.json(asset);
  } catch (error) {
    console.error("Erreur lors de la récupération de l'asset:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération de l'asset" },
      { status: 500 }
    );
  }
}
