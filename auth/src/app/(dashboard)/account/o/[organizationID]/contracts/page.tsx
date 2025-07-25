'use client';

import React, { useState } from 'react';
import { smpClient } from '@/smpClient';
import { ArrowLeftIcon, PlusIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import ContractDrawer from '@/src/components/contract/contractDrawer';

interface Contract {
  contractId: string;
  type: string;
  title: string;
  status: string;
  clientName: string;
  createdAt: string;
  validUntil: string;
  version: string;
}

async function getContracts(organizationID: string): Promise<Contract[]> {
  try {
    // Retourner le contrat demo pour la démonstration
    const demoContract: Contract = {
      contractId: 'demo',
      type: 'consulting',
      title: 'Contrat de Prestation de Services - DEMO',
      status: 'draft',
      clientName: 'Client Demo',
      createdAt: new Date().toISOString(),
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      version: '1.0'
    };
    
    return [demoContract];
  } catch (error) {
    console.error('Error fetching contracts:', error);
    return [];
  }
}

export default function ContractsPage({ params }: { params: { organizationID: string } }) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [contracts, setContracts] = useState<Contract[]>([]);

  React.useEffect(() => {
    const fetchContracts = async () => {
      const data = await getContracts(params.organizationID);
      setContracts(data);
    };
    fetchContracts();
  }, [params.organizationID]);

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-6 flex justify-between items-center">
        <Link
          href={`/account/o/${params.organizationID}`}
          className="inline-flex items-center text-sm font-medium text-gray-600 hover:text-gray-900"
        >
          <ArrowLeftIcon className="mr-2 h-5 w-5" />
          Retour à l'organisation
        </Link>
        <button
          onClick={() => setIsDrawerOpen(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
        >
          <PlusIcon className="mr-2 h-5 w-5" />
          Nouveau contrat
        </button>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {contracts.length === 0 ? (
            <li className="px-6 py-4 text-center text-gray-500">
              Aucun contrat trouvé. Créez votre premier contrat en cliquant sur le bouton "Nouveau contrat".
            </li>
          ) : (
            contracts.map((contract) => (
              <li key={contract.contractId} className="hover:bg-gray-50">
                <div className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {contract.title}
                      </p>
                      <p className="text-sm text-gray-500">
                        Client: {contract.clientName}
                      </p>
                    </div>
                    <div className="ml-4 flex-shrink-0 flex items-center space-x-2">
                      <p className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        contract.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                        contract.status === 'active' ? 'bg-green-100 text-green-800' :
                        contract.status === 'expired' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {contract.status.toUpperCase()}
                      </p>
                    </div>
                  </div>
                  <div className="mt-2 flex justify-between items-end">
                    <div className="text-sm text-gray-500">
                      <p>Type: {contract.type}</p>
                      <p>Version: {contract.version}</p>
                    </div>
                    <div className="text-sm text-gray-500">
                      <p>Créé le: {new Date(contract.createdAt).toLocaleDateString()}</p>
                      <p>Valide jusqu'au: {new Date(contract.validUntil).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="mt-3 flex space-x-2">
                    <Link
                      href={`/account/o/${params.organizationID}/contracts/${contract.contractId}`}
                      className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
                    >
                      Éditer
                    </Link>
                    <Link
                      href={`/preview/contracts/${contract.contractId}`}
                      target="_blank"
                      className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-white bg-blue-600 hover:bg-blue-700"
                    >
                      Aperçu
                    </Link>
                  </div>
                </div>
              </li>
            ))
          )}
        </ul>
      </div>

      <ContractDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        organizationID={params.organizationID}
      />
    </div>
  );
}
