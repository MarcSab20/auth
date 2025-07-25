import { NextResponse } from 'next/server';
import { smpClient } from '@/smpClient';

export async function POST(request: Request) {
  try {
    const { locationID, addressLine1, city, postalCode, country, placeKind } = await request.json();
    const updated = await smpClient.location.updatePlace(locationID, {
      addressLine1,
      city,
      postalCode,
      country,
      placeKind,
    });
    if (!updated) return NextResponse.error();
    return NextResponse.json({ message: "Localisation mise à jour avec succès" });
  } catch (error) {
    console.error("Erreur dans location/update:", error);
    return NextResponse.error();
  }
}
