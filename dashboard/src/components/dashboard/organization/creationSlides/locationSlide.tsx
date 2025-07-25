"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useOrganizationContext } from "@/context/create/createOrganizationContext";
import { Input } from "@/src/components/catalyst/components/input";

interface LocationSlideProps {
  onValidateStep: (isValid: boolean) => void;
}

const LocationSlide: React.FC<LocationSlideProps> = ({ onValidateStep }) => {
  const { formData, updateFormData } = useOrganizationContext();

  // Champs communs
  const [country, setCountry] = useState(formData.country || "");
  const [hasPhysicalAddress, setHasPhysicalAddress] = useState(formData.hasPhysicalAddress ?? false);

  // Pour desktop : champs séparés
  const [address, setAddress] = useState(formData.address || "");
  const [complement, setComplement] = useState(formData.addressComplement || "");
  const [city, setCity] = useState(formData.city || "");
  const [postalCode, setPostalCode] = useState(formData.postalCode || "");

  // Pour mobile : un seul champ pour l'adresse complète
  const [fullAddress, setFullAddress] = useState(formData.address || "");

  // Détection du mode mobile (largeur < 768px)
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Validation de l'étape
  const validateStep = useCallback(() => {
    const isValid =
      country.trim().length > 0 &&
      (hasPhysicalAddress
        ? (isMobile ? fullAddress.trim().length > 0 : address.trim().length > 0)
        : true);
    onValidateStep(isValid);
  }, [country, hasPhysicalAddress, isMobile, fullAddress, address, onValidateStep]);

  // Synchronisation des données dans le contexte
  useEffect(() => {
    const newData = hasPhysicalAddress
      ? isMobile
        ? {
            country,
            address: fullAddress,
            addressComplement: "",
            city: "",
            postalCode: "",
          }
        : {
            country,
            address,
            addressComplement: complement,
            city,
            postalCode,
          }
      : {
          country,
          address: "",
          addressComplement: "",
          city: "",
          postalCode: "",
        };

    const shouldUpdate =
      formData.country !== newData.country ||
      formData.address !== newData.address ||
      formData.addressComplement !== newData.addressComplement ||
      formData.city !== newData.city ||
      formData.postalCode !== newData.postalCode ||
      formData.hasPhysicalAddress !== hasPhysicalAddress;

    if (shouldUpdate) {
      updateFormData({ ...newData, hasPhysicalAddress });
    }

    validateStep();
  }, [
    country,
    hasPhysicalAddress,
    address,
    complement,
    city,
    postalCode,
    fullAddress,
    isMobile,
    updateFormData,
    validateStep,
    formData,
  ]);

  return (
    <div className="flex flex-col items-center justify-center h-full px-4">
      <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">
        Localisation de l’organisation
      </h2>

      {/* Champ Pays */}
      <div className="mb-4 w-full max-w-lg">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Pays (obligatoire)
        </label>
        <select
          className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={country}
          onChange={(e) => setCountry(e.target.value)}
        >
          <option value="" disabled>Sélectionnez un pays</option>
          <option value="France">France</option>
          <option value="Cameroun">Cameroun</option>
          <option value="Suisse">Suisse</option>
          <option value="Canada">Canada</option>
          <option value="Belgique">Belgique</option>
        </select>
      </div>

      {/* Switch pour adresse physique */}
      <div className="mb-4 flex items-center w-full max-w-lg">
        <span className="mr-3 text-lg font-semibold text-gray-700">
          L’organisation a une adresse physique ?
        </span>
        <label className="relative inline-block w-12 h-6">
          <input
            type="checkbox"
            className="sr-only peer"
            checked={hasPhysicalAddress}
            onChange={(e) => setHasPhysicalAddress(e.target.checked)}
          />
          <div className="w-12 h-6 bg-gray-300 rounded-full peer-checked:bg-blue-500 transition" />
          <div className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition peer-checked:translate-x-6" />
        </label>
      </div>

      {/* Affichage conditionnel des champs d'adresse */}
      {hasPhysicalAddress &&
        (isMobile ? (
          // Version mobile : un seul champ pour l'adresse complète
          <div className="mb-4 w-full max-w-lg">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Adresse
            </label>
            <Input
              type="text"
              placeholder="Entrez l'adresse complète"
              value={fullAddress}
              onChange={(e) => setFullAddress(e.target.value)}
            />
          </div>
        ) : (
          // Version desktop : champs séparés pour l'adresse
          <div className="w-full max-w-lg grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Adresse
              </label>
              <Input
                type="text"
                placeholder="Numéro et rue"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Complément
              </label>
              <Input
                type="text"
                placeholder="Bâtiment, étage, etc."
                value={complement}
                onChange={(e) => setComplement(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Ville
              </label>
              <Input
                type="text"
                placeholder="Ville"
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Code postal
              </label>
              <Input
                type="text"
                placeholder="Code postal"
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
              />
            </div>
          </div>
        ))}
    </div>
  );
};

export default LocationSlide;
