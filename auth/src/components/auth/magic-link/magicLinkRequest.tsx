// auth/src/components/auth/magic-link/magicLinkRequest.tsx
"use client";

import { useState } from "react";
import { Button } from "@/src/components/landing-page/Button";
import { useMagicLink } from "@/context/magicLinkContext";
import { maskEmail, storeMagicLinkData } from "@/src/utils/magicLink";

interface MagicLinkRequestProps {
  onSuccess?: (email: string) => void;
  onError?: (error: string) => void;
  className?: string;
  defaultEmail?: string;
  defaultAction?: 'login' | 'register' | 'reset_password' | 'verify_email';
}

const ACTION_LABELS = {
  'login': '🔑 Connexion',
  'register': '✨ Inscription',
  'reset_password': '🔄 Reset mot de passe',
  'verify_email': '✅ Vérifier email'
};

const ACTION_DESCRIPTIONS = {
  'login': 'Se connecter avec un compte existant',
  'register': 'Créer un nouveau compte automatiquement',
  'reset_password': 'Réinitialiser votre mot de passe',
  'verify_email': 'Vérifier votre adresse email'
};

export default function MagicLinkRequest({ 
  onSuccess, 
  onError, 
  className = "",
  defaultEmail = "",
  defaultAction = 'login'
}: MagicLinkRequestProps) {
  const { generateMagicLink, state } = useMagicLink();
  const [email, setEmail] = useState(defaultEmail);
  const [action, setAction] = useState(defaultAction);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      onError?.("Veuillez saisir votre adresse email.");
      return;
    }

    // Validation basique de l'email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      onError?.("Veuillez saisir une adresse email valide.");
      return;
    }

    try {
      console.log('🔗 Demande de Magic Link pour:', email, 'Action:', action);
      
      const result = await generateMagicLink({
        email: email.trim(),
        action,
        redirectUrl: '/account',
        userAgent: navigator.userAgent,
        referrer: window.location.href
      });

      if (result.success) {
        // Stocker les données pour référence
        storeMagicLinkData({
          email: email.trim(),
          action,
          linkId: state.lastGeneratedLink?.linkId,
          expiresAt: state.lastGeneratedLink?.expiresAt
        });
        
        onSuccess?.(email.trim());
        console.log('✅ Magic Link envoyé:', result);
      } else {
        onError?.(result.error || 'Échec de l\'envoi');
      }
      
    } catch (error: any) {
      console.error('❌ Erreur lors de la demande de Magic Link:', error);
      onError?.(error.message || 'Erreur de connexion au serveur');
    }
  };

  const handleEmailChange = (value: string) => {
    setEmail(value);
  };

  const canSubmit = email.trim().length > 0 && !state.isLoading;

  return (
    <div className={`max-w-sm mx-auto ${className}`}>
      {state.success && state.lastGeneratedLink ? (
        <div className="space-y-6">
          <div className="text-center">
            <div className="mx-auto h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
              <svg className="h-8 w-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Magic Link envoyé !
            </h3>
            <p className="text-sm text-gray-600">
              {state.success}
            </p>
          </div>

          <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
            <div className="flex items-start space-x-3">
              <svg className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <div className="text-left">
                <p className="text-sm font-medium text-blue-900">
                  Action: {ACTION_LABELS[action]}
                </p>
                <p className="text-xs text-blue-700 mt-1">
                  Email envoyé à <strong>{maskEmail(email)}</strong>
                </p>
                {state.lastGeneratedLink.expiresAt && (
                  <p className="text-xs text-blue-600 mt-1">
                    Expire dans 30 minutes
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-3 text-center">
            <p className="text-sm text-gray-600">
              Vous n'avez pas reçu d'email ?
            </p>
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="text-blue-500 underline text-sm hover:no-underline"
              >
                Renvoyer le Magic Link
              </button>
              <p className="text-xs text-gray-500">
                Vérifiez aussi vos spams
              </p>
            </div>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label
                className="mb-1 block text-sm font-medium text-gray-700"
                htmlFor="magic-link-email"
              >
                Adresse email
              </label>
              <input
                id="magic-link-email"
                className="form-input w-full py-2"
                type="email"
                placeholder="votre@email.com"
                value={email}
                onChange={(e) => handleEmailChange(e.target.value)}
                disabled={state.isLoading}
                autoComplete="email"
                required
              />
            </div>

            <div>
              <label
                className="mb-1 block text-sm font-medium text-gray-700"
                htmlFor="magic-link-action"
              >
                Action souhaitée
              </label>
              <select
                id="magic-link-action"
                className="form-select w-full py-2"
                value={action}
                onChange={(e) => setAction(e.target.value as any)}
                disabled={state.isLoading}
              >
                {Object.entries(ACTION_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                {ACTION_DESCRIPTIONS[action]}
              </p>
            </div>
          </div>

          {state.error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <p className="text-red-700 text-sm">{state.error}</p>
              </div>
            </div>
          )}

          <div className="mt-6">
            <Button
              type="submit"
              className="w-full"
              disabled={!canSubmit}
            >
              {state.isLoading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Envoi en cours...
                </span>
              ) : (
                <span className="flex items-center justify-center">
                  <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                  Envoyer Magic Link
                </span>
              )}
            </Button>
          </div>

          <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
            <div className="text-left space-y-1">
              <h4 className="text-sm font-medium text-gray-900 flex items-center">
                <svg className="h-4 w-4 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Magic Link
              </h4>
              <ul className="text-xs text-gray-600 space-y-1">
                <li>• Connexion sécurisée sans mot de passe</li>
                <li>• Création de compte automatique si nécessaire</li>
                <li>• Lien à usage unique valide 30 minutes</li>
                <li>• Envoyé directement dans votre boîte email</li>
              </ul>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}