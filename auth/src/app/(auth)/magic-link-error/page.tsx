// auth/src/app/(auth)/magic-link-error/page.tsx
import { Suspense } from "react";
import Link from "next/link";

export const metadata = {
  title: "Erreur Magic Link - Connexion sécurisée",
  description: "Erreur lors de la vérification du Magic Link",
};

function MagicLinkErrorContent() {
  return (
    <div className="max-w-md mx-auto">
      <div className="text-center">
        {/* Icône d'erreur */}
        <div className="mb-8">
          <div className="mx-auto h-24 w-24 rounded-full bg-red-100 flex items-center justify-center">
            <span className="text-4xl">⚠️</span>
          </div>
        </div>

        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Erreur Magic Link
          </h1>
          <p className="text-lg text-gray-600">
            Une erreur s'est produite lors de la vérification de votre lien de connexion
          </p>
        </div>

        {/* Causes possibles */}
        <div className="mb-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="text-left">
            <h3 className="text-sm font-medium text-blue-900 mb-3 flex items-center">
              <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Causes possibles
            </h3>
            <ul className="text-sm text-blue-800 space-y-2">
              <li className="flex items-start">
                <span className="text-blue-500 mr-2 mt-0.5">•</span>
                <span>Le lien a expiré (validité : 30 minutes)</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-500 mr-2 mt-0.5">•</span>
                <span>Le lien a déjà été utilisé</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-500 mr-2 mt-0.5">•</span>
                <span>Le lien n'est pas valide ou a été modifié</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-500 mr-2 mt-0.5">•</span>
                <span>Problème temporaire de connectivité</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <Link
            href="/magic-link-request"
            className="w-full inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
            Demander un nouveau Magic Link
          </Link>
          
          <Link
            href="/signin"
            className="w-full inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
            </svg>
            Connexion avec mot de passe
          </Link>
        </div>

        {/* Support */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-500 mb-3">
            Besoin d'aide ?
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

        {/* Debug info (development only) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-6 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="text-left">
              <h4 className="text-xs font-medium text-yellow-900 mb-2">
                🔧 Debug Info (Development)
              </h4>
              <div className="text-xs text-yellow-700 space-y-1">
                <p><strong>Auth URL:</strong> {process.env.NEXT_PUBLIC_AUTH_URL}</p>
                <p><strong>GraphQL:</strong> {process.env.NEXT_PUBLIC_GRAPHQL_URL}</p>
                <p><strong>Magic Link:</strong> Enabled</p>
                <p><strong>Error Page:</strong> Loaded</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function MagicLinkErrorPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    }>
      <MagicLinkErrorContent />
    </Suspense>
  );
}