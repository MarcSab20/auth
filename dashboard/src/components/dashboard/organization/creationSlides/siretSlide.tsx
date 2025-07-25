"use client";
import React, { useState, useEffect } from "react";
import { useOrganizationContext } from "@/context/create/createOrganizationContext";
import { Button } from "@/src/components/landing-page/Button";

interface LegalUniqIdentifierSlideProps {
  onValidateStep: (isValid: boolean) => void;
}

const LegalUniqIdentifierSlide: React.FC<LegalUniqIdentifierSlideProps> = ({ onValidateStep }) => {
  const { formData, updateFormData } = useOrganizationContext();
  const [legalUniqIdentifier, setLegalUniqIdentifier] = useState(formData.legalUniqIdentifier || "");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const isValid = legalUniqIdentifier.trim().length === 14; // Longueur exacte d'un SIRET
    setError(isValid || !legalUniqIdentifier ? null : "Le SIRET doit contenir 14 chiffres.");
    updateFormData({ legalUniqIdentifier });
    onValidateStep(isValid);
  }, [legalUniqIdentifier, updateFormData, onValidateStep]);

  const handleFetchLegalUniqIdentifierData = async () => {
    setLoading(true);
    try {
      // Logique fictive pour récupérer les données du SIRET
      console.log("Fetching legal data for SIRET:", legalUniqIdentifier);
      // Simulez une réponse avec un délai
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Exemple : mise à jour des données via l'API fictive
      updateFormData({ legalName: "Entreprise Exemple" });
      setError(null);
    } catch (err) {
      setError("Impossible de récupérer les informations. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full px-4">
      <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">
        SIRET / Identifiant légal
      </h2>

      <div className="w-full max-w-lg">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Numéro de SIRET (14 chiffres)
        </label>
        <input
          type="text"
          placeholder="Ex: 12345678900014"
          value={legalUniqIdentifier}
          onChange={(e) => setLegalUniqIdentifier(e.target.value)}
          className={`w-full border rounded-lg p-3 text-lg shadow-sm focus:outline-none focus:ring-2 mb-2 ${
            error ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-black"
          }`}
        />
        {error && <p className="text-sm text-red-500">{error}</p>}
      </div>

      <Button special onClick={handleFetchLegalUniqIdentifierData} disabled={loading}>
  {loading ? 'Chargement...' : 'Rechercher pour pré-remplir'}
</Button>

    </div>
  );
};

export default LegalUniqIdentifierSlide;
