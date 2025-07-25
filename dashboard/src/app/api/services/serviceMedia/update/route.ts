import { NextRequest, NextResponse } from 'next/server';
import { smpClient, initializeSMPClient } from '@/smpClient';

export async function PUT(request: NextRequest) {
  try {
    await initializeSMPClient();

    const body = await request.json();
    const { serviceMediaID, legend, listingPosition, state } = body;

    if (!serviceMediaID) {
      return NextResponse.json(
        { error: 'Service Media ID is required' },
        { status: 400 }
      );
    }

    // Préparer les données d'update
    const updateData: any = {};
    
    if (legend !== undefined) updateData.legend = legend;
    if (listingPosition !== undefined) updateData.listingPosition = listingPosition;
    if (state !== undefined) updateData.state = state;

    // Mettre à jour le serviceMedia
    const updatedServiceMedia = await smpClient.service.updateServiceMedia(
      serviceMediaID, 
      updateData
    );

    return NextResponse.json({
      success: true,
      message: 'Service media updated successfully',
      data: updatedServiceMedia
    });

  } catch (error) {
    console.error('Error updating service media:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500 }
    );
  }
}