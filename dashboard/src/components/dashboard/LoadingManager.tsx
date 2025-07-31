// dashboard/src/components/dashboard/LoadingManager.tsx - GESTIONNAIRE DE TIMEOUT
'use client';

import { useEffect, useState, useRef } from 'react';
import { useAuth } from '@/context/authenticationContext';
import { useRouter } from 'next/navigation';

interface LoadingManagerProps {
  children: React.ReactNode;
  maxWaitTime?: number; // en millisecondes
  showDiagnostics?: boolean;
}

interface LoadingPhase {
  name: string;
  status: 'pending' | 'active' | 'completed' | 'failed' | 'timeout';
  startTime?: number;
  duration?: number;
  error?: string;
}

export default function LoadingManager({ 
  children, 
  maxWaitTime = 30000, // 30 secondes par défaut
  showDiagnostics = process.env.NODE_ENV === 'development' 
}: LoadingManagerProps) {
  const { state, user, isAuthenticated, isLoading, error, retryAuth, skipAppAuth, redirectToAuth } = useAuth();
  const router = useRouter();
  
  const [timeoutReached, setTimeoutReached] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [phases, setPhases] = useState<LoadingPhase[]>([
    { name: 'Initialisation', status: 'pending' },
    { name: 'Vérification session', status: 'pending' },
    { name: 'Authentification app', status: 'pending' },
    { name: 'Validation utilisateur', status: 'pending' },
    { name: 'Finalisation', status: 'pending' }
  ]);
  
  const startTimeRef = useRef<number>(Date.now());
  const timeoutRef = useRef<NodeJS.Timeout>();
  const intervalRef = useRef<NodeJS.Timeout>();

  // Mettre à jour les phases selon l'état du contexte d'authentification
  useEffect(() => {
    setPhases(prevPhases => {
      const newPhases = [...prevPhases];
      
      // Déterminer la phase actuelle selon l'état
      if (state.initializationPhase) {
        switch (state.initializationPhase) {
          case 'starting':
            newPhases[0].status = 'active';
            break;
          case 'checking_session':
            newPhases[0].status = 'completed';
            newPhases[1].status = 'active';
            break;
          case 'app_auth':
            newPhases[1].status = 'completed';
            newPhases[2].status = 'active';
            break;
          case 'user_validation':
            newPhases[2].status = 'completed';
            newPhases[3].status = 'active';
            break;
          case 'completed':
            newPhases.forEach((phase, index) => {
              if (index < 4) phase.status = 'completed';
            });
            newPhases[4].status = 'completed';
            break;
          case 'failed':
            const activeIndex = newPhases.findIndex(p => p.status === 'active');
            if (activeIndex >= 0) {
              newPhases[activeIndex].status = 'failed';
              newPhases[activeIndex].error = error || 'Erreur inconnue';
            }
            break;
        }
      }
      
      return newPhases;
    });
  }, [state.initializationPhase, error]);

  // Gestionnaire de timeout
  useEffect(() => {
    startTimeRef.current = Date.now();
    
    // Timer de timeout global
    timeoutRef.current = setTimeout(() => {
      if (isLoading && !isAuthenticated) {
        console.warn('⏰ [LOADING-MANAGER] Timeout atteint après', maxWaitTime / 1000, 'secondes');
        setTimeoutReached(true);
      }
    }, maxWaitTime);

    // Timer d'elapsed time
    intervalRef.current = setInterval(() => {
      setElapsedTime(Date.now() - startTimeRef.current);
    }, 1000);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [maxWaitTime, isLoading, isAuthenticated]);

  // Si authentifié, afficher le contenu
  if (isAuthenticated && user) {
    return <>{children}</>;
  }

  // Si timeout atteint, afficher les options de récupération
  if (timeoutReached) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-lg w-full space-y-6 p-6">
          <div className="text-center">
            <div className="mx-auto h-16 w-16 rounded-full bg-yellow-100 flex items-center justify-center mb-4">
              <svg className="h-8 w-8 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Chargement interrompu
            </h2>
            
            <p className="text-gray-600 mb-6">
              Le tableau de bord prend plus de temps que prévu à se charger ({Math.round(elapsedTime / 1000)}s écoulées).
            </p>
          </div>

          {/* Diagnostic des phases */}
          {showDiagnostics && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h3 className="text-sm font-medium text-gray-900 mb-3">Progression du chargement</h3>
              <div className="space-y-2">
                {phases.map((phase, index) => (
                  <div key={index} className="flex items-center text-sm">
                    <div className={`h-3 w-3 rounded-full mr-3 ${
                      phase.status === 'completed' ? 'bg-green-500' :
                      phase.status === 'active' ? 'bg-blue-500 animate-pulse' :
                      phase.status === 'failed' ? 'bg-red-500' :
                      phase.status === 'timeout' ? 'bg-yellow-500' :
                      'bg-gray-300'
                    }`}></div>
                    <span className={`flex-1 ${
                      phase.status === 'failed' ? 'text-red-700' :
                      phase.status === 'active' ? 'text-blue-700 font-medium' :
                      'text-gray-600'
                    }`}>
                      {phase.name}
                    </span>
                    {phase.status === 'failed' && phase.error && (
                      <span className="text-xs text-red-500 ml-2">
                        {phase.error}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions de récupération */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Que souhaitez-vous faire ?</h3>
            
            <div className="space-y-3">
              <button
                onClick={() => {
                  setTimeoutReached(false);
                  setElapsedTime(0);
                  startTimeRef.current = Date.now();
                  retryAuth();
                }}
                className="w-full bg-blue-600 text-white px-4 py-3 rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
              >
                <svg className="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Réessayer le chargement
              </button>
              
              <button
                onClick={() => {
                  setTimeoutReached(false);
                  skipAppAuth();
                }}
                className="w-full border border-gray-300 text-gray-700 px-4 py-3 rounded-md hover:bg-gray-50 transition-colors"
              >
                Utiliser la session existante
              </button>
              
              <button
                onClick={() => redirectToAuth('/account')}
                className="w-full border border-blue-300 text-blue-700 px-4 py-3 rounded-md hover:bg-blue-50 transition-colors"
              >
                Se reconnecter
              </button>
              
              <button
                onClick={() => {
                  // Nettoyage complet et redirection
                  localStorage.clear();
                  document.cookie.split(";").forEach(cookie => {
                    const eqPos = cookie.indexOf("=");
                    const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
                    document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
                  });
                  window.location.href = 'http://localhost:3000/signin';
                }}
                className="w-full text-sm text-gray-600 hover:text-gray-800 underline hover:no-underline"
              >
                Effacer les données et recommencer
              </button>
            </div>
          </div>

          {/* Informations de diagnostic */}
          {showDiagnostics && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 className="text-sm font-medium text-yellow-900 mb-2">
                🔧 Informations de diagnostic
              </h4>
              <div className="text-xs text-yellow-800 space-y-1">
                <p><strong>Temps écoulé:</strong> {Math.round(elapsedTime / 1000)}s / {maxWaitTime / 1000}s</p>
                <p><strong>État auth:</strong> {isLoading ? 'Loading' : 'Idle'}</p>
                <p><strong>Utilisateur:</strong> {user?.userID || 'None'}</p>
                <p><strong>Authentifié:</strong> {isAuthenticated ? 'Oui' : 'Non'}</p>
                <p><strong>Erreur:</strong> {error || 'Aucune'}</p>
                <p><strong>Phase:</strong> {state.initializationPhase}</p>
                <p><strong>Tentatives:</strong> {state.retryCount}</p>
                <p><strong>App auth échoué:</strong> {state.appAuthFailed ? 'Oui' : 'Non'}</p>
              </div>
            </div>
          )}

          {/* Tips pour éviter les timeouts */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="text-sm font-medium text-blue-900 mb-2">
              💡 Conseils pour éviter ce problème
            </h4>
            <ul className="text-xs text-blue-800 space-y-1">
              <li>• Vérifiez que la gateway (port 4000) est démarrée</li>
              <li>• Vérifiez votre connexion réseau</li>
              <li>• Actualisez la page si le problème persiste</li>
              <li>• Contactez le support si le problème est récurrent</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  // Affichage normal du loading avec progression
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-6 p-6">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center mb-6">
            <div className="relative h-10 w-10">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xs font-bold text-blue-600">
                  {Math.round((elapsedTime / maxWaitTime) * 100)}%
                </span>
              </div>
            </div>
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Services Dashboard
          </h2>
          
          <p className="text-gray-600 mb-4">
            Chargement de votre espace de travail...
          </p>

          {/* Barre de progression temporelle */}
          <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${Math.min((elapsedTime / maxWaitTime) * 100, 100)}%` }}
            ></div>
          </div>

          <p className="text-sm text-gray-500 mb-6">
            {elapsedTime < 5000 ? 'Initialisation...' :
             elapsedTime < 10000 ? 'Vérification des permissions...' :
             elapsedTime < 15000 ? 'Chargement des données...' :
             elapsedTime < 20000 ? 'Finalisation...' :
             'Cela prend plus de temps que prévu...'}
          </p>
        </div>

        {/* Phases de chargement */}
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <h3 className="text-sm font-medium text-gray-900 mb-3">
            Progression
          </h3>
          <div className="space-y-2">
            {phases.map((phase, index) => (
              <div key={index} className="flex items-center text-sm">
                <div className={`h-2 w-2 rounded-full mr-3 ${
                  phase.status === 'completed' ? 'bg-green-500' :
                  phase.status === 'active' ? 'bg-blue-500 animate-pulse' :
                  phase.status === 'failed' ? 'bg-red-500' :
                  'bg-gray-300'
                }`}></div>
                <span className={`${
                  phase.status === 'active' ? 'text-blue-700 font-medium' :
                  phase.status === 'completed' ? 'text-green-700' :
                  phase.status === 'failed' ? 'text-red-700' :
                  'text-gray-500'
                }`}>
                  {phase.name}
                  {phase.status === 'active' && (
                    <span className="ml-2 text-xs">
                      ({Math.round(elapsedTime / 1000)}s)
                    </span>
                  )}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Warning si ça prend du temps */}
        {elapsedTime > 15000 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start">
              <svg className="h-5 w-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <div>
                <h4 className="text-sm font-medium text-yellow-900 mb-1">
                  Chargement plus lent que prévu
                </h4>
                <p className="text-xs text-yellow-800">
                  La connexion peut prendre jusqu'à {maxWaitTime / 1000} secondes. 
                  Si le problème persiste, vérifiez que tous les services sont démarrés.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Actions d'urgence après 20 secondes */}
        {elapsedTime > 20000 && (
          <div className="flex justify-center space-x-4 text-sm">
            <button 
              onClick={() => window.location.reload()} 
              className="text-blue-600 hover:text-blue-800 underline hover:no-underline"
            >
              Actualiser
            </button>
            <span className="text-gray-300">|</span>
            <button 
              onClick={() => skipAppAuth()}
              className="text-gray-600 hover:text-gray-800 underline hover:no-underline"
            >
              Forcer l'accès
            </button>
            <span className="text-gray-300">|</span>
            <button 
              onClick={() => redirectToAuth()}
              className="text-gray-600 hover:text-gray-800 underline hover:no-underline"
            >
              Reconnexion
            </button>
          </div>
        )}

        {/* Info développement */}
        {showDiagnostics && elapsedTime > 10000 && (
          <div className="bg-gray-900 text-green-400 rounded-lg p-3 font-mono text-xs">
            <div className="flex justify-between items-center mb-2">
              <span>🔧 Debug Console</span>
              <span>{Math.round(elapsedTime / 1000)}s</span>
            </div>
            <div className="space-y-1 opacity-80">
              <div>→ Phase: {state.initializationPhase}</div>
              <div>→ Loading: {isLoading ? 'true' : 'false'}</div>
              <div>→ Authenticated: {isAuthenticated ? 'true' : 'false'}</div>
              <div>→ User: {user?.userID || 'null'}</div>
              <div>→ Error: {error || 'none'}</div>
              <div>→ Retries: {state.retryCount}/3</div>
              <div>→ App Auth Failed: {state.appAuthFailed ? 'true' : 'false'}</div>
            </div>
          </div>
        )}

        {/* Bouton d'action si erreur détectée */}
        {error && elapsedTime > 5000 && (
          <div className="text-center">
            <p className="text-sm text-red-600 mb-3">
              Erreur détectée: {error}
            </p>
            <button
              onClick={() => retryAuth()}
              className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors text-sm"
            >
              Réessayer maintenant
            </button>
          </div>
        )}
      </div>
    </div>
  );
}