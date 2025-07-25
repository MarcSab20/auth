'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/src/components/landing-page/Button';
import { Dialog, DialogTitle, DialogDescription } from '@/src/components/catalyst/components/dialog';
import { useAssetManagement } from '@/context/manage/asset';
import { AssetCard } from '@/src/components/dashboard/organization/asset/assetCard';

interface AssetsSectionProps {
  serviceID: string;
  organizationID: string;
}

interface ServiceAsset {
  asset: {
    assetID: string;
    title: string;
    description?: string;
    organizationID: string;
    uniqRef?: string;
    slug?: string;
    authorID?: string;
    mediaID?: string | null;
    price: number;
    legalVatPercent?: number;
    quantity?: number | null;
    stockQuantity?: number | null;
    maxPerReservation?: number | null;
    conflictingAssets?: string | null;
    applyableAssets?: string | null;
    state: string;
    createdAt?: string | null;
  };
  serviceAsset: {
    serviceAssetID: string;
    serviceID: string;
    assetID: string;
  };
}

export default function AssetsSection({ serviceID, organizationID }: AssetsSectionProps) {
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isAssociateModalOpen, setIsAssociateModalOpen] = useState(false);
  const [selectedServiceAssetID, setSelectedServiceAssetID] = useState<string | null>(null);
  
  const {
    associatedAssets,
    availableAssets,
    loading,
    error,
    loadAssociatedAssets,
    loadAvailableAssets,
    associateAsset,
    dissociateAsset
  } = useAssetManagement();

  useEffect(() => {
    loadAssociatedAssets(serviceID);
    loadAvailableAssets(organizationID);
  }, [serviceID, organizationID, loadAssociatedAssets, loadAvailableAssets]);

  const handleDissociate = async () => {
    if (!selectedServiceAssetID) return;
    try {
      await dissociateAsset(selectedServiceAssetID);
      setIsConfirmModalOpen(false);
      setSelectedServiceAssetID(null);
    } catch (error) {
      console.error('Error dissociating asset:', error);
    }
  };

  const handleAssociate = async (assetID: string) => {
    try {
      await associateAsset(serviceID, assetID);
      setIsAssociateModalOpen(false);
    } catch (error) {
      console.error('Error associating asset:', error);
    }
  };

  if (loading) return <div>Chargement...</div>;
  if (error) return <div>Erreur: {error}</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Assets associés</h3>
        <Button onClick={() => setIsAssociateModalOpen(true)}>
          Associer un asset
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {(associatedAssets as unknown as ServiceAsset[]).map((serviceAsset) => (
          <div key={serviceAsset.serviceAsset.serviceAssetID} className="relative">
            <AssetCard asset={serviceAsset.asset} />
            <Button
              className="absolute top-2 right-2"
              onClick={() => {
                setSelectedServiceAssetID(serviceAsset.serviceAsset.serviceAssetID);
                setIsConfirmModalOpen(true);
              }}
            >
              Dissocier
            </Button>
          </div>
        ))}
      </div>

      {/* Modal de confirmation de dissociation */}
      <Dialog open={isConfirmModalOpen} onClose={() => {
        setIsConfirmModalOpen(false);
        setSelectedServiceAssetID(null);
      }}>
        <div className="p-6">
          <DialogTitle>Confirmer la dissociation</DialogTitle>
          <DialogDescription>
            Êtes-vous sûr de vouloir dissocier cet asset du service ?
          </DialogDescription>
          <div className="mt-4 flex justify-end space-x-2">
            <Button
             
              onClick={() => {
                setIsConfirmModalOpen(false);
                setSelectedServiceAssetID(null);
              }}
            >
              Annuler
            </Button>
            <Button  onClick={handleDissociate}>
              Dissocier
            </Button>
          </div>
        </div>
      </Dialog>

      {/* Modal d'association d'assets */}
      <Dialog open={isAssociateModalOpen} onClose={() => setIsAssociateModalOpen(false)}>
        <div className="p-6">
          <DialogTitle>Associer un asset</DialogTitle>
          <DialogDescription>
            Sélectionnez un asset à associer au service
          </DialogDescription>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto">
            {availableAssets.map((asset) => (
              <div key={asset.assetID} className="relative">
                <AssetCard asset={asset} />
                <Button
                  type="button"
                  className="absolute top-2 right-2"
                  onClick={() => handleAssociate(asset.assetID)}
                >
                  Jumeler
                </Button>
              </div>
            ))}
          </div>
          <div className="mt-4 flex justify-end">
            <Button
              type="button"
              onClick={() => setIsAssociateModalOpen(false)}
            >
              Fermer
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
