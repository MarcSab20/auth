// auth/src/components/auth/AuthSuccessDisplay.tsx - Composant pour l'affichage des succès
import React from 'react';
import Link from 'next/link';

interface AuthSuccessDisplayProps {
  title: string;
  message: string;
  actionText?: string;
  actionHref?: string;
  actionOnClick?: () => void;
  countdown?: number;
  showIcon?: boolean;
  className?: string;
}

export default function AuthSuccessDisplay({
  title,
  message,
  actionText,
  actionHref,
  actionOnClick,
  countdown,
  showIcon = true,
  className = "max-w-sm mx-auto text-center"
}: AuthSuccessDisplayProps) {
  return (
    <div className={className}>
      {showIcon && (
        <div className="mx-auto h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mb-6">
          <svg className="h-8 w-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      )}
      
      <h3 className="text-2xl font-bold text-gray-900 mb-2">
        {title}
      </h3>
      <p className="text-gray-600 mb-6">
        {message}
      </p>
      
      {countdown !== undefined && countdown > 0 && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-md mb-4">
          <div className="flex items-center justify-center space-x-2 text-blue-600 mb-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <span className="text-sm font-medium">
              Redirection automatique...
            </span>
          </div>
          <p className="text-xs text-blue-700">
            Dans {countdown} seconde{countdown !== 1 ? 's' : ''}
          </p>
        </div>
      )}

      {(actionText && (actionHref || actionOnClick)) && (
        <div>
          {actionHref ? (
            <Link href={actionHref} className="btn bg-blue-600 text-white hover:bg-blue-700">
              {actionText}
            </Link>
          ) : (
            <button
              onClick={actionOnClick}
              className="btn bg-blue-600 text-white hover:bg-blue-700"
            >
              {actionText}
            </button>
          )}
        </div>
      )}
    </div>
  );
}