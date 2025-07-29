// dashboard/src/components/auth/AuthErrorBoundary.tsx
'use client';

import { useAuth } from '@/context/authenticationContext';
import { useState } from 'react';

interface AuthErrorBoundaryProps {
  children: React.ReactNode;
}

export default function AuthErrorBoundary({ children }: AuthErrorBoundaryProps) {
  const { state, retryAuth, skipAppAuth, redirectToAuth, clearError } = useAuth();
  const [showDetails, setShowDetails] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);

  // Si pas d'erreur d'authentification ou si authentifié, afficher les enfants
  if (state.isAuthenticated || (!state.error && !state.appAuthFailed)) {
    return <>{children}</>;
  }

  // Si chargement en cours, afficher le loader
  if (state.isLoading && !state.error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Initialisation du tableau de bord...
          </h2>
          <p className="text-gray-600">
            Connexion à la plateforme Services
          </p>
        </div>
      </div>
    );
  }

  const handleRetry = async () => {
    setIsRetrying(true);
    clearError();
    try {
      await retryAuth();
    } finally {
      setIsRetrying(false);
    }
  };

  const handleSkipAuth = () => {
    clearError();
    skipAppAuth();
  };

  const handleGoToAuth = () => {
    redirectToAuth('/account');
  };

  const isNetworkError = state.error?.includes('NetworkError') || state.error?.includes('CORS');
  const isAuthError = state.appAuthFailed || state.error?.includes('AUTH_FAILED');

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          {/* Icône d'erreur */}
          <div className="mx-auto h-16 w-16 rounded-full bg-red-100 flex items-center justify-center mb-6">
            {isNetworkError ? (
              <svg className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            ) : (
              <svg className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            )}
          </div>

          {/* Titre */}
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {isNetworkError ? 'Problème de connexion' : 'Problème d\'authentification'}
          </h2>

          {/* Message */}
          <p className="text-gray-600 mb-6">
            {isNetworkError 
              ? 'Impossible de se connecter au serveur Services. Vérifiez que la gateway est démarrée.'
              : 'Nous n\'arrivons pas à vous authentifier sur le tableau de bord.'}
          </p>

          {/* Détails de l'erreur (repliable) */}
          {state.error && (
            <div className="mb-6">
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="text-sm text-gray-500 hover:text-gray-700 flex items-center mx-auto"
              >
                <span>Détails techniques</span>
                <svg 
                  className={`ml-1 h-4 w-4 transform ${showDetails ? 'rotate-180' : ''}`} 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {showDetails && (
                <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg text-left">
                  <p className="text-xs text-red-700 font-mono break-words">
                    {state.error}
                  </p>
                  <div className="mt-2 text-xs text-red-600">
                    <p><strong>Tentatives:</strong> {state.retryCount}/3</p>
                    <p><strong>Type:</strong> {isNetworkError ? 'Réseau/CORS' : 'Authentification'}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="space-y-4">
            {/* Actions principales */}
            <div className="space-y-3">
              {isNetworkError ? (
                <>
                  <button
                    onClick={handleRetry}
                    disabled={isRetrying}
                    className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    {isRetrying ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Reconnexion...
                      </>
                    ) : (
                      <>
                        <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Réessayer la connexion
                      </>
                    )}
                  </button>

                  <button
                    onClick={handleSkipAuth}
                    className="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 9l3 3-3 3m-6 0l3-3-3-3" />
                    </svg>
                    Utiliser la session existante
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={handleGoToAuth}
                    className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                    </svg>
                    Se reconnecter
                  </button>

                  {state.retryCount < 3 && (
                    <button
                      onClick={handleRetry}
                      disabled={isRetrying}
                      className="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      {isRetrying ? 'Tentative...' : 'Réessayer l\'authentification'}
                    </button>
                  )}
                </>
              )}
            </div>

            {/* Actions secondaires */}
            <div className="border-t border-gray-200 pt-4">
              <p className="text-xs text-gray-500 mb-3">Autres options :</p>
              <div className="space-y-2">
                <button
                  onClick={() => window.location.reload()}
                  className="text-xs text-blue-600 hover:text-blue-800 underline hover:no-underline"
                >
                  Recharger la page complètement
                </button>
                <br />
                <button
                  onClick={() => {
                    localStorage.clear();
                    window.location.reload();
                  }}
                  className="text-xs text-gray-600 hover:text-gray-800 underline hover:no-underline"
                >
                  Effacer le cache et recharger
                </button>
              </div>
            </div>
          </div>

          {/* Informations d'aide */}
          <div className="mt-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="text-left space-y-2">
              <h3 className="text-sm font-medium text-gray-900">
                💡 Que faire ?
              </h3>
              {isNetworkError ? (
                <ul className="text-xs text-gray-600 space-y-1">
                  <li>• Vérifiez que la gateway (port 4000) est démarrée</li>
                  <li>• Vérifiez la configuration CORS de la gateway</li>
                  <li>• Essayez de recharger la page</li>
                  <li>• Contactez l'équipe technique si le problème persiste</li>
                </ul>
              ) : (
                <ul className="text-xs text-gray-600 space-y-1">
                  <li>• Reconnectez-vous via l'application d'authentification</li>
                  <li>• Vérifiez que votre session n'a pas expiré</li>
                  <li>• Effacez le cache si nécessaire</li>
                  <li>• Contactez le support en cas de problème persistant</li>
                </ul>
              )}
            </div>
          </div>

          {/* Footer avec informations de diagnostic */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-6 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="text-left">
                <h4 className="text-xs font-medium text-yellow-900 mb-2">
                  🔧 Mode Développement
                </h4>
                <div className="text-xs text-yellow-700 space-y-1">
                  <p><strong>Gateway:</strong> http://localhost:4000/graphql</p>
                  <p><strong>Auth App:</strong> http://localhost:3000</p>
                  <p><strong>Dashboard:</strong> http://localhost:3002</p>
                  <p><strong>Retry Count:</strong> {state.retryCount}/3</p>
                  <p><strong>App Auth Failed:</strong> {state.appAuthFailed ? 'Yes' : 'No'}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}