// src/components/dashboard/accounting/InvoicesView.tsx
'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { AccountingTable, Invoice } from '@/src/components/design/tables/accountingTables';

interface InvoicesViewProps {
  invoices: Invoice[];
}

export default function InvoicesView({ invoices }: InvoicesViewProps) {
  const router = useRouter();

  return (
    <AccountingTable
      type="invoice"
      entries={invoices}
      onView={(id) => router.push(`/accounting/invoices/${id}`)}
      onAdd={() => router.push('/accounting/invoices/new')}
      onExport={() => {
        
        console.log('Export invoices', invoices);
      }}
    />
  );
}
