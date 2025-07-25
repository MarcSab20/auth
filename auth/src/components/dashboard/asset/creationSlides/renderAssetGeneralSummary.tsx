import React from "react";

interface AssetGeneralSummaryProps {
  title?: string;
  price?: number;
  legalVatPercent?: number;
  hasStockLimit?: boolean;
  stockQuantity?: number;
  maxPerReservation?: number;
}

const AssetGeneralSummary: React.FC<AssetGeneralSummaryProps> = ({
  title,
  price,
  legalVatPercent,
  hasStockLimit,
  stockQuantity,
  maxPerReservation,
}) => {
  const isKnown = (value: any) => value !== undefined && value !== null && value !== "";

  return (
    <div className="w-full">
      <div className="overflow-y-auto">
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
                {isKnown(title) ? title : <span className="text-red-500">Non défini</span>}
              </td>
            </tr>
            {/* Prix */}
            <tr className="hover:bg-gray-100">
              <td className="px-6 py-4 text-sm font-medium text-gray-800">Prix</td>
              <td className="px-6 py-4 text-sm text-gray-500">
                {price !== undefined && price !== null ? `${price} €` : <span className="text-red-500">Non défini</span>}
              </td>
            </tr>
            {/* TVA */}
            <tr className="hover:bg-gray-100">
              <td className="px-6 py-4 text-sm font-medium text-gray-800">TVA</td>
              <td className="px-6 py-4 text-sm text-gray-500">
                {legalVatPercent !== undefined && legalVatPercent !== null
                  ? `${legalVatPercent}%`
                  : <span className="text-red-500">Non défini</span>}
              </td>
            </tr>
            {/* Max par réservation */}
            <tr className="hover:bg-gray-100">
              <td className="px-6 py-4 text-sm font-medium text-gray-800">Max par réservation</td>
              <td className="px-6 py-4 text-sm text-gray-500">
                {maxPerReservation !== undefined && maxPerReservation !== null
                  ? maxPerReservation
                  : <span className="text-red-500">Non défini</span>}
              </td>
            </tr>
            {/* Stock limité */}
            <tr className="hover:bg-gray-100">
              <td className="px-6 py-4 text-sm font-medium text-gray-800">Stock limité</td>
              <td className="px-6 py-4 text-sm text-gray-500">
                {hasStockLimit ? 'Oui' : 'Non'}
              </td>
            </tr>
            {/* Quantité en stock si limité */}
            {hasStockLimit && (
              <tr className="hover:bg-gray-100">
                <td className="px-6 py-4 text-sm font-medium text-gray-800">Quantité en stock</td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {stockQuantity !== undefined && stockQuantity !== null
                    ? stockQuantity
                    : <span className="text-red-500">Non défini</span>}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AssetGeneralSummary;
