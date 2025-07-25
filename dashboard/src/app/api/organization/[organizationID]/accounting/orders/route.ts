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
      // Pour les clients, on ne récupère que les orders où l'organisation est vendeuse
      const orders = await smpClient.order.getBySellerOrganizationId(params.organizationID);
      // console.log('API Response (customers):', JSON.stringify(orders, null, 2));
      return NextResponse.json(orders);
    } else {
      // Pour les fournisseurs, on ne récupère que les orders où l'organisation est acheteuse
      const orders = await smpClient.order.getByBuyerOrganizationId(params.organizationID);
      // console.log('API Response (suppliers):', JSON.stringify(orders, null, 2));
      return NextResponse.json(orders);
    }
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}
