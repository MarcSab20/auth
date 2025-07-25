// app/dashboard/user/accounting/invoices/page.tsx
import { smpClient } from '@/smpClient';
import InvoicesView from '@/src/components/dashboard/user/accounting/invoicesTable';
import { Heading } from '@/src/components/catalyst/components/heading';

interface Invoice {
  invoiceId: string;
  slug: string;
  transactionId: string;
  orderId: string;
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
  updatedAt: string;
  deletedAt?: string;
}

export const revalidate = 3600;

export default async function InvoicesPage() {
  // 1. Récupère les factures via l'API
  // const resp = await smpClient.accounting.getInvoices();
  // 2. Mappe sur ton interface Invoice
  const invoices: Invoice[] = [];
  // const invoices: Invoice[] = resp.invoices.map((inv: any) => ({
  //   invoiceId: inv.invoiceId,
  //   slug: inv.slug,
  //   transactionId: inv.transactionId,
  //   orderId: inv.orderId,
  //   totalAmount: inv.totalAmount,
  //   thirdPartyFees: inv.thirdPartyFees,
  //   servicesFees: inv.servicesFees,
  //   servicesVatPercent: inv.servicesVatPercent,
  //   prestationsVatPercent: inv.prestationsVatPercent,
  //   sellerOrganizationId: inv.sellerOrganizationId,
  //   buyerOrganizationId: inv.buyerOrganizationId,
  //   paymentStatus: inv.paymentStatus,
  //   emittedDate: inv.emittedDate,
  //   dueDate: inv.dueDate,
  //   digitalSignature: inv.digitalSignature,
  //   state: inv.state,
  //   currency: inv.currency,
  //   createdAt: inv.createdAt,
  //   updatedAt: inv.updatedAt,
  //   deletedAt: inv.deletedAt,
  // }));

  return (
    <div className="p-4">
      <Heading className="mb-5">Mes Factures</Heading>
      <InvoicesView invoices={invoices} />
    </div>
  );
}
