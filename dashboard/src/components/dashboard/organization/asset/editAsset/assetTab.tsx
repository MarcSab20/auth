// src/components/update/asset/AssetTabsTable.tsx
'use client';

import React from 'react';

interface AssetTabsTableProps {
  activeTab: 'details' | 'prix' | 'description' | 'services';
  onTabChange: (tab: 'details' | 'prix' | 'description' | 'services') => void;
}

const AssetTabsTable: React.FC<AssetTabsTableProps> = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'details' as const, label: 'Détails' },
    { id: 'prix' as const, label: 'Prix' },
    { id: 'description' as const, label: 'Description' },
    { id: 'services' as const, label: 'Services' },
  ];

  return (
    <div className="mt-8 flex space-x-6 border-b pb-4">
      {tabs.map((tab) => (
        <a
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`text-base font-medium border-b-2 pb-2 cursor-pointer ${
            activeTab === tab.id
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-600 hover:text-blue-600'
          }`}
        >
          {tab.label}
        </a>
      ))}
    </div>
  );
};

export default AssetTabsTable;
