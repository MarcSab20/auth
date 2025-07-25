import { NextResponse } from 'next/server';
import { smpClient } from '@/smpClient';

export async function DELETE(
  request: Request,
  { params }: { params: { organizationID: string } }
) {
  try {
    const body = await request.json();
    const { userID } = body;
    const organizationID = params.organizationID;

    const response = await smpClient.manageOrganization.removeUserFromOrganization({
      organizationID,
      userID
    });

    if (!response.success) {
      return NextResponse.json(
        { error: response.message || 'Failed to remove member' },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error removing member:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
