'use client';
import React from 'react';
import Link from 'next/link';
import { ArrowRightIcon, CheckCircleIcon, XCircleIcon, ClockIcon } from '@heroicons/react/24/outline';

interface Service {
  serviceID: string;
  title: string;
  price: number;
  items: Array<{
    quantity: number;
    unitPrice: number;
  }>;
}

interface EstimateSummaryProps {
  estimate: {
    estimateId: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    details: {
      services: Service[];
      to: {
        name: string;
      };
      validUntil: string;
      total: number;
    };
    organizationId: string;
    negotiationCount: number;
  };
}

export default function EstimateSummary({ estimate }: EstimateSummaryProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'text-green-600 bg-green-50';
      case 'REJECTED':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-yellow-600 bg-yellow-50';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return <CheckCircleIcon className="h-5 w-5 text-green-600" />;
      case 'REJECTED':
        return <XCircleIcon className="h-5 w-5 text-red-600" />;
      default:
        return <ClockIcon className="h-5 w-5 text-yellow-600" />;
    }
  };

  // Calcul du total des services de base (sans les options)
  const baseServicesTotal = estimate.details.services.reduce((sum: number, service: Service) => sum + service.price, 0);
  
  // Calcul du total des options
  const optionsTotal = estimate.details.services.reduce((sum: number, service: Service) => 
    sum + service.items.reduce((itemSum: number, item) => itemSum + (item.quantity * item.unitPrice), 0), 0);

  return (
    <div className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold">Devis #{estimate.estimateId}</h3>
          <p className="text-sm text-gray-600">{estimate.details.to.name}</p>
        </div>
        <div className={`px-3 py-1 rounded-full flex items-center gap-2 ${getStatusColor(estimate.status)}`}>
          {getStatusIcon(estimate.status)}
          <span className="text-sm font-medium">{estimate.status}</span>
        </div>
      </div>

      <div className="space-y-3 mb-6">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Services de base</span>
          <span className="font-medium">{baseServicesTotal.toLocaleString('fr-FR')} €</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Options</span>
          <span className="font-medium">{optionsTotal.toLocaleString('fr-FR')} €</span>
        </div>
        <div className="flex justify-between text-sm pt-2 border-t">
          <span className="font-medium">Total</span>
          <span className="font-bold">{estimate.details.total.toLocaleString('fr-FR')} €</span>
        </div>
      </div>

      <div className="space-y-2 mb-6">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span>Valide jusqu'au :</span>
          <span className="font-medium">
            {new Date(estimate.details.validUntil).toLocaleDateString()}
          </span>
        </div>
        {estimate.negotiationCount > 0 && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span>Négociations :</span>
            <span className="font-medium">{estimate.negotiationCount}</span>
          </div>
        )}
      </div>

      <Link 
        href={`/account/o/${estimate.organizationId}/estimates/${estimate.estimateId}`}
        className="flex items-center justify-center w-full gap-2 bg-[#2980FF] text-white py-2 px-4 rounded-lg hover:bg-[#2470E0] transition-colors"
      >
        <span>Voir les détails</span>
        <ArrowRightIcon className="h-4 w-4" />
      </Link>
    </div>
  );
}