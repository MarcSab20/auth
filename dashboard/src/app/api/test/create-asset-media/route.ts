import { NextRequest, NextResponse } from 'next/server';
import { smpClient, initializeSMPClient } from '@/smpClient';

export async function POST(request: NextRequest) {
  try {
    // Initialiser le client
    await initializeSMPClient();

    // Données mockées
    const mockData = {
      mediaID: "38",
      assetID: "1",
      legend: "Test Legend",
      listingPosition: 1,
      state: "online"
    };

    console.log('Attempting to create asset media with data:', mockData);

    // Créer l'asset media
    const result = await smpClient.asset.createAssetMedia(mockData);
    
    console.log('Asset media creation result:', result);

    return NextResponse.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error creating asset media:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
} 