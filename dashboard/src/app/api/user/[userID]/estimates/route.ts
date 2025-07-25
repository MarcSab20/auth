import { NextRequest, NextResponse } from 'next/server';
import { smpClient, initializeSMPClient } from '@/smpClient';

export async function GET(
  request: NextRequest,
  { params }: { params: { userID: string } }
) {
  await initializeSMPClient();
  try {
    const estimates = await smpClient.estimate.getByBuyerUserId(params.userID);
    
    return NextResponse.json(estimates);
  } catch (error) {
    console.error('Error fetching user estimates:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user estimates' },
      { status: 500 }
    );
  }
}
