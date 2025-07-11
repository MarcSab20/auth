// src/app/api/auth/magic-link/generate/route.ts
import { NextRequest, NextResponse } from "next/server";
import { API_CONFIG } from "@/src/config/api.config";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, action = 'login', redirectUrl } = body;

    if (!email) {
      return NextResponse.json(
        { success: false, error: "Email is required" },
        { status: 400 }
      );
    }

    // Extraire le contexte de la requête
    const context = {
      ip: req.ip || req.headers.get('x-forwarded-for') || 'unknown',
      userAgent: req.headers.get('user-agent') || 'unknown',
      referrer: req.headers.get('referer') || undefined
    };

    console.log('🔗 Frontend API: Generating magic link for:', email);

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
          mutation GenerateMagicLink($input: MagicLinkRequestDto!) {
            generateMagicLink(input: $input) {
              success
              linkId
              message
              expiresAt
              emailSent
            }
          }
        `,
        variables: {
          input: {
            email,
            redirectUrl,
            context: {
              ...context,
              action
            }
          }
        }
      }),
    });

    if (!response.ok) {
      throw new Error(`Backend error: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.errors) {
      throw new Error(data.errors[0].message || 'GraphQL error');
    }

    const result = data.data?.generateMagicLink;
    
    if (!result) {
      throw new Error('Invalid response from backend');
    }

    return NextResponse.json({
      success: result.success,
      data: {
        linkId: result.linkId,
        message: result.message,
        expiresAt: result.expiresAt,
        emailSent: result.emailSent
      }
    });

  } catch (error: any) {
    console.error('❌ Magic Link generation failed:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Magic Link generation failed'
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