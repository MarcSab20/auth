// src/context/update/assetManagement.tsx
'use client';

import React, { createContext, useContext, useState, useCallback } from "react";
import SMPNotification from '@/src/components/notification';

export interface AssetEntity {
  assetID: string;
  uniqRef?: string;
  slug?: string;
  title: string;
  authorID?: string;
  organizationID?: string;
  mediaID?: string | null;
  description?: string;
  price: number;
  legalVatPercent?: number;
  quantity?: number | null;
  stockQuantity?: number | null;
  maxPerReservation?: number | null;
  conflictingAssets?: string | null;
  applyableAssets?: string | null;
  state: string;
  createdAt?: string | null;
  updatedAt?: string | null;
  deletedAt?: string | null;
}

export interface ServiceAssetEntity {
  serviceAssetID: string;
  uniqRef?: string;
  slug: string;
  assetID: string;
  serviceID: string;
  legend?: string;
  state: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

interface AssetManagementContextType {
  associatedAssets: ServiceAssetEntity[];
  availableAssets: AssetEntity[];
  loading: boolean;
  error: string | null;
  loadAssociatedAssets: (serviceID: string) => Promise<void>;
  loadAvailableAssets: (organizationID: string) => Promise<void>;
  associateAsset: (serviceID: string, assetID: string) => Promise<void>;
  dissociateAsset: (serviceAssetID: string) => Promise<void>;
}

const AssetManagementContext = createContext<AssetManagementContextType | undefined>(undefined);

export const AssetManagementProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [associatedAssets, setAssociatedAssets] = useState<ServiceAssetEntity[]>([]);
  const [availableAssets, setAvailableAssets] = useState<AssetEntity[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // états pour notification
  const [showNotif, setShowNotif] = useState(false);
  const [notifType, setNotifType] = useState<'success' | 'error' | 'info'>('info');
  const [notifMessage, setNotifMessage] = useState('');
  const [notifDesc, setNotifDesc] = useState<string>();

  const notify = (type: 'success' | 'error' | 'info', message: string, description?: string) => {
    setNotifType(type);
    setNotifMessage(message);
    setNotifDesc(description);
    setShowNotif(true);
  };

  const loadAssociatedAssets = useCallback(async (serviceID: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/assets/services/${serviceID}`);
      if (!response.ok) throw new Error('Échec du chargement des assets associés');
      const serviceAssets = await response.json();
      setAssociatedAssets(serviceAssets);
      notify('success', 'Assets associés chargés');
    } catch (err: any) {
      setError(err.message);
      notify('error', 'Erreur', err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadAvailableAssets = useCallback(async (organizationID: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/assets/organization/${organizationID}`);
      if (!response.ok) throw new Error('Échec du chargement des assets disponibles');
      const assets = await response.json();
      setAvailableAssets(assets);
      notify('success', 'Assets disponibles chargés');
    } catch (err: any) {
      setError(err.message);
      notify('error', 'Erreur', err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const associateAsset = useCallback(async (serviceID: string, assetID: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/service-assets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assetID, serviceID, legend: "", state: "online" }),
      });
      if (!response.ok) throw new Error('Échec de l’association de l’asset');
      const newServiceAsset = await response.json();
      setAssociatedAssets(prev => [...prev, newServiceAsset]);
      notify('success', 'Asset associé', `ID: ${newServiceAsset.serviceAssetID}`);
    } catch (err: any) {
      setError(err.message);
      notify('error', 'Erreur', err.message);
      console.error(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const dissociateAsset = useCallback(async (serviceAssetID: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/service-assets/${serviceAssetID}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Échec de la dissociation de l’asset');
      setAssociatedAssets(prev => prev.filter(sa => sa.serviceAssetID !== serviceAssetID));
      notify('success', 'Asset dissocié', `ID: ${serviceAssetID}`);
    } catch (err: any) {
      setError(err.message);
      notify('error', 'Erreur', err.message);
      console.error(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <AssetManagementContext.Provider value={{
      associatedAssets,
      availableAssets,
      loading,
      error,
      loadAssociatedAssets,
      loadAvailableAssets,
      associateAsset,
      dissociateAsset
    }}>
      {children}

      {/* Notification globale */}
      <SMPNotification
        type={notifType}
        message={notifMessage}
        description={notifDesc}
        show={showNotif}
        onClose={() => setShowNotif(false)}
      />
    </AssetManagementContext.Provider>
  );
};

export const useAssetManagement = () => {
  const context = useContext(AssetManagementContext);
  if (context === undefined) {
    throw new Error("useAssetManagement must be used within an AssetManagementProvider");
  }
  return context;
};
