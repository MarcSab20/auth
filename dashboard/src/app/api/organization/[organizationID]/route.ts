// app/api/organization/[organizationID]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { initializeSMPClient, smpClient } from "@/smpClient";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { organizationID: string } }
) {
  const { organizationID } = params;

  if (!organizationID) {
    return NextResponse.json({ error: "organizationID requis" }, { status: 400 });
  }

  try {
    await initializeSMPClient();
    const body = await req.json();

    // Effectuer l'update
    const organization = await smpClient.organization.getById(organizationID);

    return NextResponse.json({ organization });
  } catch (error) {
    console.error("Erreur PATCH /api/organization/:id", error);
    return NextResponse.json({ error: "Erreur lors de la récupération de l'organisation" }, { status: 500 });
  }
}
