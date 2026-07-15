// src/features/analytics/pages/AnalyticsPage.tsx

import type { JSX } from 'react';

import { CategoryBreakdownChart } from '../components/CategoryBreakdownChart';
import { NetWorthTrendChart } from '../components/NetWorthTrendChart';
import { MOCK_CATEGORY_BREAKDOWN, MOCK_NET_WORTH_TREND } from '../utils/mockAnalyticsData';

export default function AnalyticsPage(): JSX.Element {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="font-display text-2xl font-semibold text-text-primary">Analytics</h1>
      <p className="mt-1 text-sm text-text-secondary">
        Spending patterns and net worth over time.
      </p>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <CategoryBreakdownChart data={MOCK_CATEGORY_BREAKDOWN} isLoading={false} />
        <NetWorthTrendChart data={MOCK_NET_WORTH_TREND} isLoading={false} />
      </div>
    </div>
  );
}
