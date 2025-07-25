import { NextResponse } from 'next/server';
import { smpClient } from '@/smpClient';

export async function POST(request: Request) {
  try {
    const {
      serviceID,
      title,
      description,
      price,
      quantity,
      stockQuantity,
      maxPerReservation,
      authorID,
      organizationID,
      mediaID,
      legalVatPercent,
      conflictingAssets,
      applyableAssets,
    } = await request.json();

  

    const newAsset = await smpClient.asset.createAsset({
      title,
      description,
      price,
      quantity,
      stockQuantity,
      maxPerReservation,
      state: "online",
    //   authorID,
      organizationID,
      mediaID,
      legalVatPercent,
      conflictingAssets,
      applyableAssets,
    });

    if (!newAsset || !newAsset.assetID) {
      return NextResponse.error();
    }

    return NextResponse.json({ assetID: newAsset.assetID, message: "Asset créé avec succès" });
  } catch (error) {
    console.error("Erreur dans /api/assets/new:", error);
    return NextResponse.error();
  }
} 