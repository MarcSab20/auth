import { NextRequest, NextResponse } from 'next/server';
import { smpClient, initializeSMPClient } from '@/smpClient';

export async function GET(
  request: NextRequest,
  { params }: { params: { userID: string } }
) {
  await initializeSMPClient();
  try {
    const invoices = await smpClient.invoice.list();
    
    return NextResponse.json(invoices);
  } catch (error) {
    console.error('Error fetching user invoices:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user invoices' },
      { status: 500 }
    );
  }
}
