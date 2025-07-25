import React from "react";

interface SMPServiceLargeZoneProps {
  country?: string;
  city?: string;
}

const SMPServiceLargeZone: React.FC<SMPServiceLargeZoneProps> = ({ country, city }) => {
  if (!country && !city) return null;
  const displayCountry = country || "";
  const displayCity = city || "";
  const title = [displayCity, displayCountry].filter(Boolean).join(", ");

  const query = encodeURIComponent([city, country].filter(Boolean).join(", "));
  const mapUrl = `https://www.google.com/maps?q=${query}&output=embed`;

  return (
    <div className="service-large-zone w-full h-96 mb-6 rounded-lg overflow-hidden shadow-md flex flex-col">
      {/* Titre de localisation si dispo */}
      {title && (
        <div className="p-4 bg-white rounded-t-lg text-center">
          <h2 className="text-xl font-semibold">{title}</h2>
        </div>
      )}
      {/* Carte Google Maps */}
      <div className="flex-1 w-full h-full">
        <iframe
          title="Service Location"
          src={mapUrl}
          width="100%"
          height="100%"
          allowFullScreen={true}
          loading="lazy"
          className="border-0"
        />
      </div>
    </div>
  );
};

export default SMPServiceLargeZone;
