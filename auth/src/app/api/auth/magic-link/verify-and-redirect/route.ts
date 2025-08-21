// auth/src/app/api/auth/magic-link/verify-and-redirect/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get('token');
    // ✅ CORRECTION: Décoder correctement l'URL de redirection
    const redirect = decodeURIComponent(searchParams.get('redirect') || '/account');
    
    console.log('🔗 [API] Raw redirect param:', searchParams.get('redirect'));
    console.log('🔗 [API] Decoded redirect:', redirect);
    
    if (!token) {
      return NextResponse.json(
        { success: false, error: "Token is required" },
        { status: 400 }
      );
    }

    console.log('🔗 [API] Verifying magic link token:', token.substring(0, 8) + '...');

    // ✅ Appel GraphQL vers le backend
    const graphqlUrl = process.env.NEXT_PUBLIC_GRAPHQL_URL || 'http://localhost:4000/graphql';
    
    const response = await fetch(graphqlUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-App-ID': process.env.NEXT_PUBLIC_AUTH_APP_ID || '',
        'X-App-Secret': process.env.NEXT_PUBLIC_AUTH_APP_SECRET || '',
        'X-Client-Name': 'auth-api',
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

    if (!result.success) {
      // ✅ Redirection vers page d'erreur avec message
      const errorUrl = new URL('/magic-link-error', req.url);
      errorUrl.searchParams.set('error', result.message || 'Magic Link verification failed');
      return NextResponse.redirect(errorUrl);
    }

    // ✅ CORRECTION: Construction propre de l'URL de redirection
    const dashboardUrl = process.env.NEXT_PUBLIC_DASHBOARD_URL || 'http://localhost:3002';
    
    // Nettoyer le path de redirection
    let cleanRedirect = redirect;
    if (!cleanRedirect.startsWith('/')) {
      cleanRedirect = '/' + cleanRedirect;
    }
    
    // Construire l'URL finale proprement
    const finalRedirectUrl = new URL(cleanRedirect, dashboardUrl).toString();
    
    console.log('🚀 [API] Magic Link verified, redirecting to:', finalRedirectUrl);
    console.log('🔧 [API] URL construction:', {
      dashboardUrl,
      originalRedirect: searchParams.get('redirect'),
      decodedRedirect: redirect,
      cleanRedirect,
      finalUrl: finalRedirectUrl
    });
    
    const redirectResponse = NextResponse.redirect(finalRedirectUrl);

    // ✅ Stocker les tokens dans des cookies sécurisés cross-domain
    if (result.accessToken) {
      const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax' as const,
        path: '/',
        domain: process.env.NODE_ENV === 'production' ? '.services.com' : undefined // ✅ undefined pour localhost
      };

      // Cookie pour le token d'accès (court terme)
      redirectResponse.cookies.set('smp_user_token', result.accessToken, {
        ...cookieOptions,
        maxAge: result.expiresIn || 3600
      });

      // Cookie pour le refresh token (long terme)
      if (result.refreshToken) {
        redirectResponse.cookies.set('smp_user_refresh', result.refreshToken, {
          ...cookieOptions,
          maxAge: 7 * 24 * 60 * 60 // 7 jours
        });
      }

      // Cookie de session
      const sessionId = `magiclink_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      redirectResponse.cookies.set('smp_session_id', sessionId, {
        httpOnly: false, // Accessible côté client pour validation
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60,
        path: '/',
        domain: process.env.NODE_ENV === 'production' ? '.services.com' : undefined
      });

      // Cookie utilisateur (accessible côté client)
      if (result.userInfo) {
        const userCookie = {
          userID: result.userInfo.sub,
          username: result.userInfo.preferred_username || result.userInfo.email,
          email: result.userInfo.email,
          profileID: result.userInfo.sub,
          accessibleOrganizations: result.userInfo.organization_ids || [],
          organizations: result.userInfo.organization_ids || [],
          roles: result.userInfo.roles || [],
          sessionId: sessionId,
          source: 'magic_link',
          authenticatedAt: new Date().toISOString()
        };

        redirectResponse.cookies.set('smp_user_0', JSON.stringify(userCookie), {
          httpOnly: false, // Accessible côté client
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 7 * 24 * 60 * 60,
          path: '/',
          domain: process.env.NODE_ENV === 'production' ? '.services.com' : undefined
        });

        console.log('✅ [API] Cookies set for user:', result.userInfo.email);
      }
    }

    return redirectResponse;

  } catch (error: any) {
    console.error('❌ [API] Magic Link verification failed:', error);
    
    // Redirection vers page d'erreur
    const errorUrl = new URL('/magic-link-error', req.url);
    errorUrl.searchParams.set('error', error.message || 'Magic Link verification failed');
    return NextResponse.redirect(errorUrl);
  }
}

function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function generateTraceId(): string {
  return `trace_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}