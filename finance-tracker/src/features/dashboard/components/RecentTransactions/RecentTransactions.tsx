// src/features/dashboard/components/RecentTransactions/RecentTransactions.tsx
// Intentionally NOT the same component as TransactionTable — this is a
// compact, non-interactive (no sort/select/pin) list for a dashboard
// widget context, showing at most a handful of rows. Reusing the full
// virtualized table here would be substantial unnecessary overhead for
// 5 rows, and would pull in TanStack Table/Virtual on the dashboard route
// even for users who never open the transactions page.

import type { JSX } from 'react';

import type { CategoryId, Transaction, TransactionCategory } from '@/shared/types';
import { formatCurrency } from '@/shared/utils/currency';
import { formatRelativeTime } from '@/shared/utils/date';

export interface RecentTransactionsProps {
  transactions: readonly Transaction[];
  categoriesById: ReadonlyMap<CategoryId, TransactionCategory>;
  isLoading: boolean;
}

export function RecentTransactions({
  transactions,
  categoriesById,
  isLoading,
}: RecentTransactionsProps): JSX.Element {
  if (isLoading) {
    return (
      <div className="glass-surface space-y-2 rounded-2xl p-5">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={`recent-tx-skeleton-${index}`} className="skeleton h-12 rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div className="glass-surface rounded-2xl p-5">
      <h3 className="font-display text-base font-semibold text-text-primary">Recent activity</h3>

      {transactions.length === 0 ? (
        <p className="mt-4 text-sm text-text-secondary">No transactions yet.</p>
      ) : (
        <ul className="mt-3 divide-y divide-border-subtle">
          {transactions.map((tx) => {
            const sign = tx.type === 'income' ? 1 : -1;
            const categoryName =
              tx.type !== 'transfer' ? categoriesById.get(tx.categoryId)?.name : 'Transfer';

            return (
              <li key={tx.id} className="flex items-center justify-between gap-3 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-text-primary">
                    {tx.description}
                  </p>
                  <p className="mt-0.5 text-xs text-text-tertiary">
                    {categoryName ?? 'Uncategorized'} · {formatRelativeTime(tx.createdAt)}
                  </p>
                </div>
                <span
                  data-numeric="true"
                  className={`shrink-0 text-sm font-semibold ${
                    sign === 1 ? 'text-financial-positive' : 'text-financial-negative'
                  }`}
                >
                  {sign === 1 ? '+' : '−'}
                  {formatCurrency(tx.amount)}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
