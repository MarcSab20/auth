// auth/src/components/debug/ConfigDebug.tsx
'use client';

import { AUTH_CONFIG } from '@/src/config/auth.config';

export default function ConfigDebug() {
  if (process.env.NODE_ENV === 'production') {
    return null;
  }

  return (
    <div className="fixed bottom-2 right-2 p-3 text-xs bg-gray-900 text-white rounded shadow-lg z-50 max-w-sm">
      <div className="font-bold mb-2 text-yellow-400">🔧 Auth Config Debug</div>
      <div className="space-y-1">
        <div><strong>Auth URL:</strong> {AUTH_CONFIG.AUTH_URL}</div>
        <div><strong>Dashboard URL:</strong> {AUTH_CONFIG.DASHBOARD_URL}</div>
        <div><strong>Gateway URL:</strong> {AUTH_CONFIG.GATEWAY_URL}</div>
        <div><strong>GraphQL URL:</strong> {AUTH_CONFIG.GRAPHQL_URL}</div>
        <div><strong>Cookie Domain:</strong> {AUTH_CONFIG.COOKIE_DOMAIN}</div>
        <div className="pt-2 border-t border-gray-700">
          <div><strong>Current Origin:</strong> {typeof window !== 'undefined' ? window.location.origin : 'N/A'}</div>
          <div><strong>Current Path:</strong> {typeof window !== 'undefined' ? window.location.pathname : 'N/A'}</div>
        </div>
      </div>
    </div>
  );
}