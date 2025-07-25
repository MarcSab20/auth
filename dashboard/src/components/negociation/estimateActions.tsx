'use client';

import React, { useState } from 'react';
import {
  DocumentDuplicateIcon,
  EnvelopeIcon,
  TrashIcon,
  CheckCircleIcon,
  ChatBubbleLeftRightIcon,
  EllipsisHorizontalIcon,
} from '@heroicons/react/24/outline';
import { downloadEstimatePdf } from '@/services/Estimate/downloadEstimatePDF';

// Style commun pour les icônes Heroicons
const iconStyle = { fill: "none", background: "transparent" };

interface EstimateItem {
  id: string;
  title: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: string;
}

interface EstimateActionsData {
  estimateNumber: string;
  items: EstimateItem[];
  from: {
    id: string;
    name: string;
    address: string;
    email: string;
    phone: string;
  };
  to: {
    name: string;
    address: string;
  };
  issueDate: string;
  validUntil: string;
  tax: number;
  subTotal: number;
  total: number;
}

interface EstimateActionsProps {
  estimateData: EstimateActionsData;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  onSendEmail?: () => void;
  onDelete?: () => void;
  onClose?: () => void;
  onNegotiate?: () => void;
}

export default function EstimateActions({
  estimateData,
  status,
  onSendEmail,
  onDelete,
  onClose,
  onNegotiate,
}: EstimateActionsProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Actions disponibles
  const actions = [
    {
      id: 'download',
      icon: <DocumentDuplicateIcon className="h-6 w-6" style={iconStyle} />,
      label: 'Télécharger',
      onClick: () => {
        // Créer une copie des données avec les items paginés
        const paginatedData = {
          ...estimateData,
          id: estimateData.estimateNumber,
          uniqRef: estimateData.estimateNumber,
          clientName: estimateData.to.name,
          negotiable: true,
          stage: 'PENDING',
          dueDate: estimateData.validUntil,
          items: estimateData.items.map(item => ({
            ...item,
            quantity: item.quantity.toString(),
            unitPrice: item.unitPrice.toString(),
            total: (Number(item.quantity) * Number(item.unitPrice)).toString()
          })),
        };
        downloadEstimatePdf(paginatedData);
      },
      isEnabled: true,
    },
    {
      id: 'email',
      icon: <EnvelopeIcon className="h-6 w-6" style={iconStyle} />,
      label: 'Envoyer',
      onClick: onSendEmail || (() => {}),
      isEnabled: !!onSendEmail,
    },
    {
      id: 'negotiate',
      icon: <ChatBubbleLeftRightIcon className="h-6 w-6" style={iconStyle} />,
      label: 'Négocier',
      onClick: onNegotiate || (() => {}),
      isEnabled: status === 'PENDING',
    },
    {
      id: 'close',
      icon: <CheckCircleIcon className="h-6 w-6" style={iconStyle} />,
      label: 'Clore',
      onClick: onClose || (() => {}),
      isEnabled: status === 'PENDING',
    },
    {
      id: 'delete',
      icon: <TrashIcon className="h-6 w-6" style={iconStyle} />,
      label: 'Supprimer',
      onClick: onDelete || (() => {}),
      isEnabled: !!onDelete,
    },
  ];

  return (
    <div
      className="fixed right-6 top-1/4 z-50"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-[#2980FF] text-white p-3 rounded-full shadow-lg hover:bg-[#2470E0] transition-colors"
          aria-label="Ouvrir actions"
        >
          <EllipsisHorizontalIcon className="h-8 w-8" style={iconStyle} />
        </button>
      ) : (
        <div className="bg-white shadow-lg rounded-lg p-3 space-y-2 border border-[#2980FF]">
          {actions.map(({ id, icon, label, onClick, isEnabled }) => (
            <button
              key={id}
              onClick={onClick}
              disabled={!isEnabled}
              className={`flex items-center space-x-2 w-full p-2 rounded-lg transition-colors
                ${isEnabled ? 'hover:bg-gray-100 text-gray-700' : 'text-gray-400 cursor-not-allowed'}`}
            >
              {icon}
              <span className="text-sm font-medium">{label}</span>
            </button>
          ))}
        </div>
      )}


    </div>
  );
}
