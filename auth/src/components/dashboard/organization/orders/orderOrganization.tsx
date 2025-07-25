'use client';

import { useState } from 'react';
import { Heading } from '@/src/components/catalyst/components/heading';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/src/components/catalyst/components/table';

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

interface OrderOrganizationProps {
  organizationID: string;
  initialOrders: Order[];
}

export default function OrderOrganization({ organizationID, initialOrders }: OrderOrganizationProps) {
  const [orders] = useState<Order[]>(initialOrders);

  return (
    <div className="space-y-6">
      <Heading level={3}>Commandes</Heading>
      <Table>
        <TableHead>
          <TableRow>
            <TableHeader>ID</TableHeader>
            <TableHeader>Date</TableHeader>
            <TableHeader>Client</TableHeader>
            <TableHeader>Montant</TableHeader>
          </TableRow>
        </TableHead>
        <TableBody>
          {orders.map((order) => (
            <TableRow key={order.orderId}>
              <TableCell>{order.orderId}</TableCell>
              <TableCell>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
              <TableCell>{order.userId}</TableCell>
              <TableCell>{order.totalPrice} {order.currency}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
} 