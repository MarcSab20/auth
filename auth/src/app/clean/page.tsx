"use client";

import { useEffect } from "react";

export default function CleanPage() {
  useEffect(() => {
    // Nettoyage agressif de tout ce qui peut causer des problèmes
    
    // 1. Supprimer tous les cookies liés à l'auth
    const cookiesToClear = ['smp_user_0', 'access_token', 'refresh_token'];
    cookiesToClear.forEach(name => {
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=${window.location.hostname}`;
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=.${window.location.hostname}`;
    });
    
    // 2. Vider complètement localStorage
    localStorage.clear();
    
    // 3. Vider complètement sessionStorage
    sessionStorage.clear();
    
    // 4. Essayer de vider les cookies avec toutes les variantes possibles
    document.cookie.split(";").forEach(function(c) { 
      document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
    });
    
    console.log("🧹 [CLEAN] Nettoyage forcé terminé");
    
    // 5. Rediriger après un court délai
    setTimeout(() => {
      window.location.href = "/signin";
    }, 1000);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-500 mx-auto mb-4"></div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">🧹 Nettoyage en cours</h1>
        <p className="text-gray-600">Suppression de toutes les données d'authentification...</p>
        <p className="text-sm text-gray-500 mt-4">Redirection automatique vers la connexion</p>
      </div>
    </div>
  );
}