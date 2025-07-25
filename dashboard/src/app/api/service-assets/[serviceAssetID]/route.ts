import { NextRequest, NextResponse } from "next/server";
import { smpClient } from "@/smpClient";

export async function DELETE(
  request: NextRequest,
  { params }: { params: { serviceAssetID: string } }
) {
  try {
    const { serviceAssetID } = params;

    if (!serviceAssetID) {
      return NextResponse.json(
        { error: "L'ID du service-asset est requis" },
        { status: 400 }
      );
    }

    await smpClient.serviceAsset.deleteServiceAsset(serviceAssetID);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erreur lors de la suppression du service-asset:", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression du service-asset" },
      { status: 500 }
    );
  }
} 