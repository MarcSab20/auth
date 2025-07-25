// /app/api/[userID]/organizations/route.ts
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { smpClient, initializeSMPClient } from '@/smpClient';

// Type local pour les rôles
type LocalRoleName = "Owner" | "Admin" | "Guest" | "Member";

// Traduction des rôles SMP vers rôles locaux
const SMPToLocalRole: Record<"SMP_OWNER" | "SMP_ADMIN" | "SMP_EMPLOYEE", LocalRoleName> = {
  SMP_OWNER: "Owner",
  SMP_ADMIN: "Admin",
  SMP_EMPLOYEE: "Member",
};

export async function GET() {

  const cookieStore = cookies();
  const rawUserCookie = cookieStore.get('smp_user_0');

  if (!rawUserCookie) {
    return NextResponse.json({ error: 'Utilisateur non connecté (cookie absent)' }, { status: 401 });
  }

  try {
    const user = JSON.parse(decodeURIComponent(rawUserCookie.value));
    const userID = user.userID;

    if (!userID) {
      return NextResponse.json({ error: 'userID manquant dans le cookie' }, { status: 400 });
    }

    await initializeSMPClient();

    const userOrganizations = await smpClient.manageOrganization.getUserOrganizations(userID);

    const nav = userOrganizations.map((org: any) => {
      const localRoleName = SMPToLocalRole[org.userRole.roleName as keyof typeof SMPToLocalRole];

      return {
        organizationID: org.organizationID,
        name: org.organizationName,
        role: localRoleName,
        icon: org.smallLogoUrl || "/images/icons/Organisation-Blanc.png",
      };
    });

    // Stockage temporaire dans un cookie (1 minute)
    const response = NextResponse.json(nav);
    response.cookies.set('orgNav', JSON.stringify(nav), {
      maxAge: 60,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error("Erreur lors de la génération de la navigation :", error);
    return NextResponse.json({ error: 'Erreur serveur lors de la génération du menu' }, { status: 500 });
  }
}
