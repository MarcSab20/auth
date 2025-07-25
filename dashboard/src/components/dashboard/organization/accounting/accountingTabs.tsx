'use client';

import { useState } from 'react';
import { Button } from '@/src/components/landing-page/Button';
import OrderOrganization from '@/src/components/dashboard/organization/accounting/orderOrganization';
import EstimateOrganization from '@/src/components/dashboard/organization/accounting/estimateOrganization';
import InvoiceOrganization from '@/src/components/dashboard/organization/accounting/invoiceOrganization';

interface AccountingTabsProps {
  organizationID: string;
  view: 'customers' | 'suppliers';
}

export default function AccountingTabs({ organizationID, view }: AccountingTabsProps) {
  const [activeTab, setActiveTab] = useState('estimates');

  const tabs = [
    { id: 'estimates', label: 'Devis' },
    { id: 'invoices', label: 'Factures' },
    { id: 'orders', label: 'Commandes' },
  ];

  function classNames(...classes: string[]) {
    return classes.filter(Boolean).join(' ');
  }

  return (
    <div className="space-y-6 mb-20">
      <div className="flex space-x-6 border-b mt-20 pb-4">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={classNames(
              activeTab === tab.id
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-blue-600',
              'text-base font-medium border-b-2 pb-2'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="mb-20">
        {activeTab === 'estimates' && <EstimateOrganization organizationID={organizationID} view={view} />}
        {activeTab === 'invoices' && <InvoiceOrganization organizationID={organizationID} view={view} />}
        {activeTab === 'orders' && <OrderOrganization organizationID={organizationID} view={view} />}
      </div>
    </div>
  );
} 