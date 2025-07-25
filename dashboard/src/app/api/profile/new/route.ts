// /app/api/profile/new/route.ts
import { NextResponse } from 'next/server';
import { smpClient, initializeSMPClient } from '@/smpClient';

export async function POST(request: Request) {
  await initializeSMPClient();
  try {
    const { authorID, state, firstName, lastName } = await request.json();
    const response = await smpClient.profile.createProfile({ 
      authorID, 
      state,
      firstName,
      lastName
    });
    return NextResponse.json(response);
  } catch (error) {
    console.error('Erreur création profile :', error);
    return NextResponse.error();
  }
}
