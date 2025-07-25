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

    const updateFields = body as Record<string, any>;

    // Optionnel : validation basique
    if (Object.keys(updateFields).length === 0) {
      return NextResponse.json({ error: "Aucune donnée fournie" }, { status: 400 });
    }

    // Effectuer l'update
    await smpClient.organization.updateOrganization(organizationID, updateFields);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erreur PATCH /api/organization/:id", error);
    return NextResponse.json({ error: "Erreur lors de la mise à jour" }, { status: 500 });
  }
}
