// src/app/account/organization/[organizationID]/assets/page.tsx
import { Metadata } from 'next'
import { smpClient } from '@/smpClient'
import { AssetList, AssetEntity } from '@/src/components/dashboard/organization/asset/assetList'
import { notFound } from 'next/navigation'

export const metadata: Metadata = {
  title: 'Assets',
}

interface AssetsPageProps {
  params: { organizationID: string }
}

export default async function AssetsPage({ params }: AssetsPageProps) {
  const { organizationID } = params

  let initialAssets: AssetEntity[] = []
  try {
    const response = await smpClient.asset.listByOrganization({ organizationID }).catch(error => {
      if (error?.response?.errors?.[0]?.message.includes('Cannot return null for non-nullable field')) {
        return []
      }
      throw error
    })

    if (!response) {
      return (
        <div className="container mx-auto px-4 py-8">
          <AssetList 
            initialAssets={[]}
            organizationID={organizationID} 
          />
        </div>
      )
    }

    initialAssets = response.map(item => ({
      ...item.asset,
      conflictingAssets: JSON.stringify(item.asset.conflictingAssets),
      applyableAssets: JSON.stringify(item.asset.applyableAssets),
      medias: item.asset.medias
    })).filter(Boolean)
  } catch (error) {
    console.error('Erreur lors de la récupération des assets:', error)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <AssetList 
        initialAssets={initialAssets}
        organizationID={organizationID} 
      />
    </div>
  )
}

export const revalidate = 3600
