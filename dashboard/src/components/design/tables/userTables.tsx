// TableUser.tsx
'use client';

import React from 'react';
import {
  Table as CatalystTable,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/src/components/catalyst/components/table';

export type Column<T> = {
  header: string;
  accessor: keyof T | ((row: T) => React.ReactNode);
};

export interface TableUserProps<T> {
  data: T[];
  columns: Column<T>[];
  isDense?: boolean;
  renderActions?: (row: T) => React.ReactNode;
}

export function TableUser<T>({
  data,
  columns,
  isDense = false,
  renderActions,
}: TableUserProps<T>) {
  return (
    <div className={isDense ? 'mt-4 flow-root dense' : 'mt-8 flow-root'}>
      <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
        <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
          <CatalystTable>
            <TableHead>
              <TableRow>
                {columns.map((col) => (
                  <TableHeader key={col.header}>{col.header}</TableHeader>
                ))}
                {renderActions && <TableHeader>Actions</TableHeader>}
              </TableRow>
            </TableHead>
            <TableBody>
              {data.map((row, idx) => (
                <TableRow key={idx as React.Key}>
                  {columns.map((col, cidx) => {
                    const cell =
                      typeof col.accessor === 'function'
                        ? col.accessor(row)
                        : (row as any)[col.accessor];
                    return <TableCell key={cidx as React.Key}>{cell}</TableCell>;
                  })}
                  {renderActions && (
                    <TableCell>{renderActions(row)}</TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </CatalystTable>
        </div>
      </div>
    </div>
  );
}
