// auth/src/app/api/auth/magic-link/verify-and-redirect/route.ts - AVEC DYNAMIC
import { NextRequest, NextResponse } from "next/server";

// 🔧 AJOUT : Forcer le mode dynamique pour éviter les erreurs de build statique
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get('token');
    const redirect = decodeURIComponent(searchParams.get('redirect') || '/account');
    
    console.log('🔗 [API] Magic Link verification - Token:', token?.substring(0, 8) + '...');
    console.log('🔗 [API] Redirect destination:', redirect);
    
    if (!token) {
      return NextResponse.json(
        { success: false, error: "Token is required" },
        { status: 400 }
      );
    }

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
      console.log('❌ [API] Magic Link verification failed:', result.message);
      const errorUrl = new URL('/magic-link-error', req.url);
      errorUrl.searchParams.set('error', result.message || 'Magic Link verification failed');
      return NextResponse.redirect(errorUrl);
    }

    console.log('✅ [API] Magic Link verified successfully');

    // ✅ Construction URL Dashboard propre
    const dashboardUrl = process.env.NEXT_PUBLIC_DASHBOARD_URL || 'http://localhost:3002';
    
    let cleanRedirect = redirect;
    if (!cleanRedirect.startsWith('/')) {
      cleanRedirect = '/' + cleanRedirect;
    }
    
    const finalRedirectUrl = `${dashboardUrl}${cleanRedirect}`;
    
    console.log('🚀 [API] Preparing redirect to:', finalRedirectUrl);
    
    const redirectResponse = NextResponse.redirect(finalRedirectUrl);

    // ✅ Configuration cookies cross-domain optimisée
    if (result.accessToken) {
      const isProduction = process.env.NODE_ENV === 'production';
      const domain = isProduction ? '.services.com' : undefined;
      
      const cookieOptions = {
        httpOnly: true,
        secure: isProduction,
        sameSite: 'lax' as const,
        path: '/',
        domain: domain
      };

      redirectResponse.cookies.set('smp_user_token', result.accessToken, {
        ...cookieOptions,
        maxAge: result.expiresIn || 3600
      });

      if (result.refreshToken) {
        redirectResponse.cookies.set('smp_user_refresh', result.refreshToken, {
          ...cookieOptions,
          maxAge: 7 * 24 * 60 * 60
        });
      }

      const sessionId = `magiclink_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      redirectResponse.cookies.set('smp_session_id', sessionId, {
        httpOnly: false,
        secure: isProduction,
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60,
        path: '/',
        domain: domain
      });

      if (result.userInfo) {
        const userCookie = {
          userID: result.userInfo.sub,
          username: result.userInfo.preferred_username || result.userInfo.email,
          email: result.userInfo.email,
          profileID: result.userInfo.sub,
          sub: result.userInfo.sub,
          accessibleOrganizations: result.userInfo.organization_ids || [],
          organizations: result.userInfo.organization_ids || [],
          roles: result.userInfo.roles || [],
          sessionId: sessionId,
          source: 'magic_link',
          authenticatedAt: new Date().toISOString(),
          timestamp: new Date().toISOString(),
          given_name: result.userInfo.given_name,
          family_name: result.userInfo.family_name,
          state: result.userInfo.state,
          email_verified: result.userInfo.email_verified,
          attributes: result.userInfo.attributes
        };

        const userCookieValue = JSON.stringify(userCookie);
        
        if (userCookieValue.length > 4000) {
          console.warn('⚠️ [API] Cookie trop volumineux, compression...');
          const compressedUserCookie = {
            userID: result.userInfo.sub,
            username: result.userInfo.preferred_username || result.userInfo.email,
            email: result.userInfo.email,
            profileID: result.userInfo.sub,
            sub: result.userInfo.sub,
            sessionId: sessionId,
            source: 'magic_link',
            timestamp: new Date().toISOString()
          };
          redirectResponse.cookies.set('smp_user_0', JSON.stringify(compressedUserCookie), {
            httpOnly: false,
            secure: isProduction,
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60,
            path: '/',
            domain: domain
          });
        } else {
          redirectResponse.cookies.set('smp_user_0', userCookieValue, {
            httpOnly: false,
            secure: isProduction,
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60,
            path: '/',
            domain: domain
          });
        }

        console.log('✅ [API] Cookies set for user:', result.userInfo.email);
      }
    }

    console.log('🚀 [API] Redirection complete to:', finalRedirectUrl);
    return redirectResponse;

  } catch (error: any) {
    console.error('❌ [API] Magic Link verification failed:', error);
    
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