// auth/src/app/(auth)/oauth/success/OAuthSuccessContent.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEnhancedAuth } from '@/context/authenticationContext';
import { AUTH_CONFIG } from '@/src/config/auth.config';

interface SuccessState {
  status: 'loading' | 'success' | 'error';
  message: string;
  countdown?: number;
  error?: string;
}

export default function OAuthSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { state: authState } = useEnhancedAuth();
  
  const [successState, setSuccessState] = useState<SuccessState>({
    status: 'loading',
    message: 'Finalisation de votre connexion...',
  });

  const action = searchParams.get('action') || 'login';
  const provider = searchParams.get('provider') || 'github';

  useEffect(() => {
    const finalizeOAuthProcess = async () => {
      try {
        // Vérifier si l'utilisateur est bien authentifié
        if (!authState.isAuthenticated || !authState.user) {
          throw new Error('Utilisateur non authentifié après OAuth');
        }

        console.log('✅ [OAUTH-SUCCESS] User authenticated:', authState.user.username);

        setSuccessState({
          status: 'success',
          message: `Connexion ${provider} réussie !`,
          countdown: 3,
        });

        // Démarrer le compte à rebours
        let countdown = 3;
        const countdownInterval = setInterval(() => {
          countdown -= 1;
          setSuccessState(prev => ({
            ...prev,
            countdown,
            message: `Redirection vers le dashboard dans ${countdown} seconde${countdown !== 1 ? 's' : ''}...`
          }));

          if (countdown <= 0) {
            clearInterval(countdownInterval);
            
            // Redirection vers dashboard
            const dashboardUrl = AUTH_CONFIG.DASHBOARD_URL + '/account';
            console.log('🚀 [OAUTH-SUCCESS] Redirecting to dashboard:', dashboardUrl);
            window.location.href = dashboardUrl;
          }
        }, 1000);

      } catch (error: any) {
        console.error('❌ [OAUTH-SUCCESS] Error finalizing OAuth:', error);
        
        setSuccessState({
          status: 'error',
          message: 'Erreur lors de la finalisation OAuth',
          error: error.message,
        });
      }
    };

    // Attendre un peu pour s'assurer que le contexte auth est à jour
    const timer = setTimeout(finalizeOAuthProcess, 1000);
    
    return () => clearTimeout(timer);
  }, [authState.isAuthenticated, authState.user, provider]);

  const handleManualRedirect = () => {
    const dashboardUrl = AUTH_CONFIG.DASHBOARD_URL + '/account';
    window.location.href = dashboardUrl;
  };

  const handleRetry = () => {
    router.push('/signin');
  };

  const getProviderIcon = () => {
    switch (provider) {
      case 'github':
        return (
          <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
          </svg>
        );
      case 'google':
        return (
          <svg className="w-8 h-8" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
        );
      default:
        return null;
    }
  };

  const getProviderDisplayName = () => {
    switch (provider) {
      case 'github':
        return 'GitHub';
      case 'google':
        return 'Google';
      default:
        return provider;
    }
  };

  const getActionText = () => {
    return action === 'login' ? 'Connexion' : 'Inscription';
  };

  const getStatusIcon = () => {
    switch (successState.status) {
      case 'loading':
        return (
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto">
          </div>
        );
      case 'success':
        return (
          <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center mx-auto">
            <svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        );
      case 'error':
        return (
          <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center mx-auto">
            <svg className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          {/* Provider icon */}
          <div className="mb-6 flex justify-center">
            <div className="p-3 bg-white rounded-full border border-gray-200 shadow-sm">
              {getProviderIcon()}
            </div>
          </div>

          {/* Status icon */}
          <div className="mb-6">
            {getStatusIcon()}
          </div>

          {/* Title */}
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {successState.status === 'loading' && 'Finalisation en cours...'}
            {successState.status === 'success' && `${getActionText()} réussie !`}
            {successState.status === 'error' && 'Erreur OAuth'}
          </h2>

          {/* Message */}
          <p className="text-gray-600 mb-6">
            {successState.message}
          </p>

          {/* User info si disponible */}
          {successState.status === 'success' && authState.user && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center justify-center space-x-3 mb-2">
                <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                  <svg className="h-4 w-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium text-green-900">
                    Bienvenue {authState.user.given_name} {authState.user.family_name}
                  </p>
                  <p className="text-xs text-green-700">
                    {authState.user.email}
                  </p>
                </div>
              </div>
              
              {successState.countdown !== undefined && (
                <div className="text-center">
                  <div className="inline-flex items-center space-x-2 text-green-600">
                    <div className="text-lg font-bold">
                      {successState.countdown}
                    </div>
                    <span className="text-sm">
                      seconde{successState.countdown !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Détails de l'erreur */}
          {successState.status === 'error' && successState.error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start space-x-3">
                <svg className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <div className="text-left">
                  <p className="text-sm font-medium text-red-900">
                    Détail de l'erreur
                  </p>
                  <p className="text-xs text-red-700 mt-1">
                    {successState.error}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Actions selon le statut */}
          {successState.status === 'success' && (
            <div className="space-y-3">
              <button
                onClick={handleManualRedirect}
                className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                Accéder au dashboard maintenant
                <svg className="ml-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          )}

          {successState.status === 'error' && (
            <div className="space-y-3">
              <button
                onClick={handleRetry}
                className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Réessayer la connexion
              </button>
            </div>
          )}

          {/* Informations sur la sécurité */}
          <div className="mt-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="text-left space-y-2">
              <h3 className="text-sm font-medium text-gray-900 flex items-center">
                <svg className="h-4 w-4 mr-2 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {getActionText()} sécurisée via {getProviderDisplayName()}
              </h3>
              <ul className="text-xs text-gray-600 space-y-1">
                <li>• Authentification OAuth 2.0</li>
                <li>• Session chiffrée et sécurisée</li>
                <li>• Données utilisateur protégées</li>
                <li>• Accès cross-application maintenu</li>
              </ul>
            </div>
          </div>

          {/* Debug info en développement */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-6 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="text-left">
                <h4 className="text-xs font-medium text-yellow-900 mb-2">
                  🔧 Debug Info (Development)
                </h4>
                <div className="text-xs text-yellow-700 space-y-1">
                  <p><strong>Status:</strong> {successState.status}</p>
                  <p><strong>Provider:</strong> {provider}</p>
                  <p><strong>Action:</strong> {action}</p>
                  <p><strong>Auth State:</strong> {authState.isAuthenticated ? 'Authenticated' : 'Not Authenticated'}</p>
                  <p><strong>User:</strong> {authState.user?.username || 'N/A'}</p>
                  <p><strong>Email:</strong> {authState.user?.email || 'N/A'}</p>
                </div>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-500 mb-3">
              Authentification OAuth via {getProviderDisplayName()}
            </p>
            <div className="flex items-center justify-center space-x-4 text-xs">
              <a 
                href="mailto:support@services.com" 
                className="text-blue-600 hover:text-blue-800 flex items-center"
              >
                <svg className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Support
              </a>
              <span className="text-gray-300">|</span>
              <a 
                href="/help" 
                className="text-blue-600 hover:text-blue-800 flex items-center"
              >
                <svg className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Aide
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}