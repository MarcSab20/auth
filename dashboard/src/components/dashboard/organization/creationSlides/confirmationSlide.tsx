"use client";

import React, { useEffect } from "react";
import { useOrganizationContext } from "@/context/create/createOrganizationContext";
import AccordionItem from "@/src/components/accordionItem";
import LegalSummary from "@/src/components/dashboard/organization/creationSlides/renderLegalSummary"; 
import GenralSummary from "@/src/components/dashboard/organization/creationSlides/renderGeneralSummary"; 
import MarkdownRenderer from "@/src/components/markdownRenderer";

interface ConfirmationSlideProps {
  onValidateStep: (isValid: boolean) => void;
}

const ConfirmationSlide: React.FC<ConfirmationSlideProps> = ({ onValidateStep }) => {
  const { formData } = useOrganizationContext();

  useEffect(() => {
    onValidateStep(true);
  }, [onValidateStep]);

  const constructAddress = () => {
    const { address, addressComplement, postalCode, city, country } = formData;
    return [address, addressComplement, postalCode, city, country].filter(Boolean).join(", ");
  };

  // Génère l'URL de Google Maps en fonction de l'adresse
  const mapSrc = `https://maps.google.com/maps?q=${encodeURIComponent(constructAddress())}&t=&z=13&ie=UTF8&iwloc=&output=embed`;

  return (
    <div className="flex flex-col h-full">
      <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">
        Récapitulatif de l'Organisation
      </h2>

      {/* Accordéon des Informations */}
      <div className="flex-1 overflow-y-auto w-full space-y-6 px-4 max-h-[450px]">
        {/* Informations Générales */}
        <AccordionItem title="Informations Générales">
          <GenralSummary
            brand={formData.brand}
            sigle={formData.sigle}
            isLegallyExisting={formData.isLegallyExisting}
            sector={formData.sectorID}
            size={formData.oSize}
          />
        </AccordionItem>

        {/* Localisation */}
        <AccordionItem title="Localisation">
          <div className="space-y-4">
            <p>
              <strong>Adresse :</strong> {constructAddress() || "Non défini"}
            </p>
            <div className="w-full h-64 mt-4">
              <iframe
                title="Google Maps"
                src={mapSrc}
                width="100%"
                height="100%"
                allowFullScreen
                loading="lazy"
                className="rounded-lg shadow-md border"
              ></iframe>
            </div>
          </div>
        </AccordionItem>

        {/* Informations Légales */}
        {formData.isLegallyExisting && (
          <AccordionItem title="Informations Légales">
            <LegalSummary
              legalName={formData.legalName}
              capital={formData.capital}
              siret={formData.legalUniqIdentifier}
              vatNumber={formData.vatNumber}
              communityVATNumber={formData.communityVATNumber}
              insuranceRef={formData.insuranceRef}
              insuranceName={formData.insuranceName}
            />
          </AccordionItem>
        )}

        {/* Description */}
        <AccordionItem title="Description">
          <div className="space-y-2 scrollbar-thin">
            <MarkdownRenderer content={formData.description || "Non défini"} />
          </div>
        </AccordionItem>
      </div>
    </div>
  );
};

export default ConfirmationSlide;
