// auth/src/components/auth/AuthLoadingDisplay.tsx - Composant pour l'affichage du chargement
import React from 'react';

interface AuthLoadingDisplayProps {
  title: string;
  message?: string;
  userInfo?: string;
  className?: string;
}

export default function AuthLoadingDisplay({
  title,
  message,
  userInfo,
  className = "max-w-sm mx-auto text-center"
}: AuthLoadingDisplayProps) {
  return (
    <div className={className}>
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">{title}</h2>
      {message && (
        <p className="text-gray-600 mb-4">{message}</p>
      )}
      {userInfo && (
        <p className="text-sm text-gray-500">{userInfo}</p>
      )}
    </div>
  );
}