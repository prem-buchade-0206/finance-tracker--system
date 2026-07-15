// src/features/budgets/utils/mockReferenceData.ts
// TEMPORARY, same rationale as transactions/utils/mockReferenceData.ts.
// Categories are duplicated here rather than imported from
// features/transactions/utils/mockReferenceData — that file lives inside
// the transactions feature, and eslint.config.js's boundary rule correctly
// blocks deep cross-feature imports even for "just mock data." This
// duplication is itself a signal: categories should become their own
// shared concept (e.g. @/shared/data/categories or a proper categories
// feature both transactions and budgets depend on) rather than living
// inside transactions at all — noted here as the actual next architectural
// step once real API data replaces both mock files.

import type { Budget, BudgetId, CategoryId, TransactionCategory, UserId } from '@/shared/types';

const MOCK_USER_ID = 'usr_dev_placeholder' as UserId;

export const MOCK_EXPENSE_CATEGORIES: readonly TransactionCategory[] = [
  { id: 'cat_groceries' as CategoryId, name: 'Groceries', kind: 'expense', icon: 'ShoppingCart', color: '#f43f5e', parentCategoryId: null, isSystemDefault: true },
  { id: 'cat_dining' as CategoryId, name: 'Dining Out', kind: 'expense', icon: 'Utensils', color: '#fb7185', parentCategoryId: null, isSystemDefault: true },
  { id: 'cat_transport' as CategoryId, name: 'Transport', kind: 'expense', icon: 'Car', color: '#f59e0b', parentCategoryId: null, isSystemDefault: true },
  { id: 'cat_utilities' as CategoryId, name: 'Utilities', kind: 'expense', icon: 'Zap', color: '#fbbf24', parentCategoryId: null, isSystemDefault: true },
  { id: 'cat_entertainment' as CategoryId, name: 'Entertainment', kind: 'expense', icon: 'Film', color: '#a78bfa', parentCategoryId: null, isSystemDefault: true },
];

export const MOCK_CATEGORIES_BY_ID: ReadonlyMap<CategoryId, TransactionCategory> = new Map(
  MOCK_EXPENSE_CATEGORIES.map((c) => [c.id, c]),
);

export const MOCK_BUDGETS: readonly Budget[] = [
  {
    id: 'budget_groceries' as BudgetId,
    userId: MOCK_USER_ID,
    categoryId: 'cat_groceries' as CategoryId,
    period: 'monthly',
    limit: { amount: 1500000, currency: 'INR' },
    currentSpend: { amount: 980000, currency: 'INR' },
    startDate: '2026-07-01' as never,
    rolloverUnused: false,
    alertThresholdPercent: 80,
  },
  {
    id: 'budget_dining' as BudgetId,
    userId: MOCK_USER_ID,
    categoryId: 'cat_dining' as CategoryId,
    period: 'monthly',
    limit: { amount: 800000, currency: 'INR' },
    currentSpend: { amount: 745000, currency: 'INR' },
    startDate: '2026-07-01' as never,
    rolloverUnused: false,
    alertThresholdPercent: 80,
  },
  {
    id: 'budget_transport' as BudgetId,
    userId: MOCK_USER_ID,
    categoryId: 'cat_transport' as CategoryId,
    period: 'monthly',
    limit: { amount: 500000, currency: 'INR' },
    currentSpend: { amount: 612000, currency: 'INR' },
    startDate: '2026-07-01' as never,
    rolloverUnused: false,
    alertThresholdPercent: 80,
  },
];
