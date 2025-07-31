// auth/src/components/debug/ConfigDebug.tsx - COMPOSANT DE DEBUG

'use client';

import { useState } from 'react';
import { AUTH_CONFIG } from '@/src/config/auth.config';

export default function ConfigDebug() {
  const [isOpen, setIsOpen] = useState(false);

  // Ne s'affiche qu'en développement
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  const configStatus = {
    AUTH_APP_ID: AUTH_CONFIG.AUTH_APP.APP_ID ? 'SET' : 'MISSING',
    AUTH_APP_SECRET: AUTH_CONFIG.AUTH_APP.APP_SECRET ? 'SET' : 'MISSING',
    GATEWAY_URL: AUTH_CONFIG.GATEWAY_URL,
    GRAPHQL_URL: AUTH_CONFIG.GRAPHQL_URL,
    AUTH_URL: AUTH_CONFIG.AUTH_URL,
    DASHBOARD_URL: AUTH_CONFIG.DASHBOARD_URL,
  };

  const hasErrors = Object.values(configStatus).some(status => status === 'MISSING');

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`px-3 py-2 rounded-lg text-white text-sm font-medium ${
          hasErrors ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-500 hover:bg-blue-600'
        }`}
      >
        🔧 Debug Config {hasErrors && '⚠️'}
      </button>

      {isOpen && (
        <div className="absolute bottom-12 right-0 w-96 bg-white border border-gray-200 rounded-lg shadow-lg p-4 max-h-96 overflow-y-auto">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-semibold text-gray-900">Configuration Status</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>
          
          <div className="space-y-2">
            {Object.entries(configStatus).map(([key, value]) => (
              <div key={key} className="flex justify-between items-center">
                <span className="text-sm font-mono text-gray-700">{key}:</span>
                <span className={`text-xs px-2 py-1 rounded ${
                  value === 'MISSING' 
                    ? 'bg-red-100 text-red-800' 
                    : value === 'SET'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-blue-100 text-blue-800'
                }`}>
                  {value === 'SET' ? 'SET' : value === 'MISSING' ? 'MISSING' : value}
                </span>
              </div>
            ))}
          </div>

          {hasErrors && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded">
              <h4 className="text-sm font-medium text-red-900 mb-2">⚠️ Configuration Issues</h4>
              <ul className="text-xs text-red-700 space-y-1">
                <li>• Vérifiez vos variables d'environnement</li>
                <li>• Assurez-vous que .env.local est configuré</li>
                <li>• Redémarrez le serveur après modification</li>
              </ul>
            </div>
          )}

          <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Expected .env.local:</h4>
            <pre className="text-xs text-gray-700 whitespace-pre-wrap">
{`NEXT_PUBLIC_AUTH_APP_ID=your_auth_app_id
NEXT_PUBLIC_AUTH_APP_SECRET=your_auth_app_secret
NEXT_PUBLIC_GATEWAY_URL=http://localhost:4000
NEXT_PUBLIC_GRAPHQL_URL=http://localhost:4000/graphql
NEXT_PUBLIC_AUTH_URL=http://localhost:3000
NEXT_PUBLIC_DASHBOARD_URL=http://localhost:3002`}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}