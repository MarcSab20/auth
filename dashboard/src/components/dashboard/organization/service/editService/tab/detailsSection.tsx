'use client';

import React, { useState, useEffect } from 'react';
import SwitchTable from '@/src/components/switchTable';
import { ServiceData } from '@/context/update/service';
import { Label } from '@/src/components/catalyst/components/label';
import { Select } from '@/src/components/catalyst/components/select';
import { Input } from '@/src/components/catalyst/components/input';
import { Textarea } from '@/src/components/catalyst/components/textarea';

interface DetailsSectionProps {
  formData: Pick<
    ServiceData,
    | 'title'
    | 'legalVatPercent'
    | 'lowerPrice'
    | 'upperPrice'
    | 'negotiable'
    | 'supplyType'
    | 'uptakeForm'
    | 'billingPlan'
    | 'onlineService'
    | 'advancedAttributes'
  >;
  handleChange: (field: keyof ServiceData, value: any) => void;
}

const MAX_SYNTHESE_LENGTH = 200; // Longueur maximale pour la synthèse

const DetailsSection: React.FC<DetailsSectionProps> = ({ formData, handleChange }) => {
  const [synthese, setSynthese] = useState('');
  const [remainingChars, setRemainingChars] = useState(MAX_SYNTHESE_LENGTH);
  const [syntheseError, setSyntheseError] = useState(false);

  // Initialiser la synthèse à partir des advancedAttributes
  useEffect(() => {
    try {
      const advancedAttrs = formData.advancedAttributes ? JSON.parse(formData.advancedAttributes) : {};
      setSynthese(advancedAttrs.synthese || '');
      setRemainingChars(MAX_SYNTHESE_LENGTH - (advancedAttrs.synthese?.length || 0));
      setSyntheseError((advancedAttrs.synthese?.length || 0) > MAX_SYNTHESE_LENGTH);
    } catch (error) {
      console.error('Erreur lors du parsing des advancedAttributes:', error);
    }
  }, [formData.advancedAttributes]);

  const handleSyntheseChange = (value: string) => {
    setSynthese(value);
    setRemainingChars(MAX_SYNTHESE_LENGTH - value.length);
    setSyntheseError(value.length > MAX_SYNTHESE_LENGTH);
    // Mettre à jour les advancedAttributes
    try {
      const currentAttrs = formData.advancedAttributes ? JSON.parse(formData.advancedAttributes) : {};
      const newAttrs = { ...currentAttrs, synthese: value };
      handleChange('advancedAttributes', JSON.stringify(newAttrs));
    } catch (error) {
      console.error('Erreur lors de la mise à jour des advancedAttributes:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Titre du service */}
      <div className="space-y-2">
        <Label className="text-lg font-semibold">Titre du service</Label>
        <Input
          value={formData.title || ''}
          onChange={(e) => handleChange('title', e.target.value)}
          placeholder="Entrez le titre du service"
          className="mt-1 w-full"
        />
      </div>

      {/* Synthèse du service */}
      <div className="space-y-2 hidden sm:block">
        <Label className="text-lg font-semibold">Synthèse</Label>
        <div className="relative">
          <Textarea
            value={synthese}
            onChange={(e) => handleSyntheseChange(e.target.value)}
            placeholder="Entrez une synthèse concise du service"
            className={`mt-1 w-full min-h-[65px] ${syntheseError ? 'border-red-500 focus:border-red-500' : ''}`}
            maxLength={MAX_SYNTHESE_LENGTH + 1}
          />
          <div className={`absolute bottom-2 right-2 text-sm ${remainingChars < 0 ? 'text-red-500' : remainingChars < 50 ? 'text-red-500' : 'text-gray-500'}`}
            style={{border: 'none', background: 'none'}}>
            {remainingChars} caractères restants
          </div>
          {syntheseError && (
            <div className="absolute left-0 -bottom-6 text-red-600 text-xs font-semibold">Vous avez dépassé la limite de caractères autorisée.</div>
          )}
        </div>
      </div>

      {/* Options du service */}
      <div className="space-y-2">
        <Label className="text-lg font-semibold">Options du service</Label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <Label>Forme de fourniture</Label>
            <Select
              value={formData.supplyType || 'mixed'}
              onChange={(e) => handleChange('supplyType', e.target.value)}
              className="mt-1 w-full"
            >
              <option value="irl">IRL</option>
              <option value="online">En ligne</option>
              <option value="mixed">Mixte</option>
            </Select>
          </div>
          <div>
            <Label>Forme de prestation</Label>
            <Select
              value={formData.uptakeForm || 'instant'}
              onChange={(e) => handleChange('uptakeForm', e.target.value)}
              className="mt-1 w-full"
            >
              <option value="instant">Instant</option>
              <option value="periodic">Périodique</option>
              <option value="prestation">Prestation</option>
            </Select>
          </div>
          <div>
            <Label>Plan tarifaire</Label>
            <Select
              value={formData.billingPlan || 'mixed'}
              onChange={(e) => handleChange('billingPlan', e.target.value)}
              className="mt-1 w-full"
            >
              <option value="unit">Unité</option>
              <option value="usage">Usage</option>
              <option value="mixed">Mixte</option>
              <option value="direct">Direct</option>
              <option value="minute">Minute</option>
              <option value="hourly">Horaire</option>
              <option value="dayly">Journalière</option>
              <option value="mensual">Mensuelle</option>
              <option value="trimestrial">Trimestrielle</option>
              <option value="semestrial">Semestrielle</option>
              <option value="annual">Annuelle</option>
            </Select>
          </div>
        </div>
      </div>

      {/* Paramètres */}
      <div className="space-y-2">
        <Label className="text-lg font-semibold">Paramètres</Label>
        <SwitchTable
          items={[
            {
              id: 'negotiable',
              label: 'Négociable',
              enabled: formData.negotiable || false,
              onChange: (value: boolean) => handleChange('negotiable', value),
            },
            {
              id: 'onlineService',
              label: 'Service en ligne',
              enabled: formData.onlineService || false,
              onChange: (value: boolean) => handleChange('onlineService', value),
            },
          ]}
        />
      </div>
    </div>
  );
};

export default DetailsSection;
