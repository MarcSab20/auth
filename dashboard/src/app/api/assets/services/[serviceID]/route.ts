import { NextRequest, NextResponse } from 'next/server';
import { smpClient } from '@/smpClient';

export async function GET(
  request: NextRequest,
  { params }: { params: { serviceID: string } }
) {
  try {
    const { serviceID } = params;

    if (!serviceID) {
      return NextResponse.json(
        { error: "L'ID du service est requis" },
        { status: 400 }
      );
    }

    const assets = await smpClient.asset.listByService({
      serviceID,
    });
    return NextResponse.json(assets);
  } catch (error) {
    console.error('Erreur lors de la récupération des assets du service:', error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des assets du service" },
      { status: 500 }
    );
  }
}
