import { NextResponse } from "next/server";
import { smpClient, initializeSMPClient } from "@/smpClient";

export async function POST(request: Request) {
  await initializeSMPClient();
  try {
    const { orderId, ...paymentInput } = await request.json();
    const response = await smpClient.smpPayment.initiatePayment({
      ...paymentInput,
      orderId
    });
    return NextResponse.json(response.data?.clientSecret || null);
  } catch (error) {
    console.error("Erreur lors de l'initiation du paiement:", error);
    return NextResponse.error();
  }
} 