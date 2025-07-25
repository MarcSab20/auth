// /app/api/newsletter/contact/new/route.ts
import { NextResponse } from "next/server";
import { smpClient, initializeSMPClient } from "@/smpClient";

export async function POST(request: Request) {
  // 0) Initialisation du client SMP
  await initializeSMPClient();

  // 1) Lecture et validation JSON
  let payload: any;
  try {
    payload = await request.json();
  } catch (err) {
    console.error("Invalid JSON payload for newsletter:", err);
    return NextResponse.json(
      { message: "Données invalides pour l’abonnement." },
      { status: 400 }
    );
  }

  // 2) Email obligatoire
  const email =
    typeof payload.email === "string" ? payload.email.trim() : "";
  if (!email) {
    return NextResponse.json(
      { message: "L’adresse e‑mail est requise." },
      { status: 400 }
    );
  }

  // 3) Construction dynamique de l’input
  const input: any = {
    email,
    // Par défaut on souscrit (sauf si explicitement false)
    isNewsletterSubscriber:
      payload.isNewsletterSubscriber === false ? false : true,
    source:
      payload.source === "footer" ? "footer" : "signup",
  };
  // On n’ajoute QUE les champs qui ne sont pas vides / null
  if (payload.userID)        input.userID = payload.userID;
  if (payload.firstName)     input.firstName = payload.firstName;
  if (payload.lastName)      input.lastName = payload.lastName;
  if (payload.country)       input.country = payload.country;
  if (payload.gender)        input.gender = payload.gender;
  if (payload.birthDate)     input.birthDate = payload.birthDate;
  if (payload.state)         input.state = payload.state;

  // 4) Appel SMP + sérialisation safe
  try {
    const result = await smpClient.mailing.createNewsletterContact(input);

    let safeResult: any;
    try {
      safeResult = JSON.parse(JSON.stringify(result));
    } catch (serErr) {
      console.error("Serialization error for newsletter result:", serErr);
      safeResult = {
        newsletterContactID:
          (result as any)?.newsletterContactID ?? null,
      };
    }
    return NextResponse.json(safeResult, { status: 200 });
  } catch (err: any) {
    console.error("Erreur création contact newsletter :", err);
    const apiMessage =
      err?.response?.errors?.[0]?.message ||
      "Une erreur interne est survenue lors de l’abonnement.";
    const status = err?.response?.status || 500;
    return NextResponse.json({ message: apiMessage }, { status });
  }
}
