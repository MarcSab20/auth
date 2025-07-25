'use client';

import { PlusIcon } from '@heroicons/react/20/solid';
import { Link } from '@/src/components/catalyst/components/link';

interface EmptyAssetsProps {
  organizationID: string;
  serviceID?: string;
}

export default function EmptyAssets({ serviceID, organizationID }: EmptyAssetsProps) {
  return (
    <div className="flex items-center justify-center py-10">
      <div className="text-center">
        <div className="mx-auto h-24 w-24 mt-5 opacity-40">
          <img
            src="/images/LOGONOIR.png"
            alt="Aucun asset"
            className="mx-auto"
          />
        </div>
        <h3 className="mt-5 text-sm font-semibold text-gray-900">
          Aucun asset
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          Commencez par créer votre premier asset pour votre Organisation.
        </p>
        <div className="mt-6">
          <Link href={`/account/o/${organizationID}/assets/new`}>
            <button
              type="button"
              className="inline-flex items-center rounded-md bg-black px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-grey focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
            >
              <PlusIcon aria-hidden="true" className="-ml-0.5 mr-1.5 h-5 w-5" />
              Créer un asset
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
} 