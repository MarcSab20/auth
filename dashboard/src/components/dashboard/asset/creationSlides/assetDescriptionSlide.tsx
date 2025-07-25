"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useAssetContext } from "@/context/create/createAssetContext";
import { Button } from "@/src/components/landing-page/Button";
import MarkdownMdxEditor from "@/src/components/markdownMDXEditor";

interface AssetDescriptionProps {
  onValidateStep: (isValid: boolean) => void;
}

const AssetDescriptionSlide: React.FC<AssetDescriptionProps> = ({ onValidateStep }) => {
  const { formData, updateFormData } = useAssetContext();
  const [description, setDescription] = useState<string>(formData.description || "");
  const [loading, setLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Détection du mode mobile
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Met à jour le contexte et valide l'étape
  const validateStep = useCallback(() => {
    onValidateStep(!!description.trim());
  }, [description, onValidateStep]);

  useEffect(() => {
    if (formData.description !== description) {
      updateFormData({ description });
    }
    validateStep();
  }, [description, formData.description, updateFormData, validateStep]);

  // Génération automatique via IA
  const generateDescription = async () => {
    try {
      setLoading(true);
      const payload = {
        title: formData.title,
        price: formData.price,
        quantity: formData.quantity,
        description: formData.description
      };
      const res = await fetch("/api/generative_IA/generateDescriptionForAsset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Échec de la génération");
      const data = await res.json();
      let text = "";
      if (typeof data === "string") {
        text = data
          .replace(/^```markdown\s*/i, "")
          .replace(/\s*```$/, "")
          .trim();
      } else {
        text = "⚠️ Erreur : description invalide renvoyée par le serveur.";
      }
      
      // Mise à jour de l'état local et du contexte
      setDescription(text);
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full px-4">
      <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">
        Décrivez votre asset
      </h2>
      <div className="w-full max-w-3xl">
        <div className="max-h-[24rem] overflow-y-auto">
          <MarkdownMdxEditor
            initialValue={description}
            onChange={(value) => {
              setDescription(value);
              updateFormData({ description: value });
            }}
            height={isMobile ? "16rem" : "24rem"}
            placeholder="Commencez à décrire votre asset..."
          />
        </div>
        <div className={`flex gap-4 mt-4 ${isMobile ? "flex-col" : "flex-row"}`}>
          <Button
            special
            onClick={generateDescription}
            disabled={loading}
            className="flex items-center"
          >
            {loading ? "Génération..." : "✨ Générer description IA"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AssetDescriptionSlide;