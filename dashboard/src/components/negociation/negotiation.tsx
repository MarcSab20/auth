'use client';

import { default as EstimateDetailsComponent } from './estimateDetails';
import EstimateSummary from './estimateSummary';
import NegotiationFeed from './feed'; 

interface NegotiationPageProps {
  estimate: {
    uniqRef: string;
    clientName: string;
    subTotal: number;
    tax: number;
    total: number;
    items: any[];
    negotiable: boolean;
    stage: string;
    dueDate: string;
    from: any;
    to: any;
  };
}

export default function NegotiationPage({ estimate }: NegotiationPageProps) {
  const {
    uniqRef,
    clientName,
    subTotal,
    tax,
    total,
    items,
    negotiable,
    stage,
    dueDate,
    from,
    to,
  } = estimate;

  return (
    <div className="p-6 bg-white shadow rounded-md space-y-8">
      {/* Titre principal */}
      <h1 className="text-2xl font-bold text-gray-900">
        Détails du devis #{uniqRef}
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Colonne gauche : détails du devis */}
        <div className="lg:col-span-2 space-y-6">
          <EstimateDetailsComponent
            estimate={{
              details: {
                subTotal,
                tax,
                total,
                items,
                from,
                to,
                estimateNumber: uniqRef,
                issueDate: "2023-01-01",
                validUntil: dueDate
              }
            }}
          />
        </div>

       
          {negotiable && <NegotiationFeed />}
        </div>
      </div>
  );
}
