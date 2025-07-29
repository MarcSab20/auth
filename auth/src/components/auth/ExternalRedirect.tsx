// auth/src/components/auth/ExternalRedirect.tsx
'use client';

import { useEffect } from 'react';
import { useAuth } from '@/context/authenticationContext';

interface ExternalRedirectProps {
  targetUrl: string;
  fallbackUrl?: string;
  message?: string;
}

export default function ExternalRedirect({ 
  targetUrl, 
  fallbackUrl = '/signin',
  message = 'Redirection en cours...'
}: ExternalRedirectProps) {
  const { state } = useAuth();

  useEffect(() => {
    const handleRedirect = () => {
      if (state.isAuthenticated && state.user && state.token) {
        console.log('🚀 [EXTERNAL-REDIRECT] Redirection vers:', targetUrl);
        
        // Utiliser la méthode de redirection avec transition
        try {
          // Redirection externe vers le dashboard
          window.location.href = targetUrl;
        } catch (error) {
          console.error('❌ [EXTERNAL-REDIRECT] Erreur redirection:', error);
          // Fallback vers une route locale
          window.location.href = fallbackUrl;
        }
      } else {
        console.log('ℹ️ [EXTERNAL-REDIRECT] Utilisateur non authentifié, redirection vers:', fallbackUrl);
        window.location.href = fallbackUrl;
      }
    };

    // Attendre un petit délai pour s'assurer que le contexte est prêt
    const timer = setTimeout(handleRedirect, 1000);
    
    return () => clearTimeout(timer);
  }, [state.isAuthenticated, state.user, state.token, targetUrl, fallbackUrl]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p className="text-gray-600 mb-2">{message}</p>
        {state.user && (
          <p className="text-sm text-gray-500">
            Redirection vers le dashboard pour {state.user.username}...
          </p>
        )}
      </div>
    </div>
  );
}