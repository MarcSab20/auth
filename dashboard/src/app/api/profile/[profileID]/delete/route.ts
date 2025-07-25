// /app/api/profile/[profileId]/route.ts
import { NextResponse } from 'next/server';
import { smpClient, initializeSMPClient } from '@/smpClient';

export async function DELETE(
  request: Request,
  { params }: { params: { profileID: string } }
) {
  await initializeSMPClient();
  try {
    await smpClient.profile.deleteProfile(params.profileID);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erreur suppression profile :', error);
    return NextResponse.error();
  }
}
