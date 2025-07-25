// src/components/update/asset/AssetDetailClient.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Heading } from '@/src/components/catalyst/components/heading';
import { Badge } from '@/src/components/catalyst/components/badge';
import { Button } from '@/src/components/landing-page/Button';
import { Divider } from '@/src/components/catalyst/components/divider';
import { Link } from '@/src/components/catalyst/components/link';
import { FrenchDate } from '@/src/components/frenchDate';
import { useUpdateAssetContext, AssetData } from '@/context/update/asset';
import AssetImageManager from './medias';
import AssetTabs from '@/src/components/dashboard/organization/asset/editAsset/assetTab';
import PriceSectionAsset from './tab/priceSectionAsset';
import DescriptionSectionAsset from './tab/descriptionSectionAsset';
import ServicesSection from './tab/serviceSection';
import DetailsSectionAsset from './tab/detailsSectionAsset';


interface AssetDetailClientProps {
  asset: {
    assetID: string;
    title: string;
    description?: string;
    price: number;
    state: string;
    mediaID?: string;
    images?: string[];
    medias?: Array<{
      assetMediaID: string;
      listingPosition: number;
      legend?: string;
      state: string;
      media: {
        url: string;
        mediaID: string;
      };
    }>;
    createdAt?: string;
    updatedAt?: string;
  };
  organizationID: string;
}

export default function AssetDetailClient({
  asset,
  organizationID,
}: AssetDetailClientProps) {
  const {
    assetFormData,
    initialAssetData,
    initializeDataFromProps,
    updateAssetForm,
    submitUpdates,
    isDirty,
  } = useUpdateAssetContext();

  const [activeTab, setActiveTab] = useState<'prix' | 'description' | 'services' | 'details'>('prix');

  // Initialisation
  useEffect(() => {
    // Convertir les assetMedias au bon format
    const convertedAssetMedias = asset.medias?.map(am => ({
      assetMediaID: am.assetMediaID,
      listingPosition: am.listingPosition,
      url: am.media.url,
      legend: am.legend,
      mediaID: am.media.mediaID,
      isNew: false,
      toDelete: false
    })) || [];

    const { images, ...assetWithoutImages } = asset; // Exclure images
    const assetWithMedias = {
      ...assetWithoutImages,
      assetMedias: convertedAssetMedias
    };

    initializeDataFromProps(assetWithMedias);
  }, [asset, initializeDataFromProps]);

  const handleSave = async () => {
    try {
      await submitUpdates();
      // Pas besoin de rafraîchir la page car le contexte gère déjà la mise à jour
    } catch (error) {
      console.error("Erreur lors de la mise à jour de l'asset:", error);
    }
  };

  return (
    <motion.div
      className="space-y-8 px-6 py-6"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 50 }}
      transition={{ duration: 0.3 }}
    >
      {/* ← Retour */}
      <div>
        <Link
          href={`/account/o/${organizationID}/assets`}
          className="hover:underline text-sm text-zinc-600"
        >
          ← Retour aux assets
        </Link>
      </div>

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between ">
        <Heading level={2}>{asset.title}</Heading>
        <Badge color={asset.state === 'online' ? 'green' : 'red'}>
          {asset.state === 'online' ? 'Actif' : 'Inactif'}
        </Badge>
      </div>

      {/* Image bannière */}
      {asset.mediaID && (
        <div className="w-full max-w-3xl">
          <img
            src={asset.mediaID}
            alt={asset.title}
            className="rounded shadow-sm object-cover w-full h-60"
          />
        </div>
      )}

      {/* Gestion des images avec AssetImageManager */}
      <div className="mt-6">
        <AssetImageManager
          assetID={asset.assetID}
          organizationID={organizationID}
          initialAssetMedias={asset.medias?.map(media => ({
            assetMediaID: media.assetMediaID,
            listingPosition: media.listingPosition,
            url: media.media.url,
            legend: media.legend
          }))}
          onUpdate={() => {
            // Le contexte gère déjà la mise à jour
            console.log('Asset images updated');
          }}
        />
      </div>

      {/* Dates */}
      <div className="mt-2 text-sm text-zinc-500">
        Créé le <FrenchDate date={asset.createdAt} /> · Mis à jour le{' '}
        <FrenchDate date={asset.updatedAt} />
      </div>

      <Divider />

      {/* Onglets */}
      <AssetTabs activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Contenu de l'onglet */}
      <div className="mt-4">
        {activeTab === 'details' && (
          <DetailsSectionAsset />
        )}
        {activeTab === 'prix' && (
          <PriceSectionAsset
            formData={{ price: assetFormData.price! }}
            handleChange={updateAssetForm}
          />
        )}
        {activeTab === 'description' && (
          <DescriptionSectionAsset
            formData={{ description: assetFormData.description }}
            handleChange={updateAssetForm}
          />
        )}
        {activeTab === 'services' && (
          <ServicesSection
            assetID={asset.assetID}
            organizationID={organizationID}
          />
        )}
      </div>

      {/* Sauvegarder */}
      <div className="pt-6 flex justify-end">
        <Button
          disabled={!isDirty}
          onClick={handleSave}
          className={`px-6 py-2 rounded-md ${
            isDirty
              ? 'bg-black text-white hover:bg-gray-800'
              : 'bg-gray-300 text-gray-700 cursor-not-allowed'
          }`}
        >
          Sauvegarder
        </Button>
      </div>
    </motion.div>
  );
}
