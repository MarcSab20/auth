import React from "react";

interface LegalSummaryProps {
  legalName?: string;
  capital?: number;
  siret?: string;
  vatNumber?: string;
  communityVATNumber?: string;
  insuranceRef?: string;
  insuranceName?: string;
}

const LegalSummary: React.FC<LegalSummaryProps> = ({
  legalName,
  capital,
  siret,
  vatNumber,
  communityVATNumber,
  insuranceRef,
  insuranceName,
}) => {
  const isKnown = (value: string | number | null | undefined) =>
    value !== undefined && value !== null && value !== "";

  return (
    <div className="w-full  rounded-lg shadow-lg">
      {/* Conteneur défilable */}
      <div className="overflow-y-auto ">
        <table className="min-w-full bg-white">
          <thead className="bg-gray-100">
            <tr>
              <th className="sticky top-0 z-10 px-6 py-3 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider bg-gray-100 border-b-2 border-gray-300">
                Champ
              </th>
              <th className="sticky top-0 z-10 px-6 py-3 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider bg-gray-100 border-b-2 border-gray-300">
                Détails
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            <tr className="hover:bg-gray-100">
              <td className="px-6 py-4 text-sm font-medium text-gray-800">Nom de l'entreprise</td>
              <td className="px-6 py-4 text-sm text-gray-500">
                {isKnown(legalName) ? (
                  <span>{legalName}</span>
                ) : (
                  <span className="inline-block  text-gray-500 text-xs px-2 py-1 rounded-full">
                    Non défini
                  </span>
                )}
              </td>
            </tr>
            <tr className="hover:bg-gray-100">
              <td className="px-6 py-4 text-sm font-medium text-gray-800">Capital</td>
              <td className="px-6 py-4 text-sm text-gray-500">
                {isKnown(capital) ? (
                  <span>{(capital ?? 0).toLocaleString()} €</span>
                ) : (
                  <span className="inline-block  text-gray-500 text-xs px-2 py-1 rounded-full">
                    Non défini
                  </span>
                )}
              </td>
            </tr>
            <tr className="hover:bg-gray-100">
              <td className="px-6 py-4 text-sm font-medium text-gray-800">SIRET</td>
              <td className="px-6 py-4 text-sm text-gray-500">
                {isKnown(siret) ? (
                  <span>{siret}</span>
                ) : (
                  <span className="inline-block  text-gray-500 text-xs px-2 py-1 rounded-full">
                    Non défini
                  </span>
                )}
              </td>
            </tr>
            <tr className="hover:bg-gray-100">
              <td className="px-6 py-4 text-sm font-medium text-gray-800">Numéro de TVA</td>
              <td className="px-6 py-4 text-sm text-gray-500">
                {isKnown(vatNumber) ? (
                  <span>{vatNumber}</span>
                ) : (
                  <span className="inline-block  text-gray-500 text-xs px-2 py-1 rounded-full">
                    Non défini
                  </span>
                )}
              </td>
            </tr>
            <tr className="hover:bg-gray-100">
              <td className="px-6 py-4 text-sm font-medium text-gray-800">
                Numéro de TVA Intracommunautaire
              </td>
              <td className="px-6 py-4 text-sm text-gray-500">
                {isKnown(communityVATNumber) ? (
                  <span>{communityVATNumber}</span>
                ) : (
                  <span className="inline-block  text-gray-500 text-xs px-2 py-1 rounded-full">
                    Non défini
                  </span>
                )}
              </td>
            </tr>
            <tr className="hover:bg-gray-100">
              <td className="px-6 py-4 text-sm font-medium text-gray-800">Référence d'Assurance</td>
              <td className="px-6 py-4 text-sm text-gray-500">
                {isKnown(insuranceRef) ? (
                  <span>{insuranceRef}</span>
                ) : (
                  <span className="inline-block  text-gray-500 text-xs px-2 py-1 rounded-full">
                    Non définie
                  </span>
                )}
              </td>
            </tr>
            <tr className="hover:bg-gray-100">
              <td className="px-6 py-4 text-sm font-medium text-gray-800">Nom Legal</td>
              <td className="px-6 py-4 text-sm text-gray-500">
                {isKnown(legalName) ? (
                  <span>{legalName}</span>
                ) : (
                  <span className="inline-block  text-gray-500 text-xs px-2 py-1 rounded-full">
                    Non définie
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

export default LegalSummary;

