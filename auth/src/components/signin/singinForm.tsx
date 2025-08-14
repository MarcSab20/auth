// auth/src/components/signin/singinForm.tsx - AVEC OAUTH GITHUB
"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/authenticationContext";
import { useMagicLink } from "@/context/magicLinkContext";
import Link from "next/link";
import { Button } from '@/src/components/landing-page/Button';
import { useSearchParams } from "next/navigation";
import { AUTH_CONFIG } from "@/src/config/auth.config";
import { TransitionService } from "@/src/lib/TransitionService";
import OAuthButtons from "@/src/components/oauth/OAuthButtons";

export default function SignInForm() {
  const { state, login, clearError, requestMagicLink } = useAuth();
  const { state: magicLinkState, isEnabled: isMagicLinkEnabled } = useMagicLink();
  const searchParams = useSearchParams();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState<'password' | 'magic-link' | 'oauth'>('password');
  const [magicLinkEnabled, setMagicLinkEnabled] = useState(false);
  const [magicLinkAction, setMagicLinkAction] = useState<'login' | 'register'>('login');
  const [isRedirecting, setIsRedirecting] = useState(false);
  
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

  const redirectToDashboard = useCallback(async (returnUrl: string = '/account'): Promise<void> => {
    try {
      console.log('🚀 [SIGNIN] Préparation redirection vers Dashboard...');
      setIsRedirecting(true);
      
      if (!state.isAuthenticated || !state.user) {
        throw new Error('Utilisateur non authentifié');
      }

      if (!state.token) {
        throw new Error('Token d\'accès manquant');
      }

      // Construire l'URL de redirection directe vers le Dashboard
      const dashboardUrl = new URL('/', AUTH_CONFIG.DASHBOARD_URL);
      
      console.log('🚀 [SIGNIN] Redirection vers Dashboard:', dashboardUrl.toString());
      
      // Effectuer la redirection externe
      window.location.href = dashboardUrl.toString();
      
    } catch (error: any) {
      console.error('❌ [SIGNIN] Erreur redirection Dashboard:', error);
      setIsRedirecting(false);
      throw error;
    }
  }, [state.isAuthenticated, state.user, state.token]);

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationErrors({});
    clearError();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      const result = await login({ username: username.trim(), password });
      
      if (result.success) {
        console.log('✅ [SIGNIN] Connexion réussie, redirection...');
        await redirectToDashboard('/account');
      }
    } catch (error) {
      console.error('❌ [SIGNIN] Erreur lors de la connexion:', error);
      setIsRedirecting(false);
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

  const isLoading = state.isLoading || magicLinkState.isLoading || isRedirecting;
  const currentError = state.error || magicLinkState.error;
  const magicLinkSuccess = magicLinkState.success;

  // Si redirection en cours, afficher un écran de redirection
  if (isRedirecting) {
    return (
      <div className="max-w-sm mx-auto">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Connexion réussie !</h2>
          <p className="text-gray-600 mb-4">Redirection vers le dashboard...</p>
          {state.user && (
            <p className="text-sm text-gray-500">
              Bienvenue {state.user.username}
            </p>
          )}
        </div>
      </div>
    );
  }

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

      {/* Onglets - afficher OAuth, Magic Link et Password */}
      <div className="mb-6">
        <div className="flex rounded-lg border border-gray-200 p-1 bg-gray-50">
          <button
            type="button"
            onClick={() => setActiveTab('password')}
            className={`flex-1 py-2 px-3 text-sm font-medium rounded-md transition-colors ${
              activeTab === 'password'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <span className="flex items-center justify-center">
              <svg className="mr-1 h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
              Mot de passe
            </span>
          </button>
          
          {/* OAuth Tab */}
          <button
            type="button"
            onClick={() => setActiveTab('oauth')}
            className={`flex-1 py-2 px-3 text-sm font-medium rounded-md transition-colors ${
              activeTab === 'oauth'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <span className="flex items-center justify-center">
              <svg className="mr-1 h-3 w-3" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              OAuth
            </span>
          </button>

          {/* Magic Link Tab - uniquement si activé */}
          {magicLinkEnabled && (
            <button
              type="button"
              onClick={() => setActiveTab('magic-link')}
              className={`flex-1 py-2 px-3 text-sm font-medium rounded-md transition-colors ${
                activeTab === 'magic-link'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <span className="flex items-center justify-center">
                <svg className="mr-1 h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
                Magic Link
              </span>
            </button>
          )}
        </div>
      </div>

      {/* Contenu des onglets */}
      {activeTab === 'oauth' ? (
        <div>
          <div className="text-center mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Connexion avec OAuth
            </h3>
            <p className="text-sm text-gray-600">
              Connectez-vous rapidement avec votre compte GitHub ou Google
            </p>
          </div>
          
          <OAuthButtons action="login" disabled={isLoading} />

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Première fois ici ?{" "}
              <Link href="/signup" className="text-blue-500 underline hover:no-underline">
                Créer un compte
              </Link>
            </p>
          </div>
        </div>
      ) : activeTab === 'password' ? (
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
          </div>

          <div className="mt-6 text-center">
            <Link href="/forgot-password" className="text-sm text-gray-700 underline hover:no-underline">
              Mot de passe oublié ?
            </Link>
          </div>
        </form>
      ) : (
        <div>
          {/* Contenu Magic Link existant */}
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
            // Contenu de succès Magic Link existant...
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
            {' | OAuth GitHub/Google disponible'}
          </p>
        </div>
      )}
    </div>
  );
}