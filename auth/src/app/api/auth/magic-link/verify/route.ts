// src/app/api/auth/magic-link/verify/route.ts
import { NextRequest, NextResponse } from "next/server";
import { API_CONFIG } from "@/src/config/api.config";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { token } = body;

    if (!token) {
      return NextResponse.json(
        { success: false, error: "Token is required" },
        { status: 400 }
      );
    }

    console.log('🔗 Frontend API: Verifying magic link token:', token.substring(0, 8) + '...');

    // Appel vers le backend via KrakenD
    const response = await fetch(`${API_CONFIG.BASE_URL}/graphql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Request-ID': generateRequestId(),
        'X-Trace-ID': generateTraceId(),
      },
      body: JSON.stringify({
        query: `
          mutation VerifyMagicLink($token: String!) {
            verifyMagicLink(token: $token) {
              success
              status
              message
              accessToken
              refreshToken
              tokenType
              expiresIn
              requiresMFA
              userInfo
            }
          }
        `,
        variables: { token }
      }),
    });

    if (!response.ok) {
      throw new Error(`Backend error: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.errors) {
      throw new Error(data.errors[0].message || 'GraphQL error');
    }

    const result = data.data?.verifyMagicLink;
    
    if (!result) {
      throw new Error('Invalid response from backend');
    }

    // Si la vérification réussit, créer une réponse avec cookies sécurisés
    const response_data = {
      success: result.success,
      data: {
        status: result.status,
        message: result.message,
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
        tokenType: result.tokenType,
        expiresIn: result.expiresIn,
        requiresMFA: result.requiresMFA,
        user: result.userInfo
      }
    };

    const nextResponse = NextResponse.json(response_data);

    // Si on a des tokens, les stocker dans des cookies sécurisés
    if (result.success && result.accessToken) {
      // Cookie pour le token d'accès (court terme)
      nextResponse.cookies.set('access_token', result.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: result.expiresIn || 3600, // 1 heure par défaut
        path: '/'
      });

      // Cookie pour le refresh token (long terme)
      if (result.refreshToken) {
        nextResponse.cookies.set('refresh_token', result.refreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 7 * 24 * 60 * 60, // 7 jours
          path: '/'
        });
      }

      // Cookie pour les infos utilisateur (accessible côté client)
      if (result.userInfo) {
        const userCookie = {
          userID: result.userInfo.sub,
          username: result.userInfo.preferred_username,
          email: result.userInfo.email,
          profileID: result.userInfo.sub // Adapter selon votre structure
        };

        nextResponse.cookies.set('smp_user_0', JSON.stringify(userCookie), {
          httpOnly: false, // Accessible côté client
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 7 * 24 * 60 * 60, // 7 jours
          path: '/'
        });
      }
    }

    return nextResponse;

  } catch (error: any) {
    console.error('❌ Magic Link verification failed:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Magic Link verification failed'
      },
      { status: 500 }
    );
  }
}

function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function generateTraceId(): string {
  return `trace_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}