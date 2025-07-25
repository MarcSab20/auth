import { NextResponse } from 'next/server';
import { smpClient } from '@/smpClient';

export async function POST(
  request: Request,
  { params }: { params: { organizationID: string } }
) {
  try {
    const body = await request.json();
    const { email, message, firstName, lastName } = body;
    const organizationID = params.organizationID;

    const response = await smpClient.manageOrganization.inviteUserToOrganization({
      email,
      organizationID,
      message,
      firstName,
      lastName,
    });

    if (!response.success) {
      return NextResponse.json(
        { error: response.message || 'Failed to invite member' },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error inviting member:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
