"use client";

import React from 'react';
import {
  DocumentTextIcon,
  PrinterIcon,
  DocumentArrowDownIcon,
  CloudArrowUpIcon,
  EyeIcon,
  PlusIcon,
  Cog6ToothIcon,
} from '@heroicons/react/24/outline';
import { useContractStore } from '@/src/store/contractStore';

export default function TopBar() {
  const {
    title,
    clientName,
    status,
    version,
    isSaving,
    lastSaved,
    isVariableDrawerOpen,
    saveContract,
    updateMetadata,
    toggleVariableDrawer,
    addSection,
  } = useContractStore();

  const handleSave = () => {
    saveContract();
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportPDF = () => {
    // Pour l'instant, utilise l'impression du navigateur
    window.print();
  };

  const handlePreview = () => {
    // Ouvre la page de prévisualisation dans un nouvel onglet
    // const previewUrl = `/preview/contracts/${window.location.pathname.split('/').pop()}`;
    const previewUrl = `/preview/contracts/demo`;
    window.open(previewUrl, '_blank');
  };

  const handleStatusChange = (newStatus: string) => {
    updateMetadata({ status: newStatus as any });
  };

  const handleClientNameChange = (newClientName: string) => {
    updateMetadata({ clientName: newClientName });
  };

  return (
    <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between shadow-sm">
      {/* Left side - Action buttons */}
      <div className="flex items-center space-x-2">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isSaving ? (
            <CloudArrowUpIcon className="h-4 w-4 animate-pulse" />
          ) : (
            <DocumentTextIcon className="h-4 w-4" />
          )}
          <span className="text-sm font-medium">
            {isSaving ? 'Sauvegarde...' : 'Sauvegarder'}
          </span>
          {lastSaved && !isSaving && (
            <span className="text-xs text-blue-200">
              {lastSaved.toLocaleTimeString('fr-FR', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          )}
        </button>

        <div className="h-6 w-px bg-gray-300" />

        <button
          onClick={handlePreview}
          className="flex items-center space-x-2 px-3 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
        >
          <EyeIcon className="h-4 w-4" />
          <span className="text-sm">Aperçu</span>
        </button>

        <button
          onClick={handlePrint}
          className="flex items-center space-x-2 px-3 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
        >
          <PrinterIcon className="h-4 w-4" />
          <span className="text-sm">Imprimer</span>
        </button>

        <button
          onClick={handleExportPDF}
          className="flex items-center space-x-2 px-3 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
        >
          <DocumentArrowDownIcon className="h-4 w-4" />
          <span className="text-sm">PDF</span>
        </button>

        <div className="h-6 w-px bg-gray-300" />

        <button
          onClick={() => addSection()}
          className="flex items-center space-x-2 px-3 py-2 text-green-700 bg-green-100 rounded-md hover:bg-green-200 transition-colors"
        >
          <PlusIcon className="h-4 w-4" />
          <span className="text-sm">Section</span>
        </button>

        <button
          onClick={toggleVariableDrawer}
          className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-colors ${
            isVariableDrawerOpen
              ? 'text-orange-700 bg-orange-100 hover:bg-orange-200'
              : 'text-gray-700 bg-gray-100 hover:bg-gray-200'
          }`}
        >
          <Cog6ToothIcon className="h-4 w-4" />
          <span className="text-sm">Variables</span>
        </button>
      </div>

      {/* Center - Document info */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          {/* Retirer l'input du titre du contrat ici */}
        </div>

        <div className="text-gray-400">•</div>

        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={clientName}
            onChange={(e) => handleClientNameChange(e.target.value)}
            placeholder="Nom du client"
            className="text-sm text-gray-600 bg-transparent border-none outline-none focus:bg-white focus:border focus:border-blue-300 focus:rounded px-2 py-1 min-w-0 w-auto max-w-[120px]"
          />
        </div>
      </div>

      {/* Right side - Status and version */}
      <div className="flex items-center space-x-3">
        <select
          value={status}
          onChange={(e) => handleStatusChange(e.target.value)}
          className="text-sm px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="draft">Brouillon</option>
          <option value="review">En révision</option>
          <option value="signed">Signé</option>
          <option value="active">Actif</option>
          <option value="expired">Expiré</option>
        </select>

        <span className="text-sm text-gray-500">v{version}</span>
      </div>
    </div>
  );
} 