// src/features/accounts/components/AccountCard/AccountCard.tsx

import type { JSX } from 'react';

import type { Account } from '@/shared/types';
import { formatCurrency } from '@/shared/utils/currency';
import { cn } from '@/shared/utils/cn';

export interface AccountCardProps {
  account: Account;
  onEdit: (account: Account) => void;
  onArchive: (account: Account) => void;
}

const ACCOUNT_TYPE_LABELS: Record<Account['type'], string> = {
  checking: 'Checking',
  savings: 'Savings',
  credit_card: 'Credit Card',
  cash: 'Cash',
  investment: 'Investment',
  loan: 'Loan',
};

export function AccountCard({ account, onEdit, onArchive }: AccountCardProps): JSX.Element {
  const isNegativeBalance = account.currentBalance.amount < 0;
  const utilizationRatio =
    account.type === 'credit_card' && account.creditLimit
      ? Math.min(Math.abs(account.currentBalance.amount) / account.creditLimit.amount, 1)
      : null;

  return (
    <div className="glass-surface rounded-2xl p-5" style={{ borderTop: `3px solid ${account.colorTag}` }}>
      <div className="flex items-start justify-between">
        <div className="min-w-0">
          <p className="truncate font-display text-base font-semibold text-text-primary">
            {account.name}
          </p>
          <p className="mt-0.5 text-xs text-text-tertiary">
            {account.institution ?? ACCOUNT_TYPE_LABELS[account.type]}
          </p>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onEdit(account)}
            aria-label={`Edit ${account.name}`}
            className="rounded-lg p-1.5 text-text-tertiary transition-colors duration-fast hover:bg-subtle hover:text-text-primary"
          >
            <EditIcon />
          </button>
          <button
            type="button"
            onClick={() => onArchive(account)}
            aria-label={`Archive ${account.name}`}
            className="rounded-lg p-1.5 text-text-tertiary transition-colors duration-fast hover:bg-subtle hover:text-text-primary"
          >
            <ArchiveIcon />
          </button>
        </div>
      </div>

      <p
        data-numeric="true"
        className={cn(
          'mt-4 text-2xl font-semibold',
          isNegativeBalance ? 'text-financial-negative' : 'text-text-primary',
        )}
      >
        {formatCurrency(account.currentBalance)}
      </p>

      <span className="badge-neutral mt-2 inline-block">{ACCOUNT_TYPE_LABELS[account.type]}</span>

      {utilizationRatio !== null && account.creditLimit && (
        <div className="mt-3">
          <div className="h-1.5 overflow-hidden rounded-full bg-subtle">
            <div
              className={cn(
                'h-full rounded-full transition-[width] duration-slower ease-decelerate',
                utilizationRatio > 0.7 ? 'bg-financial-negative' : 'bg-financial-neutral',
              )}
              style={{ width: `${utilizationRatio * 100}%` }}
              role="progressbar"
              aria-valuenow={Math.round(utilizationRatio * 100)}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Credit utilization"
            />
          </div>
          <p className="mt-1 text-xs text-text-tertiary">
            {Math.round(utilizationRatio * 100)}% of {formatCurrency(account.creditLimit)} limit used
          </p>
        </div>
      )}
    </div>
  );
}

function EditIcon(): JSX.Element {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ArchiveIcon(): JSX.Element {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M3 8h18M5 8v11a2 2 0 002 2h10a2 2 0 002-2V8M10 12h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M3 4h18v4H3z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
