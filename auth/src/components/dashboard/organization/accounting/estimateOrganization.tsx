'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Heading } from '@/src/components/catalyst/components/heading';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/src/components/catalyst/components/table';
import { Select } from '@/src/components/catalyst/components/select';
import { EllipsisVerticalIcon } from '@heroicons/react/24/outline';
import { EmptyEstimates } from '@/src/components/design/emptyStates/emptyEstimates';
import EstimateDrawer from '@/src/components/dashboard/organization/accounting/estimates/estimateDrawer';
import { formatId } from '@/src/utils/formatters';
import { Dropdown, DropdownButton, DropdownMenu, DropdownItem } from '@/src/components/catalyst/components/dropdown';
import { MouseEvent } from 'react';

interface EstimateOrganizationProps {
  organizationID: string;
  view: 'customers' | 'suppliers';
}

interface Estimate {
  estimateId: string;
  serviceId: string;
  proposalPrice?: number;
  details: {
    services: {
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
    }[];
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
  providerSignDate?: string;
  createdAt: string;
  updatedAt?: string;
  buyerUserId?: string;
  buyerOrganizationId?: string;
  sellerOrganizationId?: string;
}

export default function EstimateOrganization({ organizationID, view }: EstimateOrganizationProps) {
  const router = useRouter();
  const [estimates, setEstimates] = useState<Estimate[]>([]);
  const [selectedEstimate, setSelectedEstimate] = useState<Estimate | null>(null);
  const [isHoveringDrawer, setIsHoveringDrawer] = useState(false);
  const [isHoveringRow, setIsHoveringRow] = useState(false);
  const hoverTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const fetchEstimates = async () => {
      try {
        const response = await fetch(`/api/organization/${organizationID}/accounting/estimates?view=${view}`);
        if (!response.ok) {
          throw new Error('Failed to fetch estimates');
        }
        const data = await response.json();
        setEstimates(Array.isArray(data) ? data : data.estimates || []);
      } catch (error) {
        console.error('Error fetching estimates:', error);
        setEstimates([]);
      }
    };

    fetchEstimates();
  }, [organizationID, view]);

  const handleMouseEnter = (estimate: Estimate) => {
    setIsHoveringRow(true);
    if (hoverTimer.current) {
      clearTimeout(hoverTimer.current);
    }
    hoverTimer.current = setTimeout(() => {
      setSelectedEstimate(estimate);
    }, 1000);
  };

  const handleMouseLeave = () => {
    setIsHoveringRow(false);
    if (hoverTimer.current) {
      clearTimeout(hoverTimer.current);
    }
    if (!isHoveringDrawer) {
      hoverTimer.current = setTimeout(() => {
        setSelectedEstimate(null);
      }, 2000);
    }
  };

  const handleClick = (estimate: Estimate) => {
    if (hoverTimer.current) {
      clearTimeout(hoverTimer.current);
    }
    setSelectedEstimate(estimate);
  };

  const handleDrawerMouseEnter = () => {
    setIsHoveringDrawer(true);
    if (hoverTimer.current) {
      clearTimeout(hoverTimer.current);
    }
  };

  const handleDrawerMouseLeave = () => {
    setIsHoveringDrawer(false);
    if (hoverTimer.current) {
      clearTimeout(hoverTimer.current);
    }
    if (!isHoveringRow) {
      hoverTimer.current = setTimeout(() => {
        setSelectedEstimate(null);
      }, 2000);
    }
  };

  const handleViewEstimate = (estimateId: string) => {
    const estimate = estimates.find(e => e.estimateId === estimateId);
    if (!estimate) return;
    
    // Route simplifiée : /account/o/15/estimates/[estimateId]
    const route = `/account/o/${organizationID}/estimates/${estimateId}`;
    router.push(route);
  };

  useEffect(() => {
    return () => {
      if (hoverTimer.current) {
        clearTimeout(hoverTimer.current);
      }
    };
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Heading level={3}>Devis</Heading>
        <div className="flex items-center gap-4">
          <Select
            name="filter"
            value={view}
            onChange={(e) => {
              router.push(`/account/o/${organizationID}/estimates/${e.target.value}`);
            }}
            className="w-48"
          >
            <option value="customers">Clients</option>
            <option value="suppliers">Fournisseurs</option>
          </Select>
        </div>
      </div>

      <Table className="mt-4 [--gutter:--spacing(6)] lg:[--gutter:--spacing(10)]">
        <TableHead>
          <TableRow>
            <TableHeader>Devis ID</TableHeader>
            <TableHeader>Date</TableHeader>
            <TableHeader>Client</TableHeader>
            <TableHeader className="text-right">Montant</TableHeader>
            <TableHeader>Actions</TableHeader>
          </TableRow>
        </TableHead>
        <TableBody>
          {estimates && estimates.length > 0 ? (
            estimates.map((estimate) => (
              <TableRow 
                key={estimate.estimateId} 
                onMouseEnter={() => handleMouseEnter(estimate)}
                onMouseLeave={handleMouseLeave}
                onClick={() => handleClick(estimate)}
                className="cursor-pointer hover:bg-gray-50"
              >
                <TableCell>{formatId(estimate.estimateId, 'estimate')}</TableCell>
                <TableCell>{new Date(estimate.createdAt).toLocaleDateString()}</TableCell>
                <TableCell>{estimate.details?.clientName || 'N/A'}</TableCell>
                <TableCell className="text-right">{estimate.proposalPrice || 0} €</TableCell>
                <TableCell>
                  <Dropdown>
                    <DropdownButton plain aria-label="Actions">
                      <EllipsisVerticalIcon className="size-5" />
                    </DropdownButton>
                    <DropdownMenu anchor="bottom end">
                      <DropdownItem
                        onClick={(e: MouseEvent<HTMLButtonElement>) => {
                          e.stopPropagation();
                          handleViewEstimate(estimate.estimateId);
                        }}
                      >
                        Voir
                      </DropdownItem>
                    </DropdownMenu>
                  </Dropdown>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={4} className="py-8">
                <EmptyEstimates />
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {selectedEstimate && (
        <div 
          onMouseEnter={handleDrawerMouseEnter}
          onMouseLeave={handleDrawerMouseLeave}
        >
          <EstimateDrawer 
            estimate={selectedEstimate}
            isOpen={!!selectedEstimate} 
            onClose={() => setSelectedEstimate(null)}
            onViewFull={handleViewEstimate}
            view={view}
          />
        </div>
      )}
    </div>
  );
} 