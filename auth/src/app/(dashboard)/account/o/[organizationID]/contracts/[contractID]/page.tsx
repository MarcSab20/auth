"use client";

import React, { useEffect } from 'react';
import { useParams } from 'next/navigation';
import TopBar from '@/src/components/contract/TopBar';
import Sidebar from '@/src/components/contract/Sidebar';
import EditorPane from '@/src/components/contract/EditorPane';
import VariableDrawer from '@/src/components/contract/VariableDrawer';
import ContractDemo from '@/src/components/contract/demo/ContractDemo';
import { useContractStore } from '@/src/store/contractStore';
import {ContractAIChat} from '@/src/components/contract/ContractAIChat';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

export default function ContractEditorPage() {
  const params = useParams();
  const contractId = params.contractID as string;
  
  const {
    contractId: storeContractId,
    loadContract,
    loadTemplate,
  } = useContractStore();

  // Load contract or template on mount
  useEffect(() => {
    console.log('useEffect contractId', contractId, storeContractId);
    if (contractId && contractId !== storeContractId) {
      if (contractId === 'demo') {
        // Pour la démo, on charge le template demo avec le contenu pré-rempli
        loadTemplate('demo');
      } else {
        // Pour les autres contrats, on essaie de les charger depuis l'API
        loadContract(contractId);
      }
    }
  }, [contractId, storeContractId, loadTemplate, loadContract]);

  return (
    <>
      {/* Import print styles */}
      <link href="/styles/print.css" rel="stylesheet" />
      {/* Titre du contrat et flèche de retour */}
      <div className="flex items-center space-x-3 mt-6 mb-2 px-6">
        <Link href={`/account/o/${params.organizationID}/contracts`}>
          <button className="p-2 rounded hover:bg-gray-100">
            <ArrowLeftIcon className="h-5 w-5 text-gray-600" />
          </button>
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Contrat de prestation de service</h1>
      </div>
      <div className="h-screen flex flex-col bg-gray-50 px10">
        {/* Top navigation bar */}
        <TopBar />
        
        {/* Demo banner toujours visible */}
        {/* <div className="border-b border-gray-200">
          <ContractDemo />
        </div> */}
        
        {/* Main content area */}
        <div className="flex-1 flex overflow-hidden">
          {/* Sidebar with document structure */}
          <Sidebar />
          
          {/* Main editor pane */}
          <EditorPane />
        </div>
        
        {/* Variable drawer (modal) */}
        <VariableDrawer />
        {/* Chatbot IA pour le contrat */}
        <ContractAIChat />
      </div>
    </>
  );
} 