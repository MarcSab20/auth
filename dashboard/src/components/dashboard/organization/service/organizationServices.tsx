'use client';

import { useState } from 'react'
import useSWR from 'swr'

import { Badge } from '@/src/components/catalyst/components/badge'
import { Button } from '@/src/components/landing-page/Button'
import { Divider } from '@/src/components/catalyst/components/divider'
import {
  Dropdown,
  DropdownButton,
  DropdownItem,
  DropdownMenu,
} from '@/src/components/catalyst/components/dropdown'
import { Heading } from '@/src/components/catalyst/components/heading'
import { Input, InputGroup } from '@/src/components/catalyst/components/input'
import { Link } from '@/src/components/catalyst/components/link'
import { Select } from '@/src/components/catalyst/components/select'
import { EllipsisVerticalIcon } from '@heroicons/react/16/solid'
import EmptyServices  from '@/src/components/dashboard/organization/service/emptyServices'

export interface ServiceEntity {
  serviceID: string
  uniqRef: string
  slug: string
  authorID: string
  title: string
  description: string
  mediaBannerID?: string
  termsAndConditionsID?: string
  parentServiceID?: string
  topicID?: string
  organizationID?: string
  locationID?: string
  paymentConfigID?: string
  price: number
  legalVatPercent?: number
  lowerPrice?: number
  upperPrice?: number
  negotiable?: boolean
  perimeter?: number
  supplyType: string
  uptakeForm: string
  billingPlan: string
  onlineService?: boolean
  advancedAttributes?: string
  state: string // "online" ou "offline" par exemple
  serviceMedias?: { 
    listingPosition: number, 
    serviceMediaID:string, 
    legend:string;
     media?: { 
      url: string } }[]
}
interface ServiceListProps {
  initialServices: ServiceEntity[]
  organizationID: string
}

export function ServiceList({ initialServices, organizationID }: ServiceListProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'online' | 'offline'>('all')

  // SWR pour gérer le raffraîchissement éventuel
  const { data: services, mutate } = useSWR<ServiceEntity[]>(
    `/api/services?org=${organizationID}`,
    {
      fallbackData: initialServices,
      revalidateOnMount: false,
    }
  )
  if (!services || services.length === 0) {
    return <EmptyServices organizationID={organizationID} />
  }
  
const serviceID = services[0].serviceID
  // Filtrage côté client
  const filteredServices = services.filter((service) => {
    const matchesSearch = service.title
      .toLowerCase()
      .includes(searchTerm.toLowerCase())

    const matchesStatus =
      statusFilter === 'all' ? true : service.state === statusFilter

    return matchesSearch && matchesStatus
  })

  return (
    <div className="space-y-8">
      {/* En-tête */}
      <div>
        <Heading>Services</Heading>
        <Divider className="my-4" />

        {/* Barre de filtre et bouton d'action */}
        <div className="flex flex-wrap items-center gap-4">
          {/* Barre de recherche + Select */}
          <div className="flex flex-1  gap-4">
            <InputGroup className="w-full ">
              <Input
                placeholder="Rechercher un service…"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </InputGroup>
            <Select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value as 'all' | 'online' | 'offline')
              }
            >
              <option value="all">Tous statuts</option>
              <option value="online">Actifs</option>
              <option value="offline">Inactifs</option>
            </Select>
          </div>

          {/* Bouton "Créer un service" */}
          <div className="ml-auto">
            <Link href={`/account/o/${organizationID}/services/new`}>
            <Button  >Créer un service</Button>
            </Link>
          </div>
        </div>
      </div>
    
      {/* Liste des services */}
      <ul className="space-y-6">
        {filteredServices.map((service, index) => (
          <li key={service.serviceID}>
            <Divider soft={index > 0} />
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between py-6 gap-0 sm:gap-6">
              {/* Image */}
              <div className="w-full sm:w-60 shrink-0 flex justify-center sm:justify-start mb-4 sm:mb-0">
                <Link
                  href={`/account/o/${organizationID}/services/${service.serviceID}`}
                >
                  <img
                    src={
                      service.serviceMedias && service.serviceMedias.length > 0
                        ? (service.serviceMedias
                            .sort((a: any, b: any) => a.listingPosition - b.listingPosition)[0]?.media?.url)
                        : (service.mediaBannerID || 'https://placehold.co/400x300')
                    }
                    alt={service.title}
                    className="h-40 w-full sm:w-60 rounded-lg object-cover shadow-sm"
                  />
                </Link>
              </div>
              {/* Titre + Synthèse */}
              <div className="flex-1 flex flex-col justify-center w-full sm:w-auto">
                <Heading level={3}>
                  <Link
                    href={`/account/o/${organizationID}/services/${service.serviceID}`}
                    className="hover:text-gray-700"
                  >
                    {service.title}
                  </Link>
                </Heading>
                <div className="text-sm text-gray-600">
                  <p className="font-bold">
                    {service.price} €
                  </p>
                  <p className="mt-1 line-clamp-2">
                    {(() => {
                      try {
                        const advancedAttrs = service.advancedAttributes ? JSON.parse(service.advancedAttributes) : {};
                        return advancedAttrs.synthese || " ";
                      } catch (error) {
                      }
                    })()}
                  </p>
                </div>
              </div>
              {/* Badge et menu d'édition : visible seulement sur desktop/tablette */}
              <div className="hidden sm:flex items-center gap-4 ml-6">
                <Badge color= 'green' >
                  Actif
                </Badge>
                <Dropdown>
                  <DropdownButton plain aria-label="Actions">
                    <EllipsisVerticalIcon className="size-5" />
                  </DropdownButton>
                  <DropdownMenu anchor="bottom end">
                    <DropdownItem
                      href={`/account/o/${organizationID}/services/${serviceID}`}
                    >
                      Editer
                    </DropdownItem>
                  </DropdownMenu>
                </Dropdown>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
