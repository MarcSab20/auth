// /app/api/location/new/route.ts
import { NextResponse } from 'next/server';
import { smpClient } from '@/smpClient';

export async function POST(request: Request) {
  try {
    const { addressLine1, city, postalCode, country, placeKind, authorID } = await request.json();

    // Vérification du champ obligatoire
    if (!country) {
      return NextResponse.json({ error: "Le champ 'country' est requis" }, { status: 400 });
    }

    const newPlace = await smpClient.location.createPlace({
      addressLine1,
      city,
      postalCode,
      country,
      placeKind: placeKind || "road",
      state: "online", 
      authorID,
    });

    if (!newPlace?.placeID) {
      return NextResponse.error();
    }

    return NextResponse.json({ placeID: newPlace.placeID, message: "Localisation créée avec succès" });
  } catch (error) {
    console.error("Erreur dans /api/location/new:", error);
    return NextResponse.error();
  }
}
