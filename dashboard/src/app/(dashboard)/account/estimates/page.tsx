// app/dashboard/user/accounting/estimates/page.tsx
import { smpClient } from '@/smpClient';
import EstimatesView from '@/src/components/dashboard/user/accounting/estimatesTable';
import { Heading } from '@/src/components/catalyst/components/heading';

interface Estimate {
  estimateId: string;
  serviceId: string;
  proposalPrice: number;
  details: string;
  status: string;
  negotiationCount: number;
  clientSignDate?: string;
  providerSignDate?: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export const revalidate = 3600;

export default async function EstimatesPage() {
  // 1. Récupère les devis via l'API
  // const resp = await smpClient.accounting.getEstimates();
  // 2. Mappe sur ton interface Estimate
  const estimates: Estimate[] = [];
  // const estimates: Estimate[] = resp.estimates.map((e: any) => ({
  //   estimateId: e.estimateId,
  //   serviceId: e.serviceId,
  //   proposalPrice: e.proposalPrice,
  //   details: e.details,
  //   status: e.status,
  //   negotiationCount: e.negotiationCount,
  //   clientSignDate: e.clientSignDate,
  //   providerSignDate: e.providerSignDate,
  //   createdAt: e.createdAt,
  //   updatedAt: e.updatedAt,
  //   deletedAt: e.deletedAt,
  // }));

  return (
    <div className="p-4">
      <Heading className="mb-5">Mes Devis</Heading>
      <EstimatesView estimates={estimates} />
    </div>
  );
}
