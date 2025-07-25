// src/components/dashboard/service/creationSlides/renderGeneralSummary.tsx
import React from "react";

interface ServiceGeneralSummaryProps {
  title?: string;
  description?: string;
  price?: number;
  lowerPrice?: number;
  upperPrice?: number;
  legalVatPercent?: number;
  negotiable?: boolean;
  advancedAttributes?: {
    synthese?: string;
    serviceTags?: any[];
  };
}

const ServiceGeneralSummary: React.FC<ServiceGeneralSummaryProps> = ({
  title,
  description,
  price,
  lowerPrice,
  upperPrice,
  legalVatPercent,
  negotiable,
  advancedAttributes,
}) => {
  const isKnown = (value: any) => value !== undefined && value !== null && value !== "";
  const synthese = advancedAttributes?.synthese;

  return (
    <div className="w-full ">
      <div className="overflow-y-auto ">
        <table className="min-w-full bg-white rounded-lg shadow-md">
          <thead className="bg-gray-100">
            <tr>
              <th className="sticky top-0 px-6 py-3 border-b-2 border-gray-300 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                Champ
              </th>
              <th className="sticky top-0 px-6 py-3 border-b-2 border-gray-300 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                Détails
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {/* Titre */}
            <tr className="hover:bg-gray-100">
              <td className="px-6 py-4 text-sm font-medium text-gray-800">Titre</td>
              <td className="px-6 py-4 text-sm text-gray-500">
                {isKnown(title) ? title : <span className="badge-undefined">Non défini</span>}
              </td>
            </tr>

            {/* Synthèse */}
            {synthese && (
              <tr className="hover:bg-gray-100">
                <td className="px-6 py-4 text-sm font-medium text-gray-800">Synthèse</td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  <div className="max-w-md">
                    {synthese.length > 100 ? `${synthese.substring(0, 100)}...` : synthese}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    {synthese.length}/200 caractères
                  </div>
                </td>
              </tr>
            )}

            {/* Prix */}
            <tr className="hover:bg-gray-100">
              <td className="px-6 py-4 text-sm font-medium text-gray-800">Prix</td>
              <td className="px-6 py-4 text-sm text-gray-500">
                {price ? `${price} €` : `${lowerPrice} - ${upperPrice} €`}
              </td>
            </tr>

            {/* TVA */}
            <tr className="hover:bg-gray-100">
              <td className="px-6 py-4 text-sm font-medium text-gray-800">TVA</td>
              <td className="px-6 py-4 text-sm text-gray-500">
                {legalVatPercent}%
              </td>
            </tr>

            {/* Négociable */}
            <tr className="hover:bg-gray-100">
              <td className="px-6 py-4 text-sm font-medium text-gray-800">Négociable</td>
              <td className="px-6 py-4 text-sm text-gray-500">
                <span className={`badge-${negotiable ? 'success' : 'error'}`}>
                  {negotiable ? 'Oui' : 'Non'}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ServiceGeneralSummary;