// /app/api/profile/[profileId]/route.ts
import { NextResponse } from 'next/server';
import { smpClient, initializeSMPClient } from '@/smpClient';

export async function GET(
  request: Request,
  { params }: { params: { profileID: string } }
) {
  // Initialise le client et sécurise l'appel côté serveur
  await initializeSMPClient();
  try {
    const profile = await smpClient.profile.getProfile(params.profileID);
    return NextResponse.json(profile);
  } catch (error) {
    console.error("Erreur lors de la récupération du profil :", error);
    return NextResponse.error();
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { profileID: string } }
) {
  // Initialise le client pour sécuriser l'appel côté serveur
  await initializeSMPClient();
  try {
    const updatedFields = await request.json();
    const updatedProfile = await smpClient.profile.updateProfile(params.profileID, updatedFields);
    return NextResponse.json(updatedProfile);
  } catch (error) {
    console.error("Erreur lors de la mise à jour du profil :", error);
    return NextResponse.error();
  }
}
