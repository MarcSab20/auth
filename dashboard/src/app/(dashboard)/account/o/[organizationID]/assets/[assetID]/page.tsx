import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { smpClient } from '@/smpClient';
import AssetDetailClient from '@/src/components/dashboard/organization/asset/editAsset/assetDetails';
import { getRecentOrders } from '@/src/components/catalyst/data';
import { UpdateAssetProvider } from '@/context/update/asset';

interface Order {
  id: number;
  date: string;
  customer: { name: string };
  amount: { usd: number };
  url: string;
}

export async function generateMetadata({ params }: { params: { organizationID: string; assetID: string } }): Promise<Metadata> {
  try {
    const asset = await smpClient.asset.get(params.assetID);
    return {
      title: asset ? asset.title : 'Détail de l\'asset',
    };
  } catch (error) {
    return {
      title: 'Détail de l\'asset',
    };
  }
}

export default async function AssetDetailPage({ params }: { params: { organizationID: string; assetID: string } }) {
  const { organizationID, assetID } = params;
  
  const asset = await smpClient.asset.get(assetID);
  if (!asset) {
    notFound();
  }

  const ordersData = await getRecentOrders();
  const orders: Order[] = ordersData.map(order => ({
    ...order,
    id: parseInt(order.id.toString()),
    amount: {
      usd: parseFloat(order.amount.usd),
    }
  }));
  
  return (
    <UpdateAssetProvider>
      <div className="container mx-auto px-4 py-8">
        <AssetDetailClient 
          asset={asset} 
          organizationID={organizationID}
        />
      </div>
    </UpdateAssetProvider>
  );
}
