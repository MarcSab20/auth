// app/account/[organizationID]/services/page.tsx

import { Metadata } from 'next'
import { smpClient } from '@/smpClient'
import { ServiceEntity, ServiceList } from '@/src/components/dashboard/organization/service/organizationServices'

export const metadata: Metadata = {
  title: 'Services',
}

interface ServicesPageProps {
  params: { organizationID: string }
}

export default async function ServicesPage({ params }: ServicesPageProps) {
  const { organizationID } = params

  // Récupère les services de l'organisation en gérant les cas d'erreur ou de tableau vide
  let initialServices: ServiceEntity[] = []
  try {
    const services = await smpClient.service.listByOrganization({ organizationID })
    initialServices = services || []
    console.log(initialServices,"services@@@@@@@@")

  } catch (error) {
    console.error('Erreur lors de la récupération des services :', error)
  }

  return (
    <ServiceList 
      initialServices={initialServices} 
      organizationID={organizationID} 
    />
  )
}

export const revalidate = 3600
