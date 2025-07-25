import { NextResponse } from "next/server";
import { smpClient, initializeSMPClient } from "@/smpClient";

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function POST(request: Request) {
  try {
    await initializeSMPClient();
    await delay(500);

    const body = await request.json();
    console.log("Request body:", body);

    // Validation des champs requis
    if (!body.serviceId || !body.sellerOrganizationId || !body.currency || !body.totalAmount) {
      return NextResponse.json(
        { error: "Champs requis manquants" },
        { status: 400 }
      );
    }

    // Construction de l'input
    const input = {
      serviceId: String(body.serviceId),
      sellerOrganizationId: String(body.sellerOrganizationId),
      currency: body.currency,
      totalAmount: Number(body.totalAmount),
      buyerUserId: String(body.buyerUserId || "0"),
      buyerOrganizationId: body.buyerOrganizationId ? String(body.buyerOrganizationId) : undefined,
      sellerUserContactId: body.sellerUserContactId || undefined,
      metadata: body.metadata ? JSON.stringify(body.metadata) : '{}'
    };

    console.log("Transaction input:", input);
    console.log('Calling initiateTransaction with input:', input);
    
    const transaction = await smpClient.smpPayment.initiateTransaction(input);
    console.log('Transaction response:', transaction);

    if (!transaction) {
      console.error('No transaction returned from initiateTransaction');
      return NextResponse.json(
        { error: "Pas de transaction retournée" },
        { status: 500 }
      );
    }

    return NextResponse.json(transaction);

  } catch (error: any) {
    console.error('Erreur détaillée lors de la création de la transaction:', error);
    console.error('Stack trace:', error.stack);
    return NextResponse.json(
      { error: "Une erreur est survenue lors de la création de la transaction" },
      { status: 500 }
    );
  }
}


 