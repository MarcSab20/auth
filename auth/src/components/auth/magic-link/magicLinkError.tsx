interface MagicLinkErrorProps {
  error: string;
  onRetry: () => void;
  onGoToLogin: () => void;
}

export default function MagicLinkError({ 
  error, 
  onRetry, 
  onGoToLogin 
}: MagicLinkErrorProps) {
  
  const getErrorDetails = (errorMessage: string) => {
    const lowerError = errorMessage.toLowerCase();
    
    if (lowerError.includes('expired') || lowerError.includes('expiré')) {
      return {
        title: "Magic Link expiré",
        description: "Ce lien de connexion a expiré. Les Magic Links ne sont valides que pendant 30 minutes pour votre sécurité.",
        icon: "⏰",
        canRetry: false,
        suggestions: [
          "Demandez un nouveau Magic Link depuis la page de connexion",
          "Vérifiez que vous utilisez le lien le plus récent",
          "Contactez le support si le problème persiste"
        ]
      };
    }
    
    if (lowerError.includes('used') || lowerError.includes('utilisé')) {
      return {
        title: "Magic Link déjà utilisé",
        description: "Ce lien de connexion a déjà été utilisé. Chaque Magic Link ne peut être utilisé qu'une seule fois.",
        icon: "🔒",
        canRetry: false,
        suggestions: [
          "Demandez un nouveau Magic Link si nécessaire",
          "Vérifiez si vous êtes déjà connecté dans un autre onglet",
          "Utilisez la connexion classique avec votre mot de passe"
        ]
      };
    }
    
    if (lowerError.includes('invalid') || lowerError.includes('invalide') || lowerError.includes('token')) {
      return {
        title: "Magic Link invalide",
        description: "Ce lien de connexion est invalide ou corrompu.",
        icon: "❌",
        canRetry: false,
        suggestions: [
          "Vérifiez que vous avez copié l'URL complète",
          "Utilisez le lien directement depuis votre email",
          "Demandez un nouveau Magic Link"
        ]
      };
    }
    
    if (lowerError.includes('network') || lowerError.includes('connexion') || lowerError.includes('timeout')) {
      return {
        title: "Problème de connexion",
        description: "Impossible de vérifier votre Magic Link en raison d'un problème réseau.",
        icon: "📶",
        canRetry: true,
        suggestions: [
          "Vérifiez votre connexion internet",
          "Réessayez dans quelques instants",
          "Utilisez la connexion classique si le problème persiste"
        ]
      };
    }
    
    return {
      title: "Erreur de connexion",
      description: "Une erreur inattendue s'est produite lors de la vérification de votre Magic Link.",
      icon: "⚠️",
      canRetry: true,
      suggestions: [
        "Réessayez dans quelques instants",
        "Vérifiez que le lien est complet et correct",
        "Utilisez la connexion classique en alternative"
      ]
    };
  };

  const errorDetails = getErrorDetails(error);

  return (
    <div className="max-w-md mx-auto">
      <div className="text-center">
        {/* Icône d'erreur */}
        <div className="mb-8">
          <div className="mx-auto h-24 w-24 rounded-full bg-red-100 flex items-center justify-center">
            <span className="text-4xl">{errorDetails.icon}</span>
          </div>
        </div>

        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {errorDetails.title}
          </h1>
          <p className="text-lg text-gray-600">
            {errorDetails.description}
          </p>
        </div>

        {/* Message d'erreur technique */}
        <div className="mb-6 p-4 bg-red-50 rounded-lg border border-red-200">
          <div className="flex items-start space-x-3">
            <svg 
              className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" 
              />
            </svg>
            <div className="text-left">
              <p className="text-sm font-medium text-red-900">
                Détail de l'erreur
              </p>
              <p className="text-xs text-red-700 mt-1 font-mono bg-red-100 p-2 rounded">
                {error}
              </p>
            </div>
          </div>
        </div>

        {/* Suggestions */}
        <div className="mb-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="text-left">
            <h3 className="text-sm font-medium text-blue-900 mb-3 flex items-center">
              <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Solutions suggérées
            </h3>
            <ul className="text-sm text-blue-800 space-y-2">
              {errorDetails.suggestions.map((suggestion, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-blue-500 mr-2 mt-0.5">•</span>
                  <span>{suggestion}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          {errorDetails.canRetry && (
            <button
              onClick={onRetry}
              className="w-full inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Réessayer
            </button>
          )}
          
          <button
            onClick={onGoToLogin}
            className="w-full inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
            </svg>
            Connexion classique
          </button>
        </div>

        {/* Support */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-500 mb-3">
            Besoin d'aide ?
          </p>
          <div className="flex items-center justify-center space-x-4 text-xs">
            <a 
              href="mailto:support@example.com" 
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
  );
} 2