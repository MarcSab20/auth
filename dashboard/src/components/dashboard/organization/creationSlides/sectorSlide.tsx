"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { useOrganizationContext } from "@/context/create/createOrganizationContext";

interface SectorSlideProps {
  onValidateStep: (isValid: boolean) => void;
}

const mockSectors = [
  { id: 1, label: "Éducation", iconPath: "/images/topics/education.png" },
  { id: 2, label: "Restauration", iconPath: "/images/topics/restaurant.png" },
  { id: 3, label: "Informatique", iconPath: "/images/topics/developpement-de-logiciels.png" },
  { id: 4, label: "Santé", iconPath: "/images/topics/soins-de-sante.png" },
  { id: 5, label: "Service à la personne", iconPath: "/images/topics/prestations-de-service.png" },
];

const SectorSlide: React.FC<SectorSlideProps> = ({ onValidateStep }) => {
  const { formData, updateFormData } = useOrganizationContext();
  const [selectedSector, setSelectedSector] = useState<number | undefined>(formData.sectorID);

  const validateStep = useCallback(() => {
    onValidateStep(selectedSector !== undefined);
  }, [selectedSector, onValidateStep]);

  useEffect(() => {
    if (formData.sectorID !== selectedSector) {
      updateFormData({ sectorID: selectedSector });
    }
    validateStep();
  }, [selectedSector, formData.sectorID, updateFormData, validateStep]);

  return (
    <div className="flex flex-col items-center justify-center h-full px-4">
      <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">
        Sélectionnez votre secteur
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {mockSectors.map((sector) => (
          <button
            key={sector.id}
            onClick={() => setSelectedSector(sector.id)}
            className={`flex flex-col items-center justify-center space-y-2 p-4 border rounded-lg transition-transform transform
              ${
                selectedSector === sector.id
                  ? "shadow-lg shadow-blue-500 bg-opacity-90 scale-105"
                  : "shadow-md shadow-gray-300 bg-opacity-60 hover:shadow-lg hover:shadow-gray-400 hover:bg-opacity-70"
              } bg-white`}
          >
            <Image
              src={sector.iconPath}
              alt={sector.label}
              width={50}
              height={50}
              className="w-12 h-12 object-contain"
            />
            <span className="text-lg font-semibold">{sector.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default SectorSlide;
