"use client";

import { useEnhancedAuth } from "@/context/authenticationContext";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AccountPage() {
  const { state, logout } = useEnhancedAuth();
  const { user, isAuthenticated: isLoggedIn, isLoading: authLoading } = state;
  const router = useRouter();
  const [debugInfo, setDebugInfo] = useState<any>(null);

  // Debug: récupérer les infos du cookie pour comprendre le problème
  useEffect(() => {
    const cookieValue = document.cookie
      .split('; ')
      .find(row => row.startsWith('smp_user_0='));
    
    if (cookieValue) {
      try {
        const decoded = decodeURIComponent(cookieValue.split('=')[1]);
        const parsed = JSON.parse(decoded);
        setDebugInfo(parsed);
      } catch (error) {
        setDebugInfo({ error: "Cookie malformé" });
      }
    }
  }, []);

  useEffect(() => {
    console.log("🔍 [ACCOUNT] State:", { 
      user, 
      isLoggedIn, 
      authLoading,
      debugInfo 
    });

    // Si pas de chargement en cours et pas connecté, rediriger
    if (!authLoading && !isLoggedIn) {
      console.log("❌ [ACCOUNT] Not authenticated, redirecting to signin");
      router.push("/signin");
    }
  }, [authLoading, isLoggedIn, router, user, debugInfo]);

  // Affichage du loading
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement de votre session...</p>
        </div>
      </div>
    );
  }

  // Si pas d'utilisateur mais qu'on a un cookie, afficher debug
  if (!user && debugInfo) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">🔧 Problème de session</h2>
          
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600 mb-2">Cookie détecté mais utilisateur non chargé:</p>
              <pre className="bg-gray-100 p-3 rounded text-xs overflow-auto">
                {JSON.stringify(debugInfo, null, 2)}
              </pre>
            </div>
            
            <div>
              <p className="text-sm text-gray-600 mb-2">État du contexte:</p>
              <pre className="bg-gray-100 p-3 rounded text-xs overflow-auto">
                {JSON.stringify({ user, isLoggedIn, authLoading }, null, 2)}
              </pre>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  document.cookie = "smp_user_0=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
                  localStorage.clear();
                  window.location.href = "/signin";
                }}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-sm"
              >
                Nettoyer & Reconnecter
              </button>
              <button
                onClick={() => window.location.reload()}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm"
              >
                Recharger
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Si toujours pas d'utilisateur, redirection
  if (!isLoggedIn || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Redirection vers la connexion...</p>
        </div>
      </div>
    );
  }

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-semibold text-gray-900">
              Tableau de bord
            </h1>
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              Déconnexion
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Bienvenue, {user.username || user.email}!
              </h2>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-700">Informations du compte</h3>
                  <dl className="mt-2 grid grid-cols-1 gap-x-4 gap-y-2 sm:grid-cols-2">
                    <div>
                      <dt className="text-sm text-gray-500">Nom d'utilisateur</dt>
                      <dd className="text-sm text-gray-900">{user.username || 'Non renseigné'}</dd>
                    </div>
                    <div>
                      <dt className="text-sm text-gray-500">Email</dt>
                      <dd className="text-sm text-gray-900">{user.email || 'Non renseigné'}</dd>
                    </div>
                    <div>
                      <dt className="text-sm text-gray-500">ID Utilisateur</dt>
                      <dd className="text-sm text-gray-900 font-mono">{user.userID}</dd>
                    </div>
                    <div>
                      <dt className="text-sm text-gray-500">ID Profil</dt>
                      <dd className="text-sm text-gray-900 font-mono">{user.profileID}</dd>
                    </div>
                    {user.accessibleOrganizations && user.accessibleOrganizations.length > 0 && (
                      <div className="sm:col-span-2">
                        <dt className="text-sm text-gray-500">Organisations accessibles</dt>
                        <dd className="text-sm text-gray-900">
                          {user.accessibleOrganizations.join(', ')}
                        </dd>
                      </div>
                    )}
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}