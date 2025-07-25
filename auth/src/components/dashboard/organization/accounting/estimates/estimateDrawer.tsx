'use client';

import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react';
import { XMarkIcon, ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline';
import { CalendarIcon, TagIcon, BanknotesIcon, ClockIcon } from '@heroicons/react/20/solid';
import { useState, useEffect } from 'react';
import EstimateDetails from '@/src/components/negociation/estimateDetails';
import EstimateSummary from '@/src/components/negociation/estimateSummary';
import NegotiationFeed from '@/src/components/negociation/feed';
import CopyableId from '@/src/components/common/CopyableId';
import { Heading } from '@/src/components/catalyst/components/heading';
import { Divider } from '@/src/components/catalyst/components/divider';
import { useRouter } from 'next/navigation';

interface Service {
  serviceID: string;
  title: string;
  description: string;
  price: number;
  items: {
    id: string;
    title: string;
    description: string;
    quantity: number;
    unitPrice: number;
  }[];
}

interface Organization {
  id: string;
  name: string;
  // Add other organization fields as needed
}

interface EstimateDrawerProps {
  estimate: {
    estimateId: string;
    serviceId: string;
    proposalPrice?: number;
    details: {
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
        address: string;
        email: string;
        phone: string;
      };
      tax: number;
      subTotal: number;
      total: number;
      validUntil: string;
      clientName: string;
    };
    status: string;
    negotiationCount: number;
    clientSignDate?: string;
    buyerOrganizationID?: string;
    sellerOrganizationID?: string;
    providerSignDate?: string;
    buyerUserID?: string;
    createdAt: string;
    updatedAt?: string;
  };
  isOpen: boolean;
  onClose: () => void;
  onViewFull: (estimateId: string) => void;
  view: 'customers' | 'suppliers';
}

export default function EstimateDrawer({ estimate, isOpen, onClose, onViewFull, view }: EstimateDrawerProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [service, setService] = useState<Service | null>(null);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const router = useRouter();
  useEffect(() => {
    // Fetch service details
    const fetchService = async () => {
      try {
        const response = await fetch(`/api/services/${estimate.serviceId}`);
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
      if (!estimate.details?.from?.id && !estimate.details?.to?.id) return;
      
      const orgId = view === 'customers' ? estimate.details.to.id : estimate.details.from.id;
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

    if (estimate.serviceId) {
      fetchService();
    }
    fetchOrganization();
  }, [estimate, view]);

  // Transform the estimate data to match the EstimateSummary format
  const estimateData = {
    id: estimate.estimateId,
    uniqRef: estimate.estimateId,
    clientName: estimate.details?.clientName || '',
    subTotal: estimate.details?.subTotal || 0,
    tax: estimate.details?.tax || 0,
    total: estimate.details.total || 0,
    items: estimate.details.services?.flatMap(service => 
      service.items.map(item => ({
        id: item.id,
        title: item.title,
        description: item.description,
        quantity: item.quantity.toString(),
        unitPrice: item.unitPrice.toString(),
        total: (item.quantity * item.unitPrice).toString()
      }))
    ) || [],
    negotiable: estimate.negotiationCount > 0,
    stage: estimate.status,
    dueDate: estimate.details?.validUntil || '',
    from: estimate.details?.from || {
      id: '',
      name: '',
      address: '',
      email: '',
      phone: '',
    },
    to: estimate.details?.to || {
      id: '',
      name: '',
      address: '',
    },
    estimateNumber: estimate.estimateId,
    issueDate: estimate.createdAt,
    validUntil: estimate.details?.validUntil || '',
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'accepted':
        return 'bg-green-50 text-green-700 ring-green-600/20';
      case 'pending':
        return 'bg-yellow-50 text-yellow-700 ring-yellow-600/20';
      case 'rejected':
        return 'bg-red-50 text-red-700 ring-red-600/20';
      case 'negotiating':
        return 'bg-blue-50 text-blue-700 ring-blue-600/20';
      default:
        return 'bg-gray-50 text-gray-700 ring-gray-600/20';
    }
  };

  const getEstimateRoute = () => {
    if (view === 'customers') {
      // Cas où je suis le vendeur
      if (estimate.buyerUserID && estimate.sellerOrganizationID) {
        // Client particulier
        return `/account/o/${estimate.sellerOrganizationID}/accounting/users/${estimate.buyerUserID}/estimate/${estimate.estimateId}`;
      } else if (estimate.buyerOrganizationID && estimate.sellerOrganizationID) {
        // Organisation cliente
        return `/account/o/${estimate.sellerOrganizationID}/accounting/customers/${estimate.buyerOrganizationID}/estimate/${estimate.estimateId}`;
      }
    } else {
      // Cas où je suis l'acheteur (organisation)
      if (estimate.buyerOrganizationID && estimate.sellerOrganizationID) {
        return `/account/o/${estimate.buyerOrganizationID}/accounting/suppliers/${estimate.sellerOrganizationID}/estimate/${estimate.estimateId}`;
      }
    }
    return '#';
  };

  const handleViewFull = () => {
    onViewFull(estimate.estimateId);
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
                    <Heading>Details de votre devis</Heading>

                      <CopyableId id={estimate.estimateId} type="estimate" className="mt-1" />
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
                        <XMarkIcon aria-hidden="true" className="size-6 fill-none" />
                      </button>
                    </div>
                  </div>

                  {/* Informations détaillées avec icônes */}
                  <div className="mt-4 grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <TagIcon className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Statut</p>
                        <p className={`mt-1 inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${getStatusColor(estimate.status)}`}>
                          {estimate.status}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Date de création</p>
                        <p className="text-sm font-medium text-gray-900">
                          {new Date(estimate.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <BanknotesIcon className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Montant</p>
                        <p className="text-sm font-medium text-gray-900">
                          {estimate.details.total} €
                        </p>
                      </div>
                    </div>
                    <div className="flex mb-4 items-center gap-2">
                      <ClockIcon className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Valide jusqu'au</p>
                        <p className="text-sm font-medium text-gray-900">
                          {estimate.details.validUntil}
                        </p>
                      </div>
                    </div>
                  </div>
                  <Divider className="my-4" />
                  {/* Contenu principal avec aperçu et overlay */}
                  <div className="relative mt-8">
                    <div className="space-y-6">
                      {/* EstimateDetails sans overlay */}
                      <div className="transform scale-[0.85] origin-top">
                        <EstimateDetails
                          estimate={{
                            estimateId: estimate.estimateId,
                            details: {
                              services: estimate.details.services || [{
                                serviceID: estimate.serviceId,
                                title: service?.title || 'Service',
                                description: service?.description || '',
                                price: service?.price || 0,
                                items: []
                              }],
                              to: estimate.details.to,
                              from: estimate.details.from,
                              estimateId: estimate.estimateId,
                              issueDate: estimate.createdAt,
                              validUntil: estimate.details.validUntil,
                              tax: estimate.details.tax || 0,
                              subTotal: estimate.details.subTotal || 0,
                              total: estimate.details.total || 0
                            }
                          }}
                        />
                      </div>

                      {/* EstimateSummary avec overlay */}
                      <div 
                        className="relative cursor-pointer"
                        onMouseEnter={() => setIsHovered(true)}
                        onMouseLeave={() => setIsHovered(false)}
                        onClick={handleViewFull}
                      >
                        <div className="transform scale-[0.85] origin-top">
                          <EstimateSummary
                            estimate={{
                              estimateId: estimate.estimateId,
                              status: (estimate.status === 'PENDING' || estimate.status === 'APPROVED' || estimate.status === 'REJECTED' 
                                ? estimate.status 
                                : 'PENDING') as 'PENDING' | 'APPROVED' | 'REJECTED',
                              details: {
                                services: estimate.details.services,
                                to: {
                                  name: estimate.details?.to?.name || ''
                                },
                                validUntil: estimate.details.validUntil,
                                total: estimate.details.total
                              },
                              negotiationCount: estimate.negotiationCount,
                              organizationId: (view === 'customers' ? estimate.sellerOrganizationID : estimate.buyerOrganizationID) || ''
                            }}
                          />
                        </div>

                        {/* Overlay flouté avec bouton de redirection */}
                        <div 
                          className={`absolute inset-0 bg-white/60 backdrop-blur-[2px] transition-opacity duration-200 flex items-center justify-center ${
                            isHovered ? 'opacity-100' : 'opacity-0'
                          }`}
                          onClick={handleViewFull}
                        >
                          <div className="text-center p-4 bg-white/80 rounded-lg shadow-lg backdrop-blur-md">
                            <ArrowTopRightOnSquareIcon className="mx-auto h-8 w-8 text-indigo-600 fill-none" />
                            <p className="mt-2 text-sm font-medium text-indigo-600">
                              Cliquez pour voir le devis en détail
                            </p>
                          </div>
                        </div>
                      </div>

                      {estimate.negotiationCount > 0 && <NegotiationFeed />}
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