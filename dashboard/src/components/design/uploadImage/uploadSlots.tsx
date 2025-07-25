// UploadSlot.tsx
'use client';

import React from 'react';
import { FiUpload, FiPlus } from 'react-icons/fi';

interface UploadSlotProps {
  slotIndex: number;
  isFirstEmpty: boolean; // Pour différencier le 1er slot vide (affiche l’icône d’upload) des autres (icône +)
  onFileSelect: (files: File[]) => void;
}

const UploadSlot: React.FC<UploadSlotProps> = ({ slotIndex, isFirstEmpty, onFileSelect }) => {
  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      onFileSelect(filesArray);
    }
  };

  return (
    <div className="relative w-40 h-40 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
      <label
        htmlFor={`upload-image-${slotIndex}`}
        className="w-full h-full flex flex-col items-center justify-center cursor-pointer"
      >
        {isFirstEmpty ? (
          <FiUpload size={32} className="text-gray-400" />
        ) : (
          <FiPlus size={32} className="text-gray-400" />
        )}
        <span className="text-sm text-gray-500 mt-2">
          {isFirstEmpty ? 'Uploader' : 'Ajouter'}
        </span>
        <input
          type="file"
          id={`upload-image-${slotIndex}`}
          accept="image/*"
          onChange={handleFileInput}
          className="hidden"
        />
      </label>
    </div>
  );
};

export default UploadSlot;
