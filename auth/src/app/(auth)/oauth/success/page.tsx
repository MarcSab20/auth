// auth/src/app/(auth)/oauth/success/page.tsx - AVEC SUSPENSE
import { Suspense } from 'react';
import OAuthSuccessContent from './OAuthSuccessContent';

export const metadata = {
  title: "OAuth Success - Services",
  description: "Finalisation OAuth réussie",
};

// 🔧 AJOUT : Configuration dynamique
export const dynamic = 'force-dynamic';

function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p className="text-gray-600">Finalisation OAuth...</p>
      </div>
    </div>
  );
}

export default function OAuthSuccessPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <OAuthSuccessContent />
    </Suspense>
  );
}