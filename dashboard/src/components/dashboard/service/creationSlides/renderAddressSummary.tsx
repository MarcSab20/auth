// src/components/dashboard/service/creationSlides/ServiceAddressSummary.tsx
import React from "react";

interface ServiceAddressSummaryProps {
  addressLine1?: string;
  addressComplement?: string;
  postalCode?: string;
  city?: string;
  country: string;
}

const ServiceAddressSummary: React.FC<ServiceAddressSummaryProps> = ({
  addressLine1,
  addressComplement,
  postalCode,
  city,
  country,
}) => {
  // Construit l'adresse complète en prenant en compte les champs renseignés
  const fullAddress = [addressLine1, addressComplement, postalCode, city, country]
    .filter(Boolean)
    .join(", ");

  // Utilise une URL Google Maps avec la chaîne d'adresse encodée
  const mapSrc = `https://maps.google.com/maps?q=${encodeURIComponent(fullAddress)}&t=&z=13&ie=UTF8&iwloc=&output=embed`;

  return (
    <div className="space-y-4">
      <p>
        <strong>Adresse :</strong> {fullAddress || "Non défini"}
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
  );
};

export default ServiceAddressSummary;
