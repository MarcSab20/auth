// auth/src/app/(auth)/transition/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useEnhancedAuth } from '@/context/authenticationContext';
import { SharedSessionManager } from '@/src/lib/SharedSessionManager';

interface TransitionState {
  status: 'checking' | 'authenticated' | 'redirecting' | 'error';
  message: string;
  countdown: number;
  error?: string;
}

export default function TransitionPage() {
  const searchParams = useSearchParams();
  const { state } = useEnhancedAuth();
  const [transitionState, setTransitionState] = useState<TransitionState>({
    status: 'checking',
    message: 'Vérification de la session...',
    countdown: 0,
  });

  const returnUrl = searchParams.get('returnUrl') || '/account';
  const dashboardUrl = process.env.NEXT_PUBLIC_DASHBOARD_URL || 'http://localhost:3000';

  useEffect(() => {
    const handleTransition = async () => {
      try {
        // Attendre que l'authentification soit complète
        if (state.isLoading) {
          return;
        }

        if (!state.isAuthenticated || !state.user) {
          setTransitionState({
            status: 'error',
            message: 'Session non valide',
            countdown: 0,
            error: 'Utilisateur non authentifié'
          });
          return;
        }

        console.log('🔄 [TRANSITION] Préparation de la session pour le dashboard...');
        
        setTransitionState({
          status: 'authenticated',
          message: 'Session validée, préparation de la redirection...',
          countdown: 0,
        });

        // Créer les données de session complètes
        const sessionData = {
          user: {
            userID: state.user.userID,
            username: state.user.username,
            email: state.user.email,
            profileID: state.user.profileID,
            accessibleOrganizations: state.user.accessibleOrganizations || [],
            organizations: state.user.organizations || [],
            sub: state.user.sub,
            roles: state.user.roles || [],
            given_name: state.user.given_name,
            family_name: state.user.family_name,
            state: state.user.state,
            email_verified: state.user.email_verified,
          },
          tokens: {
            accessToken: state.token!,
            refreshToken: state.refreshToken || undefined,
            appToken: localStorage.getItem('smp_app_access_token') || undefined,
          },
          sessionId: SharedSessionManager.generateSessionId(),
          expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 minutes
          lastActivity: new Date().toISOString(),
        };

        // Stocker la session pour partage cross-app
        SharedSessionManager.storeSession(sessionData);
        
        console.log('✅ [TRANSITION] Session stockée, démarrage redirection');
        
        setTransitionState({
          status: 'redirecting',
          message: 'Redirection vers le dashboard...',
          countdown: 3,
        });

        // Compte à rebours de redirection
        let countdown = 3;
        const countdownInterval = setInterval(() => {
          countdown -= 1;
          setTransitionState(prev => ({
            ...prev,
            countdown,
            message: `Redirection vers le dashboard dans ${countdown} seconde${countdown !== 1 ? 's' : ''}...`
          }));

          if (countdown <= 0) {
            clearInterval(countdownInterval);
            
            // Construire l'URL de redirection
            const targetUrl = new URL(returnUrl, dashboardUrl);
            targetUrl.searchParams.set('from', 'auth');
            targetUrl.searchParams.set('sessionId', sessionData.sessionId);
            
            console.log('🚀 [TRANSITION] Redirection vers:', targetUrl.toString());
            window.location.href = targetUrl.toString();
          }
        }, 1000);

      } catch (error: any) {
        console.error('❌ [TRANSITION] Erreur transition:', error);
        setTransitionState({
          status: 'error',
          message: 'Erreur lors de la transition',
          countdown: 0,
          error: error.message || 'Erreur inconnue'
        });
      }
    };

    handleTransition();
  }, [state, returnUrl, dashboardUrl]);

  const handleManualRedirect = () => {
    const targetUrl = new URL(returnUrl, dashboardUrl);
    targetUrl.searchParams.set('from', 'auth');
    window.location.href = targetUrl.toString();
  };

  const handleRetryAuth = () => {
    window.location.href = '/signin';
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
        return 'Vérification en cours...';
      case 'authenticated':
        return 'Authentification réussie !';
      case 'redirecting':
        return 'Redirection en cours...';
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

          {/* Informations utilisateur (si authentifié) */}
          {state.user && transitionState.status !== 'error' && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="text-sm text-blue-900">
                <p><strong>Utilisateur:</strong> {state.user.username}</p>
                <p><strong>Email:</strong> {state.user.email}</p>
                <p><strong>Destination:</strong> Dashboard Services</p>
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
                  onClick={handleRetryAuth}
                  className="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                  <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Réessayer la connexion
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

          {/* Debug info (development only) */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-6 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="text-left">
                <h4 className="text-xs font-medium text-yellow-900 mb-2">
                  🔧 Debug Info (Development)
                </h4>
                <div className="text-xs text-yellow-700 space-y-1">
                  <p><strong>Status:</strong> {transitionState.status}</p>
                  <p><strong>Return URL:</strong> {returnUrl}</p>
                  <p><strong>Dashboard URL:</strong> {dashboardUrl}</p>
                  <p><strong>Session ID:</strong> {state.user?.sub?.substring(0, 8)}...</p>
                  <p><strong>Has Access Token:</strong> {state.token ? 'Oui' : 'Non'}</p>
                  <p><strong>Has Refresh Token:</strong> {state.refreshToken ? 'Oui' : 'Non'}</p>
                </div>
              </div>
            </div>
          )}

          {/* Footer avec informations */}
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