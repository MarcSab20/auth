"use client";

import React, { useState, useEffect } from "react";
import { useServiceContext } from "@/context/create/createServiceContext";

interface TitleSlideProps {
  onValidateStep: (isValid: boolean) => void;
}

const MAX_SYNTHESE_LENGTH = 200; // Longueur maximale pour la synthèse

const TitleSlide: React.FC<TitleSlideProps> = ({ onValidateStep }) => {
  const { formData, updateFormData } = useServiceContext();
  const [title, setTitle] = useState(formData.title || "");
  const [synthese, setSynthese] = useState("");
  const [remainingChars, setRemainingChars] = useState(MAX_SYNTHESE_LENGTH);
  const [syntheseError, setSyntheseError] = useState(false);

  // Initialiser la synthèse à partir des advancedAttributes
  useEffect(() => {
    try {
      const advancedAttrs = formData.advancedAttributes || {};
      setSynthese(advancedAttrs.synthese || "");
      setRemainingChars(MAX_SYNTHESE_LENGTH - (advancedAttrs.synthese?.length || 0));
      setSyntheseError((advancedAttrs.synthese?.length || 0) > MAX_SYNTHESE_LENGTH);
    } catch (error) {
      console.error("Erreur lors de l'initialisation de la synthèse:", error);
    }
  }, [formData.advancedAttributes]);

  // Mettez à jour le contexte seulement si la valeur change
  useEffect(() => {
    if (formData.title !== title) {
      updateFormData({ title });
    }
  }, [title, updateFormData, formData.title]);

  // Déclenche la validation uniquement quand "title" change
  useEffect(() => {
    onValidateStep(title.trim().length > 0);
  }, [title, onValidateStep]);

  // Debug: Logger les changements du formData
  useEffect(() => {
    console.log("=== DEBUG FORMDATA CHANGE ===");
    console.log("formData.advancedAttributes:", formData.advancedAttributes);
    console.log("synthese dans formData:", formData.advancedAttributes?.synthese);
  }, [formData.advancedAttributes]);

  const handleSyntheseChange = (value: string) => {
    setSynthese(value);
    setRemainingChars(MAX_SYNTHESE_LENGTH - value.length);
    setSyntheseError(value.length > MAX_SYNTHESE_LENGTH);
    
    // Debug logs
    console.log("=== DEBUG SYNTHESE CHANGE ===");
    console.log("Nouvelle valeur synthèse:", value);
    console.log("formData.advancedAttributes avant update:", formData.advancedAttributes);
    
    // Mettre à jour les advancedAttributes
    try {
      const currentAttrs = formData.advancedAttributes || {};
      const newAttrs = { ...currentAttrs, synthese: value };
      
      console.log("newAttrs à envoyer:", newAttrs);
      
      updateFormData({ 
        advancedAttributes: newAttrs
      });
      
      console.log("updateFormData appelé avec:", { advancedAttributes: newAttrs });
    } catch (error) {
      console.error("Erreur lors de la mise à jour de la synthèse:", error);
    }
  };

  return (
    <div className="relative flex flex-col items-center justify-center h-full max-w-2xl mx-auto">
      <h2 className="text-4xl font-bold text-gray-900 mb-8 text-center">
        Choisissez un titre
      </h2>
      
      {/* Champ titre */}
      <input
        type="text"
        placeholder="Titre"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full max-w-lg border mt-8 border-gray-300 rounded-lg p-5 text-lg text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-black"
      />

      {/* Champ synthèse */}
      <div className="w-full max-w-lg mt-6 space-y-3">
        <label className="block text-lg font-semibold text-gray-900">
          Synthèse (optionnel)
        </label>
        <div className="relative">
          <textarea
            value={synthese}
            onChange={(e) => handleSyntheseChange(e.target.value)}
            placeholder="Entrez une synthèse concise du service (200 caractères max)"
            className={`w-full min-h-[100px] border border-gray-300 rounded-lg p-5 text-lg text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-black resize-none ${
              syntheseError ? 'border-red-500 focus:ring-red-500' : ''
            }`}
            maxLength={MAX_SYNTHESE_LENGTH + 1}
          />
          <div 
            className={`absolute bottom-3 right-3 text-sm font-medium pointer-events-none ${
              remainingChars < 0 
                ? 'text-red-600 font-bold' 
                : remainingChars < 50 
                  ? 'text-orange-500' 
                  : 'text-gray-500'
            }`}
          >
            {remainingChars} restants
          </div>
          {syntheseError && (
            <div className="absolute left-0 -bottom-7 text-red-600 text-sm font-semibold">
              Limite de caractères dépassée
            </div>
          )}
        </div>
        <p className="text-sm text-gray-600 leading-relaxed">
          💡 La synthèse sera utilisée dans les aperçus et cartes de votre service pour donner un aperçu rapide aux utilisateurs.
        </p>
      </div>
    </div>
  );
};

export default TitleSlide;
