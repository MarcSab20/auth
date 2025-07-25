"use client";

import React, { createContext, useContext, useState, useCallback, useMemo } from "react";
import SMPNotification from '@/src/components/notification';
import { useAuth } from '@/context/authenticationContext';

export interface AssetEntity {
  assetID: string;
  uniqRef?: string;
  slug?: string;
  title: string;
  authorID?: string;
  organizationID?: string;
  mediaID?: string;
  description?: string;
  price: number;
  legalVatPercent?: number;
  quantity: number;
  stockQuantity?: number;
  maxPerReservation?: number;
  conflictingAssets?: string;
  applyableAssets?: string;
  state: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export interface AssetData {
  assetID: string;
  title?: string;
  description?: string;
  price?: number;
  legalVatPercent?: number;
  quantity?: number;
  stockQuantity?: number;
  maxPerReservation?: number;
  conflictingAssets?: string;
  applyableAssets?: string;
  state?: string;
  mediaID?: string;
  images?: File[];
  uploadedMediaIDs?: string[];
  assetMedias?: AssetMediaInfo[];
}

export interface AssetMediaInfo {
  assetMediaID: string;
  listingPosition: number;
  url: string;
  legend?: string;
  mediaID?: string;
  isNew?: boolean;
  toDelete?: boolean;
}

export interface UpdateAssetContextData {
  assetFormData: AssetData;
  initialAssetData: AssetData;
  initializeDataFromProps: (asset: AssetData) => Promise<void>;
  updateAssetForm: (fields: Partial<AssetData>) => void;
  submitUpdates: () => Promise<void>;
  assetMedias: AssetMediaInfo[];
  newImages: File[];
  addNewImage: (file: File, legend?: string) => void;
  deleteAssetMedia: (assetMediaID: string) => void;
  updateAssetMediaLegend: (assetMediaID: string, legend: string) => void;
  reorderAssetMedias: (reorderedMedias: AssetMediaInfo[]) => void;
  isDirty: boolean;
}

const UpdateAssetContext = createContext<UpdateAssetContextData | undefined>(undefined);

export const useUpdateAssetContext = () => {
  const ctx = useContext(UpdateAssetContext);
  if (!ctx) {
    throw new Error('useUpdateAssetContext must be used within UpdateAssetProvider');
  }
  return ctx;
};

export const UpdateAssetProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();

  // États pour l'asset
  const [assetFormData, setAssetFormData] = useState<AssetData>({ assetID: '' });
  const [initialAssetData, setInitialAssetData] = useState<AssetData>({ assetID: '' });

  // États pour les médias
  const [assetMedias, setAssetMedias] = useState<AssetMediaInfo[]>([]);
  const [initialAssetMedias, setInitialAssetMedias] = useState<AssetMediaInfo[]>([]);
  const [newImages, setNewImages] = useState<File[]>([]);

  // Notifications
  const [showNotification, setShowNotification] = useState(false);
  const [notificationType, setNotificationType] = useState<'success' | 'error' | 'info'>('success');
  const [notificationMessage, setNotificationMessage] = useState('');
  const [notificationDescription, setNotificationDescription] = useState('');

  // Calcul du dirty state
  const isDirty = useMemo(() => {
    const assetChanged = JSON.stringify(assetFormData) !== JSON.stringify(initialAssetData);
    const mediasChanged = JSON.stringify(assetMedias) !== JSON.stringify(initialAssetMedias);
    const hasNewImages = newImages.length > 0;
    return assetChanged || mediasChanged || hasNewImages;
  }, [assetFormData, initialAssetData, assetMedias, initialAssetMedias, newImages]);

  // Fonctions pour les médias
  const addNewImage = useCallback((file: File, legend?: string) => {
    // Vérifier la limite de 3 images
    const currentImagesCount = assetMedias.filter(m => !m.toDelete).length;
    if (currentImagesCount >= 3) {
      setShowNotification(true);
      setNotificationType('error');
      setNotificationMessage('Limite d\'images atteinte');
      setNotificationDescription('Vous ne pouvez pas ajouter plus de 3 images.');
      return;
    }

    const newPosition = currentImagesCount + 1;
    
    const tempMedia: AssetMediaInfo = {
      assetMediaID: `temp-${Date.now()}`,
      listingPosition: newPosition,
      url: URL.createObjectURL(file),
      legend: legend || file.name,
      isNew: true
    };
    
    setAssetMedias(prev => [...prev, tempMedia]);
    setNewImages(prev => [...prev, file]);
  }, [assetMedias]);

  const deleteAssetMedia = async (assetMediaID: string) => {
    try {
      const response = await fetch(`/api/upload/images/asset/${assetMediaID}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete asset media');
      }

      setAssetMedias(prev => prev.map(media => 
        media.assetMediaID === assetMediaID 
          ? { ...media, toDelete: true }
          : media
      ));
    } catch (error) {
      console.error('Error deleting asset media:', error);
      throw error;
    }
  };

  const updateAssetMediaLegend = useCallback((assetMediaID: string, legend: string) => {
    setAssetMedias(prev => prev.map(media => 
      media.assetMediaID === assetMediaID 
        ? { ...media, legend }
        : media
    ));
  }, []);

  const reorderAssetMedias = useCallback((reorderedMedias: AssetMediaInfo[]) => {
    const mediasWithUpdatedPositions = reorderedMedias.map((media, index) => ({
      ...media,
      listingPosition: index + 1
    }));
    setAssetMedias(mediasWithUpdatedPositions);
  }, []);

  // Fonction pour initialiser les données
  const initializeDataFromProps = useCallback(async (asset: AssetData) => {
    try {
      setAssetFormData(asset);
      setInitialAssetData(asset);

      // Initialiser les médias
      const medias = asset.assetMedias || [];
      setAssetMedias(medias);
      setInitialAssetMedias([...medias]);
      setNewImages([]);
    } catch (error) {
      console.error("Erreur lors de l'initialisation des données:", error);
      setShowNotification(true);
      setNotificationType('error');
      setNotificationMessage('Erreur lors du chargement');
      setNotificationDescription(String(error));
    }
  }, []);

  const updateAssetForm = useCallback((fields: Partial<AssetData>) => {
    setAssetFormData(prev => ({ ...prev, ...fields }));
  }, []);

  const submitUpdates = useCallback(async () => {
    try {
      console.log('=== DEBUT SUBMIT ===');
      console.log('Asset Medias avant submit:', assetMedias);
      console.log('New Images:', newImages);
      
      // 1. Upload des nouvelles images
      const tempMedias = assetMedias.filter(m => m.isNew && m.assetMediaID.startsWith('temp-'));
      console.log('Médias temporaires à uploader:', tempMedias);
      
      for (let i = 0; i < newImages.length; i++) {
        const image = newImages[i];
        const tempMedia = tempMedias[i];
        
        if (tempMedia) {
          const uploadFormData = new FormData();
          uploadFormData.append('file', image);
          uploadFormData.append('entityID', assetFormData.assetID);
          uploadFormData.append('listingPosition', tempMedia.listingPosition.toString());
          uploadFormData.append('legend', tempMedia.legend || '');

          try {
            const uploadRes = await fetch(`/api/upload/images/asset`, {
              method: 'POST',
              body: uploadFormData,
            });

            if (uploadRes.ok) {
              const uploadData = await uploadRes.json();
              console.log('Upload réussi pour média:', tempMedia.assetMediaID, uploadData);
              
              // Mettre à jour le média temporaire avec les vraies données
              setAssetMedias(prev => prev.map(media => {
                if (media.assetMediaID === tempMedia.assetMediaID) {
                  return {
                    ...media,
                    assetMediaID: uploadData.joinTable?.assetMediaID || uploadData.assetMediaID,
                    mediaID: uploadData.media?.mediaID || uploadData.mediaID,
                    url: uploadData.media?.url || uploadData.url,
                    isNew: false,
                    toDelete: false
                  };
                }
                return media;
              }));
            } else {
              console.error('Erreur upload:', await uploadRes.text());
              throw new Error(`Erreur lors de l'upload de l'image ${i + 1}`);
            }
          } catch (error) {
            console.error(`Erreur lors de l'upload de l'image ${i + 1}:`, error);
            throw error;
          }
        }
      }

      // 2. Supprimer les images marquées pour suppression
      const mediasToDelete = assetMedias.filter(media => media.toDelete && !media.isNew);
      console.log('Médias à supprimer:', mediasToDelete);

      for (const media of mediasToDelete) {
        try {
          console.log(`Tentative de suppression de assetMedia: ${media.assetMediaID}`);
          const response = await fetch(`/api/upload/images/asset/${media.assetMediaID}`, {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
            },
          });
          
          if (!response.ok) {
            const errorText = await response.text();
            console.error(`Erreur HTTP ${response.status} lors de la suppression:`, errorText);
            throw new Error(`Erreur ${response.status}: ${errorText}`);
          }
          
          const result = await response.json();
          console.log('Suppression réussie:', result);
        } catch (error) {
          console.error(`Erreur lors de la suppression de ${media.assetMediaID}:`, error);
        }
      }

      // 3. Mettre à jour les positions et légendes en bulk
      const existingMedias = assetMedias.filter(media => !media.isNew && !media.toDelete);
      const updates = [];
      
      for (const media of existingMedias) {
        const originalMedia = initialAssetMedias.find(m => m.assetMediaID === media.assetMediaID);
        if (originalMedia && (
          originalMedia.listingPosition !== media.listingPosition ||
          originalMedia.legend !== media.legend
        )) {
          updates.push({
            assetMediaID: media.assetMediaID,
            legend: media.legend,
            listingPosition: media.listingPosition,
            state: 'online'
          });
        }
      }

      if (updates.length > 0) {
        try {
          console.log('Mise à jour bulk des médias:', updates);
          const bulkRes = await fetch(`/api/assets/assetMedia/bulkUpdate`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ updates }),
          });
          
          if (!bulkRes.ok) {
            console.error('Erreur bulk update:', await bulkRes.text());
          } else {
            console.log('Bulk update réussi');
          }
        } catch (error) {
          console.error('Erreur lors de la mise à jour en bulk des images:', error);
        }
      }

      // 4. Mise à jour de l'asset
      const allowedAssetFields: (keyof AssetData)[] = [
        'title', 'description', 'price', 'state'
      ];
      const assetUpdates: Partial<AssetData> = {};
      allowedAssetFields.forEach(field => {
        if (assetFormData[field] !== initialAssetData[field]) {
          assetUpdates[field] = assetFormData[field] as any;
        }
      });

      if (Object.keys(assetUpdates).length > 0) {
        if (!assetFormData.assetID) {
          throw new Error('Impossible de mettre à jour : assetID manquant');
        }
        
        const assetRes = await fetch(`/api/assets/${assetFormData.assetID}/update`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(assetUpdates),
        });
        if (!assetRes.ok) {
          throw new Error("Erreur lors de la mise à jour de l'asset");
        }
      }

      // 5. Réinitialiser les états après succès
      const finalAssetMedias = assetMedias
        .filter(media => !media.toDelete)
        .map(media => ({
          ...media,
          isNew: false,
          toDelete: false
        }));

      console.log('Médias finaux après submit:', finalAssetMedias);

      setAssetMedias(finalAssetMedias);
      setInitialAssetMedias([...finalAssetMedias]);
      setNewImages([]);
      
      setInitialAssetData(prev => ({ ...prev, ...assetUpdates }));

      console.log('=== FIN SUBMIT SUCCESS ===');

      setShowNotification(true);
      setNotificationType('success');
      setNotificationMessage('Asset mis à jour avec succès');
      setNotificationDescription("Vos modifications ont été enregistrées.");
    } catch (error) {
      console.error("Erreur lors de la mise à jour de l'asset :", error);
      setShowNotification(true);
      setNotificationType('error');
      setNotificationMessage('Erreur lors de la mise à jour');
      setNotificationDescription(String(error));
    }
  }, [assetFormData, initialAssetData, assetMedias, initialAssetMedias, newImages]);

  const handleNotificationClose = () => setShowNotification(false);

  const contextValue = useMemo(() => ({
    assetFormData,
    initialAssetData,
    initializeDataFromProps,
    updateAssetForm,
    submitUpdates,
    assetMedias,
    newImages,
    addNewImage,
    deleteAssetMedia,
    updateAssetMediaLegend,
    reorderAssetMedias,
    isDirty,
  }), [
    assetFormData,
    initialAssetData,
    initializeDataFromProps,
    updateAssetForm,
    submitUpdates,
    assetMedias,
    newImages,
    addNewImage,
    deleteAssetMedia,
    updateAssetMediaLegend,
    reorderAssetMedias,
    isDirty,
  ]);

  return (
    <UpdateAssetContext.Provider value={contextValue}>
      {children}
      <SMPNotification
        type={notificationType}
        message={notificationMessage}
        description={notificationDescription}
        show={showNotification}
        onClose={handleNotificationClose}
      />
    </UpdateAssetContext.Provider>
  );
};

export default UpdateAssetProvider; 