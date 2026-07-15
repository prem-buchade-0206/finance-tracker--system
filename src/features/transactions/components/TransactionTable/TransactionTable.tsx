// src/features/transactions/components/TransactionTable/TransactionTable.tsx
// TanStack Table v8 (headless logic: sorting, selection, pinning) composed
// with @tanstack/react-virtual (row virtualization) — these are two
// separate libraries that don't know about each other; this component is
// the integration point that makes a 10k-row table render only the ~20
// DOM rows actually in the viewport while table state (selection, sort,
// pinned columns) still behaves as if all rows were rendered normally.

import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type SortingState,
} from '@tanstack/react-table';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useMemo, useRef, useState, type JSX } from 'react';

import type { CategoryId, Transaction, TransactionCategory } from '@/shared/types';
import { cn } from '@/shared/utils/cn';

import { buildTransactionColumns, type TransactionRowActions } from './columns';

export interface TransactionTableProps {
  transactions: readonly Transaction[];
  categoriesById: ReadonlyMap<CategoryId, TransactionCategory>;
  isLoading: boolean;
  actions: TransactionRowActions;
  selectedIds: readonly string[];
  onSelectionChange: (ids: readonly string[]) => void;
}

const ROW_HEIGHT_PX = 56;
const OVERSCAN_ROWS = 8;

export function TransactionTable({
  transactions,
  categoriesById,
  isLoading,
  actions,
  selectedIds,
  onSelectionChange,
}: TransactionTableProps): JSX.Element {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [sorting, setSorting] = useState<SortingState>([{ id: 'date', desc: true }]);

  const columns = useMemo(
    () => buildTransactionColumns(categoriesById, actions),
    [categoriesById, actions],
  );

  // TanStack Table's row-selection state is keyed by row.id, which we set
  // to the transaction's actual id (via getRowId below) — this keeps
  // selectedIds a plain string[] that the parent (bulk-delete toolbar) can
  // pass straight to the bulk-delete mutation without translating between
  // table-internal row indices and real transaction ids.
  const rowSelection = useMemo(
    () => Object.fromEntries(selectedIds.map((id) => [id, true])),
    [selectedIds],
  );

  const table = useReactTable({
    data: transactions as Transaction[],
    columns,
    state: { sorting, rowSelection },
    onSortingChange: setSorting,
    onRowSelectionChange: (updater) => {
      const next = typeof updater === 'function' ? updater(rowSelection) : updater;
      onSelectionChange(Object.keys(next).filter((key) => next[key]));
    },
    getRowId: (row) => row.id,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    enableRowSelection: true,
    columnResizeMode: 'onChange',
    initialState: {
      columnPinning: { left: ['select'], right: ['amount', 'actions'] },
    },
  });

  const { rows } = table.getRowModel();

  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => scrollContainerRef.current,
    estimateSize: () => ROW_HEIGHT_PX,
    overscan: OVERSCAN_ROWS,
  });

  const virtualRows = rowVirtualizer.getVirtualItems();
  const totalSize = rowVirtualizer.getTotalSize();
  const paddingTop = virtualRows[0]?.start ?? 0;
  const paddingBottom = totalSize - (virtualRows[virtualRows.length - 1]?.end ?? 0);

  if (isLoading && transactions.length === 0) {
    return <TransactionTableSkeleton />;
  }

  if (!isLoading && transactions.length === 0) {
    return <TransactionTableEmptyState />;
  }

  return (
    <div className="glass-surface overflow-hidden rounded-2xl">
      <div ref={scrollContainerRef} className="max-h-[70dvh] overflow-auto">
        <table className="w-full border-collapse">
          <thead className="sticky top-0 z-sticky bg-surface">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="border-b border-border-default">
                {headerGroup.headers.map((header) => {
                  const isPinnedLeft = header.column.getIsPinned() === 'left';
                  const isPinnedRight = header.column.getIsPinned() === 'right';
                  return (
                    <th
                      key={header.id}
                      style={{ width: header.getSize() }}
                      className={cn(
                        'px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-text-tertiary',
                        header.column.getCanSort() && 'cursor-pointer select-none',
                        (isPinnedLeft || isPinnedRight) && 'sticky z-sticky bg-surface',
                        isPinnedLeft && 'left-0',
                        isPinnedRight && 'right-0',
                      )}
                      onClick={header.column.getToggleSortingHandler()}
                      aria-sort={
                        header.column.getIsSorted() === 'asc'
                          ? 'ascending'
                          : header.column.getIsSorted() === 'desc'
                            ? 'descending'
                            : 'none'
                      }
                    >
                      <span className="inline-flex items-center gap-1">
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {header.column.getIsSorted() === 'asc' && <SortAscIcon />}
                        {header.column.getIsSorted() === 'desc' && <SortDescIcon />}
                      </span>
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>

          <tbody>
            {paddingTop > 0 && (
              <tr aria-hidden="true">
                <td style={{ height: paddingTop }} colSpan={columns.length} />
              </tr>
            )}

            {virtualRows.map((virtualRow) => {
              const row = rows[virtualRow.index];
              if (!row) return null;
              return (
                <tr
                  key={row.id}
                  data-index={virtualRow.index}
                  className={cn(
                    'border-b border-border-subtle transition-colors duration-fast',
                    row.getIsSelected() ? 'bg-brand-primary/5' : 'hover:bg-subtle',
                  )}
                  style={{ height: ROW_HEIGHT_PX }}
                >
                  {row.getVisibleCells().map((cell) => {
                    const isPinnedLeft = cell.column.getIsPinned() === 'left';
                    const isPinnedRight = cell.column.getIsPinned() === 'right';
                    return (
                      <td
                        key={cell.id}
                        style={{ width: cell.column.getSize() }}
                        className={cn(
                          'px-3 py-2 align-middle',
                          (isPinnedLeft || isPinnedRight) &&
                            'sticky z-base bg-inherit',
                          isPinnedLeft && 'left-0',
                          isPinnedRight && 'right-0',
                        )}
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    );
                  })}
                </tr>
              );
            })}

            {paddingBottom > 0 && (
              <tr aria-hidden="true">
                <td style={{ height: paddingBottom }} colSpan={columns.length} />
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------------
// Loading / empty states
// ----------------------------------------------------------------------------

function TransactionTableSkeleton(): JSX.Element {
  return (
    <div className="glass-surface space-y-2 rounded-2xl p-4">
      {Array.from({ length: 8 }).map((_, index) => (
        <div key={`tx-row-skeleton-${index}`} className="skeleton h-12 rounded-lg" />
      ))}
    </div>
  );
}

function TransactionTableEmptyState(): JSX.Element {
  return (
    <div className="glass-surface flex flex-col items-center justify-center rounded-2xl px-6 py-16 text-center">
      <p className="font-display text-lg font-semibold text-text-primary">
        No transactions found
      </p>
      <p className="mt-1 max-w-sm text-sm text-text-secondary">
        Try adjusting your filters, or add your first transaction to get
        started.
      </p>
    </div>
  );
}

function SortAscIcon(): JSX.Element {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 19V5M5 12l7-7 7 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SortDescIcon(): JSX.Element {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 5v14M5 12l7 7 7-7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
