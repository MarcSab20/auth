import { NextRequest, NextResponse } from "next/server";
import { smpClient } from "@/smpClient";

// GET /api/service-assets?serviceID=xxx
export async function GET(request: NextRequest) {
  try {
    const serviceID = request.nextUrl.searchParams.get("serviceID");
    if (!serviceID) {
      return NextResponse.json(
        { error: "serviceID est requis" },
        { status: 400 }
      );
    }

    const serviceAssets = await smpClient.serviceAsset.list({ filter: { serviceID } });
    return NextResponse.json(serviceAssets);
  } catch (error) {
    console.error("Erreur lors de la récupération des assets associés:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des assets associés" },
      { status: 500 }
    );
  }
}

// POST /api/service-assets
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { serviceID, assetID } = body;

    if (!serviceID || !assetID) {
      return NextResponse.json(
        { error: "serviceID and assetID are required" },
        { status: 400 }
      );
    }

    const input = {
      assetID,
      serviceID,
      legend: '',
      state: 'online'
    };

    const newServiceAsset = await smpClient.serviceAsset.createServiceAsset(input);
    return NextResponse.json(newServiceAsset);
  } catch (error) {
    console.error("Error creating service asset:", error);
    return NextResponse.json(
      { error: "Failed to create service asset" },
      { status: 500 }
    );
  }
}

// DELETE /api/service-assets?serviceAssetID=xxx
export async function DELETE(request: NextRequest) {
  try {
    const serviceAssetID = request.nextUrl.searchParams.get("serviceAssetID");
    
    if (!serviceAssetID) {
      return NextResponse.json(
        { error: "serviceAssetID is required" },
        { status: 400 }
      );
    }

    await smpClient.serviceAsset.deleteServiceAsset(serviceAssetID);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting service asset:", error);
    return NextResponse.json(
      { error: "Failed to delete service asset" },
      { status: 500 }
    );
  }
} 