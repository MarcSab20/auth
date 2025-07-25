import { NextRequest, NextResponse } from 'next/server';
import { smpClient, initializeSMPClient } from '@/smpClient';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { serviceMediaID: string } }
) {
  try {
    await initializeSMPClient();

    const { serviceMediaID } = params;

    if (!serviceMediaID) {
      return NextResponse.json(
        { error: 'Service Media ID is required' },
        { status: 400 }
      );
    }

    // Supprimer le serviceMedia
    const result = await smpClient.service.deleteServiceMedia(serviceMediaID);

    return NextResponse.json({
      success: true,
      message: 'Service media deleted successfully',
      data: result
    });

  } catch (error) {
    console.error('Error deleting service media:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500 }
    );
  }
} 