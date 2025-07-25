'use client';

import { useState, useEffect } from 'react';
import { Heading } from '@/src/components/catalyst/components/heading';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/src/components/catalyst/components/table';
import useSWR from 'swr';
import { EmptyTransactions } from '@/src/components/design/emptyStates/emptyTransactions';
import { Transaction } from 'smp-sdk-ts/dist/controllers/paymentController';

interface TransactionOrganizationProps {
  organizationID: string;
  initialData?: {
    buyerTransactions: Transaction[];
    sellerTransactions: Transaction[];
  };
}

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function TransactionOrganization({ organizationID, initialData }: TransactionOrganizationProps) {
  const { data, error, isLoading } = useSWR(
    `/api/organization/${organizationID}/accounting/transactions`,
    fetcher,
    {
      fallbackData: initialData
    }
  );

  if (error) return <div>Erreur lors du chargement des transactions</div>;
  if (isLoading && !initialData) return <div>Chargement...</div>;

  const transactions = [...(data?.buyerTransactions || []), ...(data?.sellerTransactions || [])];

  return (
    <div className="space-y-6">
      <Heading level={3}>Transactions récentes</Heading>
      <Table className="mt-4 [--gutter:--spacing(6)] lg:[--gutter:--spacing(10)]">
        <TableHead>
          <TableRow>
            <TableHeader>Transaction ID</TableHeader>
            <TableHeader>Date</TableHeader>
            <TableHeader>Type</TableHeader>
            <TableHeader className="text-right">Montant</TableHeader>
            <TableHeader>Statut</TableHeader>
          </TableRow>
        </TableHead>
        <TableBody>
          {transactions && transactions.length > 0 ? (
            transactions.map((transaction) => (
              <TableRow 
                key={transaction.transactionId}
                className="hover:bg-gray-50"
              >
                <TableCell>{transaction.transactionId}</TableCell>
                <TableCell>{new Date(transaction.createdAt).toLocaleDateString()}</TableCell>
                <TableCell>
                  {transaction.buyerOrganizationId === organizationID ? 'Achat' : 'Vente'}
                </TableCell>
                <TableCell className="text-right">{transaction.amount} {transaction.currency}</TableCell>
                <TableCell>{transaction.status}</TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={5} className="py-8">
                <EmptyTransactions />
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
} 