import { NextRequest, NextResponse } from 'next/server';
import { smpClient, initializeSMPClient } from '@/smpClient';

export async function GET(
  request: NextRequest,
  { params }: { params: { organizationID: string } }
) {
  try {
    await initializeSMPClient();

    // Récupérer les transactions où l'organisation est acheteur
    const buyerTransactions = await smpClient.smpPayment.getTransactionsByBuyerOrganizationId(params.organizationID);
    
    // Récupérer les transactions où l'organisation est vendeur
    const sellerTransactions = await smpClient.smpPayment.getTransactionsBySellerOrganizationId(params.organizationID);

    return NextResponse.json({
      buyerTransactions,
      sellerTransactions
    });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch transactions' },
      { status: 500 }
    );
  }
}
