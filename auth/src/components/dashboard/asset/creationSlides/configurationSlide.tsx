"use client";

import React, { useEffect, useState } from "react";
import { useAssetContext } from "@/context/create/createAssetContext";
import { Label } from "@/src/components/catalyst/components/label";
import { Input, InputGroup } from "@/src/components/catalyst/components/input";

interface ConfigurationSlideProps {
  onValidateStep: (isValid: boolean) => void;
}

const ConfigurationSlide: React.FC<ConfigurationSlideProps> = ({ onValidateStep }) => {
  const { formData, updateFormData } = useAssetContext();
  const [hasLimit, setHasLimit] = useState(false);
  const [stockQuantity, setStockQuantity] = useState(formData.stockQuantity?.toString() || "");
  const [maxPerReservation, setMaxPerReservation] = useState(
    formData.maxPerReservation?.toString() || ""
  );

  // Met à jour le contexte à chaque changement
  useEffect(() => {
    const s = parseInt(stockQuantity);
    const m = parseInt(maxPerReservation);
    const payload: any = { maxPerReservation: isNaN(m) ? 0 : m, hasStockLimit: hasLimit };
    if (hasLimit) {
      payload.stockQuantity = isNaN(s) ? 0 : s;
    }
    updateFormData(payload);
  }, [hasLimit, stockQuantity, maxPerReservation, updateFormData]);

  // Validation de l'étape
  useEffect(() => {
    const m = parseInt(maxPerReservation);
    if (isNaN(m) || m <= 0) {
      onValidateStep(false);
    } else if (hasLimit) {
      const s = parseInt(stockQuantity);
      onValidateStep(!isNaN(s) && s > 0);
    } else {
      onValidateStep(true);
    }
  }, [hasLimit, stockQuantity, maxPerReservation, onValidateStep]);

  return (
    <div className="relative flex flex-col items-center justify-center h-full space-y-8">
      <h2 className="text-4xl font-bold text-gray-900 text-center">
        Configuration de l'asset
      </h2>

      {/* Maximum par réservation */}
      <div className="w-full max-w-lg space-y-6">
        <div>
          <Label htmlFor="maxPerReservation">
            Maximum par réservation <span className="text-red-500">*</span>
          </Label>
          <InputGroup>
            <Input
              id="maxPerReservation"
              type="number"
              min="1"
              placeholder="Entrez le maximum par réservation"
              value={maxPerReservation}
              onChange={e => setMaxPerReservation(e.target.value)}
              className="mt-1 w-full"
              required
            />
          </InputGroup>
        </div>
      </div>

      {/* Toggle stock limit */}
      <div className="flex items-center space-x-4">
        <Label>Limiter le stock disponible ?</Label>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={hasLimit}
            onChange={() => setHasLimit((prev: boolean) => !prev)}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-300 rounded-full peer-checked:bg-black transition-colors" />
          <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-5" />
        </label>
      </div>

      {/* Quantité en stock si limité */}
      {hasLimit && (
        <div className="w-full max-w-lg space-y-6">
          <div>
            <Label htmlFor="stockQuantity">
              Quantité en stock <span className="text-red-500">*</span>
            </Label>
            <InputGroup>
              <Input
                id="stockQuantity"
                type="number"
                
                placeholder="Entrez la quantité en stock"
                value={stockQuantity}
                onChange={e => setStockQuantity(e.target.value)}
                className="mt-1 w-full"
                required
              />
            </InputGroup>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConfigurationSlide;
