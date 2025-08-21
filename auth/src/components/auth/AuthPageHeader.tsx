// auth/src/components/auth/AuthPageHeader.tsx - Composant pour éviter les répétitions
import React from 'react';

interface AuthPageHeaderProps {
  title: string;
  subtitle?: string;
  className?: string;
}

export default function AuthPageHeader({ 
  title, 
  subtitle, 
  className = "mb-8" 
}: AuthPageHeaderProps) {
  return (
    <div className={className}>
      <h1 className="text-4xl font-bold text-gray-900">{title}</h1>
      {subtitle && (
        <p className="text-gray-600 mt-2">{subtitle}</p>
      )}
    </div>
  );
}