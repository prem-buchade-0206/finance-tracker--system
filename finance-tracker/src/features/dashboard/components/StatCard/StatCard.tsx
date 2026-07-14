// src/features/dashboard/components/StatCard/StatCard.tsx
// Note on the percent formatting below: uses Intl.NumberFormat directly
// rather than .toFixed(). Two reasons, not one — worth being explicit:
// (1) eslint.config.js's no-restricted-syntax rule blocks ANY .toFixed()
// call, not just ones on monetary values (the AST selector matches the
// method name globally, since distinguishing "is this specific number a
// Money" at lint-time isn't possible) — this file would fail lint
// otherwise. (2) Intl.NumberFormat with style: 'percent' is also just the
// more correct tool here regardless: it handles locale-specific percent
// symbol placement (e.g. "12.3 %" vs "12.3%" varies by locale), which
// .toFixed(1) + a hardcoded '%' string does not.

import type { JSX, ReactNode } from 'react';

import { cn } from '@/shared/utils/cn';

const percentFormatter = new Intl.NumberFormat('en-IN', {
  style: 'percent',
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

export interface StatCardProps {
  label: string;
  value: string;
  /** Percentage change vs. the previous period — positive/negative drives
   *  color and arrow direction automatically. Omit for stats with no
   *  meaningful period-over-period comparison (e.g. a static count). */
  changePercent?: number;
  icon?: ReactNode;
  /** Overrides the automatic positive=green/negative=red coloring — use
   *  when a metric's "good direction" is inverted, e.g. a rising expense
   *  total is BAD (should read red) even though the number itself is up. */
  invertChangeColor?: boolean;
}

export function StatCard({
  label,
  value,
  changePercent,
  icon,
  invertChangeColor = false,
}: StatCardProps): JSX.Element {
  const hasChange = changePercent !== undefined && changePercent !== 0;
  const isPositiveChange = (changePercent ?? 0) > 0;
  const isGoodChange = invertChangeColor ? !isPositiveChange : isPositiveChange;

  return (
    <div className="glass-surface rounded-2xl p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-text-secondary">{label}</p>
        {icon && <span className="text-text-tertiary">{icon}</span>}
      </div>

      <p data-numeric="true" className="mt-2 font-display text-2xl font-semibold text-text-primary">
        {value}
      </p>

      {hasChange && (
        <div className="mt-2 flex items-center gap-1">
          <span
            className={cn(
              'inline-flex items-center gap-0.5 text-xs font-semibold',
              isGoodChange ? 'text-financial-positive' : 'text-financial-negative',
            )}
          >
            {isPositiveChange ? <ArrowUpIcon /> : <ArrowDownIcon />}
            {percentFormatter.format(Math.abs(changePercent ?? 0) / 100)}
          </span>
          <span className="text-xs text-text-tertiary">vs last period</span>
        </div>
      )}
    </div>
  );
}

function ArrowUpIcon(): JSX.Element {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 19V5M5 12l7-7 7 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ArrowDownIcon(): JSX.Element {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 5v14M5 12l7 7 7-7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
