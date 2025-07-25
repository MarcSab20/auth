// src/components/update/asset/tab/priceSectionAsset.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { AssetData } from '@/context/update/asset';
import { Label } from '@/src/components/catalyst/components/label';
import { Input } from '@/src/components/catalyst/components/input';

interface PriceSectionProps {
  formData: Pick<AssetData, 'price'>;
  handleChange: (fields: Partial<AssetData>) => void;
}

export default function PriceSectionAsset({ formData, handleChange }: PriceSectionProps) {
  const [price, setPrice] = useState(formData.price?.toString() || '');

  useEffect(() => {
    setPrice(formData.price?.toString() || '');
  }, [formData.price]);

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPrice(value);
    handleChange({ price: value ? parseInt(value) : undefined });
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="price">Prix</Label>
        <Input
          id="price"
          type="number"
          value={price}
          onChange={handlePriceChange}
          placeholder="Entrez le prix"
        />
      </div>
    </div>
  );
}
