// AcceptInvitation.tsx

"use client";
import React, { useState } from "react";
import { Button } from "@/src/components/landing-page/Button";
import { useRouter } from "next/navigation";

interface AcceptInvitationProps {
  organizationID: string;
  email: string;
  organizationName?: string;
  firstName?: string;
  lastName?: string;
  userID: string;
}

export default function AcceptInvitation({ 
  organizationID, 
  email, 
  organizationName,
  firstName,
  userID
}: AcceptInvitationProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAcceptInvitation = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/organization/${organizationID}/members/accept`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userID
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Gestion spécifique des erreurs
        if (response.status === 401) {
          throw new Error('Votre invitation a expiré. Veuillez demander une nouvelle invitation.');
        } else if (response.status === 409) {
          throw new Error('Vous êtes déjà membre de cette organisation.');
        } else {
          throw new Error(data.error || 'Une erreur est survenue lors de l\'acceptation de l\'invitation');
        }
      }

      // Rediriger vers le dashboard après acceptation réussie
      router.push('/signin');
    } catch (error) {
      console.error('Error accepting invitation:', error);
      setError(error instanceof Error ? error.message : 'Une erreur est survenue');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      {/* Titre Principal */}
      <div className="mb-5">
        <h1 className="text-3xl font-bold text-gray-800">
          {firstName ? `Bonjour ${firstName},` : 'Bonjour,'}
        </h1>
        <h2 className="text-2xl font-semibold text-gray-700 mt-2">
          Invitation à rejoindre {organizationName || 'votre organization'}
        </h2>
      </div>

      {/* Contenu Principal */}
      <div className="flex flex-col items-center justify-center text-center">
        <p className="text-lg text-gray-600 mb-8">
          Vous avez été invité(e) à rejoindre une organisation. Cliquez sur le
          bouton ci-dessous pour accepter l'invitation et devenir membre.
        </p>
        <Button
          onClick={handleAcceptInvitation}
          disabled={isLoading}
        >
          {isLoading ? 'Acceptation en cours...' : 'Rejoindre l\'organisation'}
        </Button>
        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-600">{error}</p>
            {error.includes('expiré') && (
              <p className="text-sm text-red-500 mt-2">
                Vous pouvez demander une nouvelle invitation ou contacter l'administrateur de l'organisation.
              </p>
            )}
          </div>
        )}
      </div>

      {/* Conditions d'Utilisation */}
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-500">
          En acceptant cette invitation, vous acceptez les{" "}
          <a
            className="whitespace-nowrap font-medium text-gray-700 underline hover:no-underline"
            href="#0"
          >
            Conditions Générales d'Utilisation
          </a>{" "}
          et la{" "}
          <a
            className="whitespace-nowrap font-medium text-gray-700 underline hover:no-underline"
            href="#0"
          >
            Politique de Confidentialité
          </a>
          . 
        </p>
      </div>
    </div>
  );
}