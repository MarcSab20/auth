import { useEffect, useState } from "react";

interface MagicLinkSuccessProps {
  result: any;
  redirectUrl: string;
  isRedirecting: boolean;
}

export default function MagicLinkSuccess({ 
  result, 
  redirectUrl, 
  isRedirecting 
}: MagicLinkSuccessProps) {
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    if (isRedirecting && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown, isRedirecting]);

  return (
    <div className="max-w-md mx-auto">
      <div className="text-center">
        {/* Icône de succès animée */}
        <div className="mb-8">
          <div className="mx-auto h-24 w-24 relative">
            <div className="absolute inset-0 rounded-full bg-green-100 flex items-center justify-center animate-pulse">
              <svg 
                className="h-12 w-12 text-green-500" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M5 13l4 4L19 7" 
                />
              </svg>
            </div>
            {/* Cercle de succès qui se dessine */}
            <div className="absolute inset-0 rounded-full border-4 border-green-500 opacity-20 animate-ping"></div>
          </div>
        </div>

        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            ✅ Connexion réussie !
          </h1>
          <p className="text-lg text-gray-600">
            Votre Magic Link a été vérifié avec succès
          </p>
        </div>

        {/* Informations de connexion */}
        <div className="mb-6 space-y-3">
          {result?.userInfo?.email && (
            <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span>Connecté en tant que: {result.userInfo.email}</span>
            </div>
          )}
          
          {result?.tokenType && (
            <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <span>Session sécurisée établie</span>
            </div>
          )}
        </div>

        {/* MFA requis */}
        {result?.requiresMFA && (
          <div className="mb-6 p-4 bg-orange-50 rounded-lg border border-orange-200">
            <div className="flex items-center space-x-3">
              <svg className="h-5 w-5 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <div className="text-left">
                <p className="text-sm font-medium text-orange-900">
                  Authentification à deux facteurs requise
                </p>
                <p className="text-xs text-orange-700 mt-1">
                  Vous serez redirigé vers la page MFA pour finaliser la connexion.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Redirection */}
        {isRedirecting ? (
          <div className="mb-6">
            <div className="flex items-center justify-center space-x-2 text-blue-600 mb-3">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              <span className="text-sm font-medium">
                Redirection en cours...
              </span>
            </div>
            <p className="text-sm text-gray-500">
              Redirection dans {countdown} seconde{countdown !== 1 ? 's' : ''}
            </p>
          </div>
        ) : (
          <div className="mb-6">
            <button
              onClick={() => window.location.href = redirectUrl}
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              Accéder au tableau de bord
              <svg className="ml-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        )}

        {/* Informations de sécurité */}
        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="text-left space-y-2">
            <h3 className="text-sm font-medium text-gray-900 flex items-center">
              <svg className="h-4 w-4 mr-2 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Sécurité vérifiée
            </h3>
            <ul className="text-xs text-gray-600 space-y-1">
              <li>• Magic Link à usage unique utilisé</li>
              <li>• Session chiffrée établie</li>
              <li>• Authentification vérifiée</li>
              <li>• Accès sécurisé accordé</li>
            </ul>
          </div>
        </div>

        <div className="mt-6 text-xs text-gray-400">
          Vous pouvez fermer cet onglet en toute sécurité
        </div>
      </div>
    </div>
  );
}