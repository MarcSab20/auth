import { NextRequest, NextResponse } from 'next/server';
import { smpClient } from '@/smpClient';

type MediaType = 'service' | 'organization' | 'user' | 'asset';

export async function PUT(
  request: NextRequest,
  { params }: { params: { media: MediaType; mediaID: string } }
) {
  try {
    const { legend, listingPosition, state } = await request.json();

    // Mettre à jour le media
    const updatedMedia = await smpClient.media.updateMedia(params.mediaID, {
      legend,
      state,
    });

    // Mettre à jour les tables de jointure selon l'entité
    switch (params.media) {
      case 'service':
        await smpClient.service.updateServiceMedia(params.mediaID, {
          legend,
          listingPosition,
          state,
        });
        break;

      case 'organization':
        await smpClient.organization.updateOrganizationMedia(params.mediaID, {
          legend,
          listingPosition,
          state,
        });
        break;

      case 'user':
      case 'asset':
        // Pas de table de jointure pour user et asset
        break;
    }

    return NextResponse.json({ success: true, media: updatedMedia });
  } catch (error) {
    console.error('Error updating media:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { media: MediaType; mediaID: string } }
) {
  try {
    // Supprimer des tables de jointure en premier
    switch (params.media) {
      case 'service':
        await smpClient.service.deleteServiceMedia(params.mediaID);
        break;

      case 'organization':
        await smpClient.organization.deleteOrganizationMedia(params.mediaID);
        break;

      case 'user':
        // Pas de table de jointure pour user
        break;

      case 'asset':
        await smpClient.asset.deleteAssetMedia(params.mediaID);
        break;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE handler:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        details: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}
