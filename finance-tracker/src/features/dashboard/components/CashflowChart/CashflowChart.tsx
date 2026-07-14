// src/features/dashboard/components/CashflowChart/CashflowChart.tsx

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type TooltipProps,
} from 'recharts';
import type { JSX } from 'react';

import type { CashflowDataPoint } from '@/shared/types';
import { formatCurrency } from '@/shared/utils/currency';
import { formatDate } from '@/shared/utils/date';

export interface CashflowChartProps {
  data: readonly CashflowDataPoint[];
  isLoading: boolean;
}

export function CashflowChart({ data, isLoading }: CashflowChartProps): JSX.Element {
  if (isLoading) {
    return <div className="skeleton h-80 rounded-2xl" />;
  }

  if (data.length === 0) {
    return (
      <div className="glass-surface flex h-80 flex-col items-center justify-center rounded-2xl px-6 text-center">
        <p className="text-sm text-text-secondary">
          Not enough data yet to show a cashflow trend.
        </p>
      </div>
    );
  }

  // Recharts consumes gradient colors as raw hex strings passed to <stop>,
  // not CSS custom properties — SVG gradient defs render outside the
  // normal DOM cascade Tailwind/CSS variables operate in, same underlying
  // reason pdfExport.ts hardcodes token values with a comment. Mirrored
  // here: keep these in sync with --color-financial-positive/negative in
  // tokens.css if the palette changes.
  const INCOME_COLOR = '#10b981'; // --primitive-emerald-500
  const EXPENSE_COLOR = '#f43f5e'; // --primitive-rose-500

  return (
    <div className="glass-surface rounded-2xl p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-display text-base font-semibold text-text-primary">Cashflow</h3>
        <Legend />
      </div>

      <ResponsiveContainer width="100%" height={280}>
        <AreaChart data={data as CashflowDataPoint[]} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={INCOME_COLOR} stopOpacity={0.35} />
              <stop offset="95%" stopColor={INCOME_COLOR} stopOpacity={0} />
            </linearGradient>
            <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={EXPENSE_COLOR} stopOpacity={0.35} />
              <stop offset="95%" stopColor={EXPENSE_COLOR} stopOpacity={0} />
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--chart-grid-line)" />

          <XAxis
            dataKey="date"
            tickFormatter={(value: string) => formatDate(value as never, 'dayMonth')}
            tick={{ fill: 'var(--chart-axis-text)', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tickFormatter={(value: number) =>
              formatCurrency({ amount: value, currency: 'INR' } as never, {
                compact: true,
              })
            }
            tick={{ fill: 'var(--chart-axis-text)', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            width={56}
          />

          <Tooltip content={<CashflowTooltip />} />

          <Area
            type="monotone"
            dataKey="income"
            stroke={INCOME_COLOR}
            strokeWidth={2}
            fill="url(#incomeGradient)"
          />
          <Area
            type="monotone"
            dataKey="expense"
            stroke={EXPENSE_COLOR}
            strokeWidth={2}
            fill="url(#expenseGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

function Legend(): JSX.Element {
  return (
    <div className="flex items-center gap-4 text-xs text-text-secondary">
      <span className="flex items-center gap-1.5">
        <span className="h-2 w-2 rounded-full bg-financial-positive" /> Income
      </span>
      <span className="flex items-center gap-1.5">
        <span className="h-2 w-2 rounded-full bg-financial-negative" /> Expense
      </span>
    </div>
  );
}

function CashflowTooltip({ active, payload, label }: TooltipProps<number, string>): JSX.Element | null {
  if (!active || !payload || payload.length === 0) return null;

  return (
    <div className="glass-surface-strong rounded-xl px-3.5 py-2.5 shadow-lg">
      <p className="mb-1.5 text-xs font-medium text-text-secondary">
        {formatDate(label as never, 'medium')}
      </p>
      {payload.map((entry) => (
        <p key={entry.dataKey} className="flex items-center justify-between gap-4 text-sm">
          <span className="capitalize text-text-secondary">{entry.dataKey}</span>
          <span data-numeric="true" className="font-semibold text-text-primary">
            {formatCurrency({ amount: entry.value ?? 0, currency: 'INR' } as never)}
          </span>
        </p>
      ))}
    </div>
  );
}
