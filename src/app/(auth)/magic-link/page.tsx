import { Suspense } from "react";
import MagicLinkHandler from "@/src/components/auth/magic-link/magicLinkHandler";

export const metadata = {
  title: "Magic Link - Connexion sécurisée",
  description: "Finalisation de la connexion via Magic Link",
};

export default function MagicLinkPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Vérification en cours...</p>
        </div>
      </div>
    }>
      <MagicLinkHandler />
    </Suspense>
  );
}