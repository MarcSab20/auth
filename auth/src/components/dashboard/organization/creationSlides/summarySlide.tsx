"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useOrganizationContext } from "@/context/create/createOrganizationContext";
import { Button } from "@/src/components/landing-page/Button";
import MarkdownMdxEditor from "@/src/components/markdownMDXEditor";

interface SummarySlideProps {
  onValidateStep: (isValid: boolean) => void;
}

const SummarySlide: React.FC<SummarySlideProps> = ({ onValidateStep }) => {
  const { formData, updateFormData } = useOrganizationContext();
  const [description, setDescription] = useState(formData.description || "");
  const [loading, setLoading] = useState(false);

  const validateStep = useCallback(() => {
    onValidateStep(!!description.trim());
  }, [description, onValidateStep]);

  useEffect(() => {
    if (formData.description !== description) {
      updateFormData({ description });
    }
    validateStep();
  }, [description, formData.description, updateFormData, validateStep]);

  const generateDescription = async () => {
    try {
      setLoading(true);
      const payload = {
        brand: formData.brand,
        juridicForm: formData.juridicForm,
        capital: formData.capital,
        country: formData.country,
        sectorID: formData.sectorID,
        description,
        city: formData.city,
      };

      const res = await fetch("/api/generative_IA/generateDescriptionForOrganization", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Échec de la génération");

      const data = await res.json();
      let cleanedDescription = "";
      
      // Gérer la réponse de l'API qui peut être soit directement une string, soit un objet avec description
      if (typeof data === "string") {
        cleanedDescription = data
          .replace(/^```markdown\s*/, "")
          .replace(/\s*```$/, "")
          .trim();
      } else if (data && typeof data === "object" && data.description) {
        cleanedDescription = data.description
          .replace(/^```markdown\s*/, "")
          .replace(/\s*```$/, "")
          .trim();
      } else {
        cleanedDescription = "⚠️ Erreur : La description générée est invalide.";
      }

      setDescription(cleanedDescription);
    } catch (error) {
      console.error("Erreur :", error);
      alert(error instanceof Error ? error.message : "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full px-4">
      <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">
        Décrivez votre organisation
      </h2>

      <div className="w-full max-w-3xl">
        <div className="relative">
          <div className="max-h-[24rem] overflow-y-auto">
            <MarkdownMdxEditor
              initialValue={description}
              onChange={setDescription}
              height="24rem"
              placeholder="Commencez à taper ou générez une description..."
            />
          </div>
          <div className="flex items-center gap-3 mt-4 flex-wrap">
            <Button
              special
              onClick={generateDescription}
              disabled={loading}
              className="flex items-center"
            >
              {loading && (
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              )}
              {loading ? "Génération en cours..." : "✨ Générer automatiquement"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SummarySlide;
