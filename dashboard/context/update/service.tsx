'use client';

import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import SMPNotification from '@/src/components/notification';
import { useAuth } from '@/context/authenticationContext';

// ======================================
// Types
// ======================================
export interface ServiceData {
  serviceID: string;
  title?: string;
  description?: string;
  price?: number;
  legalVatPercent?: number;
  lowerPrice?: number;
  upperPrice?: number;
  negotiable?: boolean;
  supplyType?: string;
  uptakeForm?: string;
  billingPlan?: string;
  onlineService?: boolean;
  advancedAttributes?: string;
  state?: string;
  locationID?: string;
  images?: File[];
  uploadedMediaIDs?: string[];
  serviceMedias?: ServiceMediaInfo[];
}

export interface LocationData {
  locationID?: string;
  addressLine1?: string;
  city?: string;
  postalCode?: string;
  country?: string;
  placeKind?: string;
}

export interface ServiceMediaInfo {
  serviceMediaID: string;
  listingPosition: number;
  url: string;
  legend?: string;
  mediaID?: string;
  isNew?: boolean;
  toDelete?: boolean;
}

export interface UpdateServiceContextData {
  serviceFormData: ServiceData;
  locationFormData: LocationData;
  initialServiceData: ServiceData;
  initialLocationData: LocationData;
  initializeDataFromProps: (service: ServiceData, maybeLocation?: LocationData) => Promise<void>;
  updateServiceForm: (fields: Partial<ServiceData>) => void;
  updateLocationForm: (fields: Partial<LocationData>) => void;
  submitUpdates: () => Promise<void>;
  serviceMedias: ServiceMediaInfo[];
  newImages: File[];
  addNewImage: (file: File, legend?: string) => void;
  deleteServiceMedia: (serviceMediaID: string) => void;
  updateServiceMediaLegend: (serviceMediaID: string, legend: string) => void;
  reorderServiceMedias: (reorderedMedias: ServiceMediaInfo[]) => void;
  isDirty: boolean;
}

const UpdateServiceContext = createContext<UpdateServiceContextData | undefined>(undefined);

export const useUpdateServiceContext = () => {
  const ctx = useContext(UpdateServiceContext);
  if (!ctx) {
    throw new Error('useUpdateServiceContext must be used within UpdateServiceProvider');
  }
  return ctx;
};

// ======================================
// Provider
// ======================================
export const UpdateServiceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();

  // États pour le service
  const [serviceFormData, setServiceFormData] = useState<ServiceData>({ serviceID: '' });
  const [initialServiceData, setInitialServiceData] = useState<ServiceData>({ serviceID: '' });

  // États pour la location
  const [locationFormData, setLocationFormData] = useState<LocationData>({});
  const [initialLocationData, setInitialLocationData] = useState<LocationData>({});

  // États pour les médias
  const [serviceMedias, setServiceMedias] = useState<ServiceMediaInfo[]>([]);
  const [initialServiceMedias, setInitialServiceMedias] = useState<ServiceMediaInfo[]>([]);
  const [newImages, setNewImages] = useState<File[]>([]);

  // Notifications
  const [showNotification, setShowNotification] = useState(false);
  const [notificationType, setNotificationType] = useState<'success' | 'error' | 'info'>('success');
  const [notificationMessage, setNotificationMessage] = useState('');
  const [notificationDescription, setNotificationDescription] = useState('');

  // Calcul du dirty state
  const isDirty = useMemo(() => {
    const serviceChanged = JSON.stringify(serviceFormData) !== JSON.stringify(initialServiceData);
    const locationChanged = JSON.stringify(locationFormData) !== JSON.stringify(initialLocationData);
    const mediasChanged = JSON.stringify(serviceMedias) !== JSON.stringify(initialServiceMedias);
    const hasNewImages = newImages.length > 0;
    return serviceChanged || locationChanged || mediasChanged || hasNewImages;
  }, [serviceFormData, initialServiceData, locationFormData, initialLocationData, serviceMedias, initialServiceMedias, newImages]);

  // Fonctions pour les médias
  const addNewImage = useCallback((file: File, legend?: string) => {
    const newPosition = serviceMedias.filter(m => !m.toDelete).length + 1;
    
    const tempMedia: ServiceMediaInfo = {
      serviceMediaID: `temp-${Date.now()}`,
      listingPosition: newPosition,
      url: URL.createObjectURL(file),
      legend: legend || file.name,
      isNew: true
    };
    
    setServiceMedias(prev => [...prev, tempMedia]);
    setNewImages(prev => [...prev, file]);
  }, [serviceMedias]);

  const deleteServiceMedia = useCallback((serviceMediaID: string) => {
    console.log('=== DELETE SERVICE MEDIA ===');
    console.log('ID à supprimer:', serviceMediaID);
    console.log('Médias avant suppression:', serviceMedias);
    
    if (serviceMediaID.startsWith('temp-')) {
      console.log('Suppression média temporaire');
      setServiceMedias(prev => {
        const updated = prev.filter(media => media.serviceMediaID !== serviceMediaID);
        console.log('Médias après suppression temp:', updated);
        return updated;
      });
      
      setNewImages(prev => {
        const tempIndex = serviceMedias.filter(m => m.isNew).findIndex(m => m.serviceMediaID === serviceMediaID);
        if (tempIndex >= 0) {
          const updated = prev.filter((_, index) => index !== tempIndex);
          console.log('NewImages après suppression:', updated);
          return updated;
        }
        return prev;
      });
    } else {
      console.log('Marquage pour suppression média existant');
      setServiceMedias(prev => {
        const updated = prev.map(media => {
          if (media.serviceMediaID === serviceMediaID) {
            console.log('Média marqué pour suppression:', media);
            return { ...media, toDelete: true };
          }
          return media;
        });
        console.log('Médias après marquage:', updated);
        return updated;
      });
    }
  }, [serviceMedias]);

  const updateServiceMediaLegend = useCallback((serviceMediaID: string, legend: string) => {
    setServiceMedias(prev => prev.map(media => 
      media.serviceMediaID === serviceMediaID 
        ? { ...media, legend }
        : media
    ));
  }, []);

  const reorderServiceMedias = useCallback((reorderedMedias: ServiceMediaInfo[]) => {
    const mediasWithUpdatedPositions = reorderedMedias.map((media, index) => ({
      ...media,
      listingPosition: index + 1
    }));
    setServiceMedias(mediasWithUpdatedPositions);
  }, []);

  // Fonction pour initialiser les données
  const initializeDataFromProps = useCallback(async (service: ServiceData, maybeLocation?: LocationData) => {
    try {
      setServiceFormData(service);
      setInitialServiceData(service);

      // Initialiser les médias - s'assurer qu'ils sont dans le bon format
      const medias = service.serviceMedias || [];
      setServiceMedias(medias);
      setInitialServiceMedias([...medias]); // Copie pour éviter les références
      setNewImages([]);

      if (maybeLocation) {
        setLocationFormData(maybeLocation);
        setInitialLocationData(maybeLocation);
        return;
      }

      if (service.locationID) {
        // Appel à la route API pour récupérer la localisation
        const res = await fetch("/api/location/getById", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ locationID: service.locationID }),
        });
        if (!res.ok) {
          throw new Error("Erreur lors de la récupération de la localisation");
        }
        const loc = await res.json();
        if (loc) {
          const newLocation: LocationData = {
            locationID: loc.placeID,
            addressLine1: loc.addressLine1,
            city: loc.city,
            postalCode: loc.postalCode,
            country: loc.country,
            placeKind: loc.placeKind,
          };
          setLocationFormData(newLocation);
          setInitialLocationData(newLocation);
        }
      } else {
        setLocationFormData({});
        setInitialLocationData({});
      }
    } catch (error) {
      console.error("Erreur lors de l'initialisation des données:", error);
      setShowNotification(true);
      setNotificationType('error');
      setNotificationMessage('Erreur lors du chargement');
      setNotificationDescription(String(error));
    }
  }, []);

  const updateServiceForm = useCallback((fields: Partial<ServiceData>) => {
    setServiceFormData(prev => ({ ...prev, ...fields }));
  }, []);

  const updateLocationForm = useCallback((fields: Partial<LocationData>) => {
    setLocationFormData(prev => ({ ...prev, ...fields }));
  }, []);

  const submitUpdates = useCallback(async () => {
    try {
      console.log('=== DEBUT SUBMIT ===');
      console.log('Service Medias avant submit:', serviceMedias);
      console.log('New Images:', newImages);
      
      // 1. Upload des nouvelles images
      const tempMedias = serviceMedias.filter(m => m.isNew && m.serviceMediaID.startsWith('temp-'));
      console.log('Médias temporaires à uploader:', tempMedias);
      
      for (let i = 0; i < newImages.length; i++) {
        const image = newImages[i];
        const tempMedia = tempMedias[i];
        
        if (tempMedia) {
          const uploadFormData = new FormData();
          uploadFormData.append('file', image);
          uploadFormData.append('entityID', serviceFormData.serviceID);
          uploadFormData.append('listingPosition', tempMedia.listingPosition.toString());
          uploadFormData.append('legend', tempMedia.legend || '');

          try {
            const uploadRes = await fetch(`/api/upload/images/service`, {
              method: 'POST',
              body: uploadFormData,
            });

            if (uploadRes.ok) {
              const uploadData = await uploadRes.json();
              console.log('Upload réussi pour média:', tempMedia.serviceMediaID, uploadData);
              
              // Mettre à jour le média temporaire avec les vraies données
              setServiceMedias(prev => prev.map(media => {
                if (media.serviceMediaID === tempMedia.serviceMediaID) {
                  return {
                    ...media,
                    serviceMediaID: uploadData.joinTable?.serviceMediaID || uploadData.serviceMediaID,
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
            throw error; // Propager l'erreur pour interrompre le processus
          }
        }
      }

      // 2. Supprimer les images marquées pour suppression
      const mediasToDelete = serviceMedias.filter(media => media.toDelete && !media.isNew);
      console.log('Médias à supprimer:', mediasToDelete);

      for (const media of mediasToDelete) {
        try {
          console.log(`Tentative de suppression de serviceMedia: ${media.serviceMediaID}`);
          const response = await fetch(`/api/services/serviceMedia/${media.serviceMediaID}`, {
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
          console.error(`Erreur lors de la suppression de ${media.serviceMediaID}:`, error);
          // On continue avec les autres suppressions même si une échoue
        }
      }

      // 3. Mettre à jour les positions et légendes en bulk
      const existingMedias = serviceMedias.filter(media => !media.isNew && !media.toDelete);
      const updates = [];
      
      for (const media of existingMedias) {
        const originalMedia = initialServiceMedias.find(m => m.serviceMediaID === media.serviceMediaID);
        if (originalMedia && (
          originalMedia.listingPosition !== media.listingPosition ||
          originalMedia.legend !== media.legend
        )) {
          updates.push({
            serviceMediaID: media.serviceMediaID,
            legend: media.legend,
            listingPosition: media.listingPosition,
            state: 'online'
          });
        }
      }

      if (updates.length > 0) {
        try {
          console.log('Mise à jour bulk des médias:', updates);
          const bulkRes = await fetch(`/api/services/serviceMedia/bulkUpdate`, {
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

      // 4. Mise à jour du service
      const allowedServiceFields: (keyof ServiceData)[] = [
        'title', 'description', 'price', 'legalVatPercent', 'lowerPrice', 'upperPrice',
        'negotiable', 'supplyType', 'uptakeForm', 'billingPlan',
        'onlineService', 'advancedAttributes', 'state'
      ];
      const serviceUpdates: Partial<ServiceData> = {};
      allowedServiceFields.forEach(field => {
        if (serviceFormData[field] !== initialServiceData[field]) {
          serviceUpdates[field] = serviceFormData[field] as any;
        }
      });

      // 5. Mise à jour de la localisation (code existant...)
      let finalLocationID = locationFormData.locationID || initialLocationData.locationID;
      const locationHasChanged = (
        locationFormData.addressLine1 !== initialLocationData.addressLine1 ||
        locationFormData.city !== initialLocationData.city ||
        locationFormData.postalCode !== initialLocationData.postalCode ||
        locationFormData.country !== initialLocationData.country ||
        locationFormData.placeKind !== initialLocationData.placeKind
      );

      if (finalLocationID && locationHasChanged) {
        // Mise à jour de la localisation
        const locRes = await fetch("/api/location/update", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            locationID: finalLocationID,
            addressLine1: locationFormData.addressLine1,
            city: locationFormData.city,
            postalCode: locationFormData.postalCode,
            country: locationFormData.country,
            placeKind: locationFormData.placeKind,
          }),
        });
        if (!locRes.ok) {
          throw new Error("Erreur lors de la mise à jour de la localisation");
        }
      }

      if (finalLocationID !== initialLocationData.locationID) {
        serviceUpdates.locationID = finalLocationID;
      }

      if (Object.keys(serviceUpdates).length > 0) {
        if (!serviceFormData.serviceID) {
          throw new Error('Impossible de mettre à jour : serviceID manquant');
        }
        
        const serviceRes = await fetch("/api/services/update", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            serviceID: serviceFormData.serviceID,
            updates: serviceUpdates,
          }),
        });
        if (!serviceRes.ok) {
          throw new Error("Erreur lors de la mise à jour du service");
        }
      }

      // 6. Réinitialiser les états après succès
      // Obtenir l'état final des médias (uploadés + existants non supprimés)
      const finalServiceMedias = serviceMedias
        .filter(media => !media.toDelete) // Enlever les médias supprimés
        .map(media => ({
          ...media,
          isNew: false, // Plus de médias "nouveaux" après upload
          toDelete: false
        }));

      console.log('Médias finaux après submit:', finalServiceMedias);

      // Mettre à jour tous les états
      setServiceMedias(finalServiceMedias);
      setInitialServiceMedias([...finalServiceMedias]); // Copie pour éviter les références
      setNewImages([]); // Vider les nouvelles images
      
      // Mettre à jour les données initiales
      setInitialServiceData(prev => ({ ...prev, ...serviceUpdates }));
      setInitialLocationData(locationFormData);

      console.log('=== FIN SUBMIT SUCCESS ===');

      setShowNotification(true);
      setNotificationType('success');
      setNotificationMessage('Service mis à jour avec succès');
      setNotificationDescription("Vos modifications ont été enregistrées.");
    } catch (error) {
      console.error("Erreur lors de la mise à jour du service :", error);
      setShowNotification(true);
      setNotificationType('error');
      setNotificationMessage('Erreur lors de la mise à jour');
      setNotificationDescription(String(error));
    }
  }, [serviceFormData, initialServiceData, locationFormData, initialLocationData, serviceMedias, initialServiceMedias, newImages]);

  const handleNotificationClose = () => setShowNotification(false);

  const contextValue = useMemo(() => ({
    serviceFormData,
    locationFormData,
    initialServiceData,
    initialLocationData,
    initializeDataFromProps,
    updateServiceForm,
    updateLocationForm,
    submitUpdates,
    serviceMedias,
    newImages,
    addNewImage,
    deleteServiceMedia,
    updateServiceMediaLegend,
    reorderServiceMedias,
    isDirty,
  }), [
    serviceFormData,
    locationFormData,
    initialServiceData,
    initialLocationData,
    initializeDataFromProps,
    updateServiceForm,
    updateLocationForm,
    submitUpdates,
    serviceMedias,
    newImages,
    addNewImage,
    deleteServiceMedia,
    updateServiceMediaLegend,
    reorderServiceMedias,
    isDirty,
  ]);

  return (
    <UpdateServiceContext.Provider value={contextValue}>
      {children}
      <SMPNotification
        type={notificationType}
        message={notificationMessage}
        description={notificationDescription}
        show={showNotification}
        onClose={handleNotificationClose}
      />
    </UpdateServiceContext.Provider>
  );
};

export default UpdateServiceProvider;
