'use client';

import { Avatar } from '@/src/components/catalyst/components/avatar';
import { Badge } from '@/src/components/catalyst/components/badge';
import { DescriptionDetails, DescriptionList, DescriptionTerm } from '@/src/components/catalyst/components/description-list';
import { Divider } from '@/src/components/catalyst/components/divider';
import { Heading, Subheading } from '@/src/components/catalyst/components/heading';
import { BanknotesIcon, CalendarIcon, CreditCardIcon, DocumentTextIcon, UserIcon, BuildingOfficeIcon } from '@heroicons/react/16/solid';
import { useEffect, useState } from 'react';
import { smpClient } from '@/smpClient';

interface OrderDetailsProps {
  order: {
    orderId: string;
    userId: string;
    sellerOrganizationId: string;
    buyerOrganizationId: string;
    transactionId: string;
    destinationWalletId: string;
    sourceWalletId: string;
    currency: string;
    quoteId: string;
    serviceId: string;
    status: string;
    totalPrice: number;
    createdAt: string;
    updatedAt: string;
    deletedAt: string;
    unloggedUser: any;
    lines: {
      assetId: string;
      quantity: number;
      unitPrice: number;
      details: any;
      title: string;
      description: string;
      legalVatPercent: number;
    }[];
  };
}

export default function OrderDetails({ order }: OrderDetailsProps) {
  const [service, setService] = useState<any>(null);
  const [assets, setAssets] = useState<any[]>([]);

  useEffect(() => {
    console.log('Order reçu:', order);
    console.log('ServiceId:', order?.serviceId);
    console.log('Lines:', order?.lines);

    const fetchData = async () => {
      try {
        if (!order?.serviceId) {
          console.log('Pas de serviceId trouvé dans order');
          return;
        }
        
        // Récupérer les détails du service
        console.log('Fetching service data for ID:', order.serviceId);
        const serviceResponse = await fetch(`/api/services/${order.serviceId}`);
        const serviceData = await serviceResponse.json();
        console.log('Service data received:', serviceData);
        setService(serviceData);

        // Récupérer les détails des assets
        if (order.lines && order.lines.length > 0) {
          console.log('Fetching assets for lines:', order.lines);
          const assetsData = await Promise.all(
            order.lines.map(async line => {
              console.log('Fetching asset for ID:', line.assetId);
              const response = await fetch(`/api/assets/${line.assetId}`);
              const data = await response.json();
              console.log('Asset data received:', data);
              return data;
            })
          );
          setAssets(assetsData);
        }
      } catch (error) {
        console.error('Erreur détaillée lors de la récupération des données:', error);
      }
    };

    fetchData();
  }, [order]);

  const getStatusColor = (status: string | undefined) => {
    if (!status) return 'zinc';
    switch (status.toLowerCase()) {
      case 'completed':
        return 'green';
      case 'pending':
        return 'amber';
      case 'failed':
        return 'red';
      default:
        return 'zinc';
    }
  };

  const getStatusText = (status: string | undefined) => {
    if (!status) return 'Inconnu';
    switch (status.toLowerCase()) {
      case 'completed':
        return 'Terminée';
      case 'pending':
        return 'En attente';
      case 'failed':
        return 'Échouée';
      default:
        return status;
    }
  };

  if (!order) {
    return <div>Chargement des données...</div>;
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="flex items-center gap-4">
        <Heading>Commande #{order.orderId || 'N/A'}</Heading>
        <Badge color={getStatusColor(order.status)}>{getStatusText(order.status)}</Badge>
      </div>
      
      <div className="mt-4 flex flex-wrap gap-x-10 gap-y-4 py-1.5">
        <span className="flex items-center gap-3 text-base/6 text-zinc-950 sm:text-sm/6 dark:text-white">
          <BanknotesIcon className="size-4 shrink-0 fill-zinc-400 dark:fill-zinc-500" />
          <span>{order.totalPrice ? order.totalPrice.toLocaleString('fr-FR') : '0'} {order.currency || 'EUR'}</span>
        </span>
        <span className="flex items-center gap-3 text-base/6 text-zinc-950 sm:text-sm/6 dark:text-white">
          <CalendarIcon className="size-4 shrink-0 fill-zinc-400 dark:fill-zinc-500" />
          <span>{order.createdAt ? new Date(order.createdAt).toLocaleDateString('fr-FR') : 'N/A'}</span>
        </span>
      </div>

      <div className="mt-8">
        <Subheading>Résumé</Subheading>
        <Divider className="mt-4" />
        <div className="grid grid-cols-[200px_1fr] gap-4 py-4">
          <div className="font-medium text-gray-900">ID Transaction</div>
          <div>{order.transactionId || 'N/A'}</div>

          {service && (
            <>
              <div className="font-medium text-gray-900">Service</div>
              <div>
                <a href={`/services/${order.serviceId}`} className="flex items-center gap-2">
                  <span>{service.title || 'N/A'}</span>
                </a>
              </div>
            </>
          )}

          <div className="font-medium text-gray-900">Montant total</div>
          <div>{order.totalPrice ? order.totalPrice.toLocaleString('fr-FR') : '0'} {order.currency || 'EUR'}</div>
        </div>
      </div>

      {order.lines && order.lines.length > 0 && (
        <div className="mt-8">
          <Subheading>Lignes de commande</Subheading>
          <Divider className="mt-4" />
          <div className="space-y-6">
            {order.lines.map((line, index) => {
              const asset = assets[index];
              return (
                <div key={line.assetId} className="grid grid-cols-[200px_1fr] gap-4 py-4">
                  <div className="font-medium text-gray-900">Titre</div>
                  <div>{line.title || 'N/A'}</div>

                  <div className="font-medium text-gray-900">Description</div>
                  <div>{line.description || 'N/A'}</div>

                  <div className="font-medium text-gray-900">Quantité</div>
                  <div>{line.quantity || 0}</div>

                  <div className="font-medium text-gray-900">Prix unitaire</div>
                  <div>{(line.unitPrice || 0).toLocaleString('fr-FR')} {order.currency || 'EUR'}</div>

                  <div className="font-medium text-gray-900">TVA</div>
                  <div>{(line.legalVatPercent || 0)}%</div>

                  {asset && (
                    <>
                      <div className="font-medium text-gray-900">Type d'asset</div>
                      <div>{asset.type || 'N/A'}</div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
} 