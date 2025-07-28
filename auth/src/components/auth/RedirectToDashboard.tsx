'use client';

import { useState } from 'react';
import { useAuth } from '@/context/authenticationContext';
import { TransitionService } from '@/src/lib/TransitionService';

export function RedirectToDashboard({ 
  returnUrl = "/account",
  children = "Accéder au Dashboard",
  className = ""
}) {
  const { state } = useAuth();
  const [isRedirecting, setIsRedirecting] = useState(false);

  const handleRedirect = () => {
    if (!state.isAuthenticated || !state.user || !state.token) {
      console.warn('❌ Utilisateur non authentifié');
      return;
    }

    try {
      setIsRedirecting(true);
      TransitionService.redirectToDashboard(
        state.user,
        state.token,
        state.refreshToken || undefined,
        returnUrl
      );
    } catch (error: any) {
      console.error('❌ Erreur redirection:', error);
      setIsRedirecting(false);
    }
  };

  if (!state.isAuthenticated) {
    return null;
  }

  return (
    <button
      onClick={handleRedirect}
      disabled={isRedirecting}
      className={`${className} ${isRedirecting ? 'opacity-75 cursor-wait' : ''}`}
    >
      {isRedirecting ? 'Redirection...' : children}
    </button>
  );
}