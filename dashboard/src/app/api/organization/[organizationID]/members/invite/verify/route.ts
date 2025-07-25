import { NextResponse } from 'next/server';
import { smpClient } from '@/smpClient';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { token } = body;

    if (!token) {
      return NextResponse.json(
        { error: 'Token is required' },
        { status: 400 }
      );
    }

    const response = await smpClient.manageOrganization.verifyInvitationToken({
      token
    });

    if (!response.success) {
      return NextResponse.json(
        { error: response.message || 'Invalid or expired token' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      email: response.email,
      organizationID: response.organizationID,
      userExists: response.userExists,
      userID: response.userID,
      firstName: response.firstName,
      lastName: response.lastName,
      message: response.message
    });
  } catch (error) {
    console.error('Error verifying invitation token:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 