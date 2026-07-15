// src/features/transactions/components/TransactionTable/columns.tsx
// Column definitions are kept separate from the table component itself —
// TanStack Table's column defs are pure configuration, and separating them
// makes the table component's own logic (virtualization, pinning wiring)
// easier to read without 200 lines of cell-renderer JSX interleaved.

import type { ColumnDef } from '@tanstack/react-table';
import type { JSX } from 'react';

import type { CategoryId, Transaction, TransactionCategory } from '@/shared/types';
import { formatCurrency } from '@/shared/utils/currency';
import { formatDate } from '@/shared/utils/date';

export interface TransactionRowActions {
  onEdit: (transaction: Transaction) => void;
  onDelete: (transaction: Transaction) => void;
}

function getTransactionAmountSign(transaction: Transaction): 1 | -1 {
  // Income adds, expense and outgoing transfers subtract. Amount is always
  // stored positive (per the Money contract in shared/types); sign is
  // derived here for display only, never persisted.
  return transaction.type === 'income' ? 1 : -1;
}

function getCategoryLabel(
  categoryId: CategoryId | null,
  categoriesById: ReadonlyMap<CategoryId, TransactionCategory>,
): string {
  if (!categoryId) return '—';
  return categoriesById.get(categoryId)?.name ?? 'Uncategorized';
}

/**
 * Builds the column array. A function rather than a static export because
 * cell renderers need `categoriesById` (for the category name lookup) and
 * `actions` (edit/delete callbacks) from the parent — TanStack Table columns
 * are most cleanly built as a `useMemo`'d call to this function inside the
 * table component, not as module-level constants.
 */
export function buildTransactionColumns(
  categoriesById: ReadonlyMap<CategoryId, TransactionCategory>,
  actions: TransactionRowActions,
): ColumnDef<Transaction>[] {
  return [
    {
      id: 'select',
      size: 44,
      enablePinning: true,
      header: ({ table }) => (
        <input
          type="checkbox"
          aria-label="Select all transactions on this page"
          checked={table.getIsAllPageRowsSelected()}
          ref={(el) => {
            if (el) el.indeterminate = table.getIsSomePageRowsSelected() && !table.getIsAllPageRowsSelected();
          }}
          onChange={table.getToggleAllPageRowsSelectedHandler()}
          className="h-4 w-4 rounded border-border-strong accent-brand-primary"
        />
      ),
      cell: ({ row }) => (
        <input
          type="checkbox"
          aria-label={`Select transaction: ${row.original.description}`}
          checked={row.getIsSelected()}
          onChange={row.getToggleSelectedHandler()}
          className="h-4 w-4 rounded border-border-strong accent-brand-primary"
        />
      ),
    },
    {
      id: 'date',
      accessorKey: 'date',
      header: 'Date',
      size: 100,
      cell: ({ getValue }) => (
        <span className="whitespace-nowrap text-sm text-text-secondary">
          {formatDate(getValue<string>(), 'dayMonth')}
        </span>
      ),
    },
    {
      id: 'description',
      accessorKey: 'description',
      header: 'Description',
      size: 260,
      cell: ({ row }) => (
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-text-primary">
            {row.original.description}
          </p>
          {row.original.type === 'expense' && row.original.merchant && (
            <p className="truncate text-xs text-text-tertiary">{row.original.merchant}</p>
          )}
        </div>
      ),
    },
    {
      id: 'category',
      header: 'Category',
      size: 140,
      cell: ({ row }) => {
        const categoryId = row.original.type === 'transfer' ? null : row.original.categoryId;
        return (
          <span className="truncate text-sm text-text-secondary">
            {row.original.type === 'transfer'
              ? 'Transfer'
              : getCategoryLabel(categoryId, categoriesById)}
          </span>
        );
      },
    },
    {
      id: 'type',
      header: 'Type',
      size: 90,
      cell: ({ row }) => {
        const type = row.original.type;
        const badgeClass =
          type === 'income'
            ? 'badge-positive'
            : type === 'expense'
              ? 'badge-negative'
              : 'badge-neutral';
        return <span className={badgeClass}>{type}</span>;
      },
    },
    {
      id: 'amount',
      accessorKey: 'amount',
      header: () => <span className="block text-right">Amount</span>,
      size: 130,
      enablePinning: true,
      cell: ({ row }) => {
        const sign = getTransactionAmountSign(row.original);
        const formatted = formatCurrency(row.original.amount);
        return (
          <span
            data-numeric="true"
            className={`block text-right text-sm font-semibold ${
              sign === 1 ? 'text-financial-positive' : 'text-financial-negative'
            }`}
          >
            {sign === 1 ? '+' : '−'}
            {formatted}
          </span>
        );
      },
    },
    {
      id: 'actions',
      size: 90,
      enablePinning: true,
      header: () => <span className="sr-only">Actions</span>,
      cell: ({ row }) => (
        <div className="flex items-center justify-end gap-1">
          <button
            type="button"
            onClick={() => actions.onEdit(row.original)}
            aria-label={`Edit transaction: ${row.original.description}`}
            className="rounded-lg p-1.5 text-text-tertiary transition-colors duration-fast hover:bg-subtle hover:text-text-primary"
          >
            <EditIcon />
          </button>
          <button
            type="button"
            onClick={() => actions.onDelete(row.original)}
            aria-label={`Delete transaction: ${row.original.description}`}
            className="rounded-lg p-1.5 text-text-tertiary transition-colors duration-fast hover:bg-subtle hover:text-danger"
          >
            <TrashIcon />
          </button>
        </div>
      ),
    },
  ];
}

function EditIcon(): JSX.Element {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function TrashIcon(): JSX.Element {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
