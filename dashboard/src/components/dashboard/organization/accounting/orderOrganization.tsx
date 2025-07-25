'use client';

import { useState, useEffect, useRef } from 'react';
import { Heading } from '@/src/components/catalyst/components/heading';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/src/components/catalyst/components/table';
import OrderDrawer from '@/src/components/dashboard/organization/accounting/orders/orderDrawer';
import { EmptyOrders } from '@/src/components/design/emptyStates/emptyOrders';

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
  view: 'customers' | 'suppliers';
}

export default function OrderOrganization({ organizationID, view }: OrderOrganizationProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isHoveringDrawer, setIsHoveringDrawer] = useState(false);
  const [isHoveringRow, setIsHoveringRow] = useState(false);
  const hoverTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch(`/api/organization/${organizationID}/accounting/orders?view=${view}`);
        if (!response.ok) {
          throw new Error('Failed to fetch orders');
        }
        const data = await response.json();
        console.log('Fetched orders:', data);
        setOrders(data);
      } catch (error) {
        console.error('Error fetching orders:', error);
      }
    };

    fetchOrders();
  }, [organizationID, view]);

  const handleMouseEnter = (order: Order) => {
    setIsHoveringRow(true);
    if (hoverTimer.current) {
      clearTimeout(hoverTimer.current);
    }
    hoverTimer.current = setTimeout(() => {
      setSelectedOrder(order);
    }, 1000);
  };

  const handleMouseLeave = () => {
    setIsHoveringRow(false);
    if (hoverTimer.current) {
      clearTimeout(hoverTimer.current);
    }
    if (!isHoveringDrawer) {
      hoverTimer.current = setTimeout(() => {
        setSelectedOrder(null);
      }, 2000);
    }
  };

  const handleClick = (order: Order) => {
    if (hoverTimer.current) {
      clearTimeout(hoverTimer.current);
    }
    setSelectedOrder(order);
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
        setSelectedOrder(null);
      }, 2000);
    }
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
      <Heading level={3}>Commandes récentes</Heading>
      <Table className="mt-4 [--gutter:--spacing(6)] lg:[--gutter:--spacing(10)]">
        <TableHead>
          <TableRow>
            <TableHeader>Order ID</TableHeader>
            <TableHeader>Date</TableHeader>
            <TableHeader>Client</TableHeader>
            <TableHeader className="text-right">Montant</TableHeader>
          </TableRow>
        </TableHead>
        <TableBody>
          {orders && orders.length > 0 ? (
            orders.map((order) => (
              <TableRow 
                key={order.orderId} 
                onMouseEnter={() => handleMouseEnter(order)}
                onMouseLeave={handleMouseLeave}
                onClick={() => handleClick(order)}
                className="cursor-pointer hover:bg-gray-50"
              >
                <TableCell>{order.orderId}</TableCell>
                <TableCell>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                <TableCell>{order.userId}</TableCell>
                <TableCell className="text-right">{order.totalPrice} {order.currency}</TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={4} className="py-8">
                <EmptyOrders />
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {selectedOrder && (
        <div 
          onMouseEnter={handleDrawerMouseEnter}
          onMouseLeave={handleDrawerMouseLeave}
        >
          <OrderDrawer 
            order={selectedOrder}
            isOpen={!!selectedOrder} 
            onClose={() => setSelectedOrder(null)} 
            view={view}
          />
        </div>
      )}
    </div>
  );
}
