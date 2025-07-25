import React from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface NotificationProps {
  type: 'success' | 'error';
  message: string;
  onClose: () => void;
}

export function Notification({ type, message, onClose }: NotificationProps) {
  return (
    <div className="fixed top-4 right-4 z-50">
      <div
        className={`rounded-lg p-4 shadow-lg ${
          type === 'success' ? 'bg-green-50' : 'bg-red-50'
        }`}
      >
        <div className="flex items-start">
          <div className="flex-1">
            <p
              className={`text-sm font-medium ${
                type === 'success' ? 'text-green-800' : 'text-red-800'
              }`}
            >
              {message}
            </p>
          </div>
          <button
            onClick={onClose}
            className="ml-4 inline-flex flex-shrink-0 text-gray-400 hover:text-gray-500"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
} 