'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function EstimateNotFound() {
  const params = useParams();
  const organizationID = params.organizationID as string;

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-16 sm:px-6 sm:py-24 md:grid md:place-items-center lg:px-8">
      <div className="max-w-max mx-auto">
        <main className="sm:flex">
          <p className="text-4xl font-bold tracking-tight text-[#2980FF] sm:text-5xl">404</p>
          <div className="sm:ml-6">
            <div className="sm:border-l sm:border-gray-200 sm:pl-6">
              <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">Devis non trouvé</h1>
              <p className="mt-1 text-base text-gray-500">Le devis que vous recherchez n'existe pas ou a été supprimé.</p>
            </div>
            <div className="mt-8 sm:border-l sm:border-transparent sm:pl-6">
              <Link
                href={`/account/o/${organizationID}/estimates`}
                className="inline-flex items-center rounded-md border border-transparent bg-[#2980FF] px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-[#2470e0] focus:outline-none focus:ring-2 focus:ring-[#2980FF] focus:ring-offset-2"
              >
                Retour aux devis
              </Link>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
} 