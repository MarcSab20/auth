import React from 'react';
import { Button } from '@/src/components/landing-page/Button';

interface InvitationErrorProps {
  error: string;
  onRetry?: () => void;
}

export default function InvitationError({ error, onRetry }: InvitationErrorProps) {
  return (
      <div className="max-w-md bg-white rounded-lg -lg p-6 space-y-4">
        <div className="mb-5">
          <h1 className="text-3xl font-bold text-gray-800">
            Oups ! Une erreur s'est produite
          </h1>
          <h2 className="text-2xl font-semibold text-gray-700 mt-2">
            {error.includes("expired") 
              ? "Votre invitation a peut-être expiré"
              : ""}
          </h2>
        </div>

        <div className="flex flex-col items-center justify-center text-center">
          <p className="text-lg text-gray-600 mb-8">
            {error.includes("expired") 
              ? "Votre invitation n'est plus valide. Vous pouvez demander une nouvelle invitation ou contacter l'administrateur de l'organisation."
              : "Une erreur est survenue lors de la vérification de votre invitation."}
          </p>

          <div className="flex flex-col gap-3 w-full">
            {onRetry && (
              <Button 
                onClick={onRetry}
                className="w-full"
              >
                Réessayer
              </Button>
            )}
            <Button 
              variant="outline"
              onClick={() => window.location.href = '/'}
              className="w-full"
            >
              Retour à l'accueil
            </Button>
          </div>
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            En cas de problème persistant, veuillez contacter le support.
          </p>
        </div>
      </div>
  );
} 