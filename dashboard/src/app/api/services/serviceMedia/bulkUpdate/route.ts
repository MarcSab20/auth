import { NextRequest, NextResponse } from 'next/server';
import { smpClient, initializeSMPClient } from '@/smpClient';

export async function PUT(request: NextRequest) {
  try {
    await initializeSMPClient();

    const body = await request.json();
    const { updates } = body; // Array of { serviceMediaID, legend?, listingPosition?, state? }

    if (!Array.isArray(updates) || updates.length === 0) {
      return NextResponse.json(
        { error: 'Updates array is required' },
        { status: 400 }
      );
    }

    // Mettre à jour tous les serviceMedias en parallèle
    const updatePromises = updates.map(async (update) => {
      const { serviceMediaID, ...updateData } = update;
      
      if (!serviceMediaID) {
        throw new Error('Service Media ID is required for each update');
      }

      return await smpClient.service.updateServiceMedia(serviceMediaID, updateData);
    });

    const updatedServiceMedias = await Promise.all(updatePromises);

    return NextResponse.json({
      success: true,
      message: `${updatedServiceMedias.length} service medias updated successfully`,
      data: updatedServiceMedias
    });

  } catch (error) {
    console.error('Error bulk updating service medias:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500 }
    );
  }
} 