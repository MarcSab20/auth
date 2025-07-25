"use client";

import React, { useEffect, useState } from "react";
import { useAssetContext } from "@/context/create/createAssetContext";
import { Input } from "@/src/components/catalyst/components/input";
import { Label } from "@/src/components/catalyst/components/label";

interface PriceSlideProps {
  onValidateStep: (isValid: boolean) => void;
}

const PriceSlide: React.FC<PriceSlideProps> = ({ onValidateStep }) => {
  const { formData, updateFormData } = useAssetContext();
  const [priceText, setPriceText] = useState(
    formData.price != null ? formData.price.toString() : ""
  );
  const [vatText, setVatText] = useState(
    formData.legalVatPercent != null ? formData.legalVatPercent.toString() : ""
  );

  // Met à jour le contexte lorsqu'on change le prix ou la TVA
  useEffect(() => {
    const price = parseFloat(priceText);
    const legalVatPercent = parseFloat(vatText);
    updateFormData({
      price: isNaN(price) ? 0 : price,
      legalVatPercent: isNaN(legalVatPercent) ? 0 : legalVatPercent,
    });
  }, [priceText, vatText, updateFormData]);

  // Valide l'étape quand le prix est un nombre >= 0
  useEffect(() => {
    const value = parseFloat(priceText);
    onValidateStep(!isNaN(value) && value >= 0);
  }, [priceText, onValidateStep]);

  return (
    <div className="flex flex-col items-center justify-center h-full space-y-8">
      <h2 className="text-4xl font-bold text-gray-900 text-center">
        Définissez le prix de votre asset
      </h2>
      <div className="w-full max-w-md space-y-6">
        <div>
          <Label htmlFor="price">
            Prix de l’asset  <span className="text-red-500">*</span>
          </Label>
          <Input
            id="price"
            type="number"
            min="0"
            step="0.01"
            placeholder="Entrez le prix"
            value={priceText}
            onChange={(e) => setPriceText(e.target.value)}
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="vat">TVA (%)</Label>
          <Input
            id="vat"
            type="number"
            min="0"
            step="0.01"
            placeholder="Entrez le pourcentage de TVA"
            value={vatText}
            onChange={(e) => setVatText(e.target.value)}
            className="mt-1"
          />
        </div>
      </div>
    </div>
  );
};

export default PriceSlide;