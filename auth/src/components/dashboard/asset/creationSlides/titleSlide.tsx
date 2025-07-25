"use client";

import React, { useState, useEffect } from "react";
import { useAssetContext } from "@/context/create/createAssetContext";

interface TitleSlideProps {
  onValidateStep: (isValid: boolean) => void;
}

const TitleSlide: React.FC<TitleSlideProps> = ({ onValidateStep }) => {
  const { formData, updateFormData } = useAssetContext();
  const [title, setTitle] = useState(formData.title || "");

  // Met à jour le contexte only when title changes
  useEffect(() => {
    if (formData.title !== title) {
      updateFormData({ title });
    }
  }, [title, updateFormData, formData.title]);

  // Valide l'étape quand le titre change
  useEffect(() => {
    onValidateStep(title.trim().length > 0);
  }, [title, onValidateStep]);

  return (
    <div className="relative flex flex-col items-center justify-center h-full">
      <h2 className="text-4xl font-bold text-gray-900 mb-8 text-center">
        Donnez un titre à votre asset
      </h2>
      <input
        id="title"
        type="text"
        placeholder="Titre de l’asset"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full max-w-lg border mt-8 border-gray-300 rounded-lg p-5 text-lg text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-black"
      />
    </div>
  );
};

export default TitleSlide;
