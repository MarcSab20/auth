import { NextRequest, NextResponse } from 'next/server';
import { smpClient, initializeSMPClient } from '@/smpClient';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { serviceMediaID: string } }
) {
  try {
    await initializeSMPClient();

    const { serviceMediaID } = params;
    console.log('API DELETE - serviceMediaID:', serviceMediaID);

    if (!serviceMediaID) {
      return NextResponse.json(
        { error: 'Service Media ID is required' },
        { status: 400 }
      );
    }

    // Supprimer le serviceMedia
    const result = await smpClient.service.deleteServiceMedia(serviceMediaID);
    console.log('API DELETE - result:', result);

    return NextResponse.json({
      success: true,
      message: 'Service media deleted successfully',
      data: result
    });

  } catch (error) {
    console.error('API DELETE - Error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500 }
    );
  }
} 