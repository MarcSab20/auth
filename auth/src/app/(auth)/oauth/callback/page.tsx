// auth/src/app/(auth)/oauth/callback/page.tsx - AVEC SUSPENSE
import { Suspense } from 'react';
import OAuthCallbackContent from './OAuthCallbackContent';

export const metadata = {
  title: "OAuth Callback - Services",
  description: "Traitement du callback OAuth",
};

// 🔧 AJOUT : Configuration dynamique pour éviter les erreurs de build statique
export const dynamic = 'force-dynamic';

function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p className="text-gray-600">Traitement OAuth en cours...</p>
      </div>
    </div>
  );
}

export default function OAuthCallbackPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <OAuthCallbackContent />
    </Suspense>
  );
}