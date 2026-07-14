// src/features/budgets/components/BudgetCard/BudgetCard.tsx
// The SVG progress ring is hand-rolled (stroke-dasharray math), not a
// charting-library gauge — Recharts doesn't have a clean radial-progress
// primitive, and pulling in a whole chart library for one ring per card
// (rendered up to a few dozen times on the budgets page) is worse for
// performance than ~15 lines of SVG math.

import type { JSX } from 'react';

import type { Budget, MinorUnits, TransactionCategory } from '@/shared/types';
import { getBudgetStatus } from '@/shared/types';
import { formatCurrency } from '@/shared/utils/currency';
import { cn } from '@/shared/utils/cn';

export interface BudgetCardProps {
  budget: Budget;
  category: TransactionCategory | undefined;
  onEdit: (budget: Budget) => void;
  onDelete: (budget: Budget) => void;
}

const RING_RADIUS = 36;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

const STATUS_STYLES = {
  on_track: { ring: 'stroke-financial-positive', badge: 'badge-positive', label: 'On track' },
  approaching_limit: { ring: 'stroke-financial-neutral', badge: 'badge-neutral', label: 'Approaching limit' },
  over_budget: { ring: 'stroke-financial-negative', badge: 'badge-negative', label: 'Over budget' },
} as const;

export function BudgetCard({ budget, category, onEdit, onDelete }: BudgetCardProps): JSX.Element {
  const status = getBudgetStatus(budget);
  const styles = STATUS_STYLES[status];

  // Ratio is clamped to [0, 1] for the ring's visual fill — an over-budget
  // spend (ratio > 1) still shows a FULL ring rather than overflowing the
  // circle geometry; the "how far over" magnitude is conveyed by the
  // badge + amount text below, not by the ring shape itself.
  const rawRatio = budget.currentSpend.amount / budget.limit.amount;
  const clampedRatio = Math.min(Math.max(rawRatio, 0), 1);
  const strokeDashoffset = RING_CIRCUMFERENCE * (1 - clampedRatio);

  const remaining = {
    amount: (budget.limit.amount - budget.currentSpend.amount) as MinorUnits,
    currency: budget.limit.currency,
  };

  return (
    <div className="glass-surface rounded-2xl p-5">
      <div className="flex items-start justify-between">
        <div className="min-w-0">
          <p className="truncate font-display text-base font-semibold text-text-primary">
            {category?.name ?? 'Uncategorized'}
          </p>
          <p className="mt-0.5 text-xs capitalize text-text-tertiary">{budget.period}</p>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onEdit(budget)}
            aria-label={`Edit ${category?.name ?? 'budget'} budget`}
            className="rounded-lg p-1.5 text-text-tertiary transition-colors duration-fast hover:bg-subtle hover:text-text-primary"
          >
            <EditIcon />
          </button>
          <button
            type="button"
            onClick={() => onDelete(budget)}
            aria-label={`Delete ${category?.name ?? 'budget'} budget`}
            className="rounded-lg p-1.5 text-text-tertiary transition-colors duration-fast hover:bg-subtle hover:text-danger"
          >
            <TrashIcon />
          </button>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-4">
        <svg
          width="88"
          height="88"
          viewBox="0 0 88 88"
          className="shrink-0 -rotate-90"
          role="img"
          aria-label={`${Math.round(clampedRatio * 100)}% of budget used`}
        >
          <circle
            cx="44"
            cy="44"
            r={RING_RADIUS}
            fill="none"
            strokeWidth="8"
            className="stroke-border-subtle"
          />
          <circle
            cx="44"
            cy="44"
            r={RING_RADIUS}
            fill="none"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={RING_CIRCUMFERENCE}
            strokeDashoffset={strokeDashoffset}
            className={cn('transition-[stroke-dashoffset] duration-slower ease-decelerate', styles.ring)}
          />
        </svg>

        <div className="min-w-0 flex-1">
          <p data-numeric="true" className="text-lg font-semibold text-text-primary">
            {formatCurrency(budget.currentSpend)}
          </p>
          <p className="text-xs text-text-secondary">
            of {formatCurrency(budget.limit)} limit
          </p>
          <span className={cn('mt-2 inline-block', styles.badge)}>{styles.label}</span>
        </div>
      </div>

      {status !== 'over_budget' && (
        <p className="mt-3 text-xs text-text-tertiary">
          {formatCurrency(remaining)} remaining this {budget.period.replace('ly', '')}
        </p>
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

function TrashIcon(): JSX.Element {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
