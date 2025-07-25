import { smpClient } from '@/smpClient';
import { OrdersTable } from '@/src/components/design/tables/ordersTable';
import { Heading } from '@/src/components/catalyst/components/heading';

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

export default async function OrdersPage() {
  // 1. Récupère les commandes via l'API
  // const resp = await smpClient.accounting.getOrders();
  // 2. Mappe sur ton interface Order
  const orders: Order[] = [];
  // const orders: Order[] = resp.orders.map((order: any) => ({
  //   orderId: order.orderId,
  //   slug: order.slug,
  //   transactionId: order.transactionId,
  //   totalAmount: order.totalAmount,
  //   thirdPartyFees: order.thirdPartyFees,
  //   servicesFees: order.servicesFees,
  //   servicesVatPercent: order.servicesVatPercent,
  //   prestationsVatPercent: order.prestationsVatPercent,
  //   sellerOrganizationId: order.sellerOrganizationId,
  //   buyerOrganizationId: order.buyerOrganizationId,
  //   paymentStatus: order.paymentStatus,
  //   emittedDate: order.emittedDate,
  //   dueDate: order.dueDate,
  //   digitalSignature: order.digitalSignature,
  //   state: order.state,
  //   currency: order.currency,
  //   createdAt: order.createdAt,
  //   updatedAt: order.updatedAt,
  //   deletedAt: order.deletedAt,
  // }));

  return (
    <div className="p-4">
      <Heading className="mb-5">Mes Commandes</Heading>
      <OrdersTable orders={orders} />
    </div>
  );
} 