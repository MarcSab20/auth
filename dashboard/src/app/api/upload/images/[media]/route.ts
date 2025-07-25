import { NextRequest, NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { smpClient, initializeSMPClient } from '@/smpClient';
import { v4 as uuidv4 } from 'uuid';

// Configuration du client S3
const s3Client = new S3Client({
  region: process.env.S3_REGION!,
  endpoint: process.env.S3_ENDPOINT,
  credentials: { 
    accessKeyId: process.env.S3_ACCESS_KEY!,
    secretAccessKey: process.env.S3_SECRET_KEY!,
  },
  forcePathStyle: true,
});

// Types de médias supportés
type MediaType = 'service' | 'organization' | 'profile' | 'asset' | 'smallLogo';

// Configuration des chemins S3 par entité
const getS3Path = (mediaType: MediaType, fileName: string): string => {
  const paths = {
    service: `images/service/${fileName}`,
    organization: `images/organization/${fileName}`,
    smallLogo: `images/organization/smallLogo/${fileName}`,
    profile: `images/user/profilePicture/${fileName}`,
    asset: `images/asset/${fileName}`,
  };
  return paths[mediaType];
};

export async function POST(
  request: NextRequest,
  { params }: { params: { media: MediaType } }
) {
  try {
    // Initialiser le client et attendre qu'il soit prêt
    await initializeSMPClient();
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const entityID = formData.get('entityID') as string;
    const listingPosition = formData.get('listingPosition') as string;
    const legend = formData.get('legend') as string;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Générer un nom de fichier unique
    const fileExtension = file.name.split('.').pop();
    const uniqueFileName = `${uuidv4()}.${fileExtension}`;
    const s3Path = getS3Path(params.media, uniqueFileName);

    // Convertir le fichier en buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // Upload direct vers S3 avec les métadonnées appropriées
    const putCommand = new PutObjectCommand({
      Bucket: process.env.S3_BUCKET!,
      Key: s3Path,
      Body: buffer,
      ContentType: file.type,
      ACL: 'public-read',
      Metadata: {
        'x-amz-meta-entity-type': params.media,
        'x-amz-meta-entity-id': entityID,
      },
    });

    await s3Client.send(putCommand);

    // Construire l'URL publique pour Scaleway
    const publicUrl = `https://${process.env.S3_BUCKET}.s3.${process.env.S3_REGION}.scw.cloud/${s3Path}`;

    // Créer l'entrée media dans la base de données
    console.log('Creating media entry...');
    const media = await smpClient.media.createMedia({
      mediaType: 'image',
      originalName: file.name,
      finalName: uniqueFileName,
      url: publicUrl,
      entityID,
      authorID: "7",
      entityName: params.media === 'smallLogo' ? 'organization' : params.media,
      state: 'online',
      size: file.size.toString(),
    });
    console.log('Media created:', media);

    // Créer les entrées dans les tables de jointure selon l'entité
    let joinTableResponse: any = null;

    switch (params.media) {
      case 'service':
        console.log('Creating service media...');
        joinTableResponse = await smpClient.service.createServiceMedia({
          mediaID: media.mediaID,
          serviceID: entityID,
          legend: " ",
          listingPosition: parseInt(listingPosition) || 1,
          state: 'online',
        });
        console.log('Service media created:', joinTableResponse);
        break;

      case 'organization':
      case 'smallLogo':
        console.log('Creating organization media...');
        joinTableResponse = await smpClient.organization.createOrganizationMedia({
          mediaID: media.mediaID,
          organizationID: entityID,
          legend: " ",
          listingPosition: parseInt(listingPosition) || 1,
          state: 'online',
        });
        console.log('Organization media created:', joinTableResponse);

        // Mettre à jour le champ correspondant dans l'organisation
        if (params.media === 'smallLogo') {
          await smpClient.organization.updateOrganization(entityID, {
            smallLogo: joinTableResponse.organizationMediaID
          });
          console.log('Updated organization smallLogo with organizationMediaID:', joinTableResponse.organizationMediaID);
        }
        break;

      case 'profile':
        // Mettre à jour le profil avec le nouveau mediaID comme photo de profil
        joinTableResponse = await smpClient.profile.updateProfile(entityID, {
          profilePictureID: String(media.mediaID)
        });
        console.log('Profile updated with new profilePictureID:', joinTableResponse);
        break;

      case 'asset':
        const assetMediaInput = {
          mediaID: media.mediaID,
          assetID: entityID,
          legend: legend || file.name,
          listingPosition: parseInt(listingPosition) || 1,
          state: "online"
        };
        
        console.log('Asset media input:', assetMediaInput);
        joinTableResponse = await smpClient.asset.createAssetMedia(assetMediaInput);
        console.log('Asset media created:', joinTableResponse);
        break;
    }

    return NextResponse.json({
      media,
      joinTable: joinTableResponse,
      s3Url: publicUrl,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
