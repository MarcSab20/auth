import { NextResponse } from 'next/server';
import { smpClient } from '@/smpClient';

export async function POST(
  request: Request,
  { params }: { params: { organizationID: string } }
) {
  try {
    const body = await request.json();
    const { userID } = body;

    console.log('Accept invitation request:', {
      userID,
      organizationID: params.organizationID
    });

    if (!userID) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    console.log('Calling addUserToOrganization with:', {
      userID,
      organizationID: params.organizationID,
      role: "4"
    });

    const response = await smpClient.manageOrganization.addUserToOrganization({
      userID,
      organizationID: params.organizationID,
      role: "4"  // Rôle "Member" dans le backend
    });

    console.log('AddUserToOrganization response:', response);

    if (!response.success) {
      console.error('Failed to join organization:', response.message);
      return NextResponse.json(
        { error: response.message || 'Failed to join organization' },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error joining organization:', error);
    // Log plus détaillé de l'erreur
    if (error instanceof Error) {
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 