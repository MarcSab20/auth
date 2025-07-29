// auth/src/components/debug/CorsTest.tsx
'use client';

import { useState, useEffect } from 'react';
import authAPI from '@/src/services/api/authAPI';

export default function CorsTest() {
  const [corsStatus, setCorsStatus] = useState<'testing' | 'success' | 'error'>('testing');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    testCors();
  }, []);

  const testCors = async () => {
    try {
      setCorsStatus('testing');
      const result = await authAPI.testCors();
      
      if (result.success) {
        setCorsStatus('success');
        console.log('✅ CORS test passed');
      } else {
        setCorsStatus('error');
        setError(result.error || 'CORS test failed');
      }
    } catch (error: any) {
      setCorsStatus('error');
      setError(error.message);
      console.error('❌ CORS test error:', error);
    }
  };

  if (process.env.NODE_ENV === 'production') {
    return null; // Ne pas afficher en production
  }

  return (
    <div className="fixed top-2 right-2 p-2 text-xs bg-gray-800 text-white rounded shadow-lg z-50">
      <div className="flex items-center space-x-2">
        <span>CORS:</span>
        {corsStatus === 'testing' && (
          <div className="flex items-center space-x-1">
            <div className="animate-spin h-3 w-3 border border-yellow-400 border-t-transparent rounded-full"></div>
            <span className="text-yellow-400">Testing...</span>
          </div>
        )}
        {corsStatus === 'success' && (
          <span className="text-green-400">✅ OK</span>
        )}
        {corsStatus === 'error' && (
          <div className="flex items-center space-x-1">
            <span className="text-red-400">❌ Failed</span>
            <button 
              onClick={testCors} 
              className="text-blue-400 underline hover:no-underline"
              title={error || 'Click to retry'}
            >
              Retry
            </button>
          </div>
        )}
      </div>
      {error && corsStatus === 'error' && (
        <div className="mt-1 text-red-300 max-w-xs truncate" title={error}>
          {error}
        </div>
      )}
    </div>
  );
}