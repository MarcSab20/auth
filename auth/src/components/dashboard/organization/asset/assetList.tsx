'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { Badge } from '@/src/components/catalyst/components/badge';
import { Button } from '@/src/components/landing-page/Button';
import { Divider } from '@/src/components/catalyst/components/divider';
import {
  Dropdown,
  DropdownButton,
  DropdownItem,
  DropdownMenu,
} from '@/src/components/catalyst/components/dropdown';
import { Heading } from '@/src/components/catalyst/components/heading';
import { Input, InputGroup } from '@/src/components/catalyst/components/input';
import { Link } from '@/src/components/catalyst/components/link';
import { Select } from '@/src/components/catalyst/components/select';
import { EllipsisVerticalIcon } from '@heroicons/react/16/solid';
import EmptyAssets from './emptyAssets';

export interface AssetEntity {
  assetID: string;
  uniqRef?: string;
  slug?: string;
  title: string;
  authorID?: string;
  organizationID?: string;
  mediaID?: string;
  description?: string;
  price: number;
  legalVatPercent?: number;
  quantity: number;
  stockQuantity?: number;
  maxPerReservation?: number;
  conflictingAssets?: string;
  applyableAssets?: string;
  state: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
  medias?: {
    assetMediaID: string;
    listingPosition: number;
    legend?: string;
    state: string;
    media: {
      url: string;
    };
  }[];
}

interface AssetListProps {
  organizationID: string;
  serviceID?: string;
  initialAssets?: AssetEntity[];
}

export function AssetList({ serviceID, organizationID, initialAssets = [] }: AssetListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'online' | 'offline'>('all');

  // SWR pour gérer le raffraîchissement éventuel
  const { data: response = initialAssets, error, isLoading } = useSWR<AssetEntity[]>(
    `/api/assets/organization/${organizationID}`,
    {
      fallbackData: initialAssets,
      revalidateOnMount: false,
      revalidateOnFocus: false,
      revalidateOnReconnect: false
    }
  );

  console.log('Assets data structure:', {
    response,
    firstAsset: response?.[0],
    medias: response?.[0]?.medias,
    mediaID: response?.[0]?.mediaID
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Heading level={2}>Erreur</Heading>
        <p className="mt-2 text-gray-600">
          Une erreur est survenue lors du chargement des assets.
        </p>
      </div>
    );
  }

  if (!response || response.length === 0) {
    return <EmptyAssets serviceID={serviceID} organizationID={organizationID} />;
  }

  // Filtrage côté client
  const filteredAssets = response.filter((asset) => {
    const matchesSearch = asset.title
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === 'all' ? true : asset.state === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-8">
      {/* En-tête */}
      <div>
        <Heading>Assets</Heading>
        <Divider className="my-4" />

        {/* Barre de filtre et bouton d'action */}
        <div className="flex flex-wrap items-center gap-4">
          {/* Barre de recherche + Select */}
          <div className="flex flex-1 gap-4">
            <InputGroup className="w-full">
              <Input
                placeholder="Rechercher un asset…"
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

          {/* Bouton "Créer un asset" */}
          <div className="ml-auto">
            <Link href={`/account/o/${organizationID}/assets/new`}>
              <Button>Créer un asset</Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Liste des assets */}
      <ul className="space-y-6">
        {filteredAssets.map((asset, index) => (
          <li key={asset.assetID}>
            <Divider soft={index > 0} />
            <div className="flex items-center justify-between py-6">
              <div className="flex flex-1 gap-6">
                <div className="w-35 shrink-0">
                  <Link
                    href={`/account/o/${organizationID}/assets/${asset.assetID}`}
                  >
                    <img
                      src={
                        asset.medias && asset.medias.length > 0
                          ? (asset.medias
                              .sort((a, b) => a.listingPosition - b.listingPosition)[0]?.media?.url)
                          : 'https://placehold.co/400x300'
                      }
                      alt={asset.title}
                      className="h-40 w-60 rounded-lg object-cover shadow-sm"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = 'https://placehold.co/400x300';
                      }}
                    />
                  </Link>
                </div>
                <div className="flex-1 space-y-2">
                  <Heading level={3}>
                    <Link
                      href={`/account/o/${organizationID}/assets/${asset.assetID}`}
                      className="hover:text-gray-700"
                    >
                      {asset.title}
                    </Link>
                  </Heading>
                  <div className="text-sm text-gray-600">
                    <p>
                      {asset.price} € &middot; Quantité: {asset.quantity}
                    </p>
                    <p className="mt-1 line-clamp-2">{asset.description}</p>
                  </div>
                </div>
              </div>

              <div className="ml-6 flex items-center gap-4">
                <Badge color={asset.state === 'online' ? 'green' : 'red'}>
                  {asset.state === 'online' ? 'Actif' : 'Inactif'}
                </Badge>
                <Dropdown>
                  <DropdownButton plain aria-label="Actions">
                    <EllipsisVerticalIcon className="size-5" />
                  </DropdownButton>
                  <DropdownMenu anchor="bottom end">
                    <DropdownItem
                      href={`/account/o/${organizationID}/assets/${asset.assetID}`}
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
  );
} 