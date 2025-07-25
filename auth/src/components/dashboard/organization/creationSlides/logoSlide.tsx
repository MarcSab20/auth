"use client";

import React, { useState, useEffect } from "react";
import { useOrganizationContext } from "@/context/create/createOrganizationContext";
import { Button } from '@/src/components/landing-page/Button'

const LogoUploadSlide: React.FC<{ onValidateStep: (isValid: boolean) => void }> = ({ onValidateStep }) => {
  const { formData, updateFormData } = useOrganizationContext();
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(formData.smallLogoID || null);

  // Lors du montage : si un logo est déjà présent dans le contexte, marque l'étape comme valide.
  useEffect(() => {
    if (formData.smallLogoID) {
      setLogoPreview(formData.smallLogoID);
      onValidateStep(true);
    }
  }, [formData.smallLogoID, onValidateStep]);

  // Met à jour l'aperçu et le contexte uniquement lorsque logoFile change.
  useEffect(() => {
    if (logoFile) {
      const objectURL = URL.createObjectURL(logoFile);
      setLogoPreview(objectURL);
      if (formData.smallLogoID !== objectURL) {
        updateFormData({ smallLogoID: objectURL });
      }
      onValidateStep(true);
      return () => {
        URL.revokeObjectURL(objectURL);
      };
    }
  }, [logoFile, formData.smallLogoID, updateFormData, onValidateStep]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const maxSizeMB = 2; // 2 Mo
      if (file.size > maxSizeMB * 1024 * 1024) {
        alert(`Le fichier est trop volumineux. Taille maximale : ${maxSizeMB} Mo.`);
        return;
      }
      if (!file.type.startsWith("image/")) {
        alert("Seuls les fichiers images sont acceptés.");
        return;
      }
      setLogoFile(file);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full px-4">
      <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">
        Upload du logo (optionnel)
      </h2>

      <div className="w-full max-w-lg flex flex-col items-center">
        {logoPreview ? (
          <img
            src={logoPreview}
            alt="Prévisualisation du logo"
            className="w-32 h-32 object-cover rounded-full mb-4"
          />
        ) : (
          <div
            className="w-32 h-32 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-full mb-4"
            aria-label="Zone pour télécharger un logo"
          >
            <span className="text-gray-400">Aucun logo</span>
          </div>
        )}

        <label className="cursor-pointer">
          <Button as="span">Choisir un logo</Button>
          <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
        </label>
        <p className="text-sm text-gray-500 mt-2">
          Formats acceptés : JPG, PNG, GIF. Taille max : 2 Mo.
        </p>
      </div>
    </div>
  );
};

export default LogoUploadSlide;
