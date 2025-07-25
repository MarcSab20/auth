import { smpClient, initializeSMPClient } from '@/smpClient';
import TransactionOrganization from '@/src/components/dashboard/organization/accounting/transactionOrganization';

interface PageProps {
  params: {
    organizationID: string;
  };
}

export default async function TransactionsPage({ params }: PageProps) {
  await initializeSMPClient();
  
  
  // Filtrer les transactions où l'organisation est acheteur
  const buyerTransactions = await smpClient.smpPayment.getTransactionsByBuyerOrganizationId(params.organizationID);
  
  // Filtrer les transactions où l'organisation est vendeur
  const sellerTransactions = await smpClient.smpPayment.getTransactionsBySellerOrganizationId(params.organizationID);
    

  return (
    <div className="p-6">
      <TransactionOrganization 
        organizationID={params.organizationID}
        initialData={{
          buyerTransactions,
          sellerTransactions
        }}
      />
    </div>
  );
}
