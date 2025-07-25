'use client';

import React, { useState } from 'react';
import { MdContentCopy } from 'react-icons/md';
import { Heading, Subheading } from '@/src/components/catalyst/components/heading';
import { Label } from '@/src/components/catalyst/components/label';
import { Text } from '@/src/components/catalyst/components/text';
import { Divider } from '@/src/components/catalyst/components/divider';

interface RecapSectionProps {
  organizationData: {
    legalName?: string;
    sigle?: string;
    legalUniqIdentifier?: string; // SIRET
    vatNumber?: string;
    currency?: string;
    brand?: string;
    activityStartedAt?: string | number;
    activityEndedAt?: string | number;
    description?: string;
    insuranceRef?: string;
    insuranceName?: string;
    capital?: number;
  };
  locationData?: {
    country?: string;
  };
}

const formatDate = (date?: string | number) => {
  return date !== undefined && date !== null ? String(date) : 'Non renseigné';
};

const RecapSection: React.FC<RecapSectionProps> = ({ organizationData, locationData }) => {
  const [copied, setCopied] = useState<{ legalUniqIdentifier: boolean; vat: boolean }>({
    legalUniqIdentifier: false,
    vat: false,
  });

  const handleCopy = (field: 'legalUniqIdentifier' | 'vat', text: string) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        setCopied(prev => ({ ...prev, [field]: true }));
        setTimeout(() => {
          setCopied(prev => ({ ...prev, [field]: false }));
        }, 2000);
      })
      .catch((err) => console.error('Erreur lors de la copie:', err));
  };

  return (
    <div className="w-full px-4 py-6">
      <Divider />
      <Heading level={3} className="text-center">Informations légales et opérationnelles</Heading>
      
      <div className="bg-white shadow-sm rounded-lg p-4 space-y-6 mx-auto w-full sm:max-w-2xl border border-gray-100">
        {/* Bloc Identité */}
        <div className="space-y-4">
          <Subheading level={4}>Identité légale</Subheading>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Label>Nom juridique</Label>
              <Text className="font-medium">
                {organizationData.legalName || 'Non renseigné'}
              </Text>
            </div>
            <div>
              <Label>Sigle commercial</Label>
              <Text className="font-medium text-blue-600">
                {organizationData.sigle || '—'}
              </Text>
            </div>
          </div>
        </div>

        {/* Bloc Identifiants */}
        <div className="space-y-4">
          <Subheading level={4}>Identifiants légaux</Subheading>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Label>SIRET</Label>
              <div className="flex items-center gap-2">
                <Text className="font-medium">
                  {organizationData.legalUniqIdentifier || 'Non renseigné'}
                </Text>
                {organizationData.legalUniqIdentifier && (
                  <button
                    onClick={() => handleCopy('legalUniqIdentifier', organizationData.legalUniqIdentifier || '')}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <MdContentCopy className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
            <div>
              <Label>TVA Intracommunautaire</Label>
              <div className="flex items-center gap-2">
                <Text className="font-medium">
                  {organizationData.vatNumber || 'Non renseigné'}
                </Text>
                {organizationData.vatNumber && (
                  <button
                    onClick={() => handleCopy('vat', organizationData.vatNumber || '')}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <MdContentCopy className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Bloc Caractéristiques */}
        <div className="space-y-4">
          <Subheading level={4}>Caractéristiques</Subheading>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label>Devise</Label>
              <Text className="font-medium">
                {organizationData.currency || 'EUR'}
              </Text>
            </div>
            <div>
              <Label>Capital</Label>
              <Text className="font-medium">
                {organizationData.capital?.toLocaleString('fr-FR') || '—'} €
              </Text>
            </div>
            <div className="sm:col-span-2">
              <Label>Pays</Label>
              <Text className="font-medium">
                {locationData?.country || 'Non renseigné'}
              </Text>
            </div>
          </div>
        </div>

        {/* Bloc Activité */}
        <div className="space-y-4">
          <Subheading level={4}>Période d'activité</Subheading>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label>Début</Label>
              <Text className="font-medium">
                {formatDate(organizationData.activityStartedAt)}
              </Text>
            </div>
            <div>
              <Label>Fin</Label>
              <Text className="font-medium">
                {formatDate(organizationData.activityEndedAt)}
              </Text>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecapSection;
