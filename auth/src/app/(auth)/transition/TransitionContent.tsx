// auth/src/app/(auth)/transition/TransitionContent.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/authenticationContext';
import { SharedSessionManager } from '@/src/lib/SharedSessionManager';

interface TransitionState {
  status: 'loading' | 'validating' | 'authenticated' | 'redirecting' | 'error';
  message: string;
  countdown: number;
  error?: string;
}

export default function TransitionContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { state } = useAuth();
  
  const [transitionState, setTransitionState] = useState<TransitionState>({
    status: 'loading',
    message: 'Initialisation de la transition...',
    countdown: 0,
  });

  const returnUrl = searchParams.get('returnUrl') || '/account';
  const fromApp = searchParams.get('from') || 'auth';
  const transitionToken = searchParams.get('token');

  useEffect(() => {
    const handleTransition = async () => {
      try {
        console.log('🔄 [DASHBOARD-TRANSITION] Démarrage transition depuis', fromApp);
        
        setTransitionState({
          status: 'validating',
          message: 'Validation de la session...',
          countdown: 0,
        });

        // 1. Finaliser la transition avec SharedSessionManager
        const sessionData = SharedSessionManager.completeTransition();
        
        if (!sessionData) {
          throw new Error('Aucune session valide trouvée pour la transition');
        }

        console.log('✅ [DASHBOARD-TRANSITION] Session récupérée:', {
          userId: sessionData.user.userID,
          source: sessionData.source
        });

        setTransitionState({
          status: 'authenticated',
          message: 'Session validée avec succès !',
          countdown: 0,
        });

        // 2. Attendre que le contexte d'authentification soit prêt
        await new Promise(resolve => {
          const checkAuth = () => {
            if (state.isAuthenticated && state.user) {
              resolve(true);
            } else {
              setTimeout(checkAuth, 100);
            }
          };
          checkAuth();
        });

        console.log('✅ [DASHBOARD-TRANSITION] Contexte d\'authentification prêt');
        
        setTransitionState({
          status: 'redirecting',
          message: 'Redirection vers le Dashboard...',
          countdown: 3,
        });

        // 3. Compte à rebours de redirection
        let countdown = 3;
        const countdownInterval = setInterval(() => {
          countdown -= 1;
          setTransitionState(prev => ({
            ...prev,
            countdown,
            message: `Redirection dans ${countdown} seconde${countdown !== 1 ? 's' : ''}...`
          }));

          if (countdown <= 0) {
            clearInterval(countdownInterval);
            console.log('🚀 [DASHBOARD-TRANSITION] Redirection vers:', returnUrl);
            router.push(returnUrl);
          }
        }, 1000);

      } catch (error: any) {
        console.error('❌ [DASHBOARD-TRANSITION] Erreur transition:', error);
        setTransitionState({
          status: 'error',
          message: 'Erreur lors de la transition',
          countdown: 0,
          error: error.message || 'Erreur inconnue'
        });
      }
    };

    handleTransition();
  }, [fromApp, returnUrl, router, state.isAuthenticated, state.user]);

  const handleManualRedirect = () => {
    router.push(returnUrl);
  };

  const handleRetryTransition = () => {
    window.location.reload();
  };

  const getStatusIcon = () => {
    switch (transitionState.status) {
      case 'loading':
      case 'validating':
        return (
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto">
          </div>
        );
      case 'authenticated':
        return (
          <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center mx-auto">
            <svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        );
      case 'redirecting':
        return (
          <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center mx-auto">
            <div className="text-lg font-bold text-blue-600">
              {transitionState.countdown}
            </div>
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

  const getStatusTitle = () => {
    switch (transitionState.status) {
      case 'loading':
        return 'Chargement...';
      case 'validating':
        return 'Validation en cours...';
      case 'authenticated':
        return 'Session validée !';
      case 'redirecting':
        return 'Redirection...';
      case 'error':
        return 'Erreur de transition';
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          {/* Icône de statut */}
          <div className="mb-6">
            {getStatusIcon()}
          </div>

          {/* Titre */}
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {getStatusTitle()}
          </h2>

          {/* Message */}
          <p className="text-gray-600 mb-6">
            {transitionState.message}
          </p>

          {/* Informations utilisateur (si disponible) */}
          {state.user && transitionState.status !== 'error' && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="text-sm text-blue-900">
                <p><strong>Utilisateur:</strong> {state.user.username}</p>
                <p><strong>Email:</strong> {state.user.email}</p>
                <p><strong>Destination:</strong> {returnUrl}</p>
                <p><strong>Source:</strong> Application {fromApp}</p>
              </div>
            </div>
          )}

          {/* Actions selon le statut */}
          {transitionState.status === 'error' && (
            <div className="space-y-4">
              {/* Détails de l'erreur */}
              {transitionState.error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <svg className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    <div className="text-left">
                      <p className="text-sm font-medium text-red-900">
                        Détail de l'erreur
                      </p>
                      <p className="text-xs text-red-700 mt-1">
                        {transitionState.error}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Boutons d'action */}
              <div className="space-y-3">
                <button
                  onClick={handleManualRedirect}
                  className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                  <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  Continuer manuellement
                </button>
                
                <button
                  onClick={handleRetryTransition}
                  className="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                  <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Réessayer la transition
                </button>
              </div>
            </div>
          )}

          {/* Action manuelle pour la redirection */}
          {(transitionState.status === 'redirecting' || transitionState.status === 'authenticated') && (
            <div className="mt-6">
              <button
                onClick={handleManualRedirect}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                Accéder maintenant
                <svg className="ml-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}