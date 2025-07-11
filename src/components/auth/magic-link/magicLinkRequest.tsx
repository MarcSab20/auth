"use client";

import { useState } from "react";
import { Button } from "@/src/components/landing-page/Button";

interface MagicLinkRequestProps {
  onSuccess?: (email: string) => void;
  onError?: (error: string) => void;
  className?: string;
}

export default function MagicLinkRequest({ 
  onSuccess, 
  onError, 
  className = "" 
}: MagicLinkRequestProps) {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setStatus('error');
      setMessage("Veuillez saisir votre adresse email.");
      onError?.("Email requis");
      return;
    }

    // Validation basique de l'email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setStatus('error');
      setMessage("Veuillez saisir une adresse email valide.");
      onError?.("Format email invalide");
      return;
    }

    setIsLoading(true);
    setStatus('idle');
    setMessage("");

    try {
      console.log('🔗 Demande de Magic Link pour:', email);
      
      // Appel vers votre API GraphQL pour générer un Magic Link
      const response = await fetch('http://localhost:3001/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: `
            mutation GenerateMagicLink($input: MagicLinkGenerationInputDto!) {
              generateMagicLink(input: $input) {
                success
                linkId
                message
                expiresAt
                emailSent
              }
            }
          `,
          variables: {
            input: {
              email: email.trim(),
              action: 'login',
              context: {
                ip: '',
                userAgent: navigator.userAgent,
                deviceFingerprint: '',
                referrer: window.location.href
              }
            }
          }
        }),
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.errors) {
        throw new Error(data.errors[0].message || 'Erreur GraphQL');
      }

      const result = data.data?.generateMagicLink;
      
      if (!result) {
        throw new Error('Réponse invalide du serveur');
      }

      if (result.success && result.emailSent) {
        setStatus('success');
        setMessage(result.message || 'Magic Link envoyé avec succès !');
        onSuccess?.(email);
        console.log('✅ Magic Link envoyé:', result);
      } else {
        setStatus('error');
        setMessage(result.message || 'Échec de l\'envoi du Magic Link');
        onError?.(result.message || 'Échec de l\'envoi');
      }
      
    } catch (error: any) {
      console.error('❌ Erreur lors de la demande de Magic Link:', error);
      setStatus('error');
      setMessage('Erreur de connexion au serveur. Veuillez réessayer.');
      onError?.(error.message || 'Erreur réseau');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailChange = (value: string) => {
    setEmail(value);
    
    if (status !== 'idle') {
      setStatus('idle');
      setMessage("");
    }
  };

  const canSubmit = email.trim().length > 0 && !isLoading;

  return (
    <div className={`max-w-sm mx-auto ${className}`}>
      {status === 'success' ? (
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
              {message}
            </p>
          </div>

          <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
            <div className="flex items-start space-x-3">
              <svg className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <div className="text-left">
                <p className="text-sm font-medium text-blue-900">
                  Vérifiez votre boîte email
                </p>
                <p className="text-xs text-blue-700 mt-1">
                  Un email contenant votre Magic Link a été envoyé à <strong>{email}</strong>
                </p>
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
                onClick={() => {
                  setStatus('idle');
                  setMessage("");
                }}
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
                disabled={isLoading}
                autoComplete="email"
                required
              />
            </div>
          </div>

          {status === 'error' && message && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <p className="text-red-700 text-sm">{message}</p>
              </div>
            </div>
          )}

          <div className="mt-6">
            <Button
              type="submit"
              className="w-full"
              disabled={!canSubmit}
            >
              {isLoading ? (
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