import { NextRequest, NextResponse } from "next/server";
import { smpClient } from "@/smpClient";

export async function GET(
  request: NextRequest,
  { params }: { params: { organizationID: string } }
) {
  try {
    const { organizationID } = params;

    if (!organizationID) {
      return NextResponse.json(
        { error: "L'ID de l'organisation est requis" },
        { status: 400 }
      );
    }

    const assets = await smpClient.asset.listByOrganization({ organizationID });
    return NextResponse.json(assets);
  } catch (error) {
    console.error("Erreur lors de la récupération des assets:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des assets" },
      { status: 500 }
    );
  }
} 