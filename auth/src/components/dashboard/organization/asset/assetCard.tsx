'use client'

import { AssetEntity } from '@/context/manage/asset'

interface AssetCardProps {
  asset: AssetEntity
}

export function AssetCard({ asset }: AssetCardProps) {
  if (!asset) return <div>Asset non trouvé</div>

  return (
    <div className="relative bg-white rounded-lg shadow-md overflow-hidden">
      <img
        src={asset.mediaID || 'https://placehold.co/400'}
        alt={asset.title}
        className="w-full h-48 object-cover"
      />
      <div className="p-4">
        <h3 className="text-lg font-semibold mb-2">{asset.title}</h3>
        <p className="text-sm text-gray-600 mb-2">{asset.description || ''}</p>
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium">{asset.price} €</span>
          <span className="text-sm text-gray-500">
            {asset.quantity ? `Quantité: ${asset.quantity}` : ''}
          </span>
        </div>
      </div>
    </div>
  )
} 