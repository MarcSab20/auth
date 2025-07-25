'use client';

import { useState, useEffect } from 'react';
import { Heading } from '@/src/components/catalyst/components/heading';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/src/components/catalyst/components/table';
import { Select } from '@/src/components/catalyst/components/select';
import { EllipsisVerticalIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';
import { EmptyInvoices } from '@/src/components/design/emptyStates/emptyInvoices';

interface Invoice {
  invoiceId: string;
  uniqRef: string;
  transactionId: string;
  slug: string;
  orderId: string;
  totalAmount: number;
  sellerOrganizationId: string;
  paymentStatus: string;
  emittedDate: string;
  dueDate: string;
  state: string;
  createdAt: string;
  updatedAt?: string;
  deletedAt?: string;
}

interface InvoiceOrganizationProps {
  organizationID: string;
  view: 'customers' | 'suppliers';
}

export default function InvoiceOrganization({ organizationID, view }: InvoiceOrganizationProps) {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [filter, setFilter] = useState('all');
  const router = useRouter();

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const response = await fetch(`/api/organization/${organizationID}/accounting/invoices?view=${view}`);
        if (!response.ok) {
          throw new Error('Failed to fetch invoices');
        }
        const data = await response.json();
        console.log('Fetched invoices:', data);
        setInvoices(data);
      } catch (error) {
        console.error('Error fetching invoices:', error);
      }
    };

    fetchInvoices();
  }, [organizationID, view]);

  const handleViewInvoice = (invoiceId: string) => {
    router.push(`/account/o/${organizationID}/invoices/${invoiceId}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Heading level={3}>Factures</Heading>
        <div className="flex items-center gap-4">
          <Select
            name="filter"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-48"
          >
            <option value="all">Toutes les factures</option>
            <option value="paid">Payées</option>
            <option value="pending">En attente</option>
            <option value="overdue">En retard</option>
          </Select>
        </div>
      </div>

      <Table>
        <TableHead>
          <TableRow>
            <TableHeader>ID</TableHeader>
            <TableHeader>Référence</TableHeader>
            <TableHeader>Montant</TableHeader>
            <TableHeader>Statut</TableHeader>
            <TableHeader>Date d'émission</TableHeader>
            <TableHeader>Date d'échéance</TableHeader>
            <TableHeader>Actions</TableHeader>
          </TableRow>
        </TableHead>
        <TableBody>
          {invoices && invoices.length > 0 ? (
            invoices.map((invoice) => (
              <TableRow key={invoice.invoiceId}>
                <TableCell>{invoice.invoiceId}</TableCell>
                <TableCell>{invoice.uniqRef}</TableCell>
                <TableCell>{invoice.totalAmount}</TableCell>
                <TableCell>{invoice.paymentStatus}</TableCell>
                <TableCell>{new Date(invoice.emittedDate).toLocaleDateString()}</TableCell>
                <TableCell>{new Date(invoice.dueDate).toLocaleDateString()}</TableCell>
                <TableCell>
                  <div className="relative">
                    <button className="p-1 hover:bg-gray-100 rounded">
                      <EllipsisVerticalIcon className="h-5 w-5" />
                    </button>
                    <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 hidden group-hover:block">
                      <div className="py-1">
                        <button 
                          onClick={() => handleViewInvoice(invoice.invoiceId)}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          Voir
                        </button>
                      </div>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={7} className="py-8">
                <EmptyInvoices />
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
} 