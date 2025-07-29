// dashboard/src/components/debug/SessionDebug.tsx - CORRECTION TYPAGE
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/authenticationContext';
import { SharedSessionManager } from '@/src/lib/SharedSessionManager';

interface SessionDebugProps {
  enabled?: boolean;
}

export default function SessionDebug({ enabled = process.env.NODE_ENV === 'development' }: SessionDebugProps) {
  const { state, user, isAuthenticated, isLoading } = useAuth();
  const [sessionInfo, setSessionInfo] = useState<any>(null);
  const [cookieInfo, setCookieInfo] = useState<Record<string, string | null>>({});
  const [localStorageInfo, setLocalStorageInfo] = useState<Record<string, string | null>>({});
  const [isMinimized, setIsMinimized] = useState(false);

  useEffect(() => {
    if (!enabled) return;

    const updateDebugInfo = () => {
      try {
        // Session partagée
        const session = SharedSessionManager.getSession();
        setSessionInfo(session);

        // Cookies
        const cookies: Record<string, string | null> = {
          smp_user_0: getCookie('smp_user_0'),
          smp_user_token: getCookie('smp_user_token'),
          smp_session_id: getCookie('smp_session_id'),
          access_token: getCookie('access_token'),
        };
        setCookieInfo(cookies);

        // LocalStorage
        const localStorage: Record<string, string | null> = {
          access_token: window.localStorage.getItem('access_token'),
          refresh_token: window.localStorage.getItem('refresh_token'),
          smp_user_0: window.localStorage.getItem('smp_user_0'),
          smp_session_id: window.localStorage.getItem('smp_session_id'),
          dashboard_app_token: window.localStorage.getItem('dashboard_app_token'),
        };
        setLocalStorageInfo(localStorage);
      } catch (error) {
        console.warn('Error updating debug info:', error);
      }
    };

    updateDebugInfo();
    const interval = setInterval(updateDebugInfo, 2000);

    return () => clearInterval(interval);
  }, [enabled]);

  const getCookie = (name: string): string | null => {
    if (typeof document === 'undefined') return null;
    try {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) {
        const cookieValue = parts.pop()?.split(';').shift();
        return cookieValue ? decodeURIComponent(cookieValue) : null;
      }
    } catch (error) {
      console.warn('Error reading cookie:', name, error);
    }
    return null;
  };

  const formatValue = (value: string | null): string => {
    if (!value) return 'Missing';
    if (typeof value === 'string' && value.length > 15) {
      return value.substring(0, 15) + '...';
    }
    return value;
  };

  const handleClearSession = () => {
    if (confirm('Êtes-vous sûr de vouloir effacer la session ?')) {
      SharedSessionManager.clearSession();
      window.location.reload();
    }
  };

  const handleRefreshSession = () => {
    window.location.reload();
  };

  const handleToggleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  const copyToClipboard = (data: any) => {
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
  };

  if (!enabled) return null;

  return (
    <div className={`fixed bottom-4 right-4 w-96 bg-black text-white text-xs rounded-lg shadow-lg z-50 font-mono border border-gray-700 ${
      isMinimized ? 'h-10' : 'max-h-96'
    } transition-all duration-200`}>
      {/* Header toujours visible */}
      <div className="flex justify-between items-center p-3 bg-gray-800 rounded-t-lg cursor-pointer" onClick={handleToggleMinimize}>
        <h3 className="text-yellow-400 font-bold flex items-center">
          🔧 Session Debug 
          <span className={`ml-2 w-2 h-2 rounded-full ${isAuthenticated ? 'bg-green-400' : 'bg-red-400'}`}></span>
        </h3>
        <div className="flex items-center space-x-1">
          <span className="text-gray-400 text-xs">{isMinimized ? '▲' : '▼'}</span>
          {!isMinimized && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); handleRefreshSession(); }}
                className="bg-blue-600 hover:bg-blue-700 px-2 py-1 rounded text-xs"
                title="Rafraîchir"
              >
                🔄
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); handleClearSession(); }}
                className="bg-red-600 hover:bg-red-700 px-2 py-1 rounded text-xs"
                title="Effacer session"
              >
                🗑️
              </button>
            </>
          )}
        </div>
      </div>

      {/* Contenu détaillé */}
      {!isMinimized && (
        <div className="p-3 max-h-80 overflow-auto">
          {/* État d'authentification */}
          <div className="mb-3">
            <div className="text-green-400 font-semibold flex items-center justify-between">
              Auth State:
              <button 
                onClick={() => copyToClipboard({ isLoading, isAuthenticated, user, error: state.error })}
                className="text-xs bg-gray-700 hover:bg-gray-600 px-1 rounded"
                title="Copier"
              >
                📋
              </button>
            </div>
            <div className="pl-2 space-y-1">
              <div>Loading: <span className={isLoading ? 'text-yellow-400' : 'text-green-400'}>{String(isLoading)}</span></div>
              <div>Authenticated: <span className={isAuthenticated ? 'text-green-400' : 'text-red-400'}>{String(isAuthenticated)}</span></div>
              <div>User ID: <span className="text-blue-400">{user?.userID?.substring(0, 8) || 'N/A'}...</span></div>
              <div>Username: <span className="text-blue-400">{user?.username || 'N/A'}</span></div>
              <div>Email: <span className="text-blue-400">{user?.email || 'N/A'}</span></div>
              {state.error && <div>Error: <span className="text-red-400 break-words">{state.error}</span></div>}
            </div>
          </div>

          {/* Session partagée */}
          <div className="mb-3">
            <div className="text-green-400 font-semibold flex items-center justify-between">
              Shared Session:
              <button 
                onClick={() => copyToClipboard(sessionInfo)}
                className="text-xs bg-gray-700 hover:bg-gray-600 px-1 rounded"
                title="Copier"
              >
                📋
              </button>
            </div>
            <div className="pl-2 space-y-1">
              {sessionInfo ? (
                <>
                  <div>Valid: <span className={SharedSessionManager.isSessionValid(sessionInfo) ? 'text-green-400' : 'text-red-400'}>
                    {SharedSessionManager.isSessionValid(sessionInfo) ? 'Yes' : 'No'}
                  </span></div>
                  <div>Session ID: <span className="text-blue-400">{sessionInfo.sessionId.substring(0, 12)}...</span></div>
                  <div>Source: <span className="text-blue-400">{sessionInfo.source}</span></div>
                  <div>Expires: <span className="text-blue-400">{new Date(sessionInfo.expiresAt).toLocaleTimeString()}</span></div>
                  <div>Last Activity: <span className="text-blue-400">{new Date(sessionInfo.lastActivity).toLocaleTimeString()}</span></div>
                  <div>Has Access Token: <span className="text-green-400">{sessionInfo.tokens?.accessToken ? 'Yes' : 'No'}</span></div>
                  <div>Has Refresh Token: <span className="text-green-400">{sessionInfo.tokens?.refreshToken ? 'Yes' : 'No'}</span></div>
                </>
              ) : (
                <div className="text-red-400">No session found</div>
              )}
            </div>
          </div>

          {/* Cookies */}
          <div className="mb-3">
            <div className="text-green-400 font-semibold flex items-center justify-between">
              Cookies:
              <button 
                onClick={() => copyToClipboard(cookieInfo)}
                className="text-xs bg-gray-700 hover:bg-gray-600 px-1 rounded"
                title="Copier"
              >
                📋
              </button>
            </div>
            <div className="pl-2 space-y-1">
              {Object.entries(cookieInfo).map(([key, value]) => (
                <div key={key} className="flex justify-between">
                  <span>{key}:</span>
                  <span className={value ? 'text-green-400' : 'text-red-400'}>
                    {formatValue(value)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* LocalStorage */}
          <div className="mb-3">
            <div className="text-green-400 font-semibold flex items-center justify-between">
              LocalStorage:
              <button 
                onClick={() => copyToClipboard(localStorageInfo)}
                className="text-xs bg-gray-700 hover:bg-gray-600 px-1 rounded"
                title="Copier"
              >
                📋
              </button>
            </div>
            <div className="pl-2 space-y-1">
              {Object.entries(localStorageInfo).map(([key, value]) => (
                <div key={key} className="flex justify-between">
                  <span>{key}:</span>
                  <span className={value ? 'text-green-400' : 'text-red-400'}>
                    {formatValue(value)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* URLs de configuration */}
          <div className="mb-2">
            <div className="text-green-400 font-semibold">Config:</div>
            <div className="pl-2 space-y-1 text-xs">
              <div>Auth: <span className="text-blue-400">{process.env.NEXT_PUBLIC_AUTH_URL || 'http://localhost:3000'}</span></div>
              <div>Dashboard: <span className="text-blue-400">{process.env.NEXT_PUBLIC_DASHBOARD_URL || 'http://localhost:3002'}</span></div>
              <div>API: <span className="text-blue-400">{process.env.NEXT_PUBLIC_GRAPHQL_URL || 'http://localhost:4000/graphql'}</span></div>
            </div>
          </div>

          {/* Timestamp */}
          <div className="text-xs text-gray-500 text-center border-t border-gray-700 pt-2">
            Last update: {new Date().toLocaleTimeString()}
          </div>
        </div>
      )}
    </div>
  );
}