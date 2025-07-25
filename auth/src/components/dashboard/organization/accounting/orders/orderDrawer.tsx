'use client';

import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { CalendarIcon, TagIcon, BanknotesIcon, ClockIcon } from '@heroicons/react/20/solid';
import { useState, useEffect } from 'react';
import CopyableId from '@/src/components/common/CopyableId';
import { Heading } from '@/src/components/catalyst/components/heading';
import { Divider } from '@/src/components/catalyst/components/divider';

interface Service {
  id: string;
  title: string;
  description: string;
  // Add other service fields as needed
}

interface Organization {
  id: string;
  name: string;
  // Add other organization fields as needed
}

interface Order {
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
}

interface OrderDrawerProps {
  order: Order;
  isOpen: boolean;
  onClose: () => void;
  view: 'customers' | 'suppliers';
}

export default function OrderDrawer({ order, isOpen, onClose, view }: OrderDrawerProps) {
  const [service, setService] = useState<Service | null>(null);
  const [organization, setOrganization] = useState<Organization | null>(null);

  useEffect(() => {
    // Fetch service details
    const fetchService = async () => {
      try {
        const response = await fetch(`/api/services/${order.serviceId}`);
        if (response.ok) {
          const data = await response.json();
          setService(data);
        }
      } catch (error) {
        console.error('Error fetching service:', error);
      }
    };

    // Fetch organization details based on view type
    const fetchOrganization = async () => {
      const orgId = view === 'customers' ? order.buyerOrganizationId : order.sellerOrganizationId;
      try {
        const response = await fetch(`/api/organizations/${orgId}`);
        if (response.ok) {
          const data = await response.json();
          setOrganization(data);
        }
      } catch (error) {
        console.error('Error fetching organization:', error);
      }
    };

    if (order.serviceId) {
      fetchService();
    }
    fetchOrganization();
  }, [order, view]);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-green-50 text-green-700 ring-green-600/20';
      case 'pending':
        return 'bg-yellow-50 text-yellow-700 ring-yellow-600/20';
      case 'cancelled':
        return 'bg-red-50 text-red-700 ring-red-600/20';
      default:
        return 'bg-gray-50 text-gray-700 ring-gray-600/20';
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-10">
      <div className="fixed inset-0" />

      <div className="fixed inset-0 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10 sm:pl-16">
            <DialogPanel
              transition
              className="pointer-events-auto w-screen max-w-2xl transform transition-all duration-[400ms] ease-in-out translate-x-full data-[open]:translate-x-0"
            >
              <div className="flex h-full flex-col overflow-y-scroll bg-white py-6 shadow-xl">
                <div className="px-4 sm:px-6">
                  {/* En-tête principal */}
                  <div className="flex items-start justify-between border-b border-gray-200 pb-4">
                    <div className="space-y-1">
                    <Heading>Details de votre Commande</Heading>

                      <CopyableId id={order.orderId} type="order" className="mt-1" />
                      {service && (
                        <p className="text-sm font-medium text-gray-500">{service.title}</p>
                      )}
                      {organization && (
                        <p className="text-sm text-gray-500">{organization.name}</p>
                      )}
                    </div>
                    <div className="ml-3 flex h-7 items-center">
                      <button
                        type="button"
                        onClick={onClose}
                        className="relative rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                      >
                        <span className="absolute -inset-2.5" />
                        <span className="sr-only">Fermer</span>
                        <XMarkIcon aria-hidden="true" className="size-6" />
                      </button>
                    </div>
                  </div>
                  {/* Informations détaillées avec icônes */}
                  <div className="mt-4 grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <TagIcon className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Statut</p>
                        <p className={`mt-1 inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${getStatusColor(order.status)}`}>
                          {order.status}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Date de création</p>
                        <p className="text-sm font-medium text-gray-900">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <BanknotesIcon className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Montant</p>
                        <p className="text-sm font-medium text-gray-900">
                          {order.totalPrice} {order.currency}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <ClockIcon className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Dernière mise à jour</p>
                        <p className="text-sm font-medium text-gray-900">
                          {new Date(order.updatedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                  <Divider className="my-4" />
                  {/* Détails des lignes de commande */}
                  <div className="mt-8">
                    <h4 className="text-sm font-medium text-gray-900">Articles</h4>
                    <div className="mt-4 divide-y divide-gray-200">
                      {order.lines.map((line, index) => (
                        <div key={index} className="py-4">
                          <div className="flex justify-between">
                            <div>
                              <p className="text-sm font-medium text-gray-900">{line.title}</p>
                              <p className="mt-1 text-sm text-gray-500">{line.description}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-medium text-gray-900">
                                {line.quantity} x {line.unitPrice} {order.currency}
                              </p>
                              <p className="mt-1 text-sm text-gray-500">
                                TVA {line.legalVatPercent}%
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </DialogPanel>
          </div>
        </div>
      </div>
    </Dialog>
  );
} 