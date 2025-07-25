// /app/api/service/new/route.ts
import { NextResponse } from 'next/server';
import { smpClient } from '@/smpClient';

export async function POST(request: Request) {
  try {
    const {
      organizationID,
      title,
      description,
      price,
      lowerPrice,
      upperPrice,
      authorID,
      legalVatPercent,
      negotiable,
      locationID, 
      supplyType,
      billingPlan,
      uptakeForm,
      advancedAttributes,
    } = await request.json();

    // Vérification : le service doit posséder une localisation
    if (!locationID) {
      return NextResponse.json({ error: "Le champ 'locationID' est requis" }, { status: 400 });
    }

    const newService = await smpClient.service.createService({
      organizationID,
      title,
      description,
      price,
      lowerPrice,
      upperPrice,
      state: "online",
      authorID,
      legalVatPercent,
      negotiable,
      locationID,
      supplyType,
      billingPlan,
      uptakeForm,
      advancedAttributes,
    });

    if (!newService || !newService.serviceID) {
      return NextResponse.error();
    }

    return NextResponse.json({ serviceID: newService.serviceID, message: "Service créé avec succès" });
  } catch (error) {
    console.error("Erreur dans /api/services/new:", error);
    return NextResponse.error();
  }
}
