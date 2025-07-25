"use client";

import { useState } from "react";
import { Button } from "@/src/components/landing-page/Button";
import authAPI from "@/src/services/api/authAPI";
import Link from "next/link";

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setStatus('error');
      setMessage("Veuillez saisir votre adresse email.");
      return;
    }

    // Validation basique de l'email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setStatus('error');
      setMessage("Veuillez saisir une adresse email valide.");
      return;
    }

    setStatus('loading');
    setMessage("");

    try {
      await authAPI.requestPasswordReset(email.trim());
      setStatus('success');
      setMessage(
        "Si cette adresse email est associée à un compte, vous recevrez un lien de réinitialisation dans quelques minutes."
      );
    } catch (error: any) {
      setStatus('success'); // Message générique pour la sécurité
      setMessage(
        "Si cette adresse email est associée à un compte, vous recevrez un lien de réinitialisation dans quelques minutes."
      );
    }
  };

  const handleEmailChange = (value: string) => {
    setEmail(value);
    
    if (status !== 'idle') {
      setStatus('idle');
      setMessage("");
    }
  };

  const canSubmit = email.trim().length > 0 && status !== 'loading';

  return (
    <div className="max-w-sm mx-auto">
      <div className="mb-10">
        <h1 className="text-4xl font-bold">Mot de passe oublié</h1>
        <p className="text-gray-600 mt-2">
          Saisissez votre adresse email et nous vous enverrons un lien pour réinitialiser votre mot de passe.
        </p>
      </div>

      {status === 'success' ? (
        <div className="space-y-6">
          <div className="p-4 bg-green-50 border border-green-200 rounded-md">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-green-700 font-medium">Email envoyé !</span>
            </div>
            <p className="text-green-700 text-sm mt-2">{message}</p>
          </div>

          <div className="text-center space-y-4">
            <p className="text-sm text-gray-600">
              Vous n'avez pas reçu d'email ? Vérifiez vos spams ou 
              <button
                type="button"
                onClick={() => {
                  setStatus('idle');
                  setMessage("");
                }}
                className="text-blue-500 underline ml-1 hover:no-underline"
              >
                réessayez
              </button>
            </p>
            
            <Link 
              href="/signin" 
              className="inline-block text-sm text-gray-700 underline hover:no-underline"
            >
              ← Retour à la connexion
            </Link>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label
                className="mb-1 block text-sm font-medium text-gray-700"
                htmlFor="email"
              >
                Adresse email
              </label>
              <input
                id="email"
                className="form-input w-full py-2"
                type="email"
                placeholder="votre@email.com"
                value={email}
                onChange={(e) => handleEmailChange(e.target.value)}
                disabled={status === 'loading'}
                autoComplete="email"
                required
              />
            </div>
          </div>

          {status === 'error' && message && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-700 text-sm">{message}</p>
            </div>
          )}

          <div className="mt-6">
            <Button
              type="submit"
              className="w-full"
              disabled={!canSubmit}
            >
              {status === 'loading' ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Envoi en cours...
                </span>
              ) : (
                "Envoyer le lien de réinitialisation"
              )}
            </Button>
          </div>

          <div className="mt-6 text-center">
            <Link 
              href="/signin" 
              className="text-sm text-gray-700 underline hover:no-underline"
            >
              ← Retour à la connexion
            </Link>
          </div>
        </form>
      )}
    </div>
  );
}