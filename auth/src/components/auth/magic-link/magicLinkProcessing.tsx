export default function MagicLinkProcessing() {
  return (
    <div className="max-w-md mx-auto">
      <div className="text-center">
        <div className="mb-8">
          <div className="mx-auto h-24 w-24 relative">
            {/* Animation de chargement avec Magic Link */}
            <div className="absolute inset-0 rounded-full border-4 border-blue-200"></div>
            <div className="absolute inset-0 rounded-full border-4 border-blue-500 border-t-transparent animate-spin"></div>
            <div className="absolute inset-4 flex items-center justify-center">
              <svg 
                className="h-8 w-8 text-blue-500" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" 
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🔐 Connexion en cours...
          </h1>
          <p className="text-lg text-gray-600">
            Vérification de votre Magic Link
          </p>
        </div>

        <div className="space-y-4 text-sm text-gray-500">
          <div className="flex items-center justify-center space-x-2">
            <div className="h-2 w-2 bg-blue-500 rounded-full animate-pulse"></div>
            <span>Validation du token sécurisé</span>
          </div>
          
          <div className="flex items-center justify-center space-x-2">
            <div className="h-2 w-2 bg-gray-300 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
            <span>Vérification des permissions</span>
          </div>
          
          <div className="flex items-center justify-center space-x-2">
            <div className="h-2 w-2 bg-gray-300 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
            <span>Préparation de votre session</span>
          </div>
        </div>

        <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-start space-x-3">
            <svg 
              className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" 
              />
            </svg>
            <div className="text-left">
              <p className="text-sm font-medium text-blue-900">
                Connexion sécurisée
              </p>
              <p className="text-xs text-blue-700 mt-1">
                Votre Magic Link est chiffré et ne peut être utilisé qu'une seule fois.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 text-xs text-gray-400">
          Cette page se met à jour automatiquement...
        </div>
      </div>
    </div>
  );
}