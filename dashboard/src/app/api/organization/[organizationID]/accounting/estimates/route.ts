import { NextRequest, NextResponse } from 'next/server';
import { smpClient, initializeSMPClient } from '@/smpClient';

export async function GET(
  request: NextRequest,
  { params }: { params: { organizationID: string } }
) {
  try {
    await initializeSMPClient();
    const { searchParams } = new URL(request.url);
    const view = searchParams.get('view') || 'suppliers';

    if (view === 'customers') {
      // Pour les clients, on récupère les estimates où l'organisation est vendeuse
      const estimates = await smpClient.estimate.getBySellerOrganizationId(params.organizationID);
      return NextResponse.json({ estimates });
    } else {
      // Pour les fournisseurs, on récupère les estimates où l'organisation est acheteuse
      const estimates = await smpClient.estimate.getByBuyerOrganizationId(params.organizationID);
      return NextResponse.json({ estimates });
    }
  } catch (error) {
    console.error('Error fetching estimates:', error);
    return NextResponse.json({ error: 'Failed to fetch estimates' }, { status: 500 });
  }
}
