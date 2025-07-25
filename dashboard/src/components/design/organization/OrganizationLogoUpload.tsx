'use client';

import React, { useState } from 'react';
import { BuildingOfficeIcon } from '@heroicons/react/24/solid';
import { FiTrash2 } from 'react-icons/fi';

interface OrganizationLogoUploadProps {
  organizationID: string;
  currentLogoUrl?: string;
  onLogoUpdate: (url: string) => void;
  onLogoDelete: () => void;
  onNotification: (type: 'success' | 'error' | 'info', message: string, description?: string) => void;
}

const OrganizationLogoUpload: React.FC<OrganizationLogoUploadProps> = ({
  organizationID,
  currentLogoUrl,
  onLogoUpdate,
  onLogoDelete,
  onNotification,
}) => {
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Vérification de la taille (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      onNotification('error', 'Le fichier est trop volumineux', 'La taille maximale autorisée est de 2MB');
      return;
    }

    // Vérification du type de fichier
    if (!file.type.startsWith('image/')) {
      onNotification('error', 'Format de fichier non supporté', 'Seuls les fichiers images sont acceptés');
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('entityID', organizationID);
    formData.append('legend', 'Organization Logo');
    formData.append('listingPosition', '1');

    try {
      const response = await fetch(`/api/upload/images/smallLogo`, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        onLogoUpdate(data.s3Url);
        onNotification('success', 'Logo mis à jour avec succès');
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de l\'upload');
      }
    } catch (error) {
      console.error('Error uploading logo:', error);
      onNotification('error', 'Erreur lors de l\'upload du logo', error instanceof Error ? error.message : 'Une erreur est survenue');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setIsUploading(true);
      await onLogoDelete();
      onNotification('success', 'Logo supprimé avec succès');
    } catch (error) {
      console.error('Error deleting logo:', error);
      onNotification('error', 'Erreur lors de la suppression du logo');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="col-span-full">
      <label htmlFor="logo" className="block text-sm/6 font-medium text-gray-900">
        Logo
      </label>
      <div className="mt-2 flex items-center gap-x-3">
        {currentLogoUrl ? (
          <img
            src={currentLogoUrl}
            alt="Organization Logo"
            className="size-20 rounded-full object-cover"
          />
        ) : (
          <BuildingOfficeIcon className="size-20 text-gray-300" aria-hidden="true" />
        )}
        <div className="flex gap-x-2">
          <label
            htmlFor="logo-upload"
            className="rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 cursor-pointer"
          >
            {currentLogoUrl ? 'Changer' : 'Ajouter'}
            <input
              id="logo-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
              disabled={isUploading}
            />
          </label>
          {currentLogoUrl && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={isUploading}
              className="rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-red-600 shadow-sm ring-1 ring-inset ring-red-300 hover:bg-red-50"
            >
              <FiTrash2 className="inline-block mr-1" />
              Supprimer
            </button>
          )}
        </div>
      </div>
      {isUploading && (
        <p className="mt-2 text-sm text-gray-500">
          Upload en cours...
        </p>
      )}
    </div>
  );
};

export default OrganizationLogoUpload; 