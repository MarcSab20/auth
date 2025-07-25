"use client";

import React, { useState, useEffect } from "react";
import { useServiceContext } from "@/context/create/createServiceContext";

const PriceSlide = () => {
  const { formData, updateFormData } = useServiceContext();
  const [isMobile, setIsMobile] = useState(false);

  // Détection du responsive
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Utilisation d'un seul état pour la saisie manuelle du prix (pour mobile et desktop)
  const [priceText, setPriceText] = useState<string>(formData.price ? String(formData.price) : "");

  // Met à jour le contexte si la valeur saisie est un nombre valide et différent de la valeur actuelle
  useEffect(() => {
    const parsed = parseFloat(priceText);
    if (!isNaN(parsed) && parsed !== formData.price) {
      updateFormData({ price: parsed });
    }
  }, [priceText, formData.price, updateFormData]);

  // État pour le toggle "négociable"
  const [negotiable, setNegotiable] = useState<boolean>(formData.negotiable || false);
  useEffect(() => {
    if (negotiable !== formData.negotiable) {
      updateFormData({ negotiable });
    }
  }, [negotiable, formData.negotiable, updateFormData]);

  return (
    <div className="flex flex-col items-center justify-center h-full">
      <h2 className="text-4xl font-bold text-gray-900 mb-8 text-center">
        Définissez le prix de votre service
      </h2>
      <input
        type="number"
        min="0"
        placeholder="Saisissez le prix du service"
        value={priceText}
        onChange={(e) => setPriceText(e.target.value)}
        className="w-full max-w-md border border-gray-300 rounded-lg p-3 text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-black"
      />
      <div className="mt-8 flex items-center justify-between w-full max-w-lg">
        <span className="text-gray-700 text-lg">Le service est négociable</span>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={negotiable}
            onChange={(e) => setNegotiable(e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-300 rounded-full peer-checked:bg-black transition-colors" />
          <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-5" />
        </label>
      </div>
    </div>
  );
};

export default PriceSlide;
