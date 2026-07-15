// src/features/analytics/utils/mockAnalyticsData.ts
// TEMPORARY — same rationale as every other feature's mock data file.
// Real implementation: GET /analytics/category-breakdown?period=X and
// GET /analytics/net-worth-trend, both computed server-side.

import type { CategoryBreakdownSlice, CategoryId, NetWorthDataPoint } from '@/shared/types';

export const MOCK_CATEGORY_BREAKDOWN: readonly CategoryBreakdownSlice[] = [
  { categoryId: 'cat_groceries' as CategoryId, categoryName: 'Groceries', color: '#f43f5e', total: 980000 as never, percentOfTotal: 28 },
  { categoryId: 'cat_dining' as CategoryId, categoryName: 'Dining Out', color: '#fb7185', total: 745000 as never, percentOfTotal: 21 },
  { categoryId: 'cat_transport' as CategoryId, categoryName: 'Transport', color: '#f59e0b', total: 612000 as never, percentOfTotal: 17 },
  { categoryId: 'cat_utilities' as CategoryId, categoryName: 'Utilities', color: '#fbbf24', total: 540000 as never, percentOfTotal: 15 },
  { categoryId: 'cat_entertainment' as CategoryId, categoryName: 'Entertainment', color: '#a78bfa', total: 385000 as never, percentOfTotal: 11 },
  { categoryId: 'cat_other' as CategoryId, categoryName: 'Other', color: '#94a3b8', total: 280000 as never, percentOfTotal: 8 },
];

function monthsAgoISO(monthsAgo: number): string {
  const date = new Date();
  date.setMonth(date.getMonth() - monthsAgo);
  return date.toISOString().slice(0, 10);
}

export const MOCK_NET_WORTH_TREND: readonly NetWorthDataPoint[] = Array.from({ length: 6 }).map(
  (_, index) => {
    const monthsAgo = 5 - index;
    const assets = 58000000 + index * 1800000;
    const liabilities = 6500000 - index * 300000;
    return {
      date: monthsAgoISO(monthsAgo) as never,
      assets: assets as never,
      liabilities: liabilities as never,
      netWorth: (assets - liabilities) as never,
    };
  },
);
