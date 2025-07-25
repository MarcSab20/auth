// /app/api/organization/new/route.ts
import { NextResponse } from "next/server";
import { smpClient } from "@/smpClient";

export async function POST(request: Request) {
  try {
    const {
      brand,
      juridicForm,
      capital,
      sectorID,
      description,
      legalName,
      sigle,
      locationID,
      smallLogo,
      oSize,
      vatNumber,
      communityVATNumber,
      insuranceRef,
      insuranceName,
      legalUniqIdentifier,
      authorID,
    } = await request.json();

    // Vérification minimale, ici par exemple que locationID est présent
    if (!locationID) {
      return NextResponse.json(
        { error: "Le champ 'locationID' est requis" },
        { status: 400 }
      );
    }

    const newOrganization = await smpClient.organization.createOrganization({
      brand,
      juridicForm,
      capital,
      sectorID,
      description,
      legalName,
      sigle,
      locationID,
      smallLogo,
      oSize,
      vatNumber,
      communityVATNumber,
      insuranceRef,
      insuranceName,
      legalUniqIdentifier,
      state: "online",
      authorID,
    });

    if (!newOrganization || !newOrganization.organizationID) {
      return NextResponse.error();
    }

    return NextResponse.json({
      organizationID: newOrganization.organizationID,
      message: "Organisation créée avec succès",
    });
  } catch (error) {
    console.error("Erreur dans /api/organization/new:", error);
    return NextResponse.error();
  }
}
