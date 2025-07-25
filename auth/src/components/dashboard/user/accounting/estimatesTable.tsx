// src/components/dashboard/accounting/EstimatesView.tsx
'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { AccountingTable, Estimate } from '@/src/components/design/tables/accountingTables';

interface EstimatesViewProps {
  estimates: Estimate[];
}

export default function EstimatesView({ estimates }: EstimatesViewProps) {
  const router = useRouter();

  return (
    <AccountingTable
      type="estimate"
      entries={estimates}
      onView={(id) => router.push(`/accounting/estimates/${id}`)}
      onAdd={() => router.push('/accounting/estimates/new')}
      onExport={() => {
        // Implémente ici ton export (CSV, PDF, etc.)
        console.log('Export estimates', estimates);
      }}
    />
  );
}
