import { NextRequest, NextResponse } from 'next/server';
import { smpClient, initializeSMPClient } from '@/smpClient';

export const GET = async (
  request: NextRequest,
  { params }: { params: { organizationID: string } }
) => {
  try {
    await initializeSMPClient();
    const { searchParams } = new URL(request.url);
    const view = searchParams.get('view') || 'suppliers';

    if (view === 'customers') {
      // Pour les clients, on ne récupère que les invoices où l'organisation est vendeuse
      const invoices = await smpClient.order.getBySellerOrganizationId(params.organizationID);
      return NextResponse.json({ invoices });
    } else {
      // Pour les fournisseurs, on ne récupère que les invoices où l'organisation est acheteuse
      const invoices = await smpClient.order.getByBuyerOrganizationId(params.organizationID);
      return NextResponse.json({ invoices });
    }
  } catch (error) {
    console.error('Error fetching invoices:', error);
    return NextResponse.json({ error: 'Failed to fetch invoices' }, { status: 500 });
  }
};
