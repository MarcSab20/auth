// src/components/common/AccountingTable.tsx
'use client';

import React, { ReactNode, useState, useMemo } from 'react';
import {
  Table as CatalystTable,
  TableHead,
  TableBody,
  TableHeader,
  TableRow,
  TableCell,
} from '@/src/components/catalyst/components/table';
import { Button } from '@/src/components/landing-page/Button';
import {
  Dropdown,
  DropdownButton,
  DropdownItem,
  DropdownMenu,
} from '@/src/components/catalyst/components/dropdown';
import {
  EllipsisVerticalIcon,
  DocumentTextIcon,
  CurrencyDollarIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/20/solid';

import { EmptyEstimates } from '@/src/components/design/emptyStates/emptyEstimates';
import { EmptyInvoices } from '@/src/components/design/emptyStates/emptyInvoices';

/** Composant générique de tableau */
export type Column<T> = {
  header: string;
  accessor: keyof T | ((row: T) => ReactNode);
};

interface TableDataProps<T> {
  data: T[];
  columns: Column<T>[];
  isDense?: boolean;
  renderActions?: (row: T) => ReactNode;
  emptyState?: ReactNode;
}

export function TableData<T>({
  data,
  columns,
  isDense = false,
  renderActions,
  emptyState,
}: TableDataProps<T>) {
  const totalCols = columns.length + (renderActions ? 1 : 0);

  return (
    <div className={isDense ? 'mt-4 flow-root dense' : 'mt-8 flow-root'}>
      <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
        <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
          <CatalystTable>
            <TableHead>
              <TableRow>
                {columns.map((col) => (
                  <TableHeader key={col.header}>{col.header}</TableHeader>
                ))}
                {renderActions && <TableHeader>Actions</TableHeader>}
              </TableRow>
            </TableHead>
            <TableBody>
              {data.length > 0 ? (
                data.map((row, rIdx) => (
                  <TableRow key={rIdx}>
                    {columns.map((col, cIdx) => {
                      const cell =
                        typeof col.accessor === 'function'
                          ? col.accessor(row)
                          : (row as any)[col.accessor];
                      return <TableCell key={cIdx}>{cell}</TableCell>;
                    })}
                    {renderActions && (
                      <TableCell>{renderActions(row)}</TableCell>
                    )}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={totalCols} className="text-center py-6">
                    {emptyState}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </CatalystTable>
        </div>
      </div>
    </div>
  );
}

/** Tes modèles business */
export interface Estimate {
  estimateId: string;
  serviceId: string;
  proposalPrice?: number;
  details?: any;
  status: string;
  negotiationCount: number;
  clientSignDate?: string;
  providerSignDate?: string;
  createdAt: string;
  updatedAt?: string;
  deletedAt?: string;
}

export interface Invoice {
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
  buyerOrganizationId?: string;
  paymentStatus: string;
  emittedDate: string;
  dueDate: string;
  digitalSignature?: string;
  state: string;
  currency: string;
  createdAt: string;
  updatedAt?: string;
  deletedAt?: string;
}

type Entry = Estimate | Invoice;

export interface AccountingTableProps {
  type: 'estimate' | 'invoice';
  entries: Entry[];
  onView: (id: string) => void;
  onAdd: () => void;
  onExport: () => void;
}

/** Helper pour afficher un badge */
const badge = (label: string) => (
  <span className="inline-block px-2 py-1 text-xs font-medium rounded bg-gray-100">
    {label}
  </span>
);

export function AccountingTable({
  type,
  entries,
  onView,
  onAdd,
  onExport,
}: AccountingTableProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [clientFilter, setClientFilter] = useState<string>('');

  const statuses = useMemo(
    () =>
      Array.from(
        new Set(
          entries.map((e) =>
            type === 'estimate'
              ? (e as Estimate).status
              : (e as Invoice).paymentStatus
          )
        )
      ),
    [entries, type]
  );

  const clients = useMemo(
    () =>
      Array.from(
        new Set(
          entries.map((e) =>
            type === 'estimate'
              ? (e as Estimate).serviceId
              : (e as Invoice).sellerOrganizationId
          )
        )
      ),
    [entries, type]
  );

  const filtered = useMemo(
    () =>
      entries
        .filter((e) => {
          const hay =
            type === 'estimate'
              ? `${(e as Estimate).estimateId} ${(e as Estimate).serviceId}`
              : `${(e as Invoice).invoiceId} ${(e as Invoice).orderId}`;
          return hay.toLowerCase().includes(search.toLowerCase());
        })
        .filter((e) =>
          statusFilter
            ? type === 'estimate'
              ? (e as Estimate).status === statusFilter
              : (e as Invoice).paymentStatus === statusFilter
            : true
        )
        .filter((e) =>
          clientFilter
            ? type === 'estimate'
              ? (e as Estimate).serviceId === clientFilter
              : (e as Invoice).sellerOrganizationId === clientFilter
            : true
        ),
    [entries, search, statusFilter, clientFilter, type]
  );

  const columns: Column<Entry>[] = useMemo(() => {
    if (type === 'estimate') {
      return [
        { header: 'Devis ID', accessor: (e) => (e as Estimate).estimateId },
        { header: 'Service', accessor: (e) => (e as Estimate).serviceId },
        {
          header: 'Prix',
          accessor: (e) =>
            (e as Estimate).proposalPrice != null
              ? `€${(e as Estimate).proposalPrice!.toFixed(2)}`
              : '-',
        },
        { header: 'Statut', accessor: (e) => badge((e as Estimate).status) },
        {
          header: 'Créé le',
          accessor: (e) =>
            new Date((e as Estimate).createdAt).toLocaleDateString(),
        },
      ];
    }
    return [
      { header: 'Facture ID', accessor: (e) => (e as Invoice).invoiceId },
      { header: 'Commande #', accessor: (e) => (e as Invoice).orderId },
      {
        header: 'Montant total',
        accessor: (e) => `€${(e as Invoice).totalAmount.toFixed(2)}`,
      },
      {
        header: 'Statut paiement',
        accessor: (e) => badge((e as Invoice).paymentStatus),
      },
      {
        header: 'Échéance',
        accessor: (e) =>
          new Date((e as Invoice).dueDate).toLocaleDateString(),
        },
    ];
  }, [type]);

  const renderActions = (e: Entry) => (
    <Dropdown>
      <DropdownButton plain aria-label="Actions">
        <EllipsisVerticalIcon className="h-5 w-5" />
      </DropdownButton>
      <DropdownMenu anchor="bottom end">
        <DropdownItem
          onClick={() =>
            onView(
              type === 'estimate'
                ? (e as Estimate).estimateId
                : (e as Invoice).invoiceId
            )
          }
        >
          Voir
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  );

  // Choisir le bon empty state
  const emptyState = type === 'estimate' ? <EmptyEstimates /> : <EmptyInvoices />;

  return (
    <>
      {/* Toolbar responsive */}
      <div className="mb-6 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div className="flex flex-wrap items-center gap-2">
          {/* <Button onClick={onAdd}>
            {type === 'estimate' ? (
              <>
                <DocumentTextIcon className="h-5 w-5 mr-1" /> Nouveau devis
              </>
            ) : (
              <>
                <CurrencyDollarIcon className="h-5 w-5 mr-1" /> Nouvelle facture
              </>
            )}
          </Button> */}
          <Button  onClick={onExport}>
            Exporter
          </Button>
          <div className="relative flex-1 sm:flex-none">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher…"
              className="h-10 w-full sm:w-64 px-3 pl-10 border rounded-lg"
            />
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-10 w-full sm:w-40 px-3 pr-8 border rounded-lg appearance-none"
            >
              <option value="">Tous statuts</option>
              {statuses.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <div className="relative">
            <select
              value={clientFilter}
              onChange={(e) => setClientFilter(e.target.value)}
              className="h-10 w-full sm:w-40 px-3 pr-8 border rounded-lg appearance-none"
            >
              <option value="">
                {type === 'estimate' ? 'Tous services' : 'Tous vendeurs'}
              </option>
              {clients.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <TableData
        data={filtered}
        columns={columns}
        renderActions={renderActions}
        isDense={false}
        emptyState={emptyState}
      />
    </>
  );
}
