// src/features/analytics/components/NetWorthTrendChart/NetWorthTrendChart.tsx

import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, type TooltipProps } from 'recharts';
import type { JSX } from 'react';

import type { NetWorthDataPoint } from '@/shared/types';
import { formatCurrency } from '@/shared/utils/currency';
import { formatDate } from '@/shared/utils/date';

export interface NetWorthTrendChartProps {
  data: readonly NetWorthDataPoint[];
  isLoading: boolean;
}

// Kept in sync with tokens.css primitives — see the comment in
// CashflowChart.tsx for why these can't be CSS custom properties directly.
const NET_WORTH_COLOR = '#2563eb'; // --primitive-blue-600
const ASSETS_COLOR = '#10b981'; // --primitive-emerald-500
const LIABILITIES_COLOR = '#f43f5e'; // --primitive-rose-500

export function NetWorthTrendChart({ data, isLoading }: NetWorthTrendChartProps): JSX.Element {
  if (isLoading) {
    return <div className="skeleton h-80 rounded-2xl" />;
  }

  if (data.length === 0) {
    return (
      <div className="glass-surface flex h-80 flex-col items-center justify-center rounded-2xl px-6 text-center">
        <p className="text-sm text-text-secondary">Not enough history to chart net worth yet.</p>
      </div>
    );
  }

  return (
    <div className="glass-surface rounded-2xl p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-display text-base font-semibold text-text-primary">Net worth trend</h3>
        <ul className="flex items-center gap-4 text-xs text-text-secondary">
          <LegendItem color={NET_WORTH_COLOR} label="Net worth" />
          <LegendItem color={ASSETS_COLOR} label="Assets" />
          <LegendItem color={LIABILITIES_COLOR} label="Liabilities" />
        </ul>
      </div>

      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={data as NetWorthDataPoint[]} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
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
              formatCurrency({ amount: value, currency: 'INR' } as never, { compact: true })
            }
            tick={{ fill: 'var(--chart-axis-text)', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            width={56}
          />
          <Tooltip content={<NetWorthTooltip />} />
          <Line type="monotone" dataKey="netWorth" stroke={NET_WORTH_COLOR} strokeWidth={2.5} dot={false} />
          <Line type="monotone" dataKey="assets" stroke={ASSETS_COLOR} strokeWidth={1.5} strokeDasharray="4 3" dot={false} />
          <Line type="monotone" dataKey="liabilities" stroke={LIABILITIES_COLOR} strokeWidth={1.5} strokeDasharray="4 3" dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

function LegendItem({ color, label }: { color: string; label: string }): JSX.Element {
  return (
    <li className="flex items-center gap-1.5">
      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} aria-hidden="true" />
      {label}
    </li>
  );
}

function NetWorthTooltip({ active, payload, label }: TooltipProps<number, string>): JSX.Element | null {
  if (!active || !payload || payload.length === 0) return null;

  return (
    <div className="glass-surface-strong rounded-xl px-3.5 py-2.5 shadow-lg">
      <p className="mb-1.5 text-xs font-medium text-text-secondary">
        {formatDate(label as never, 'medium')}
      </p>
      {payload.map((entry) => (
        <p key={entry.dataKey} className="flex items-center justify-between gap-4 text-sm">
          <span className="capitalize text-text-secondary">{String(entry.dataKey)}</span>
          <span data-numeric="true" className="font-semibold text-text-primary">
            {formatCurrency({ amount: entry.value ?? 0, currency: 'INR' } as never)}
          </span>
        </p>
      ))}
    </div>
  );
}
