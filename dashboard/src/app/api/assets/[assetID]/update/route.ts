import { NextResponse } from 'next/server';
import { smpClient } from '@/smpClient';

export async function POST(
  request: Request,
  { params }: { params: { assetID: string } }
) {
  try {
    const { assetID } = params;
    const updates = await request.json();

    // Vérification que l'assetID est valide
    if (!assetID || assetID === '[assetID]') {
      return NextResponse.json({ error: 'Invalid asset ID' }, { status: 400 });
    }

    const updated = await smpClient.asset.updateAsset(assetID, {
      title: updates.title,
      description: updates.description,
      price: updates.price,
      state: updates.state,
      mediaID: updates.mediaID,
    });

    if (!updated) {
      return NextResponse.json({ error: 'Failed to update asset' }, { status: 500 });
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Erreur dans asset/update:", error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 