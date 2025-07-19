import MagicLinkRequest from "@/src/components/auth/magic-link/magicLinkRequest";
import Link from "next/link";

export const metadata = {
  title: "Demander un Magic Link - Connexion sécurisée",
  description: "Recevez un lien de connexion sécurisé par email",
};

export default function MagicLinkRequestPage() {
  return (
    <div className="max-w-sm mx-auto">
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-bold mb-4">🔗 Magic Link</h1>
        <p className="text-gray-600">
          Recevez un lien de connexion sécurisé directement dans votre boîte email
        </p>
      </div>

      <MagicLinkRequest />

      <div className="mt-8 text-center space-y-4">
        <div className="border-t border-gray-200 pt-6">
          <p className="text-sm text-gray-500 mb-3">
            Autres options de connexion
          </p>
          <div className="space-y-2">
            <Link 
              href="/signin" 
              className="block text-sm text-blue-600 hover:text-blue-800 underline hover:no-underline"
            >
              Connexion avec mot de passe
            </Link>
            <Link 
              href="/forgot-password" 
              className="block text-sm text-gray-600 hover:text-gray-800 underline hover:no-underline"
            >
              Mot de passe oublié ?
            </Link>
          </div>
        </div>
        
        <div className="text-center text-sm text-gray-700">
          Pas encore inscrit ?
          <Link href="/signup" className="text-blue-500 underline ml-1 hover:no-underline">
            Créer un compte
          </Link>
        </div>
      </div>
    </div>
  );
}