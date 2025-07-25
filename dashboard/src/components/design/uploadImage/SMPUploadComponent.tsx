// SMPUploadComponent.tsx
'use client';

import React, { useState, useEffect } from 'react';
import CropModal from './cropModal';
import UploadSlot from './uploadSlots';
import ImageCard from './imageCard';
import { FiFile, FiEdit2, FiTrash2 } from 'react-icons/fi'; // Utilisé dans UploadSlot si nécessaire

// Types utilisés dans ce composant
export interface MyImage {
  id: string;
  url: string;
  file?: File;
}

export interface SMPuploadComponentProps {
  /**
   * Définit le type d'upload.
   * - "image" : upload d'une image (avec recadrage)
   * - "file" : upload d'un fichier générique
   */
  uploadType?: 'image' | 'file';
  /**
   * Liste des extensions autorisées (sans le point).
   * Par défaut pour une image : ['jpg', 'jpeg', 'png', 'gif']
   */
  allowedExtensions?: string[];
  /**
   * Callback appelée après un upload réussi.
   */
  onFileUpload?: (file: File) => void;
  /**
   * Callback appelée lors de la suppression d'une image.
   */
  onDelete?: () => void;
  /**
   * Image initiale à afficher.
   */
  initialImage?: File;
  /**
   * Ratio d'aspect pour le recadrage.
   */
  cropAspectRatio?: number;
  /**
   * Largeur recommandée pour l'image.
   */
  recommendedWidth?: number;
  /**
   * Hauteur recommandée pour l'image.
   */
  recommendedHeight?: number;
  /**
   * Classe CSS pour la prévisualisation.
   */
  previewClassName?: string;
}

// Type pour les réglages d'édition
export interface EditData {
  crop: { x: number; y: number };
  zoom: number;
  brightness: number;
  contrast: number;
}

const SMPUploadComponent: React.FC<SMPuploadComponentProps> = ({
  uploadType = 'image',
  allowedExtensions,
  onFileUpload,
  onDelete,
  initialImage,
  cropAspectRatio,
  recommendedWidth,
  recommendedHeight,
  previewClassName,
}) => {
  const [fileData, setFileData] = useState<MyImage | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [editData, setEditData] = useState<EditData>({
    crop: { x: 0, y: 0 },
    zoom: 1,
    brightness: 100,
    contrast: 100,
  });
  const [showCropModal, setShowCropModal] = useState(false);
  const [enlarged, setEnlarged] = useState<string | null>(null);

  // Extensions par défaut
  const defaultExtensions = uploadType === 'image' ? ['jpg', 'jpeg', 'png', 'gif'] : [];
  const extensions = allowedExtensions || defaultExtensions;

  // Reset du composant après upload
  const resetComponent = () => {
    if (originalUrl) {
      URL.revokeObjectURL(originalUrl);
    }
    setFileData(null);
    setOriginalUrl(null);
    setEditData({
      crop: { x: 0, y: 0 },
      zoom: 1,
      brightness: 100,
      contrast: 100,
    });
  };

  // Gestion de l'upload : vérifie l'extension et ouvre directement l'éditeur pour les images
  const handleFile = (file: File) => {
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (extensions.length > 0 && (!ext || !extensions.includes(ext))) {
      alert(`Extension non autorisée. Extensions autorisées : ${extensions.join(', ')}`);
      return;
    }

    const blob = new Blob([file], { type: file.type });
    const url = URL.createObjectURL(blob);
    const newData: MyImage = {
      id: `${file.name}-${Date.now()}`,
      url,
      file,
    };
    
    setFileData(newData);
    setOriginalUrl(url);
    
    // Pour les images, ouvrir directement l'éditeur
    if (uploadType === 'image') {
      setShowCropModal(true);
    } else {
      // Pour les fichiers, uploader directement
      if (onFileUpload) onFileUpload(file);
      resetComponent();
    }
  };

  // Gestion du changement de l'input fichier
  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  // Callback appelée par CropModal à la validation
  const handleCropComplete = async (croppedUrl: string, newEditData: EditData) => {
    setShowCropModal(false);

    // Convertir l'URL de l'image recadrée en File
    try {
      const response = await fetch(croppedUrl);
      const blob = await response.blob();
      const file = new File([blob], fileData?.file?.name || 'cropped-image.jpg', {
        type: blob.type,
      });
      
      // Uploader le fichier final
      if (onFileUpload) onFileUpload(file);
      
      // Reset du composant après upload réussi
      resetComponent();
      
    } catch (error) {
      console.error('Erreur lors de la conversion de l\'image recadrée:', error);
    }
  };

  // Annulation de l'édition
  const handleCropCancel = () => {
    setShowCropModal(false);
    resetComponent();
  };

  // Suppression de l'image (si jamais elle est affichée)
  const handleDelete = () => {
    resetComponent();
    if (onDelete) onDelete();
  };

  return (
    <div className="flex flex-col items-center py-4">
      {/* Toujours afficher l'espace d'upload car le composant se vide après upload */}
      <UploadSlot
        slotIndex={0}
        isFirstEmpty={true}
        onFileSelect={(files: File[]) => {
          if (files[0]) handleFile(files[0]);
        }}
      />

      {/* Aperçu de l'image avant recadrage */}
      {fileData && !showCropModal && (
        <div className="mt-4 relative">
          <img
            src={fileData.url}
            alt="Aperçu"
            className="max-w-[200px] max-h-[200px] rounded shadow-md"
          />
          <div className="absolute top-2 right-2 flex space-x-2">
            <button
              onClick={() => setShowCropModal(true)}
              className="bg-blue-500 text-white p-2 rounded-full shadow-lg hover:bg-blue-600 transition-colors"
              title="Recadrer l'image"
            >
              <FiEdit2 size={16} />
            </button>
            <button
              onClick={handleDelete}
              className="bg-red-500 text-white p-2 rounded-full shadow-lg hover:bg-red-600 transition-colors"
              title="Supprimer l'image"
            >
              <FiTrash2 size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Aperçu agrandi de l'image (si jamais nécessaire) */}
      {enlarged && (
        <div
          className="fixed top-10 left-1/2 transform -translate-x-1/2 z-50"
          onClick={() => setEnlarged(null)}
        >
          <img
            src={enlarged}
            alt="Aperçu agrandi"
            className="max-w-[320px] max-h-[320px] rounded shadow-lg"
          />
        </div>
      )}

      {/* Modal de recadrage (pour les images) */}
      {uploadType === 'image' && showCropModal && originalUrl && (
        <CropModal
          originalUrl={originalUrl}
          editData={editData}
          onClose={handleCropCancel}
          onCropComplete={handleCropComplete}
          cropState={{ ...editData.crop, index: 0, url: originalUrl || '' }}
          aspectRatio={cropAspectRatio || 1}
        />
      )}
    </div>
  );
};

export default SMPUploadComponent;
