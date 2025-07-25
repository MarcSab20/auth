'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/src/components/landing-page/Button';
import {
  Dropdown,
  DropdownButton,
  DropdownItem,
  DropdownMenu,
} from '@/src/components/catalyst/components/dropdown';
import { EllipsisVerticalIcon, MagnifyingGlassIcon } from '@heroicons/react/20/solid';
import { EmptyOrders } from '@/src/components/design/emptyStates/emptyOrders';

interface Order {
  orderId: string;
  slug: string;
  transactionId: string;
  totalAmount: number;
  thirdPartyFees: number;
  servicesFees: number;
  servicesVatPercent: number;
  prestationsVatPercent: number;
  sellerOrganizationId: string;
  buyerOrganizationId: string;
  paymentStatus: string;
  emittedDate: string;
  dueDate: string;
  digitalSignature: string;
  state: string;
  currency: string;
  createdAt: string;
  updatedAt?: string;
  deletedAt?: string;
}

interface OrdersViewProps {
  orders: Order[];
}

export default function OrdersView({ orders }: OrdersViewProps) {
  const [search, setSearch] = useState('');

  const filteredOrders = useMemo(() => {
    if (!search) return orders;
    return orders.filter((order) =>
      Object.values(order).some((value) =>
        String(value).toLowerCase().includes(search.toLowerCase())
      )
    );
  }, [orders, search]);

  const columns = [
    { header: 'Commande ID', accessor: (o: Order) => o.orderId },
    { header: 'Transaction', accessor: (o: Order) => o.transactionId },
    {
      header: 'Montant total',
      accessor: (o: Order) => `€${o.totalAmount.toFixed(2)}`,
    },
    {
      header: 'Statut paiement',
      accessor: (o: Order) => o.paymentStatus,
    },
    {
      header: 'Échéance',
      accessor: (o: Order) => new Date(o.dueDate).toLocaleDateString(),
    },
  ];

  const renderActions = (order: Order) => (
    <Dropdown>
      <DropdownButton plain aria-label="Actions">
        <EllipsisVerticalIcon className="h-5 w-5" />
      </DropdownButton>
      <DropdownMenu anchor="bottom end">
        <DropdownItem onClick={() => console.log('View order:', order.orderId)}>
          Voir
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  );

  if (orders.length === 0) {
    return <EmptyOrders />;
  }

  return (
    <>
      <div className="mb-6 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <Button onClick={() => console.log('Export orders')}>
            Exporter
          </Button>
          <div className="relative flex-1 sm:flex-none">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher…"
              className="h-10 w-full sm:w-64 px-3 pl-10 border rounded-lg"
            />
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column, index) => (
                <th
                  key={index}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {column.header}
                </th>
              ))}
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredOrders.map((order) => (
              <tr key={order.orderId}>
                {columns.map((column, index) => (
                  <td
                    key={index}
                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                  >
                    {column.accessor(order)}
                  </td>
                ))}
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  {renderActions(order)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
} 