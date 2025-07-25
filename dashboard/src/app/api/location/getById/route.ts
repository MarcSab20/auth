import { NextResponse } from 'next/server';
import { smpClient } from '@/smpClient';

export async function POST(request: Request) {
  try {
    const { locationID } = await request.json();
    const location = await smpClient.location.getById(locationID);
    if (!location) return NextResponse.error();
    return NextResponse.json(location);
  } catch (error) {
    console.error("Erreur dans getById:", error);
    return NextResponse.error();
  }
}
