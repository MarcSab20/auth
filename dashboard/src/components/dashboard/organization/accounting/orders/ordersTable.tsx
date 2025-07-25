'use client';

import { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/src/components/catalyst/components/table';
import OrderDrawer from './orderDrawer';

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
  unloggedUser: boolean;
  lines: Array<{
    assetId: string;
    quantity: number;
    unitPrice: number;
    details: any;
    title: string;
    description: string;
    legalVatPercent: number;
  }>;
  id: string;
  date: string;
  url: string;
  payment: {
    transactionId: string;
    card: {
      type: string;
      number: string;
      expiry: string;
    };
  };
  customer: {
    name: string;
    email: string;
    address: string;
    country: string;
    countryFlagUrl: string;
  };
  amount: {
    usd: number;
    cad: number;
    fee: number;
    net: number;
  };
  event?: {
    name: string;
    url: string;
    thumbUrl: string;
  };
}

interface OrdersTableProps {
  orders: Order[];
}

export default function OrdersTable({ orders }: OrdersTableProps) {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [hoverTimeout, setHoverTimeout] = useState<NodeJS.Timeout | null>(null);

  const handleRowHover = (order: Order) => {
    if (hoverTimeout) {
      clearTimeout(hoverTimeout);
    }

    const timeout = setTimeout(() => {
      setSelectedOrder(order);
      setIsDrawerOpen(true);
    }, 2000);

    setHoverTimeout(timeout);
  };

  const handleRowLeave = () => {
    if (hoverTimeout) {
      clearTimeout(hoverTimeout);
    }
  };

  const handleRowClick = (order: Order) => {
    setSelectedOrder(order);
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
    setSelectedOrder(null);
  };

  return (
    <>
      <Table>
        <TableHead>
          <TableRow>
            <TableHeader>Order ID</TableHeader>
            <TableHeader>Date</TableHeader>
            <TableHeader>Client</TableHeader>
            <TableHeader className="text-right">Montant</TableHeader>
          </TableRow>
        </TableHead>
        <TableBody>
          {orders.map((order) => (
            <TableRow
              key={order.id}
              onMouseEnter={() => handleRowHover(order)}
              onMouseLeave={handleRowLeave}
              onClick={() => handleRowClick(order)}
              className="cursor-pointer hover:bg-gray-50"
            >
              <TableCell>{order.id}</TableCell>
              <TableCell>{order.date}</TableCell>
              <TableCell>{order.customer.name}</TableCell>
              <TableCell className="text-right">{order.amount.usd} €</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {selectedOrder && (
        <OrderDrawer
          order={selectedOrder}
          isOpen={isDrawerOpen}
          onClose={handleCloseDrawer}
          view="customers"
        />
      )}
    </>
  );
} 