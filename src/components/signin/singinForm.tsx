"use client";

import { useState } from "react";
import { useEnhancedAuth } from "@/context/enhancedAuthContext";
import Link from "next/link";
import { Button } from '@/src/components/landing-page/Button';
import { useSearchParams } from "next/navigation";

export default function SignInForm() {
  const { state, login, clearError } = useEnhancedAuth();
  const searchParams = useSearchParams();
  
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const initialMessage = searchParams.get("message");

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!username.trim()) {
      errors.username = "Le nom d'utilisateur ou email est requis";
    } else if (username.trim().length < 3) {
      errors.username = "Le nom d'utilisateur doit contenir au moins 3 caractères";
    }

    if (!password.trim()) {
      errors.password = "Le mot de passe est requis";
    } else if (password.length < 6) {
      errors.password = "Le mot de passe doit contenir au moins 6 caractères";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setValidationErrors({});
    clearError();

    if (!validateForm()) {
      return;
    }

    const result = await login({ username: username.trim(), password });
    
    if (result.success) {
      window.location.href = "/account";
    }
  };

  const handleFieldChange = (field: 'username' | 'password', value: string) => {
    if (field === 'username') {
      setUsername(value);
    } else {
      setPassword(value);
    }

    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }

    if (state.error) {
      clearError();
    }
  };

  return (
    <div className="max-w-sm mx-auto">
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-bold">Connectez-vous à votre compte</h1>
      </div>

      {initialMessage && (
        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
          <p className="text-blue-700 text-sm">{initialMessage}</p>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="username">
              Nom d'utilisateur ou email
            </label>
            <input
              id="username"
              type="text"
              className={`form-input w-full py-2 ${
                validationErrors.username ? 'border-red-300 focus:border-red-500' : ''
              }`}
              placeholder="Votre identifiant"
              value={username}
              onChange={(e) => handleFieldChange('username', e.target.value)}
              disabled={state.isLoading}
              autoComplete="username"
              required
            />
            {validationErrors.username && (
              <p className="text-red-500 text-sm mt-1">{validationErrors.username}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="password">
              Mot de passe
            </label>
            <input
              id="password"
              type="password"
              className={`form-input w-full py-2 ${
                validationErrors.password ? 'border-red-300 focus:border-red-500' : ''
              }`}
              placeholder="••••••••"
              value={password}
              onChange={(e) => handleFieldChange('password', e.target.value)}
              disabled={state.isLoading}
              autoComplete="current-password"
              required
            />
            {validationErrors.password && (
              <p className="text-red-500 text-sm mt-1">{validationErrors.password}</p>
            )}
          </div>
        </div>

        {state.error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-700 text-sm">{state.error}</p>
          </div>
        )}

        <div className="mt-6">
          <Button
            type="submit"
            className="w-full"
            disabled={state.isLoading}
          >
            {state.isLoading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Connexion...
              </span>
            ) : (
              "Se connecter"
            )}
          </Button>
        </div>
      </form>

      <div className="mt-6 text-center">
        <Link href="/forgot-password" className="text-sm text-gray-700 underline hover:no-underline">
          Mot de passe oublié ?
        </Link>
      </div>
      
      <div className="mt-4 text-center text-sm text-gray-700">
        Pas encore inscrit ?
        <Link href="/signup" className="text-blue-500 underline ml-1 hover:no-underline">
          Créer un compte
        </Link>
      </div>
    </div>
  );
}
