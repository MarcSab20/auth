"use client";

import React, { useState, useEffect, useCallback, FormEvent } from "react";
import { useServiceContext } from "@/context/create/createServiceContext";

interface LocationSlideProps {
  onValidateStep?: (isValid: boolean) => void;
}

const LocationSlide: React.FC<LocationSlideProps> = ({ onValidateStep = () => {} }) => {
  const { formData, updateFormData } = useServiceContext();

  const [country, setCountry] = useState(formData.country || "");
  const [hasPhysicalAddress, setHasPhysicalAddress] = useState(formData.hasPhysicalAddress ?? false);
  // Pour desktop : champs séparés
  const [address, setAddress] = useState(formData.addressLine1 || "");
  const [complement, setComplement] = useState(formData.addressComplement || "");
  const [city, setCity] = useState(formData.city || "");
  const [postalCode, setPostalCode] = useState(formData.postalCode || "");
  // Pour mobile : un seul champ pour l'adresse complète
  const [fullAddress, setFullAddress] = useState(formData.addressLine1 || "");

  // Détection du mobile (mobile si largeur < 768px)
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Validation : valide si le pays et l'adresse (ou l'adresse complète) sont renseignés
  const validateStep = useCallback(() => {
    const isValid =
      country.trim().length > 0 &&
      (hasPhysicalAddress
        ? (isMobile ? fullAddress.trim().length > 0 : address.trim().length > 0)
        : true);
    onValidateStep(isValid);
  }, [country, hasPhysicalAddress, isMobile, fullAddress, address, onValidateStep]);

  // Mise à jour du contexte en fonction de la vue et de l'état du switch
  useEffect(() => {
    const newData = hasPhysicalAddress
      ? isMobile
        ? {
            country,
            addressLine1: fullAddress,
            addressComplement: "",
            city: "",
            postalCode: "",
          }
        : {
            country,
            addressLine1: address,
            addressComplement: complement,
            city,
            postalCode,
          }
      : {
          country,
          addressLine1: "",
          addressComplement: "",
          city: "",
          postalCode: "",
        };
  
    // Vérifie que les données ont changé avant de mettre à jour
    const shouldUpdate =
      formData.country !== newData.country ||
      formData.addressLine1 !== newData.addressLine1 ||
      formData.addressComplement !== newData.addressComplement ||
      formData.city !== newData.city ||
      formData.postalCode !== newData.postalCode ||
      formData.hasPhysicalAddress !== hasPhysicalAddress;
  
    if (shouldUpdate) {
      updateFormData({
        ...newData,
        hasPhysicalAddress,
      });
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
  ]);
  

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    validateStep();
  };

  return (
    <form
      className="flex flex-col items-center justify-center h-full px-4 overflow-y-auto max-h-screen"
      onSubmit={handleSubmit}
    >
      <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">
        Localisation du service
      </h2>

      {/* Champ Pays */}
      <div className="mb-4 w-full max-w-lg">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Pays (obligatoire)
        </label>
        <select
          value={country}
          onChange={(e) => setCountry(e.target.value)}
          className="w-full border border-gray-300 rounded-lg p-3 shadow-sm focus:ring-2 focus:ring-blue-500"
        >
          <option value="" disabled>Sélectionnez un pays</option>
          <option value="France">France</option>
          <option value="Belgique">Belgique</option>
          <option value="Suisse">Suisse</option>
          <option value="Canada">Canada</option>
          <option value="Cameroun">Cameroun</option>
        </select>
      </div>

      {/* Switch pour adresse physique */}
      <div className="mb-4 flex items-center w-full max-w-lg">
        <span className="mr-3 text-lg font-semibold text-gray-700">
          le service a une adresse physique ?
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
            <input
              type="text"
              placeholder="Entrez l'adresse complète"
              value={fullAddress}
              onChange={(e) => setFullAddress(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-3 shadow-sm focus:ring-2 focus:ring-blue-500"
            />
          </div>
        ) : (
          // Version desktop : champs séparés pour l'adresse
          <div className="w-full max-w-lg grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Adresse
              </label>
              <input
                type="text"
                placeholder="Numéro et rue"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-3 shadow-sm focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Complément
              </label>
              <input
                type="text"
                placeholder="Bâtiment, étage, etc."
                value={complement}
                onChange={(e) => setComplement(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-3 shadow-sm focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Ville
              </label>
              <input
                type="text"
                placeholder="Ville"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-3 shadow-sm focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Code postal
              </label>
              <input
                type="text"
                placeholder="Code postal"
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-3 shadow-sm focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        ))}
    </form>
  );
};

export default LocationSlide;
