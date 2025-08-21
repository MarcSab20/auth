// auth/src/components/auth/magic-link/magicLinkHandler.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEnhancedAuth } from "@/context/authenticationContext";
import { SharedSessionManager } from "@/src/lib/SharedSessionManager";
import MagicLinkProcessing from "./magicLinkProcessing";
import MagicLinkSuccess from "./magicLinkSuccess";
import MagicLinkError from "./magicLinkError";

interface MagicLinkResult {
  success: boolean;
  status: string;
  message?: string;
  accessToken?: string;
  refreshToken?: string;
  tokenType?: string;
  expiresIn?: number;
  requiresMFA?: boolean;
  userInfo?: any;
}

export default function MagicLinkHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { state, login } = useEnhancedAuth();
  
  const [status, setStatus] = useState<'processing' | 'success' | 'error' | 'redirect'>('processing');
  const [result, setResult] = useState<MagicLinkResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [redirectUrl, setRedirectUrl] = useState<string>('/account');

  useEffect(() => {
    const token = searchParams.get('token');
    const redirect = searchParams.get('redirect');
    
    if (redirect) {
      setRedirectUrl(decodeURIComponent(redirect));
    }
    
    if (!token) {
      setError('Token manquant dans l\'URL');
      setStatus('error');
      return;
    }

    verifyMagicLink(token);
  }, [searchParams]);

  const verifyMagicLink = async (token: string) => {
    try {
      setStatus('processing');
      
      console.log('🔗 Verification du Magic Link avec token:', token.substring(0, 8) + '...');
      
      // ✅ CORRECTION: Utiliser la Gateway GraphQL
      const graphqlUrl = process.env.NEXT_PUBLIC_GRAPHQL_URL || 'http://localhost:4000/graphql';
      
      const response = await fetch(graphqlUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // ✅ Ajouter les headers d'app auth si nécessaire
          'X-App-ID': process.env.NEXT_PUBLIC_AUTH_APP_ID || '',
          'X-App-Secret': process.env.NEXT_PUBLIC_AUTH_APP_SECRET || '',
          'X-Client-Name': 'auth-frontend',
        },
        credentials: 'include', // ✅ Important pour les cookies
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
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.errors) {
        throw new Error(data.errors[0].message || 'Erreur GraphQL');
      }

      const magicLinkResult = data.data?.verifyMagicLink;
      
      if (!magicLinkResult) {
        throw new Error('Réponse invalide du serveur');
      }

      setResult(magicLinkResult);

      if (magicLinkResult.success) {
        console.log('✅ Magic Link vérifié avec succès');

        // ✅ CORRECTION: Créer la session complète avec SharedSessionManager
        if (magicLinkResult.accessToken && magicLinkResult.userInfo) {
          const sessionData = {
            user: {
              userID: magicLinkResult.userInfo.sub,
              username: magicLinkResult.userInfo.preferred_username || magicLinkResult.userInfo.email,
              email: magicLinkResult.userInfo.email,
              profileID: magicLinkResult.userInfo.sub,
              accessibleOrganizations: magicLinkResult.userInfo.organization_ids || [],
              organizations: magicLinkResult.userInfo.organization_ids || [],
              sub: magicLinkResult.userInfo.sub,
              roles: magicLinkResult.userInfo.roles || [],
              given_name: magicLinkResult.userInfo.given_name,
              family_name: magicLinkResult.userInfo.family_name,
              state: magicLinkResult.userInfo.state,
              email_verified: magicLinkResult.userInfo.email_verified,
              attributes: magicLinkResult.userInfo.attributes
            },
            tokens: {
              accessToken: magicLinkResult.accessToken,
              refreshToken: magicLinkResult.refreshToken,
            },
            sessionId: `magiclink_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            expiresAt: new Date(Date.now() + (magicLinkResult.expiresIn || 3600) * 1000).toISOString(),
            lastActivity: new Date().toISOString(),
            source: 'auth' as const
          };

          // ✅ Stocker la session avec SharedSessionManager
          SharedSessionManager.storeSession(sessionData);

          console.log('✅ Session cross-app créée via Magic Link');

          // ✅ Stocker aussi dans localStorage pour compatibilité
          localStorage.setItem('access_token', magicLinkResult.accessToken);
          
          if (magicLinkResult.refreshToken) {
            localStorage.setItem('refresh_token', magicLinkResult.refreshToken);
          }
        }

        // Vérifier si MFA est requis
        if (magicLinkResult.requiresMFA) {
          console.log('🔐 MFA requis, redirection vers page MFA');
          setStatus('success');
          // Ici vous pourriez rediriger vers une page MFA
          return;
        }

        setStatus('success');
        
        // ✅ CORRECTION: Redirection vers le dashboard externe
        setTimeout(() => {
          setStatus('redirect');
          const dashboardUrl = process.env.NEXT_PUBLIC_DASHBOARD_URL || 'http://localhost:3002';
          const finalRedirectUrl = redirectUrl === '/account' ? '/account' : redirectUrl;
          
          console.log('🚀 Redirection vers Dashboard:', `${dashboardUrl}${finalRedirectUrl}`);
          
          // ✅ Redirection vers l'application externe
          window.location.href = `${dashboardUrl}${finalRedirectUrl}`;
        }, 2000);
        
      } else {
        setError(magicLinkResult.message || 'Échec de la vérification du Magic Link');
        setStatus('error');
      }
      
    } catch (error: any) {
      console.error('❌ Erreur lors de la vérification du Magic Link:', error);
      setError(error.message || 'Erreur de connexion au serveur');
      setStatus('error');
    }
  };

  const handleRetry = () => {
    const token = searchParams.get('token');
    if (token) {
      verifyMagicLink(token);
    }
  };

  const handleGoToLogin = () => {
    router.push('/signin');
  };

  const handleManualRedirect = () => {
    const dashboardUrl = process.env.NEXT_PUBLIC_DASHBOARD_URL || 'http://localhost:3002';
    const finalRedirectUrl = redirectUrl === '/account' ? '/account' : redirectUrl;
    window.location.href = `${dashboardUrl}${finalRedirectUrl}`;
  };

  if (status === 'processing') {
    return <MagicLinkProcessing />;
  }

  if (status === 'success' || status === 'redirect') {
    return (
      <MagicLinkSuccess 
        result={result}
        redirectUrl={redirectUrl}
        isRedirecting={status === 'redirect'}

      />
    );
  }

  if (status === 'error') {
    return (
      <MagicLinkError 
        error={error || 'Une erreur inconnue est survenue'}
        onRetry={handleRetry}
        onGoToLogin={handleGoToLogin}
      />
    );
  }

  return null;
}