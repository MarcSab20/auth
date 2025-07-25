import { NextResponse } from 'next/server';
import { smpClient } from '@/smpClient';

export async function GET(
  request: Request,
  { params }: { params: { uniqRef: string } }
) {
  try {
    const { uniqRef } = params;
    const asset = await smpClient.asset.assetByUniqRef(uniqRef);
    return NextResponse.json(asset);
  } catch (error) {
    console.error('Error fetching asset by uniqRef:', error);
    return NextResponse.json(
      { error: 'Failed to fetch asset by uniqRef' },
      { status: 500 }
    );
  }
} 