import { NextResponse } from 'next/server';
import { smpClient } from '@/smpClient';

export async function GET(
  request: Request,
  { params }: { params: { assetID: string } }
) {
  try {
    const { assetID } = params;
    const services = await smpClient.asset.listServicesByAsset({ assetID });
    
    const formattedServices = services?.map(item => ({
      serviceID: item.service.serviceID,
      title: item.service.title || 'Sans titre',
      description: item.service.description || 'Aucune description disponible',
      state: item.service.state || 'offline',
      mediaBannerID: item.service.mediaBannerID || null,
      createdAt: item.service.createdAt || new Date().toISOString(),
      serviceAssetID: item.serviceAsset.serviceAssetID
    })) || [];

    return NextResponse.json(formattedServices);
  } catch (error) {
    console.error('Error listing services by asset:', error);
    return NextResponse.json(
      { error: 'Failed to list services by asset' },
      { status: 500 }
    );
  }
} 