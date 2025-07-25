"use client";

import React from "react";

interface GeneralSummaryProps {
  brand?: string;
  sigle?: string;
  isLegallyExisting: boolean;
  sector?: number | string;
  size?: string;
  description?: string;
  legalName?: string;
  siret?: string;
}

const GeneralSummary: React.FC<GeneralSummaryProps> = ({
  brand,
  sigle,
  isLegallyExisting,
  sector,
  size,
  description,
  legalName,
  siret,
}) => {
  // Fonction utilitaire pour vérifier si une valeur est connue
  const isKnown = (value: string | number | null | undefined) =>
    value !== undefined && value !== null && value !== "";

  return (
    <div className="w-full ">
      {/* Conteneur scrollable */}
      <div className="overflow-y-auto ">
        <table className="min-w-full bg-white rounded-lg shadow-md">
          <thead className="bg-gray-100">
            <tr>
              <th className="sticky top-0 px-6 py-3 border-b-2 border-gray-300 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider bg-gray-100">
                Champ
              </th>
              <th className="sticky top-0 px-6 py-3 border-b-2 border-gray-300 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider bg-gray-100">
                Détails
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {/* Marque */}
            <tr className="hover:bg-gray-100">
              <td className="px-6 py-4 text-sm font-medium text-gray-800">Marque</td>
              <td className="px-6 py-4 text-sm text-gray-500">
                {isKnown(brand) ? (
                  <span>{brand}</span>
                ) : (
                  <span className="inline-block  text-xs px-2 py-1">Non défini</span>
                )}
              </td>
            </tr>

            {/* Sigle */}
            <tr className="hover:bg-gray-100">
              <td className="px-6 py-4 text-sm font-medium text-gray-800">Sigle</td>
              <td className="px-6 py-4 text-sm text-gray-500">
                {isKnown(sigle) ? (
                  <span>{sigle}</span>
                ) : (
                  <span className="inline-block text-xs px-2 py-1">Non défini</span>
                )}
              </td>
            </tr>

            {/* Existe légalement */}
            <tr className="hover:bg-gray-100">
              <td className="px-6 py-4 text-sm font-medium text-gray-800">Existe légalement</td>
              <td className="px-6 py-4 text-sm text-gray-500">
                <span
                  className={`inline-block px-2 py-1 rounded-full text-xs ${
                    isLegallyExisting
                      ? "bg-green-200 "
                      : "bg-red-200 "
                  }`}
                >
                  {isLegallyExisting ? "Oui" : "Non"}
                </span>
              </td>
            </tr>

            {/* Secteur */}
            <tr className="hover:bg-gray-100">
              <td className="px-6 py-4 text-sm font-medium text-gray-800">Secteur</td>
              <td className="px-6 py-4 text-sm text-gray-500">
                {isKnown(sector) ? (
                  <span>{sector}</span>
                ) : (
                  <span className="inline-block  text-pink-800 text-xs px-2 py-1 rounded-full">
                    Non défini
                  </span>
                )}
              </td>
            </tr>

          </tbody>
        </table>
      </div>
    </div>
  );
};

export default GeneralSummary;
