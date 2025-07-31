// dashboard/src/app/(dashboard)/account/layout.tsx - ENHANCED WITH BETTER ERROR HANDLING
'use client';

import { getEvents } from "@/src/components/catalyst/data";
import { ApplicationLayout } from "@/src/app/application-layout";
import { DashboardProvider } from "@/context/dashboardContext"; 
import { useAuth } from "@/context/authenticationContext";
import { useEffect, useState } from "react";
import SessionDiagnostics from '@/src/components/debug/SessionDiagnostics';

interface LoadingState {
  stage: 'initializing' | 'checking_session' | 'authenticating_app' | 'loading_user' | 'ready' | 'error';
  message: string;
  progress: number;
  details?: string;
  error?: string;
  canRetry?: boolean;
}

export default function DashboardLayoutWrapper({ children }: { children: React.ReactNode }) {
  const { user, isLoading, error, state, testAppAuth, retryAuth, skipAppAuth, redirectToAuth } = useAuth();
  const [loadingState, setLoadingState] = useState<LoadingState>({
    stage: 'initializing',
    message: 'Initialisation du tableau de bord...',
    progress: 0
  });
  const [retryCount, setRetryCount] = useState(0);
  const [showDetails, setShowDetails] = useState(false);

  // Monitor auth state changes and update loading state
  useEffect(() => {
    if (user?.userID) {
      setLoadingState({
        stage: 'ready',
        message: 'Tableau de bord prêt !',
        progress: 100
      });
      return;
    }

    if (error) {
      const isNetworkError = error.includes('NetworkError') || error.includes('CORS') || error.includes('fetch');
      const isAuthError = error.includes('AUTH_FAILED') || error.includes('Authentification');
      
      setLoadingState({
        stage: 'error',
        message: isNetworkError ? 'Erreur de connexion au serveur' : 'Erreur d\'authentification',
        progress: 0,
        error,
        details: isNetworkError 
          ? 'Impossible de se connecter à la gateway. Vérifiez que le serveur est démarré.'
          : 'Problème d\'authentification avec les services.',
        canRetry: true
      });
      return;
    }

    if (isLoading) {
      if (state.appAuthFailed) {
        setLoadingState({
          stage: 'authenticating_app',
          message: 'Authentification de l\'application...',
          progress: 25,
          details: `Tentative ${state.retryCount + 1}/3`
        });
      } else {
        setLoadingState({
          stage: 'loading_user',
          message: 'Récupération des informations utilisateur...',
          progress: 75,
          details: 'Validation de la session en cours'
        });
      }
      return;
    }

    // No user and not loading - probably need to authenticate
    setLoadingState({
      stage: 'checking_session',
      message: 'Vérification de la session...',
      progress: 50,
      details: 'Recherche d\'une session existante'
    });
  }, [user, isLoading, error, state]);

  const handleRetry = async () => {
    setRetryCount(prev => prev + 1);
    setLoadingState({
      stage: 'authenticating_app',
      message: 'Nouvelle tentative...',
      progress: 10,
      details: `Tentative ${retryCount + 2}`
    });
    
    try {
      await retryAuth();
    } catch (err) {
      console.error('Retry failed:', err);
    }
  };
  <SessionDiagnostics />

  const handleSkipAuth = () => {
    setLoadingState({
      stage: 'loading_user',
      message: 'Utilisation de la session existante...',
      progress: 60,
      details: 'Contournement de l\'authentification app'
    });
    skipAppAuth();
  };

  const handleGoToAuth = () => {
    redirectToAuth('/account');
  };

  // Show detailed loading/error screen
  if (loadingState.stage !== 'ready') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full space-y-6 p-6">
          {/* Header */}
          <div className="text-center">
            <div className="mx-auto h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center mb-4">
              {loadingState.stage === 'error' ? (
                <svg className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              ) : (
                <div className="relative h-8 w-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xs font-bold text-blue-600">
                      {Math.round(loadingState.progress)}%
                    </span>
                  </div>
                </div>
              )}
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {loadingState.stage === 'error' ? 'Problème de connexion' : 'Services Dashboard'}
            </h2>
            
            <p className="text-gray-600 mb-4">
              {loadingState.message}
            </p>

            {/* Progress bar */}
            {loadingState.stage !== 'error' && (
              <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${loadingState.progress}%` }}
                ></div>
              </div>
            )}

            {/* Details */}
            {loadingState.details && (
              <p className="text-sm text-gray-500 mb-4">
                {loadingState.details}
              </p>
            )}
          </div>

          {/* Error State Actions */}
          {loadingState.stage === 'error' && (
            <div className="space-y-4">
              {/* Error details */}
              {loadingState.error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <button
                    onClick={() => setShowDetails(!showDetails)}
                    className="flex items-center justify-between w-full text-left"
                  >
                    <span className="text-sm font-medium text-red-900">
                      Détails de l'erreur
                    </span>
                    <svg 
                      className={`h-4 w-4 text-red-500 transition-transform ${showDetails ? 'rotate-180' : ''}`}
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  
                  {showDetails && (
                    <div className="mt-3 p-3 bg-red-100 rounded border-l-4 border-red-400">
                      <pre className="text-xs text-red-800 whitespace-pre-wrap font-mono">
                        {loadingState.error}
                      </pre>
                      <div className="mt-2 text-xs text-red-700">
                        <p><strong>Statut:</strong> {loadingState.stage}</p>
                        <p><strong>Tentatives:</strong> {retryCount}</p>
                        <p><strong>Timestamp:</strong> {new Date().toLocaleTimeString()}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Action buttons */}
              <div className="space-y-3">
                <button
                  onClick={handleRetry}
                  className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
                >
                  <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Réessayer ({retryCount + 1})
                </button>
                
                <button
                  onClick={handleSkipAuth}
                  className="w-full border border-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Utiliser la session existante
                </button>
                
                <button
                  onClick={handleGoToAuth}
                  className="w-full border border-blue-300 text-blue-700 px-4 py-2 rounded-md hover:bg-blue-50 transition-colors"
                >
                  Se reconnecter
                </button>
              </div>
            </div>
          )}

          {/* Loading State Info */}
          {loadingState.stage !== 'error' && (
            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="text-sm font-medium text-blue-900 mb-2">
                Étapes de connexion
              </h3>
              <div className="space-y-2">
                {[
                  { key: 'initializing', label: 'Initialisation', progress: 10 },
                  { key: 'checking_session', label: 'Vérification session', progress: 30 },
                  { key: 'authenticating_app', label: 'Authentification app', progress: 50 },
                  { key: 'loading_user', label: 'Chargement utilisateur', progress: 80 },
                  { key: 'ready', label: 'Prêt', progress: 100 },
                ].map(step => (
                  <div key={step.key} className="flex items-center text-xs">
                    <div className={`h-2 w-2 rounded-full mr-2 ${
                      loadingState.progress >= step.progress 
                        ? 'bg-blue-500' 
                        : loadingState.stage === step.key 
                          ? 'bg-blue-400 animate-pulse' 
                          : 'bg-gray-300'
                    }`}></div>
                    <span className={`${
                      loadingState.stage === step.key ? 'text-blue-800 font-medium' : 'text-blue-700'
                    }`}>
                      {step.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Development info */}
          {process.env.NODE_ENV === 'development' && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 className="text-xs font-medium text-yellow-900 mb-2">
                🔧 Debug Info
              </h4>
              <div className="text-xs text-yellow-800 space-y-1">
                <p><strong>Stage:</strong> {loadingState.stage}</p>
                <p><strong>Loading:</strong> {isLoading ? 'Yes' : 'No'}</p>
                <p><strong>User:</strong> {user?.userID ? 'Present' : 'None'}</p>
                <p><strong>App Auth Failed:</strong> {state.appAuthFailed ? 'Yes' : 'No'}</p>
                <p><strong>Retry Count:</strong> {state.retryCount}</p>
                <p><strong>Gateway:</strong> http://localhost:4000/graphql</p>
              </div>
            </div>
          )}

          {/* Quick actions */}
          <div className="flex justify-center space-x-4 text-sm">
            <button 
              onClick={() => window.location.reload()} 
              className="text-blue-600 hover:text-blue-800"
            >
              Recharger
            </button>
            <span className="text-gray-300">|</span>
            <button 
              onClick={() => {
                localStorage.clear();
                window.location.reload();
              }} 
              className="text-gray-600 hover:text-gray-800"
            >
              Reset cache
            </button>
          </div>
        </div>
      </div>
    );
  }

  // User is authenticated, render the dashboard
  return (
    <DashboardProvider>
      <DashboardLayout>{children}</DashboardLayout>
    </DashboardProvider>
  );
}

function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <ApplicationLayout events={[]}>
      {children}
    </ApplicationLayout>
  );
}