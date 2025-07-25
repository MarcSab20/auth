import React from 'react';
import { Button } from '@/src/components/landing-page/Button'

interface ServiceTabsTableProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const tabs = [
  { id: 'prix', label: 'Prix' },
  { id: 'details', label: 'Détails' },
  { id: 'localisation', label: 'Localisation' },
  { id: 'description', label: 'Description' },
  { id: 'tags', label: 'Tags' },
  { id: 'assets', label: 'Assets' },
];

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

const ServiceTabsTable: React.FC<ServiceTabsTableProps> = ({ activeTab, onTabChange }) => {
  return (
    <>
      {/* Menu déroulant mobile */}
      <div className="block sm:hidden mb-4">
        <select
          value={activeTab}
          onChange={e => onTabChange(e.target.value)}
          className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {tabs.map(tab => (
            <option key={tab.id} value={tab.id}>{tab.label}</option>
          ))}
        </select>
      </div>
      {/* Barre d'onglets desktop/tablette */}
      <div className="mt-8 hidden sm:flex space-x-6 border-b pb-4">
        {tabs.map((tab) => (
          <a
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={classNames(
              activeTab === tab.id
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-blue-600',
              'text-base font-medium border-b-2 pb-2 cursor-pointer'
            )}
          >
            {tab.label}
          </a>
        ))}
      </div>
    </>
  );
};

export default ServiceTabsTable;
