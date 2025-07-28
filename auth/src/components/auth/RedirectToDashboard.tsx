'use client';

import { useState } from 'react';
import { useAuth } from '@/context/authenticationContext';

interface RedirectToDashboardProps {
  returnUrl?: string;
  children: React.ReactNode;
  className?: string;
}

export function RedirectToDashboard({ 
  returnUrl = '/account', 
  children, 
  className = '' 
}: RedirectToDashboardProps) {
  const { redirectToDashboard, state } = useAuth();
  const [isRedirecting, setIsRedirecting] = useState(false);

  const handleRedirect = async () => {
    if (!state.isAuthenticated) {
      console.warn('Utilisateur non authentifié');
      return;
    }

    setIsRedirecting(true);
    try {
      await redirectToDashboard(returnUrl);
    } catch (error) {
      console.error('Erreur redirection:', error);
      setIsRedirecting(false);
    }
  };

  return (
    <button
      onClick={handleRedirect}
      disabled={!state.isAuthenticated || isRedirecting}
      className={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-md ${
        state.isAuthenticated 
          ? 'text-white bg-blue-600 hover:bg-blue-700' 
          : 'text-gray-400 bg-gray-300 cursor-not-allowed'
      } ${className}`}
    >
      {isRedirecting ? (
        <>
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Redirection...
        </>
      ) : (
        children
      )}
    </button>
  );
}