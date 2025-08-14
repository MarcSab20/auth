// auth/src/components/oauth/OAuthButtons.tsx
'use client';

import { useEffect, useState } from 'react';
import { useOAuth } from '@/context/oauthContext';

interface OAuthButtonsProps {
  action: 'login' | 'register';
  className?: string;
  disabled?: boolean;
}

export default function OAuthButtons({ action, className = '', disabled = false }: OAuthButtonsProps) {
  const { state, initiateOAuth, getAvailableProviders } = useOAuth();
  const [availableProviders, setAvailableProviders] = useState<any[]>([]);

  useEffect(() => {
    const loadProviders = async () => {
      try {
        const providers = await getAvailableProviders();
        setAvailableProviders(providers.filter(p => p.enabled && p.configured));
      } catch (error) {
        console.error('Failed to load OAuth providers:', error);
      }
    };

    loadProviders();
  }, [getAvailableProviders]);

  if (availableProviders.length === 0) {
    return null; // Ne rien afficher si aucun provider disponible
  }

  const handleOAuthClick = async (provider: 'github' | 'google') => {
    if (disabled || state.isLoading || state.isRedirecting) return;
    
    try {
      await initiateOAuth(provider, action);
    } catch (error) {
      console.error(`OAuth ${provider} error:`, error);
    }
  };

  const getProviderIcon = (provider: string) => {
    switch (provider) {
      case 'github':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
          </svg>
        );
      case 'google':
        return (
          <svg className="w-5 h-5" viewBox="0 0 24 24">
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

  const getProviderDisplayName = (provider: string) => {
    switch (provider) {
      case 'github':
        return 'GitHub';
      case 'google':
        return 'Google';
      default:
        return provider;
    }
  };

  const getActionText = () => {
    return action === 'login' ? 'Se connecter avec' : 'S\'inscrire avec';
  };

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">
            ou {getActionText().toLowerCase()}
          </span>
        </div>
      </div>

      <div className="grid gap-3">
        {availableProviders.map((provider) => (
          <button
            key={provider.name}
            type="button"
            onClick={() => handleOAuthClick(provider.name)}
            disabled={disabled || state.isLoading || state.isRedirecting}
            className={`
              w-full inline-flex justify-center items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm
              text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 
              focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-colors duration-200
              ${state.isRedirecting ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          >
            {state.isLoading || state.isRedirecting ? (
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              getProviderIcon(provider.name)
            )}
            <span className="ml-2">
              {state.isRedirecting 
                ? 'Redirection...' 
                : `${getActionText()} ${getProviderDisplayName(provider.name)}`
              }
            </span>
          </button>
        ))}
      </div>

      {state.error && (
        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <p className="text-red-700 text-sm">{state.error}</p>
          </div>
        </div>
      )}

      {/* Information sur la sécurité */}
      <div className="mt-3 text-center">
        <p className="text-xs text-gray-500">
          🔒 Connexion sécurisée via OAuth 2.0
        </p>
      </div>
    </div>
  );
}