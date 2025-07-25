// ImageCard.tsx
'use client';

import React from 'react';
import { FiX, FiEdit } from 'react-icons/fi';

export interface MyImage {
    id: string;
    url: string;
    file?: File;
  }
  
  export interface CropState {
    index: number;
    url: string;
  }
  
interface ImageCardProps {
  image: MyImage;
  index: number;
  onDelete: (index: number) => void;
  onEdit: (index: number) => void;
  onEnlarge: (url: string) => void;
}

const ImageCard: React.FC<ImageCardProps> = ({
  image,
  index,
  onDelete,
  onEdit,
  onEnlarge,
}) => {
  return (
    <div className="relative w-40 h-40 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
      <img
        src={image.url}
        alt="Preview"
        className="w-full h-full object-cover rounded-lg cursor-pointer"
        onClick={() => onEnlarge(image.url)}
      />
      {/* Bouton de suppression */}
      <button
        onClick={() => onDelete(index)}
        className="absolute top-1 right-1 bg-black text-white rounded-full p-1 hover:bg-grey-600"
      >
        <FiX size={16} />
      </button>
      {/* Bouton d'édition */}
      <button
        onClick={() => onEdit(index)}
        className="absolute bottom-1 right-1 bg-black text-white rounded-full p-1 hover:bg-gray-700"
      >
        <FiEdit size={16} />
      </button>
    </div>
  );
};

export default ImageCard;
