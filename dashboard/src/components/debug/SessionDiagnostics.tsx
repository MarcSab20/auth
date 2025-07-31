// dashboard/src/components/debug/SessionDiagnostics.tsx - NEW DIAGNOSTIC TOOL
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/authenticationContext';
import { SharedSessionManager } from '@/src/lib/SharedSessionManager';

interface DiagnosticResult {
  category: string;
  status: 'success' | 'warning' | 'error' | 'info';
  message: string;
  details?: any;
  suggestion?: string;
}

interface SessionDiagnosticsProps {
  showInProduction?: boolean;
}

export default function SessionDiagnostics({ showInProduction = false }: SessionDiagnosticsProps) {
  const { state, user, isAuthenticated, testAppAuth } = useAuth();
  const [diagnostics, setDiagnostics] = useState<DiagnosticResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  // Don't show in production unless explicitly requested
  if (process.env.NODE_ENV === 'production' && !showInProduction) {
    return null;
  }

  const runDiagnostics = async () => {
    setIsRunning(true);
    const results: DiagnosticResult[] = [];

    try {
      // 1. Check localStorage
      const hasAccessToken = !!localStorage.getItem('access_token');
      const hasRefreshToken = !!localStorage.getItem('refresh_token');
      const hasUserData = !!localStorage.getItem('smp_user_0');
      const hasSessionId = !!localStorage.getItem('smp_session_id');

      results.push({
        category: 'LocalStorage',
        status: hasAccessToken && hasUserData ? 'success' : 'error',
        message: `Tokens: ${hasAccessToken ? '✓' : '✗'} | User: ${hasUserData ? '✓' : '✗'} | Session: ${hasSessionId ? '✓' : '✗'}`,
        details: {
          accessToken: hasAccessToken,
          refreshToken: hasRefreshToken,
          userData: hasUserData,
          sessionId: hasSessionId,
        },
        suggestion: !hasAccessToken ? 'Session data missing. Try logging in again.' : undefined
      });

      // 2. Check cookies
      const cookies = document.cookie.split(';').reduce((acc, cookie) => {
        const [key, value] = cookie.trim().split('=');
        acc[key] = value;
        return acc;
      }, {} as Record<string, string>);

      const hasCookieUser = !!cookies['smp_user_0'];
      const hasCookieToken = !!cookies['smp_user_token'] || !!cookies['access_token'];
      const hasCookieSession = !!cookies['smp_session_id'];

      results.push({
        category: 'Cookies',
        status: hasCookieUser && hasCookieSession ? 'success' : 'warning',
        message: `User: ${hasCookieUser ? '✓' : '✗'} | Token: ${hasCookieToken ? '✓' : '✗'} | Session: ${hasCookieSession ? '✓' : '✗'}`,
        details: {
          available: Object.keys(cookies),
          smpUser: hasCookieUser,
          token: hasCookieToken,
          session: hasCookieSession,
        },
        suggestion: !hasCookieUser ? 'Cross-domain cookies not working. Check domain configuration.' : undefined
      });

      // 3. Check SharedSessionManager
      const sharedSession = SharedSessionManager.getSession();
      const isValidSharedSession = sharedSession ? SharedSessionManager.isSessionValid(sharedSession) : false;

      results.push({
        category: 'Shared Session',
        status: isValidSharedSession ? 'success' : 'error',
        message: sharedSession 
          ? `Session ${isValidSharedSession ? 'valid' : 'expired'} (${sharedSession.source})`
          : 'No shared session found',
        details: sharedSession ? {
          sessionId: sharedSession.sessionId,
          source: sharedSession.source,
          expiresAt: sharedSession.expiresAt,
          lastActivity: sharedSession.lastActivity,
          userId: sharedSession.user.userID,
          hasTokens: !!sharedSession.tokens.accessToken,
        } : null,
        suggestion: !isValidSharedSession ? 'Shared session invalid. Check expiration and activity limits.' : undefined
      });

      // 4. Check Auth Context
      results.push({
        category: 'Auth Context',
        status: isAuthenticated ? 'success' : 'error',
        message: `Authenticated: ${isAuthenticated ? 'Yes' : 'No'} | Loading: ${state.isLoading ? 'Yes' : 'No'}`,
        details: {
          isAuthenticated,
          isLoading: state.isLoading,
          hasUser: !!user,
          hasToken: !!state.token,
          error: state.error,
          appAuthFailed: state.appAuthFailed,
          retryCount: state.retryCount,
        },
        suggestion: !isAuthenticated ? 'Auth context not ready. Check app authentication and session recovery.' : undefined
      });

      // 5. Test Gateway Connection
      try {
        const gatewayUrl = process.env.NEXT_PUBLIC_GRAPHQL_URL || 'http://localhost:4000/graphql';
        const healthUrl = gatewayUrl.replace('/graphql', '/health');
        
        const response = await fetch(healthUrl, {
          method: 'GET',
          mode: 'cors',
          credentials: 'include',
        });

        if (response.ok) {
          const healthData = await response.json();
          results.push({
            category: 'Gateway Connection',
            status: 'success',
            message: `Gateway accessible (${response.status})`,
            details: healthData,
          });
        } else {
          throw new Error(`HTTP ${response.status}`);
        }
      } catch (error: any) {
        results.push({
          category: 'Gateway Connection',
          status: 'error',
          message: `Gateway unreachable: ${error.message}`,
          details: { error: error.message },
          suggestion: 'Check that the gateway is running on port 4000 and CORS is configured.'
        });
      }

      // 6. Test App Authentication
      try {
        const appAuthResult = await testAppAuth();
        results.push({
          category: 'App Authentication',
          status: appAuthResult.success ? 'success' : 'error',
          message: appAuthResult.success ? 'App auth successful' : `App auth failed: ${appAuthResult.error}`,
          details: appAuthResult,
          suggestion: !appAuthResult.success ? 'Check app credentials and gateway connectivity.' : undefined
        });
      } catch (error: any) {
        results.push({
          category: 'App Authentication',
          status: 'error',
          message: `App auth error: ${error.message}`,
          details: { error: error.message },
          suggestion: 'App authentication failed. Check credentials and network connectivity.'
        });
      }

      // 7. Environment Check
      results.push({
        category: 'Environment',
        status: 'info',
        message: `Mode: ${process.env.NODE_ENV} | Browser: ${navigator.userAgent.split(' ')[0]}`,
        details: {
          nodeEnv: process.env.NODE_ENV,
          urls: {
            auth: process.env.NEXT_PUBLIC_AUTH_URL || 'http://localhost:3000',
            dashboard: process.env.NEXT_PUBLIC_DASHBOARD_URL || 'http://localhost:3002',
            gateway: process.env.NEXT_PUBLIC_GRAPHQL_URL || 'http://localhost:4000/graphql',
          },
          browser: {
            userAgent: navigator.userAgent,
            cookieEnabled: navigator.cookieEnabled,
            onLine: navigator.onLine,
          }
        }
      });

    } catch (error: any) {
      results.push({
        category: 'Diagnostics Error',
        status: 'error',
        message: `Diagnostic failed: ${error.message}`,
        details: { error: error.message }
      });
    }

    setDiagnostics(results);
    setIsRunning(false);
  };

  useEffect(() => {
    // Run diagnostics on mount
    runDiagnostics();
    
    // Re-run every 30 seconds
    const interval = setInterval(runDiagnostics, 30000);
    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = (status: DiagnosticResult['status']) => {
    switch (status) {
      case 'success': return '✅';
      case 'warning': return '⚠️';  
      case 'error': return '❌';
      case 'info': return 'ℹ️';
      default: return '❓';
    }
  };

  const getStatusColor = (status: DiagnosticResult['status']) => {
    switch (status) {
      case 'success': return 'text-green-700 bg-green-50 border-green-200';
      case 'warning': return 'text-yellow-700 bg-yellow-50 border-yellow-200';
      case 'error': return 'text-red-700 bg-red-50 border-red-200';
      case 'info': return 'text-blue-700 bg-blue-50 border-blue-200';
      default: return 'text-gray-700 bg-gray-50 border-gray-200';
    }
  };

  if (!isVisible) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setIsVisible(true)}
          className="bg-gray-800 text-white text-xs px-3 py-2 rounded-lg shadow-lg hover:bg-gray-700 transition-colors"
        >
          🔧 Session Debug
        </button>
      </div>
    );
  }

  return (
    <div className="fixed inset-4 z-50 bg-white border border-gray-300 rounded-lg shadow-2xl flex flex-col max-h-[80vh]">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50 rounded-t-lg">
        <div className="flex items-center space-x-2">
          <h3 className="text-lg font-semibold text-gray-900">🔧 Session Diagnostics</h3>
          <span className="text-xs text-gray-500">
            {new Date().toLocaleTimeString()}
          </span>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={runDiagnostics}
            disabled={isRunning}
            className="text-xs bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {isRunning ? '🔄 Running...' : '🔄 Refresh'}
          </button>
          <button
            onClick={() => setIsVisible(false)}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4">
        <div className="space-y-4">
          {diagnostics.map((result, index) => (
            <div
              key={index}
              className={`border rounded-lg p-4 ${getStatusColor(result.status)}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-lg">{getStatusIcon(result.status)}</span>
                    <h4 className="font-medium">{result.category}</h4>
                  </div>
                  
                  <p className="text-sm mb-2">{result.message}</p>
                  
                  {result.suggestion && (
                    <p className="text-xs italic opacity-75">
                      💡 {result.suggestion}
                    </p>
                  )}
                </div>
              </div>

              {/* Details (collapsible) */}
              {result.details && (
                <details className="mt-3">
                  <summary className="text-xs cursor-pointer hover:underline">
                    View Details
                  </summary>
                  <pre className="text-xs mt-2 p-2 bg-black bg-opacity-10 rounded overflow-auto">
                    {JSON.stringify(result.details, null, 2)}
                  </pre>
                </details>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-gray-200 p-4 bg-gray-50 rounded-b-lg">
        <div className="flex items-center justify-between text-xs text-gray-600">
          <div>
            {diagnostics.filter(d => d.status === 'error').length > 0 && (
              <span className="text-red-600 font-medium">
                ❌ {diagnostics.filter(d => d.status === 'error').length} error(s) found
              </span>
            )}
            {diagnostics.filter(d => d.status === 'warning').length > 0 && (
              <span className="text-yellow-600 font-medium ml-4">
                ⚠️ {diagnostics.filter(d => d.status === 'warning').length} warning(s)
              </span>
            )}
            {diagnostics.filter(d => d.status === 'success').length > 0 && (
              <span className="text-green-600 font-medium ml-4">
                ✅ {diagnostics.filter(d => d.status === 'success').length} passed
              </span>
            )}
          </div>
          
          <div className="space-x-2">
            <button
              onClick={() => {
                const report = {
                  timestamp: new Date().toISOString(),
                  diagnostics: diagnostics,
                  userAgent: navigator.userAgent,
                  url: window.location.href,
                };
                navigator.clipboard.writeText(JSON.stringify(report, null, 2));
                alert('Diagnostic report copied to clipboard!');
              }}
              className="text-blue-600 hover:text-blue-800"
            >
              📋 Copy Report
            </button>
            
            <button
              onClick={() => {
                if (confirm('This will clear all session data and reload the page. Continue?')) {
                  localStorage.clear();
                  document.cookie.split(";").forEach(cookie => {
                    const eqPos = cookie.indexOf("=");
                    const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
                    document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
                  });
                  window.location.reload();
                }
              }}
              className="text-red-600 hover:text-red-800"
            >
              🗑️ Clear All
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}