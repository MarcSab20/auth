// auth/src/components/oauth/OAuthButtons.tsx - VERSION SIMPLIFIÉE
'use client';

import { useState } from 'react';

interface OAuthButtonsProps {
  action: 'login' | 'register';
  className?: string;
  disabled?: boolean;
}

export default function OAuthButtons({ action, className = '', disabled = false }: OAuthButtonsProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ✅ SOLUTION GRAPHQL : Utilisation de votre mutation generateOAuthUrl
  const handleOAuthClick = async (provider: 'github' | 'google') => {
    if (disabled || isLoading) return;
    
    console.log(`🔐 [OAUTH-BUTTONS] Initiating ${provider} OAuth for ${action}`);
    
    try {
      setIsLoading(true);
      setError(null);
      
      // Stocker l'action pour le callback
      sessionStorage.setItem('oauth_action', action);
      sessionStorage.setItem('oauth_provider', provider);
      
      // Appel GraphQL vers votre mutation generateOAuthUrl
      const graphqlUrl = process.env.NEXT_PUBLIC_GRAPHQL_URL || 'http://localhost:4000/graphql';
      
      const response = await fetch(graphqlUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-App-ID': process.env.NEXT_PUBLIC_AUTH_APP_ID || '',
          'X-App-Secret': process.env.NEXT_PUBLIC_AUTH_APP_SECRET || '',
        },
        credentials: 'include',
        body: JSON.stringify({
          query: `
            mutation GenerateOAuthUrl($input: OAuthAuthorizationInput!) {
              generateOAuthUrl(input: $input) {
                success
                authUrl
                state
                provider
                expiresAt
                message
              }
            }
          `,
          variables: {
            input: {
              provider: provider,
              redirectUri: `${window.location.origin}/oauth/callback`,
              scopes: provider === 'github' 
                ? ['user:email', 'read:user'] 
                : ['openid', 'email', 'profile']
            }
          }
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (result.errors) {
        throw new Error(result.errors[0].message);
      }

      const oauthData = result.data?.generateOAuthUrl;
      
      if (oauthData?.success && oauthData.authUrl) {
        console.log(`🚀 [OAUTH-BUTTONS] Redirecting to ${provider} OAuth: ${oauthData.authUrl}`);
        
        // Stocker le state retourné par le backend
        sessionStorage.setItem('oauth_state', oauthData.state);
        
        // Redirection vers l'URL générée par votre backend
        window.location.href = oauthData.authUrl;
      } else {
        throw new Error(oauthData?.message || 'Failed to generate OAuth URL');
      }
      
    } catch (error: any) {
      console.error(`❌ [OAUTH-BUTTONS] OAuth ${provider} error:`, error);
      setError(`Erreur OAuth ${provider}: ${error.message}`);
      setIsLoading(false);
    }
  };

  const getProviderIcon = (provider: string) => {
    switch (provider) {
      case 'github':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
          </svg>
        );
      case 'google':
        return (
          <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden="true">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
        );
      default:
        return null;
    }
  };

  const getActionText = () => {
    return action === 'login' ? 'Se connecter avec' : 'S\'inscrire avec';
  };

  // Providers disponibles (simplifié)
  const availableProviders = [
    { name: 'github', displayName: 'GitHub', enabled: true },
    { name: 'google', displayName: 'Google', enabled: true }
  ];

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Titre de section */}
      <div className="text-center">
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          {action === 'login' ? 'Connexion avec OAuth' : 'Inscription rapide avec OAuth'}
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          {action === 'login' 
            ? 'Connectez-vous rapidement avec votre compte GitHub ou Google'
            : 'Créez votre compte instantanément avec GitHub ou Google'
          }
        </p>
      </div>

      {/* Boutons OAuth */}
      <div className="grid gap-3">
        {availableProviders.map((provider) => (
          <button
            key={provider.name}
            type="button"
            onClick={() => handleOAuthClick(provider.name as 'github' | 'google')}
            disabled={disabled || isLoading}
            className={`
              w-full inline-flex justify-center items-center px-6 py-3 border-2 border-gray-300 rounded-lg shadow-sm
              text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-400
              focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
              disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:border-gray-300
              transition-all duration-200 ease-in-out
              ${provider.name === 'github' ? 'hover:text-gray-900' : ''}
              ${provider.name === 'google' ? 'hover:text-gray-900' : ''}
            `}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Redirection...</span>
              </>
            ) : (
              <>
                {getProviderIcon(provider.name)}
                <span className="ml-3">
                  {getActionText()} {provider.displayName}
                </span>
              </>
            )}
          </button>
        ))}
      </div>

      {/* Message d'erreur */}
      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-red-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Information sur la sécurité */}
      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start space-x-3">
          <svg className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="text-left">
            <p className="text-sm font-medium text-blue-900">
              {action === 'login' ? 'Connexion sécurisée' : 'Inscription automatique'}
            </p>
            <p className="text-xs text-blue-700 mt-1">
              {action === 'login' 
                ? 'Votre authentification est sécurisée via OAuth 2.0. Nous ne stockons jamais vos mots de passe.'
                : 'Votre compte sera créé automatiquement avec les informations de votre profil. Aucun mot de passe nécessaire.'
              }
            </p>
          </div>
        </div>
      </div>

      {/* Séparateur */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">
            ou {action === 'login' ? 'utilisez votre mot de passe' : 'remplissez le formulaire'}
          </span>
        </div>
      </div>
    </div>
  );
}