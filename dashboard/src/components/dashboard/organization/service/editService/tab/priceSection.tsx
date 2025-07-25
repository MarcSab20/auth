'use client';

import React, { useState, useEffect } from 'react';
import { ServiceData } from '@/context/update/service';
import { Label } from '@/src/components/catalyst/components/label';
import { Input } from '@/src/components/catalyst/components/input';
import { Text } from '@/src/components/catalyst/components/text';

interface PriceSectionProps {
  formData: Pick<ServiceData, 'price' | 'lowerPrice' | 'upperPrice' | 'legalVatPercent'>;
  handleChange: (field: keyof ServiceData, value: any) => void;
}

const PriceSection: React.FC<PriceSectionProps> = ({ formData, handleChange }) => {
  // Gérer les valeurs sous forme de chaînes pour éviter les zéros en tête non désirés
  const [priceValue, setPriceValue] = useState(formData.price ? formData.price.toString() : '');
  const [lowerPriceValue, setLowerPriceValue] = useState(formData.lowerPrice ? formData.lowerPrice.toString() : '');
  const [upperPriceValue, setUpperPriceValue] = useState(formData.upperPrice ? formData.upperPrice.toString() : '');
  const [vatValue, setVatValue] = useState(formData.legalVatPercent ? formData.legalVatPercent.toString() : '');
  const [error, setError] = useState('');

  useEffect(() => {
    setPriceValue(formData.price ? formData.price.toString() : '');
    setLowerPriceValue(formData.lowerPrice ? formData.lowerPrice.toString() : '');
    setUpperPriceValue(formData.upperPrice ? formData.upperPrice.toString() : '');
    setVatValue(formData.legalVatPercent ? formData.legalVatPercent.toString() : '');
  }, [formData]);

  // Fonction pour supprimer les zéros inutiles en début de chaîne
  const sanitizeNumberInput = (val: string) => {
    if (val === '') return '';
    const sanitized = val.replace(/^0+(?!$)/, '');
    return sanitized === '' ? '0' : sanitized;
  };

  const onPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVal = sanitizeNumberInput(e.target.value);
    setPriceValue(newVal);
    handleChange('price', Number(newVal));
  };

  const onLowerPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVal = sanitizeNumberInput(e.target.value);
    setLowerPriceValue(newVal);
    // Vérifier la condition : prix min ne doit pas être supérieur au prix max
    if (upperPriceValue && Number(newVal) > Number(upperPriceValue)) {
      setError("Le prix minimum ne peut pas être supérieur au prix maximum");
    } else {
      setError("");
      handleChange('lowerPrice', Number(newVal));
    }
  };

  const onUpperPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVal = sanitizeNumberInput(e.target.value);
    setUpperPriceValue(newVal);
    if (lowerPriceValue && Number(lowerPriceValue) > Number(newVal)) {
      setError("Le prix minimum ne peut pas être supérieur au prix maximum");
    } else {
      setError("");
      handleChange('upperPrice', Number(newVal));
    }
  };

  const onVatChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVal = sanitizeNumberInput(e.target.value);
    setVatValue(newVal);
    handleChange('legalVatPercent', Number(newVal));
  };

  return (
    <div className="space-y-6">
      <div>
        <Label>Prix</Label>
        <Input
          type="number"
          name="price"
          value={priceValue}
          onChange={onPriceChange}
          placeholder="Entrez le prix"
          className="mt-1"
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <Label>Prix min</Label>
          <Input
            type="number"
            name="lowerPrice"
            value={lowerPriceValue}
            onChange={onLowerPriceChange}
            placeholder="Minimum"
            className={`mt-1 ${error ? 'border-red-500' : ''}`}
          />
        </div>
        <div>
          <Label>Prix max</Label>
          <Input
            type="number"
            name="upperPrice"
            value={upperPriceValue}
            onChange={onUpperPriceChange}
            placeholder="Maximum"
            className={`mt-1 ${error ? 'border-red-500' : ''}`}
          />
        </div>
      </div>
      <div>
        <Label>TVA (%)</Label>
        <Input
          type="number"
          name="legalVatPercent"
          value={vatValue}
          onChange={onVatChange}
          placeholder="Taux de TVA"
          className="mt-1"
        />
      </div>
      {error && <Text className="mt-2 text-red-600 text-sm">{error}</Text>}
    </div>
  );
};

export default PriceSection;
