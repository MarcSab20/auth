import { NextRequest, NextResponse } from 'next/server';
import { smpClient, initializeSMPClient } from '@/smpClient';

export async function PUT(request: NextRequest) {
  try {
    await initializeSMPClient();

    const body = await request.json();
    const { updates } = body; // Array of { assetMediaID, legend?, listingPosition?, state? }

    if (!Array.isArray(updates) || updates.length === 0) {
      return NextResponse.json(
        { error: 'Updates array is required' },
        { status: 400 }
      );
    }

    // Mettre à jour tous les assetMedias en parallèle
    const updatePromises = updates.map(async (update) => {
      const { assetMediaID, ...updateData } = update;
      
      if (!assetMediaID) {
        throw new Error('Asset Media ID is required for each update');
      }

      return await smpClient.asset.updateAssetMedia(assetMediaID, updateData);
    });

    const updatedAssetMedias = await Promise.all(updatePromises);

    return NextResponse.json({
      success: true,
      message: `${updatedAssetMedias.length} asset medias updated successfully`,
      data: updatedAssetMedias
    });

  } catch (error) {
    console.error('Error bulk updating asset medias:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500 }
    );
  }
} 