'use client';

import React, { createContext, useContext, useState } from 'react';
import SMPNotification from '@/src/components/notification';

export interface UpdateOrganizationInput {
  ownerID?: number;
  orgRef?: string;
  sectorID?: number;
  legalName?: string;
  brand?: string;
  sigle?: string;
  smallLogoID?: string;
  bigLogoID?: string;
  bannerID?: string;
  smallLogoUrl?: string;
  bannerUrl?: string;
  oSize?: string;
  juridicForm?: string;
  juridicCatLabel?: string;
  juridicCatCode?: string;
  currency?: string;
  legalUniqIdentifier?: string;
  vatNumber?: string;
  communityVATNumber?: string;
  capital?: number;
  insuranceRef?: string;
  insuranceName?: string;
  activityStartedAt?: number;
  activityEndedAt?: number;
  description?: string;
  summary?: string;
  locationID?: string;
  parentOrganizationID?: string;
  advancedAttributes?: string;
  state?: string;
}

export interface OrganizationData extends UpdateOrganizationInput {
  organizationID: string;
}

export interface LocationData {
  locationID?: string;
  addressLine1?: string;
  city?: string;
  postalCode?: string;
  country?: string;
  placeKind?: string;
}

export interface UpdateOrganizationContextData {
  organizationFormData: OrganizationData;
  locationFormData: LocationData;
  initialOrganizationData: OrganizationData;
  initialLocationData: LocationData;
  initializeDataFromId: (organizationID: string) => Promise<void>;
  updateOrganizationForm: (fields: Partial<OrganizationData>) => void;
  updateLocationForm: (fields: Partial<LocationData>) => void;
  updateOrganizationMedia: (type: 'smallLogo' | 'banner', url: string) => void;
  deleteOrganizationMedia: (type: 'smallLogo' | 'banner') => Promise<void>;
  submitUpdates: () => Promise<void>;
}

const UpdateOrganizationContext = createContext<UpdateOrganizationContextData | undefined>(undefined);

export const useUpdateOrganizationContext = () => {
  const ctx = useContext(UpdateOrganizationContext);
  if (!ctx) {
    throw new Error('useUpdateOrganizationContext must be used within UpdateOrganizationProvider');
  }
  return ctx;
};

export const UpdateOrganizationProvider: React.FC<{
  children: React.ReactNode;
  initialOrganizationData: OrganizationData;
  initialLocationData?: LocationData;
}> = ({ children, initialOrganizationData, initialLocationData = {} }) => {
  const [organizationFormData, setOrganizationFormData] = useState(initialOrganizationData);
  const [locationFormData, setLocationFormData] = useState(initialLocationData);
  const [notification, setNotification] = useState<{
    show: boolean;
    type: 'success' | 'error' | 'info';
    message: string;
    description: string;
  }>({
    show: false,
    type: 'success',
    message: '',
    description: '',
  });

  const updateOrganizationForm = (fields: Partial<OrganizationData>) => {
    setOrganizationFormData(prev => ({ ...prev, ...fields }));
  };

  const updateLocationForm = (fields: Partial<LocationData>) => {
    setLocationFormData(prev => ({ ...prev, ...fields }));
  };

  const updateOrganizationMedia = (type: 'smallLogo' | 'banner', url: string) => {
    setOrganizationFormData(prev => ({
      ...prev,
      [type === 'smallLogo' ? 'smallLogoUrl' : 'bannerUrl']: url
    }));
  };

  const deleteOrganizationMedia = async (type: 'smallLogo' | 'banner') => {
    try {
      const mediaID = type === 'smallLogo' ? organizationFormData.smallLogoID : organizationFormData.bannerID;
      if (!mediaID) return;

      const response = await fetch(`/api/organization/${organizationFormData.organizationID}/media/${mediaID}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setOrganizationFormData(prev => ({
          ...prev,
          [type === 'smallLogo' ? 'smallLogoUrl' : 'bannerUrl']: undefined,
          [type === 'smallLogo' ? 'smallLogoID' : 'bannerID']: undefined
        }));

        setNotification({
          show: true,
          type: 'success',
          message: 'Succès',
          description: `Le ${type === 'smallLogo' ? 'logo' : 'bannière'} a été supprimé avec succès.`,
        });
      } else {
        throw new Error('Erreur lors de la suppression du média');
      }
    } catch (error: any) {
      setNotification({
        show: true,
        type: 'error',
        message: 'Erreur',
        description: error.message || 'Erreur lors de la suppression du média',
      });
    }
  };

  const submitUpdates = async () => {
    try {
      const updateFields: Partial<UpdateOrganizationInput> = {};

      // Vérifier les changements sur les champs de l'organisation
      Object.entries(organizationFormData).forEach(([key, value]) => {
        if (
          key !== 'organizationID' &&
          value !== (initialOrganizationData as any)[key]
        ) {
          updateFields[key as keyof UpdateOrganizationInput] = value;
        }
      });

      // Vérifier si les données de localisation ont changé
      const locationChanged =
        locationFormData.addressLine1 !== initialLocationData.addressLine1 ||
        locationFormData.city !== initialLocationData.city ||
        locationFormData.postalCode !== initialLocationData.postalCode ||
        locationFormData.country !== initialLocationData.country ||
        locationFormData.placeKind !== initialLocationData.placeKind;

      // Si des modifications existent sur l'organisation, effectuer l'appel API
      if (Object.keys(updateFields).length > 0) {
        const orgResponse = await fetch(`/api/organization/${organizationFormData.organizationID}/update`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updateFields),
        });

        if (!orgResponse.ok) {
          throw new Error("Erreur serveur lors de la mise à jour de l'organisation");
        }
      }

      // Si la localisation a changé et qu'un locationID existe, appeler l'API de mise à jour de la localisation
      if (locationChanged && locationFormData.locationID) {
        const locResponse = await fetch('/api/location/update', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            locationID: locationFormData.locationID,
            addressLine1: locationFormData.addressLine1,
            city: locationFormData.city,
            postalCode: locationFormData.postalCode,
            country: locationFormData.country,
            placeKind: locationFormData.placeKind,
          }),
        });
        if (!locResponse.ok) {
          throw new Error('Erreur lors de la mise à jour de la localisation.');
        }
      }

      setNotification({
        show: true,
        type: 'success',
        message: 'Succès',
        description: 'Organisation et localisation mises à jour avec succès.',
      });
    } catch (error: any) {
      console.error('Update error:', error);
      setNotification({
        show: true,
        type: 'error',
        message: 'Erreur',
        description: error.message || 'Erreur inconnue',
      });
    }
  };

  return (
    <UpdateOrganizationContext.Provider
      value={{
        organizationFormData,
        locationFormData,
        initialOrganizationData,
        initialLocationData,
        initializeDataFromId: async () => {},
        updateOrganizationForm,
        updateLocationForm,
        updateOrganizationMedia,
        deleteOrganizationMedia,
        submitUpdates,
      }}
    >
      {children}
      <SMPNotification
        type={notification.type}
        message={notification.message}
        description={notification.description}
        show={notification.show}
        onClose={() => setNotification(prev => ({ ...prev, show: false }))}
      />
    </UpdateOrganizationContext.Provider>
  );
};
