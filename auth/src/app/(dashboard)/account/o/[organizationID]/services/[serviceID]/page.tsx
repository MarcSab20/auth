// app/account/[organizationID]/services/[serviceID]/page.tsx
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { smpClient } from '@/smpClient';
import ServiceDetailClient from '@/src/components/dashboard/organization/service/editService/serviceDetails';
import { getRecentOrders } from '@/src/components/catalyst/data';
import { UpdateServiceProvider } from '@/context/update/service';
import { AssetManagementProvider } from '@/context/manage/asset';

interface Order {
  id: number;
  date: string;
  customer: { name: string };
  amount: { usd: number };
  url: string;
}

export async function generateMetadata({ params }: { params: { organizationID: string; serviceID: string } }): Promise<Metadata> {
  const service = await smpClient.service.getById(params.serviceID);
  return {
    title: service ? service.title : 'Détail du service',
  };
}

export default async function ServiceDetailPage({ params }: { params: { organizationID: string; serviceID: string } }) {
  const { organizationID, serviceID } = params;
  
  const service = await smpClient.service.getById(serviceID);
  if (!service) {
    notFound();
  }
  // const orders = await getRecentOrders();
  const ordersData = await getRecentOrders();
  // Transformation des données pour correspondre à l'interface Order
  const orders: Order[] = ordersData.map(order => ({
    ...order,
    id: parseInt(order.id.toString()), // conversion en number si c'est une string
    amount: {
      usd: parseFloat(order.amount.usd), // conversion en nombre si besoin
      // Vous pouvez ignorer ou transformer les autres champs d'amount si non utilisés
    }
  }));
  
  return (
    <UpdateServiceProvider>
      <AssetManagementProvider>
        <ServiceDetailClient service={service} orders={orders} organizationID={organizationID} />
      </AssetManagementProvider>
    </UpdateServiceProvider>
  );
}
