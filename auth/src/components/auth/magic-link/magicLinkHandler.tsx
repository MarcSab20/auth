"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEnhancedAuth } from "@/context/authenticationContext";
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
  const { state } = useEnhancedAuth();
  
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
      
      // Appel vers votre API GraphQL
      const response = await fetch('http://localhost:3001/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
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
        // Stocker les tokens si fournis
        if (magicLinkResult.accessToken) {
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
        
        // Redirection automatique après un délai
        setTimeout(() => {
          setStatus('redirect');
          router.push(redirectUrl);
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