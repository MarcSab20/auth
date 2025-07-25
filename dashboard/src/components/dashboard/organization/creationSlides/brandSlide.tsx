"use client";

import React, { useState, useEffect } from "react";
import { useOrganizationContext } from "@/context/create/createOrganizationContext";
import { Input } from "@/src/components/catalyst/components/input";

interface BrandSlideProps {
  onValidateStep: (isValid: boolean) => void;
}

const BrandSlide: React.FC<BrandSlideProps> = ({ onValidateStep }) => {
  const { formData, updateFormData } = useOrganizationContext();
  const [brand, setBrand] = useState(formData.brand || "");
  const [isLegallyExisting, setIsLegallyExisting] = useState(formData.isLegallyExisting || false);

  // Valider dès le montage si le nom est renseigné
  useEffect(() => {
    onValidateStep(brand.trim().length > 0);
  }, []); // Exécuté une seule fois

  // Validation en fonction du changement de la valeur
  useEffect(() => {
    onValidateStep(brand.trim().length > 0);
  }, [brand, onValidateStep]);

  // Synchronisation avec le contexte
  useEffect(() => {
    updateFormData({
      brand,
      isLegallyExisting,
    });
  }, [brand, isLegallyExisting, updateFormData]);

  return (
    <div className="flex flex-col items-center justify-center h-full px-4">
      <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">
        Nom de l'organisation
      </h2>

      <div className="w-full max-w-lg mb-6">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Nom de l'organisation (obligatoire)
        </label>
        <Input
          type="text"
          placeholder="Ex : Ma super organisation"
          value={brand}
          onChange={(e) => {
            const newVal = e.target.value;
            setBrand(newVal);
            onValidateStep(newVal.trim().length > 0);
          }}
        />
      </div>

      {/* Switch pour indiquer si l'organisation existe légalement */}
      <div className="mb-6 flex items-center">
        <span className="mr-3 text-lg font-semibold text-gray-700">
          L'organisation existe déjà légalement ?
        </span>
        <label className="relative inline-block w-12 h-6">
          <input
            type="checkbox"
            className="sr-only peer"
            checked={isLegallyExisting}
            onChange={(e) => setIsLegallyExisting(e.target.checked)}
          />
          <div className="w-12 h-6 bg-gray-300 rounded-full peer-checked:bg-blue-500 transition" />
          <div className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition peer-checked:translate-x-6" />
        </label>
      </div>
    </div>
  );
};

export default BrandSlide;
