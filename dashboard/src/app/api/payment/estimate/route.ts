import { NextResponse } from "next/server";
import { smpClient, initializeSMPClient } from "@/smpClient";

export async function POST(request: Request) {
  await initializeSMPClient();
  try {
    const { serviceId, proposalPrice, details } = await request.json();
    console.log('POST /api/payment/estimate - Input:', { serviceId, proposalPrice, details });
    
    const estimate = await smpClient.smpPayment.createEstimate({
      serviceId,
      proposalPrice,
      details
    });
    
    console.log('POST /api/payment/estimate - Response:', estimate);
    return NextResponse.json(estimate);
  } catch (error) {
    console.error("Erreur détaillée lors de la création du devis:", error);
    return NextResponse.error();
  }
}

export async function PUT(request: Request) {
  await initializeSMPClient();
  try {
    const body = await request.json();
    console.log('PUT /api/payment/estimate - Input:', body);
    
    const { updateEstimateId, data } = body;
    
    if (!updateEstimateId) {
      console.error('PUT /api/payment/estimate - Erreur: updateEstimateId manquant');
      return new NextResponse(JSON.stringify({ error: 'updateEstimateId is required' }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    console.log('Appel de updateEstimate avec:', { updateEstimateId, data });
    const estimate = await smpClient.smpPayment.updateEstimate(updateEstimateId, data);
    
    console.log('PUT /api/payment/estimate - Response:', estimate);
    return NextResponse.json(estimate);
  } catch (error: any) {
    console.error("Erreur détaillée lors de la mise à jour du devis:", error);
    return new NextResponse(JSON.stringify({ error: error?.message || 'Une erreur est survenue' }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
} 