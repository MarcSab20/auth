'use client';

import { MdContentCopy } from 'react-icons/md';
import { formatId } from '@/src/utils/formatters';
import { useState } from 'react';

interface CopyableIdProps {
  id: string;
  type: 'estimate' | 'order' | 'invoice';
  className?: string;
}

export default function CopyableId({ id, type, className = '' }: CopyableIdProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span className="font-mono">{formatId(id, type)}</span>
      <button
        onClick={handleCopy}
        className="text-gray-400 hover:text-gray-600"
      >
        <MdContentCopy className="w-4 h-4" />
      </button>
      {copied && (
        <span className="text-xs text-green-600 animate-fade-out">
          Copié !
        </span>
      )}
    </div>
  );
} 