// src/features/analytics/components/CategoryBreakdownChart/CategoryBreakdownChart.tsx
// Donut (not pie) chart — the hollow center is used to display the grand
// total, which a solid pie can't accommodate. Custom legend (not Recharts'
// built-in <Legend>) because the built-in one doesn't support showing the
// percentage-of-total alongside each entry without a custom formatter that
// ends up being roughly the same amount of code as just building it here.

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip, type TooltipProps } from 'recharts';
import type { JSX } from 'react';

import type { CategoryBreakdownSlice } from '@/shared/types';
import { formatCurrency, formatMinorUnits } from '@/shared/utils/currency';

export interface CategoryBreakdownChartProps {
  data: readonly CategoryBreakdownSlice[];
  isLoading: boolean;
}

export function CategoryBreakdownChart({ data, isLoading }: CategoryBreakdownChartProps): JSX.Element {
  if (isLoading) {
    return <div className="skeleton h-80 rounded-2xl" />;
  }

  if (data.length === 0) {
    return (
      <div className="glass-surface flex h-80 flex-col items-center justify-center rounded-2xl px-6 text-center">
        <p className="text-sm text-text-secondary">No spending data for this period yet.</p>
      </div>
    );
  }

  const grandTotal = data.reduce((sum, slice) => sum + slice.total, 0);

  return (
    <div className="glass-surface rounded-2xl p-5">
      <h3 className="mb-4 font-display text-base font-semibold text-text-primary">
        Spending by category
      </h3>

      <div className="flex flex-col items-center gap-6 sm:flex-row">
        <div className="relative h-56 w-56 shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data as CategoryBreakdownSlice[]}
                dataKey="total"
                nameKey="categoryName"
                innerRadius="65%"
                outerRadius="100%"
                paddingAngle={2}
                strokeWidth={0}
              >
                {data.map((slice) => (
                  <Cell key={slice.categoryId} fill={slice.color} />
                ))}
              </Pie>
              <Tooltip content={<CategoryTooltip grandTotal={grandTotal} />} />
            </PieChart>
          </ResponsiveContainer>

          {/* Center total — positioned absolutely over the chart's hollow
              center rather than as an SVG <text> element, since HTML text
              gets font-feature-settings (tabular-nums) and text-wrapping
              behavior "for free" that SVG text requires manual tspan work for. */}
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <span data-numeric="true" className="text-xl font-bold text-text-primary">
              {formatMinorUnits(grandTotal as never, 'INR', { compact: true })}
            </span>
            <span className="text-xs text-text-tertiary">Total spend</span>
          </div>
        </div>

        <ul className="w-full min-w-0 flex-1 space-y-2">
          {data.map((slice) => (
            <li key={slice.categoryId} className="flex items-center justify-between gap-3 text-sm">
              <span className="flex min-w-0 items-center gap-2">
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: slice.color }}
                  aria-hidden="true"
                />
                <span className="truncate text-text-secondary">{slice.categoryName}</span>
              </span>
              <span className="shrink-0 text-right">
                <span data-numeric="true" className="font-medium text-text-primary">
                  {formatMinorUnits(slice.total as never, 'INR')}
                </span>
                <span className="ml-1.5 text-xs text-text-tertiary">
                  {Math.round(slice.percentOfTotal)}%
                </span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function CategoryTooltip({
  active,
  payload,
  grandTotal,
}: TooltipProps<number, string> & { grandTotal: number }): JSX.Element | null {
  if (!active || !payload || payload.length === 0) return null;
  const slice = payload[0]?.payload as CategoryBreakdownSlice | undefined;
  if (!slice) return null;

  const percent = grandTotal > 0 ? Math.round((slice.total / grandTotal) * 100) : 0;

  return (
    <div className="glass-surface-strong rounded-xl px-3.5 py-2.5 shadow-lg">
      <p className="text-xs font-medium text-text-secondary">{slice.categoryName}</p>
      <p data-numeric="true" className="text-sm font-semibold text-text-primary">
        {formatCurrency({ amount: slice.total, currency: 'INR' } as never)} · {percent}%
      </p>
    </div>
  );
}
