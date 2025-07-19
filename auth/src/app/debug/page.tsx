"use client";

import { useEffect, useState } from "react";

export default function DebugPage() {
  const [cookieInfo, setCookieInfo] = useState<any>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    // Analyser le cookie actuel
    const cookieValue = document.cookie
      .split('; ')
      .find(row => row.startsWith('smp_user_0='));
    
    if (cookieValue) {
      try {
        const decoded = decodeURIComponent(cookieValue.split('=')[1]);
        const parsed = JSON.parse(decoded);
        setCookieInfo(parsed);
      } catch (error) {
        setCookieInfo({ error: "Cookie malformé", raw: cookieValue });
      }
    } else {
      setCookieInfo(null);
    }
  }, []);

  const clearAllAuth = () => {
    // Supprimer tous les cookies
    document.cookie = "smp_user_0=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
    
    // Supprimer localStorage
    const keys = ['smp_user_0', 'access_token', 'refresh_token', 'orgFormData', 'serviceFormData'];
    keys.forEach(key => localStorage.removeItem(key));
    
    // Supprimer sessionStorage
    sessionStorage.clear();
    
    setMessage("✅ Authentification nettoyée avec succès !");
    setCookieInfo(null);
    
    setTimeout(() => {
      window.location.href = "/signin";
    }, 1500);
  };

  const forceSignin = () => {
    clearAllAuth();
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">🔧 Debug Auth</h1>
        
        {message && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-md">
            <p className="text-green-700">{message}</p>
          </div>
        )}
        
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-700 mb-3">État du cookie</h2>
            {cookieInfo ? (
              <div className="bg-gray-50 p-4 rounded-md">
                <pre className="text-xs text-gray-800 whitespace-pre-wrap">
                  {JSON.stringify(cookieInfo, null, 2)}
                </pre>
                {cookieInfo.userID?.startsWith('temp-') && (
                  <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded">
                    <p className="text-yellow-800 text-sm">
                      ⚠️ Cookie temporaire détecté - Cela cause des problèmes
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-gray-600">✅ Aucun cookie trouvé</p>
            )}
          </div>
          
          <div className="space-y-3">
            <button
              onClick={forceSignin}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium"
            >
              🔄 Forcer le nettoyage et aller à la connexion
            </button>
          </div>
          
          <div className="text-sm text-gray-500 bg-gray-50 p-3 rounded">
            <p><strong>LocalStorage:</strong></p>
            <ul className="list-disc list-inside mt-1">
              {['smp_user_0', 'access_token', 'refresh_token'].map(key => {
                const exists = localStorage.getItem(key);
                return (
                  <li key={key}>
                    {key}: {exists ? "✅ Présent" : "❌ Absent"}
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}