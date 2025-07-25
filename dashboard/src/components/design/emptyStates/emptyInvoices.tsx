// src/components/dashboard/accounting/EmptyInvoices.tsx
'use client';

import Link from 'next/link';
import { CurrencyDollarIcon, PlusIcon } from '@heroicons/react/20/solid';


export function EmptyInvoices() {
    return (
      <div className="flex items-center justify-center py-10">
        <div className="text-center">
          <CurrencyDollarIcon className="mx-auto h-16 w-16 text-gray-300 opacity-40" aria-hidden="true" />
          <h3 className="mt-4 text-sm font-semibold text-gray-900">Aucune facture</h3>
          <p className="mt-1 text-sm text-gray-500">Il n’y a aucune facture à afficher.</p>
        </div>
      </div>
    );
  }