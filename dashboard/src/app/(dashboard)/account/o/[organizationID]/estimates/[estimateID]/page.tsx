import React from 'react';
import { smpClient } from '@/smpClient';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import EstimateDetails from "@/src/components/negociation/estimateDetails";
import NegotiationFeed from "@/src/components/negociation/feed";
import EstimateActions from "@/src/components/negociation/estimateActions";


interface EstimateItem {
  id: string;
  title: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: string;
}

interface Service {
  serviceID: string;
  title: string;
  description: string;
  price: number;
  items: EstimateItem[];
}

interface EstimateDetails {
  services: Service[];
  to: {
    id: string;
    name: string;
    email: string;
    phone: string;
    address: string;
  };
  from: {
    id: string;
    name: string;
    email: string;
    phone: string;
    address: string;
  };
  tax: number;
  subTotal: number;
  total: number;
  clientName: string;
  validUntil: string;
}

interface Estimate {
  estimateId: string;
  serviceId: string;
  details: EstimateDetails;
  status: string;
  negotiationCount: number;
  createdAt: string;
  proposalPrice?: number;
}

async function getEstimate(estimateID: string, organizationID: string): Promise<Estimate | null> {
  try {
    const estimate = await smpClient.estimate.getById(estimateID);
    if (!estimate) {
      return null;
    }
    return estimate;
  } catch (error) {
    console.error('Error fetching estimate:', error);
    return null;
  }
}

export default async function EstimateDetailPage({ params }: { params: { estimateID: string; organizationID: string } }) {
  const estimate = await getEstimate(params.estimateID, params.organizationID);
  
  if (!estimate) {
    notFound();
  }

  const services = estimate.details.services || [{
    serviceID: estimate.serviceId,
    title: 'Service',
    description: '',
    price: estimate.proposalPrice || 0,
    items: []
  }];

  return (
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="mb-6">
          <Link
            href={`/account/o/${params.organizationID}/estimates`}
            className="inline-flex items-center text-sm font-medium text-gray-600 hover:text-gray-900"
          >
            <ArrowLeftIcon className="mr-2 h-5 w-5" />
            Retour aux devis
          </Link>
        </div>

        <EstimateActions
        estimateData={{
          estimateNumber: estimate.estimateId,
          items: estimate.details.services.flatMap((service: Service) =>
            service.items.map((item: EstimateItem) => ({
              id: item.id,
              title: item.title,
              description: item.description,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              total: item.total
            }))
          ),
          from: estimate.details.from,
          to: estimate.details.to,
          issueDate: estimate.createdAt,
          validUntil: estimate.details.validUntil,
          tax: estimate.details.tax,
          subTotal: estimate.details.subTotal,
          total: estimate.details.total
        }}
        status={estimate.status === 'PENDING' || estimate.status === 'APPROVED' || estimate.status === 'REJECTED' ? estimate.status : 'PENDING'}
            // onSendEmail={handleSendEmail}
            // onDelete={handleDelete}
            // onClose={handleClose}
            // onNegotiate={handleNegotiate}
      />

        <div className="relative mx-auto bg-white shadow-lg" style={{ width: '210mm', margin: '0 auto' }}>
          <div className="estimate-pages" style={{ 
            transform: 'scale(0.9)',
            transformOrigin: 'top center',
            height: '297mm',
            overflow: 'auto'
          }}>
            <EstimateDetails
              estimate={{
                estimateId: estimate.estimateId,
                details: {
                  services: estimate.details.services,
                  to: estimate.details.to,
                  from: estimate.details.from,
                  estimateId: estimate.estimateId,
                  issueDate: estimate.createdAt,
                  validUntil: estimate.details.validUntil,
                  tax: estimate.details.tax,
                  subTotal: estimate.details.subTotal,
                  total: estimate.details.total
                }
              }}
            />
          </div>
        </div>
      </div>
  );
}
