// dashboard/src/app/(dashboard)/transition/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/authenticationContext';
import { SharedSessionManager } from '@/src/lib/SharedSessionManager';

interface TransitionState {
  status: 'checking' | 'authenticated' | 'redirecting' | 'error';
  message: string;
  countdown: number;
  error?: string;
}

export default function TransitionPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { state, testAppAuth } = useAuth();
  
  const [transitionState, setTransitionState] = useState<TransitionState>({
    status: 'checking',
    message: 'Vérification de la session...',
    countdown: 0,
  });

  const returnUrl = searchParams.get('returnUrl') || '/account';
  const transitionToken = searchParams.get('token');
  const fromApp = searchParams.get('from');

  useEffect(() => {
    const handleTransition = async () => {
      try {
        console.log('🔄 [DASHBOARD-TRANSITION] Démarrage transition...', {
          returnUrl,
          fromApp,
          hasToken: !!transitionToken
        });

        // Étape 1: Authentifier l'app Dashboard
        setTransitionState({
          status: 'checking',
          message: 'Authentification de l\'application Dashboard...',
          countdown: 0,
        });

        const appAuthResult = await testAppAuth();
        if (!appAuthResult.success) {
          throw new Error(`Authentification app Dashboard échouée: ${appAuthResult.error}`);
        }

        // Étape 2: Finaliser la transition
        setTransitionState({
          status: 'checking',
          message: 'Récupération de la session utilisateur...',
          countdown: 0,
        });

        const sessionData = SharedSessionManager.completeTransition();
        
        if (!sessionData || !SharedSessionManager.isSessionValid(sessionData)) {
          throw new Error('Session invalide ou expirée');
        }

        console.log('✅ [DASHBOARD-TRANSITION] Session récupérée:', {
          userId: sessionData.user.userID,
          source: sessionData.source
        });

        // Étape 3: Attendre que le contexte auth soit mis à jour
        setTransitionState({
          status: 'authenticated',
          message: 'Session validée, préparation de la redirection...',
          countdown: 0,
        });

        // Petite attente pour laisser le contexte se mettre à jour
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Étape 4: Redirection
        setTransitionState({
          status: 'redirecting',
          message: 'Redirection vers le tableau de bord...',
          countdown: 3,
        });

        // Compte à rebours de redirection
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

    // Démarrer la transition après un petit délai
    const timeout = setTimeout(handleTransition, 500);
    
    return () => clearTimeout(timeout);
  }, [testAppAuth, returnUrl, transitionToken, fromApp, router]);

  const handleManualRedirect = () => {
    console.log('🚀 [DASHBOARD-TRANSITION] Redirection manuelle vers:', returnUrl);
    router.push(returnUrl);
  };

  const handleRetryAuth = () => {
    const authUrl = process.env.NEXT_PUBLIC_AUTH_URL || 'http://localhost:3001';
    window.location.href = `${authUrl}/signin?returnUrl=${encodeURIComponent(returnUrl)}`;
  };

  const getStatusIcon = () => {
    switch (transitionState.status) {
      case 'checking':
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
      case 'checking':
        return 'Connexion en cours...';
      case 'authenticated':
        return 'Connexion réussie !';
      case 'redirecting':
        return 'Redirection en cours...';
      case 'error':
        return 'Erreur de connexion';
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

          {/* Informations de transition */}
          {fromApp && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="text-sm text-blue-900">
                <p><strong>Provenance:</strong> Application {fromApp}</p>
                <p><strong>Destination:</strong> {returnUrl}</p>
                <p><strong>Type:</strong> Transition sécurisée</p>
              </div>
            </div>
          )}

          {/* Informations utilisateur si disponible */}
          {state.user && transitionState.status !== 'error' && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="text-sm text-green-900">
                <p><strong>Utilisateur:</strong> {state.user.username}</p>
                <p><strong>Email:</strong> {state.user.email}</p>
                <p><strong>Organisations:</strong> {state.user.accessibleOrganizations?.length || 0}</p>
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
                      <p className="text-xs text-red-700 mt-1 font-mono bg-red-100 p-2 rounded">
                        {transitionState.error}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Boutons d'action pour les erreurs */}
              <div className="space-y-3">
                <button
                  onClick={handleManualRedirect}
                  className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                  <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  Continuer vers le Dashboard
                </button>
                
                <button
                  onClick={handleRetryAuth}
                  className="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                  <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Retourner à la connexion
                </button>
              </div>
            </div>
          )}

          {/* Action manuelle pour la redirection (si pas d'erreur) */}
          {transitionState.status === 'redirecting' && (
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

          {/* Informations de sécurité */}
          {transitionState.status !== 'error' && (
            <div className="mt-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="text-left space-y-2">
                <h3 className="text-sm font-medium text-gray-900 flex items-center">
                  <svg className="h-4 w-4 mr-2 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Transition sécurisée
                </h3>
                <ul className="text-xs text-gray-600 space-y-1">
                  <li>• Session chiffrée et vérifiée</li>
                  <li>• Transfert sécurisé des données utilisateur</li>
                  <li>• Authentification maintenue entre applications</li>
                  <li>• Accès aux organisations préservé</li>
                </ul>
              </div>
            </div>
          )}

          {/* Informations techniques de debug (development seulement) */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-6 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="text-left">
                <h4 className="text-xs font-medium text-yellow-900 mb-2">
                  🔧 Debug Info (Development)
                </h4>
                <div className="text-xs text-yellow-700 space-y-1">
                  <p><strong>Status:</strong> {transitionState.status}</p>
                  <p><strong>Return URL:</strong> {returnUrl}</p>
                  <p><strong>From App:</strong> {fromApp || 'N/A'}</p>
                  <p><strong>Transition Token:</strong> {transitionToken ? transitionToken.substring(0, 8) + '...' : 'N/A'}</p>
                  <p><strong>Auth State:</strong> {state.isAuthenticated ? 'Authentifié' : 'Non authentifié'}</p>
                  <p><strong>User ID:</strong> {state.user?.userID?.substring(0, 8) || 'N/A'}...</p>
                  <p><strong>Session ID:</strong> {state.user?.sub?.substring(0, 8) || 'N/A'}...</p>
                </div>
              </div>
            </div>
          )}

          {/* Timeline de transition */}
          {transitionState.status !== 'error' && (
            <div className="mt-8 p-4 bg-indigo-50 rounded-lg border border-indigo-200">
              <div className="text-left">
                <h3 className="text-sm font-medium text-indigo-900 mb-3">
                  Progression de la transition
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center text-xs">
                    <div className="h-2 w-2 bg-green-500 rounded-full mr-2"></div>
                    <span className="text-indigo-700">Authentification application ✓</span>
                  </div>
                  <div className="flex items-center text-xs">
                    <div className={`h-2 w-2 rounded-full mr-2 ${
                      transitionState.status === 'checking' ? 'bg-blue-500 animate-pulse' : 'bg-green-500'
                    }`}></div>
                    <span className="text-indigo-700">
                      Récupération session {transitionState.status !== 'checking' ? '✓' : '...'}
                    </span>
                  </div>
                  <div className="flex items-center text-xs">
                    <div className={`h-2 w-2 rounded-full mr-2 ${
                      transitionState.status === 'redirecting' ? 'bg-blue-500 animate-pulse' : 
                      transitionState.status === 'authenticated' ? 'bg-green-500' : 'bg-gray-300'
                    }`}></div>
                    <span className="text-indigo-700">
                      Redirection {transitionState.status === 'redirecting' ? '...' : 
                      transitionState.status === 'authenticated' ? '✓' : ''}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Footer avec informations de support */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-500 mb-3">
              Transition automatique entre applications Services
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