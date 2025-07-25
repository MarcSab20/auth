'use client';

import React from 'react';
import { Input } from '@/src/components/catalyst/components/input';
import { Label } from '@/src/components/catalyst/components/label';
import { Divider } from '@/src/components/catalyst/components/divider';
import { Text } from '@/src/components/catalyst/components/text';

interface LegalInfoSectionProps {
  formData: {
    brand?: string;
    juridicForm?: string;
    juridicCatLabel?: string;
    juridicCatCode?: string;
    capital?: number;
    legalUniqIdentifier?: string;
    insuranceRef?: string;
    insuranceName?: string;
  };
  handleChange: (field: keyof LegalInfoSectionProps['formData'], value: any) => void;
}

const LegalInfoSection: React.FC<LegalInfoSectionProps> = ({ formData, handleChange }) => {
  return (
    <div className="space-y-6">
      <div>
        <Label>Marque / Brand</Label>
        <Input
          name="brand"
          value={formData.brand || ''}
          onChange={(e) => handleChange('brand', e.target.value)}
          placeholder="Entrez la marque"
          className="mt-1"
        />
      </div>

      <div>
        <Label>SIRET</Label>
        <Input
          name="legalUniqIdentifier"
          value={formData.legalUniqIdentifier || ''}
          onChange={(e) => handleChange('legalUniqIdentifier', e.target.value)}
          placeholder="Entrez votre SIRET"
          className="mt-1"
        />
      </div>

      <div>
        <Label>Forme Juridique</Label>
        <Input
          name="juridicForm"
          value={formData.juridicForm || ''}
          onChange={(e) => handleChange('juridicForm', e.target.value)}
          placeholder="Ex : SAS, SARL, etc."
          className="mt-1"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label>Catégorie Juridique (Label)</Label>
          <Input
            name="juridicCatLabel"
            value={formData.juridicCatLabel || ''}
            onChange={(e) => handleChange('juridicCatLabel', e.target.value)}
            placeholder="Entrez le label"
            className="mt-1"
          />
        </div>
        <div>
          <Label>Catégorie Juridique (Code)</Label>
          <Input
            name="juridicCatCode"
            value={formData.juridicCatCode || ''}
            onChange={(e) => handleChange('juridicCatCode', e.target.value)}
            placeholder="Entrez le code"
            className="mt-1"
          />
        </div>
      </div>

      <div>
        <Label>Capital</Label>
        <Input
          type="number"
          name="capital"
          value={formData.capital ?? ''}
          onChange={(e) => handleChange('capital', Number(e.target.value))}
          placeholder="Capital social"
          className="mt-1"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label>Référence Assurance</Label>
          <Input
            name="insuranceRef"
            value={formData.insuranceRef || ''}
            onChange={(e) => handleChange('insuranceRef', e.target.value)}
            placeholder="Référence d'assurance"
            className="mt-1"
          />
        </div>
        <div>
          <Label>Nom de l'Assurance</Label>
          <Input
            name="insuranceName"
            value={formData.insuranceName || ''}
            onChange={(e) => handleChange('insuranceName', e.target.value)}
            placeholder="Nom de l'assurance"
            className="mt-1"
          />
        </div>
      </div>
    </div>
  );
};

export default LegalInfoSection;
