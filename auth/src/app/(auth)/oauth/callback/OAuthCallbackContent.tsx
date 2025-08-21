// auth/src/app/(auth)/oauth/callback/OAuthCallbackContent.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEnhancedAuth } from '@/context/authenticationContext';
import { SharedSessionManager } from '@/src/lib/SharedSessionManager';
import { AUTH_CONFIG } from '@/src/config/auth.config';

interface CallbackState {
  status: 'loading' | 'processing' | 'success' | 'error';
  message: string;
  error?: string;
  countdown?: number;
}

export default function OAuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { state: authState } = useEnhancedAuth();
  
  const [callbackState, setCallbackState] = useState<CallbackState>({
    status: 'loading',
    message: 'Traitement du callback OAuth...',
  });

  const [oauthData, setOauthData] = useState<{
    action: string;
    provider: string;
    state: string;
  } | null>(null);

  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const action = localStorage.getItem('oauth_action') || 'login';
      const provider = localStorage.getItem('oauth_provider') || 'github';
      const storedState = localStorage.getItem('oauth_state') || '';
      
      setOauthData({ action, provider, state: storedState });
      
      console.log('🔍 [OAUTH-CALLBACK] OAuth data retrieved:', {
        action,
        provider,
        hasStoredState: !!storedState,
        receivedState: state?.substring(0, 10) + '...'
      });
    }
  }, [state]);

  useEffect(() => {
    // Attendre que les données OAuth soient chargées
    if (!oauthData) return;

    const handleOAuthCallback = async () => {
      try {
        // Vérifier les paramètres d'erreur
        if (error) {
          throw new Error(errorDescription || error);
        }

        if (!code || !state) {
          throw new Error('Paramètres OAuth manquants');
        }

        // Vérifier la correspondance de l'état
        if (oauthData.state && oauthData.state !== state) {
          throw new Error('État OAuth non valide - possible attaque CSRF');
        }

        setCallbackState({
          status: 'processing',
          message: 'Traitement de l\'authentification OAuth...',
        });

        console.log(`🔄 [OAUTH-CALLBACK] Processing ${oauthData.provider} ${oauthData.action} with code:`, code.substring(0, 10) + '...');

        // Traiter le callback via votre backend
        const response = await fetch(`${AUTH_CONFIG.GRAPHQL_URL}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-App-ID': AUTH_CONFIG.AUTH_APP.APP_ID,
            'X-App-Secret': AUTH_CONFIG.AUTH_APP.APP_SECRET,
            'X-Client-Name': 'auth-app-oauth-callback',
          },
          credentials: 'include',
          body: JSON.stringify({
            query: `
              mutation HandleOAuthCallback($input: OAuthCallbackInput!) {
                handleOAuthCallback(input: $input) {
                  success
                  userInfo {
                    id
                    email
                    name
                    firstName
                    lastName
                    username
                    verified
                    provider
                    avatarUrl
                  }
                  tokens {
                    accessToken
                    refreshToken
                    tokenType
                    expiresIn
                    idToken
                  }
                  message
                }
              }
            `,
            variables: {
              input: {
                provider: oauthData.provider,
                code,
                state,
                error: error,
                errorDescription: errorDescription
              },
            },
          }),
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const result = await response.json();
        
        if (result.errors) {
          throw new Error(result.errors[0].message);
        }

        const callbackData = result.data?.handleOAuthCallback;
        
        if (!callbackData?.success) {
          throw new Error(callbackData?.message || 'Échec de l\'authentification OAuth');
        }

        console.log('✅ [OAUTH-CALLBACK] OAuth authentication successful');

        // Créer l'utilisateur avec les données reçues
        const user = {
          userID: callbackData.userInfo.id,
          username: callbackData.userInfo.username || callbackData.userInfo.email,
          email: callbackData.userInfo.email,
          profileID: callbackData.userInfo.id,
          accessibleOrganizations: [],
          organizations: [],
          sub: callbackData.userInfo.id,
          roles: ['USER'],
          given_name: callbackData.userInfo.firstName,
          family_name: callbackData.userInfo.lastName,
          state: 'ACTIVE',
          email_verified: callbackData.userInfo.verified || false,
          attributes: {
            oauth_provider: callbackData.userInfo.provider,
            oauth_username: callbackData.userInfo.username,
          }
        };

        // Créer la session
        const sessionData = SharedSessionManager.createSessionFromAuth({
          user,
          accessToken: callbackData.tokens.accessToken,
          refreshToken: callbackData.tokens.refreshToken,
        }, 'auth');

        console.log('✅ [OAUTH-CALLBACK] Session created successfully');

        setCallbackState({
          status: 'success',
          message: `Connexion ${oauthData.provider} réussie !`,
          countdown: 3,
        });

        // Nettoyer localStorage
        if (typeof window !== 'undefined') {
          localStorage.removeItem('oauth_action');
          localStorage.removeItem('oauth_provider');
          localStorage.removeItem('oauth_state');
        }

        // Démarrer le compte à rebours
        let countdown = 3;
        const countdownInterval = setInterval(() => {
          countdown -= 1;
          setCallbackState(prev => ({
            ...prev,
            countdown,
            message: `Redirection vers le dashboard dans ${countdown} seconde${countdown !== 1 ? 's' : ''}...`
          }));

          if (countdown <= 0) {
            clearInterval(countdownInterval);
            
            // Redirection vers dashboard
            const dashboardUrl = AUTH_CONFIG.DASHBOARD_URL + '/account';
            console.log('🚀 [OAUTH-CALLBACK] Redirecting to dashboard:', dashboardUrl);
            window.location.href = dashboardUrl;
          }
        }, 1000);

      } catch (error: any) {
        console.error('❌ [OAUTH-CALLBACK] Error processing callback:', error);
        
        // Nettoyer localStorage en cas d'erreur
        if (typeof window !== 'undefined') {
          localStorage.removeItem('oauth_action');
          localStorage.removeItem('oauth_provider');
          localStorage.removeItem('oauth_state');
        }
        
        setCallbackState({
          status: 'error',
          message: 'Erreur lors de l\'authentification OAuth',
          error: error.message || 'Erreur inconnue',
        });
      }
    };

    handleOAuthCallback();
  }, [code, state, error, errorDescription, oauthData]);

  const handleRetry = () => {
    router.push('/signin');
  };

  const handleManualRedirect = () => {
    const dashboardUrl = AUTH_CONFIG.DASHBOARD_URL + '/account';
    window.location.href = dashboardUrl;
  };

  const getStatusIcon = () => {
    switch (callbackState.status) {
      case 'loading':
      case 'processing':
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

  const getStatusTitle = () => {
    switch (callbackState.status) {
      case 'loading':
        return 'Initialisation...';
      case 'processing':
        return 'Authentification en cours...';
      case 'success':
        return 'Connexion réussie !';
      case 'error':
        return 'Erreur d\'authentification';
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
            {callbackState.message}
          </p>

          {/* Compte à rebours pour succès */}
          {callbackState.status === 'success' && callbackState.countdown !== undefined && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center justify-center space-x-2 text-green-600 mb-2">
                <div className="text-lg font-bold">
                  {callbackState.countdown}
                </div>
                <span className="text-sm font-medium">
                  seconde{callbackState.countdown !== 1 ? 's' : ''}
                </span>
              </div>
              <p className="text-xs text-green-700">
                Redirection automatique vers le dashboard
              </p>
            </div>
          )}

          {/* Détails de l'erreur */}
          {callbackState.status === 'error' && callbackState.error && (
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
                    {callbackState.error}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Actions selon le statut */}
          {callbackState.status === 'error' && (
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

          {/* Action manuelle pour succès */}
          {callbackState.status === 'success' && (
            <div className="mt-6">
              <button
                onClick={handleManualRedirect}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                Accéder au dashboard maintenant
                <svg className="ml-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          )}

          {/* Debug info en développement */}
          {process.env.NODE_ENV === 'development' && oauthData && (
            <div className="mt-6 p-3 bg-gray-50 rounded-lg border border-gray-200">
              <div className="text-left">
                <h4 className="text-xs font-medium text-gray-900 mb-2">
                  🔧 Debug Info (Development)
                </h4>
                <div className="text-xs text-gray-600 space-y-1">
                  <p><strong>Status:</strong> {callbackState.status}</p>
                  <p><strong>Code:</strong> {code ? code.substring(0, 10) + '...' : 'N/A'}</p>
                  <p><strong>State:</strong> {state ? state.substring(0, 10) + '...' : 'N/A'}</p>
                  <p><strong>Error:</strong> {error || 'None'}</p>
                  <p><strong>Provider:</strong> {oauthData.provider}</p>
                  <p><strong>Action:</strong> {oauthData.action}</p>
                  <p><strong>State Match:</strong> {oauthData.state === state ? '✅ Valid' : '❌ Invalid'}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}