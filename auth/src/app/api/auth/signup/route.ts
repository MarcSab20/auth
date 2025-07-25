// /app/api/auth/signup/route.ts
import { NextResponse } from "next/server";
import { smpClient, initializeSMPClient } from "@/smpClient";

export async function POST(request: Request) {
  await initializeSMPClient();

  const {
    username,
    email,
    password,
    profileID,
    userKind,
    state,
    twoFactorEnabled,
    rsaPublicKey,
    organizationID,
  } = await request.json();

  // 1) Appel SMP
  let result: any;
  try {
    if (organizationID) {
      result = await smpClient.manageOrganization.signupAfterInvitation(
        { username, email, password, profileID, userKind, state, twoFactorEnabled, rsaPublicKey },
        organizationID
      );
    } else {
      result = await smpClient.signup.createUser({
        username,
        email,
        password,
        profileID,
        userKind,
        state,
        twoFactorEnabled,
        rsaPublicKey,
      });
    }
  } catch (error: any) {
    console.error("Erreur SMP lors de la création de l'utilisateur :", error);
    const msg = error.message || "";
    if (msg.includes("already exist")) {
      // doublon
      return NextResponse.json(
        { message: "Cet e‑mail est déjà utilisé." },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { message: "Une erreur interne est survenue lors de l'inscription. Veuillez réessayer plus tard." },
      { status: 500 }
    );
  }

  // 2) Sérialisation safe pour éviter Value is not JSON serializable
  let safeResult: any;
  try {
    safeResult = JSON.parse(JSON.stringify(result));
  } catch (err: any) {
    console.error("Erreur de sérialisation du résultat SMP :", err);
    safeResult = { userID: (result as any)?.userID ?? null };
  }

  // 3) Renvoi OK
  return NextResponse.json(safeResult);
}