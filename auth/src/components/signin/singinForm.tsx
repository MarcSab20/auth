"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/authenticationContext";
import { useMagicLink } from "@/context/magicLinkContext";
import Link from "next/link";
import { Button } from '@/src/components/landing-page/Button';
import { useSearchParams } from "next/navigation";
import { PostLoginRedirect } from "@/src/components/auth/RedirectToDashboard";
import { RedirectToDashboard } from "@/src/components/auth/RedirectToDashboard";

export default function SignInForm() {
  const { state, login, clearError, requestMagicLink } = useAuth();
  const { state: magicLinkState, isEnabled: isMagicLinkEnabled } = useMagicLink();
  const searchParams = useSearchParams();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState<'password' | 'magic-link'>('password');
  const [magicLinkEnabled, setMagicLinkEnabled] = useState(false);
    const [magicLinkAction, setMagicLinkAction] = useState<'login' | 'register'>('login');
  const initialMessage = searchParams.get("message");

  useEffect(() => {
    const checkMagicLinkAvailability = async () => {
      try {
        const enabled = await isMagicLinkEnabled();
        setMagicLinkEnabled(enabled);
      } catch (error) {
        console.warn('Could not check Magic Link availability:', error);
        setMagicLinkEnabled(false);
      }
    };

    checkMagicLinkAvailability();
  }, [isMagicLinkEnabled]);

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!username.trim()) {
      errors.username = "Le nom d'utilisateur ou email est requis";
    } else if (username.trim().length < 3) {
      errors.username = "Le nom d'utilisateur doit contenir au moins 3 caractères";
    }

    if (activeTab === 'password') {
      if (!password.trim()) {
        errors.password = "Le mot de passe est requis";
      } else if (password.length < 6) {
        errors.password = "Le mot de passe doit contenir au moins 6 caractères";
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handlePasswordLogin = async (e: React.FormEvent) => {
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

  const handleMagicLinkRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setValidationErrors({});
    clearError();

    if (!username.trim()) {
      setValidationErrors({ username: "L'email est requis pour Magic Link" });
      return;
    }

    // Vérifier que c'est un email valide
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(username.trim())) {
      setValidationErrors({ username: "Veuillez saisir une adresse email valide" });
      return;
    }

    const result = await requestMagicLink(username.trim(), 'login');
    
    if (result.success) {
      console.log('Magic Link envoyé avec succès');
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

  const isLoading = state.isLoading || magicLinkState.isLoading;
  const currentError = state.error || magicLinkState.error;
  const magicLinkSuccess = magicLinkState.success;

  return (
    <div className="max-w-sm mx-auto">
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-bold">Connectez-vous à votre compte</h1>
        <p className="text-gray-600 mt-2">Propulsé par SMP SDK</p>
      </div>

      {initialMessage && (
        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
          <p className="text-blue-700 text-sm">{initialMessage}</p>
        </div>
      )}

      {/* Onglets - n'afficher que si Magic Link est activé */}
      {magicLinkEnabled && (
        <div className="mb-6">
          <div className="flex rounded-lg border border-gray-200 p-1 bg-gray-50">
            <button
              type="button"
              onClick={() => setActiveTab('password')}
              className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
                activeTab === 'password'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <span className="flex items-center justify-center">
                <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
                Mot de passe
              </span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('magic-link')}
              className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
                activeTab === 'magic-link'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <span className="flex items-center justify-center">
                <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
                Magic Link
              </span>
            </button>
          </div>
        </div>
      )}

      {/* Contenu des onglets */}
      {activeTab === 'password' ? (
        <form onSubmit={handlePasswordLogin}>
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
                disabled={isLoading}
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
                disabled={isLoading}
                autoComplete="current-password"
                required
              />
              {validationErrors.password && (
                <p className="text-red-500 text-sm mt-1">{validationErrors.password}</p>
              )}
            </div>
          </div>

          <div className="mt-6">
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
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
            {/* Bouton de redirection vers Dashboard si connecté */}
            {state.isAuthenticated && state.user && (
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                      <svg className="h-4 w-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-green-900">
                        Connexion réussie !
                      </p>
                      <p className="text-xs text-green-700">
                        Bienvenue {state.user.username}
                      </p>
                    </div>
                  </div>
                  <RedirectToDashboard
                    returnUrl="/account"
                    size="sm"
                    className="whitespace-nowrap"
                  >
                    Accéder au Dashboard
                  </RedirectToDashboard>
                </div>
              </div>
            )}
          </div>

          <div className="mt-6 text-center">
            <Link href="/forgot-password" className="text-sm text-gray-700 underline hover:no-underline">
              Mot de passe oublié ?
            </Link>
          </div>
        </form>
      ) : (
        <div>
          {!magicLinkSuccess ? (
            <form onSubmit={handleMagicLinkRequest}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="magic-email">
                    Adresse email
                  </label>
                  <input
                    id="magic-email"
                    type="email"
                    className={`form-input w-full py-2 ${
                      validationErrors.username ? 'border-red-300 focus:border-red-500' : ''
                    }`}
                    placeholder="votre@email.com"
                    value={username}
                    onChange={(e) => handleFieldChange('username', e.target.value)}
                    disabled={isLoading}
                    autoComplete="email"
                    required
                  />
                  {validationErrors.username && (
                    <p className="text-red-500 text-sm mt-1">{validationErrors.username}</p>
                  )}
                </div>
                 <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="magic-action">
                    Action souhaitée
                  </label>
                  <select
                    id="magic-action"
                    className="form-select w-full py-2"
                    value={magicLinkAction}
                    onChange={(e) => setMagicLinkAction(e.target.value as 'login' | 'register')}
                    disabled={isLoading}
                  >
                    <option value="login">Connexion </option>
                    <option value="register">Inscription </option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    {magicLinkAction === 'login' 
                      ? 'Se connecter avec un compte existant'
                      : 'Créer un nouveau compte automatiquement'
                    }
                  </p>
                </div>
              </div>

              <div className="mt-6">
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading}
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
            </form>
          ) : (
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
                  {magicLinkSuccess}
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
                      Un email contenant votre Magic Link a été envoyé à <strong>{username}</strong>
                    </p>
                    <p className="text-xs text-blue-600 mt-1">
                      Expire dans 30 minutes
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
          )}

          {!magicLinkSuccess && (
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600 mb-2">
                Pourquoi utiliser Magic Link ?
              </p>
              <div className="text-xs text-gray-500 space-y-1">
                <p>✨ Plus sûr qu'un mot de passe</p>
                <p>⚡ Connexion instantanée</p>
                <p>🔒 Lien sécurisé à usage unique</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Affichage des erreurs */}
      {currentError && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <p className="text-red-700 text-sm">{currentError}</p>
          </div>
        </div>
      )}
      
      <div className="mt-8 text-center text-sm text-gray-700 border-t pt-6">
        {/* Redirection automatique après connexion réussie */}
        <PostLoginRedirect />
        Pas encore inscrit ?
        <Link href="/signup" className="text-blue-500 underline ml-1 hover:no-underline">
          Créer un compte
        </Link>
      </div>

      {/* Informations SDK en mode développement */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-xs text-gray-600 text-center">
            🔧 Propulsé par SMP SDK v1.0.0
            {magicLinkEnabled && ' | Magic Link activé'}
          </p>
        </div>
      )}
    </div>
  );
}