// src/components/dashboard/accounting/EmptyEstimates.tsx
'use client';

import Link from 'next/link';
import { DocumentTextIcon, PlusIcon } from '@heroicons/react/20/solid';

export function EmptyEstimates() {
    return (
      <div className="flex items-center justify-center py-10">
        <div className="text-center">
          <DocumentTextIcon className="mx-auto h-16 w-16 text-gray-300 opacity-40" aria-hidden="true" />
          <h3 className="mt-4 text-sm font-semibold text-gray-900">Aucun devis</h3>
          <p className="mt-1 mb-5 text-sm text-gray-500">Pour pouvoir consulter un devis il vous suffit de profiter d'un de nos  nombreux services ! </p>
          <Link href={`/`}>
            <button
              type="button"
              className="inline-flex items-center rounded-md bg-black px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-grey focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
            >
              <PlusIcon aria-hidden="true" className="-ml-0.5 mr-1.5 h-5 w-5" />
              Services
            </button>
          </Link>

        </div>
      </div>
    );
  }