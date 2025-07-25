import { NextRequest, NextResponse } from 'next/server';
import { smpClient, initializeSMPClient } from '@/smpClient';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { assetMediaID: string } }
) {
  try {
    await initializeSMPClient();

    const { assetMediaID } = params;
    if (!assetMediaID) {
      return NextResponse.json(
        { error: 'Asset Media ID is required' },
        { status: 400 }
      );
    }

    const result = await smpClient.asset.deleteAssetMedia(assetMediaID);

    return NextResponse.json({
      success: true,
      message: 'Asset media deleted successfully',
      data: result
    });

  } catch (error) {
    console.error('Error deleting asset media:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500 }
    );
  }
} 