// auth/src/components/debug/SignupTest.tsx - COMPOSANT POUR TESTER L'INSCRIPTION

'use client';

import { useState } from 'react';
import { graphqlService } from '@/src/services/GraphQLServices';

export default function SignupTest() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [testData, setTestData] = useState({
    username: 'testuser' + Date.now(),
    email: 'test' + Date.now() + '@example.com',
    password: 'TestPassword123!',
    firstName: 'Test',
    lastName: 'User'
  });

  // Ne s'affiche qu'en développement
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  const testSignup = async () => {
    setLoading(true);
    setResult(null);

    try {
      console.log('🧪 [TEST] Testing signup with:', testData);
      
      // Tester l'authentification app d'abord
      const authResult = await graphqlService.authenticateApp();
      console.log('🔑 [TEST] App auth result:', authResult);
      
      if (!authResult.success) {
        throw new Error('App authentication failed: ' + authResult.error);
      }
      
      // Tester la création d'utilisateur
      const signupResult = await graphqlService.createUser(testData);
      console.log('👤 [TEST] Signup result:', signupResult);
      
      setResult({
        success: true,
        appAuth: authResult,
        signup: signupResult
      });
      
    } catch (error: any) {
      console.error('❌ [TEST] Test failed:', error);
      setResult({
        success: false,
        error: error.message,
        details: error
      });
    } finally {
      setLoading(false);
    }
  };

  const testConnection = async () => {
    setLoading(true);
    setResult(null);

    try {
      const connectionResult = await graphqlService.testConnection();
      setResult({
        success: true,
        connection: connectionResult
      });
    } catch (error: any) {
      setResult({
        success: false,
        error: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50">
      <div className="space-y-2">
        <button
          onClick={testConnection}
          disabled={loading}
          className="block w-full px-3 py-2 rounded-lg text-white text-sm font-medium bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400"
        >
          {loading ? '🔄...' : '🔗 Test Connection'}
        </button>
        
        <button
          onClick={testSignup}
          disabled={loading}
          className="block w-full px-3 py-2 rounded-lg text-white text-sm font-medium bg-green-500 hover:bg-green-600 disabled:bg-gray-400"
        >
          {loading ? '🔄...' : '🧪 Test Signup'}
        </button>
      </div>

      {result && (
        <div className="absolute top-20 right-0 w-[400px] bg-white border border-gray-200 rounded-lg shadow-lg p-4 max-h-96 overflow-y-auto">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-semibold text-gray-900">Test Results</h3>
            <button
              onClick={() => setResult(null)}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>

          {result.success ? (
            <div className="p-3 bg-green-50 border border-green-200 rounded">
              <p className="text-green-700 font-medium">✅ Test Success!</p>
              
              {result.connection && (
                <div className="mt-2">
                  <p className="text-sm text-green-600">Connection: OK</p>
                </div>
              )}
              
              {result.appAuth && (
                <div className="mt-2">
                  <p className="text-sm text-green-600">App Auth: ✅</p>
                  <p className="text-xs text-green-500">Token: {result.appAuth.token?.substring(0, 20)}...</p>
                </div>
              )}
              
              {result.signup && (
                <div className="mt-2">
                  <p className="text-sm text-green-600">
                    Signup: {result.signup.success ? '✅' : '❌'}
                  </p>
                  {result.signup.userID && (
                    <p className="text-xs text-green-500">User ID: {result.signup.userID}</p>
                  )}
                  {result.signup.message && (
                    <p className="text-xs text-green-500">Message: {result.signup.message}</p>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="p-3 bg-red-50 border border-red-200 rounded">
              <p className="text-red-700 font-medium">❌ Test Failed</p>
              <p className="text-sm text-red-600 mt-1">{result.error}</p>
            </div>
          )}

          <div className="mt-4 p-2 bg-gray-100 rounded">
            <details>
              <summary className="text-xs font-medium cursor-pointer">🔍 Test Data Used</summary>
              <pre className="text-xs mt-2 max-h-32 overflow-y-auto">
                {JSON.stringify(testData, null, 2)}
              </pre>
            </details>
          </div>

          <div className="mt-2 p-2 bg-gray-100 rounded">
            <details>
              <summary className="text-xs font-medium cursor-pointer">📋 Full Result</summary>
              <pre className="text-xs mt-2 max-h-32 overflow-y-auto">
                {JSON.stringify(result, null, 2)}
              </pre>
            </details>
          </div>
        </div>
      )}
    </div>
  );
}