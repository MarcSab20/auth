import { NextResponse } from "next/server";
import { smpClient, initializeSMPClient } from "@/smpClient";

export async function POST(request: Request) {
  await initializeSMPClient();
  try {
    const { serviceId, quoteId, totalPrice, sellerOrganizationId, buyerOrganizationId, currency, transactionId, userId, unloggedUser } = await request.json();
    console.log('orderInput:', { serviceId, quoteId, totalPrice, sellerOrganizationId, buyerOrganizationId, currency, transactionId });
    const order = await smpClient.smpPayment.createOrder({
      serviceId,
      quoteId,
      totalPrice: totalPrice || 100,
      sellerOrganizationId,
      buyerOrganizationId,
      currency,
      transactionId,
      userId,
      unloggedUser
    });
    return NextResponse.json(order);
  } catch (error) {
    console.error("Erreur lors de la création de la commande:", error);
    return NextResponse.error();
  }
}

export async function PUT(request: Request) {
  await initializeSMPClient();
  try {
    const { orderId, lineInput } = await request.json();
    const line = await smpClient.smpPayment.addLine(orderId, lineInput);
    return NextResponse.json(line);
  } catch (error) {
    console.error("Erreur lors de l'ajout d'une ligne:", error);
    return NextResponse.error();
  }
}

export async function DELETE(request: Request) {
  await initializeSMPClient();
  try {
    const { orderId, assetId } = await request.json();
    await smpClient.smpPayment.deleteLine(orderId, assetId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erreur lors de la suppression d'une ligne:", error);
    return NextResponse.error();
  }
} 