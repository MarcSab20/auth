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

    // ✅ CORRECTION: Appel vers l'endpoint GraphQL PUBLIC pour Magic Link
    const graphqlEndpoint = `${API_CONFIG.BASE_URL}/graphql-public`;
    
    const response = await fetch(graphqlEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Request-ID': generateRequestId(),
        'X-Trace-ID': generateTraceId(),
        // ✅ Ne pas envoyer de token Authorization pour GraphQL public
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

    console.log('🔍 Response status:', response.status);
    console.log('🔍 Response headers:', [...response.headers.entries()]);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Backend error response:', errorText);
      throw new Error(`Backend error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('✅ Backend response:', data);
    
    if (data.errors) {
      console.error('❌ GraphQL errors:', data.errors);
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