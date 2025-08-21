// auth/src/app/(auth)/transition/page.tsx - AVEC SUSPENSE
import { Suspense } from 'react';
import TransitionContent from './TransitionContent';

export const metadata = {
  title: "Transition - Services",
  description: "Transition entre applications",
};

// 🔧 AJOUT : Configuration dynamique
export const dynamic = 'force-dynamic';

function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p className="text-gray-600">Préparation de la transition...</p>
      </div>
    </div>
  );
}

export default function TransitionPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <TransitionContent />
    </Suspense>
  );
}