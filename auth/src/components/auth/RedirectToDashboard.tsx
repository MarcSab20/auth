// auth/src/components/auth/RedirectToDashboard.tsx
'use client';

import { useState } from 'react';
import { useEnhancedAuth } from '@/context/authenticationContext';
import { Button } from '@/src/components/landing-page/Button';

interface RedirectToDashboardProps {
  className?: string;
  returnUrl?: string;
  children?: React.ReactNode;
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export function RedirectToDashboard({
  className = "",
  returnUrl = "/account",
  children,
  variant = "primary",
  size = "md",
  showIcon = true
}: RedirectToDashboardProps) {
  const { redirectToDashboard, isAuthenticated, isLoading } = useEnhancedAuth();
  const [isRedirecting, setIsRedirecting] = useState(false);

  const handleRedirect = async () => {
    if (!isAuthenticated) {
      console.warn('❌ [REDIRECT] Utilisateur non authentifié');
      return;
    }

    try {
      setIsRedirecting(true);
      console.log('🚀 [REDIRECT] Redirection vers Dashboard...');
      await redirectToDashboard(returnUrl);
    } catch (error: any) {
      console.error('❌ [REDIRECT] Erreur redirection:', error);
      setIsRedirecting(false);
    }
  };

  const isDisabled = !isAuthenticated || isLoading || isRedirecting;

  const buttonContent = children || (
    <span className="flex items-center">
      {showIcon && (
        <svg 
          className="mr-2 h-4 w-4" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M9 5l7 7-7 7" 
          />
        </svg>
      )}
      {isRedirecting ? 'Redirection en cours...' : 'Accéder au Dashboard'}
    </span>
  );

  const loadingIndicator = isRedirecting && (
    <svg 
      className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" 
      xmlns="http://www.w3.org/2000/svg" 
      fill="none" 
      viewBox="0 0 24 24"
    >
      <circle 
        className="opacity-25" 
        cx="12" 
        cy="12" 
        r="10" 
        stroke="currentColor" 
        strokeWidth="4"
      />
      <path 
        className="opacity-75" 
        fill="currentColor" 
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );

  return (
    <Button
      onClick={handleRedirect}
      disabled={isDisabled}
      className={`${className} ${isRedirecting ? 'opacity-75 cursor-wait' : ''}`}
      data-variant={variant}
      data-size={size}
    >
      {isRedirecting ? (
        <span className="flex items-center">
          {loadingIndicator}
          Redirection...
        </span>
      ) : (
        buttonContent
      )}
    </Button>
  );
}

// Composant pour l'intégration dans les formulaires de connexion
export function PostLoginRedirect() {
  const { isAuthenticated, user, redirectToDashboard } = useEnhancedAuth();
  const [isRedirecting, setIsRedirecting] = useState(false);

  if (!isAuthenticated || !user) {
    return null;
  }

  const handleRedirect = async () => {
    setIsRedirecting(true);
    try {
      await redirectToDashboard('/account');
    } catch (error) {
      setIsRedirecting(false);
    }
  };

  return (
    <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-green-800">
              Connexion réussie !
            </p>
            <p className="text-xs text-green-600 mt-1">
              Bienvenue {user.username}
            </p>
          </div>
        </div>
        
        <button
          onClick={handleRedirect}
          disabled={isRedirecting}
          className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-green-700 bg-green-100 hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors disabled:opacity-50"
        >
          {isRedirecting ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
              </svg>
              Redirection...
            </>
          ) : (
            <>
              Tableau de bord
              <svg className="ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </>
          )}
        </button>
      </div>
    </div>
  );
}

// Hook pour la redirection automatique
export function useAutoRedirectToDashboard(delay: number = 3000) {
  const { isAuthenticated, redirectToDashboard } = useEnhancedAuth();
  const [countdown, setCountdown] = useState(Math.floor(delay / 1000));
  const [isActive, setIsActive] = useState(false);

  const startAutoRedirect = () => {
    if (!isAuthenticated) return;
    
    setIsActive(true);
    setCountdown(Math.floor(delay / 1000));
    
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          redirectToDashboard('/account');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  };

  const cancelAutoRedirect = () => {
    setIsActive(false);
    setCountdown(Math.floor(delay / 1000));
  };

  return {
    countdown,
    isActive,
    startAutoRedirect,
    cancelAutoRedirect
  };
}