// src/features/dashboard/utils/mockDashboardData.ts
// TEMPORARY — same rationale as the transactions/budgets mock data files.
// A real dashboard would fetch this from a dedicated analytics endpoint
// (GET /analytics/cashflow, GET /analytics/net-worth) that does the
// aggregation server-side, NOT by fetching all transactions client-side
// and summing them in the browser — that approach falls over the moment
// transaction count grows past a few thousand. This file exists purely to
// make the dashboard's charts/cards visually complete right now.

import type { CashflowDataPoint, CategoryId, Transaction, TransactionCategory, TransactionId, UserId, AccountId } from '@/shared/types';

function daysAgoISO(daysAgo: number): string {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString().slice(0, 10);
}

export const MOCK_CASHFLOW_DATA: readonly CashflowDataPoint[] = Array.from({ length: 14 }).map(
  (_, index) => {
    const daysAgo = 13 - index;
    const income = daysAgo % 7 === 0 ? 4500000 : 0; // weekly-ish income spike
    const expense = 150000 + Math.round(Math.sin(index) * 60000 + 200000);
    return {
      date: daysAgoISO(daysAgo) as never,
      income: income as never,
      expense: expense as never,
      net: (income - expense) as never,
    };
  },
);

const MOCK_USER_ID = 'usr_dev_placeholder' as UserId;
const MOCK_ACCOUNT_ID = 'acc_checking_001' as AccountId;

export const MOCK_RECENT_TRANSACTIONS: readonly Transaction[] = [
  {
    id: 'tx_recent_1' as TransactionId,
    userId: MOCK_USER_ID,
    accountId: MOCK_ACCOUNT_ID,
    type: 'expense',
    categoryId: 'cat_groceries' as CategoryId,
    merchant: 'Whole Foods',
    isReimbursable: false,
    amount: { amount: 342500, currency: 'INR' },
    date: daysAgoISO(0) as never,
    description: 'Weekly groceries',
    notes: null,
    tags: [],
    attachmentUrl: null,
    isRecurring: false,
    recurringRuleId: null,
    createdAt: new Date().toISOString() as never,
    updatedAt: new Date().toISOString() as never,
  },
  {
    id: 'tx_recent_2' as TransactionId,
    userId: MOCK_USER_ID,
    accountId: MOCK_ACCOUNT_ID,
    type: 'expense',
    categoryId: 'cat_transport' as CategoryId,
    merchant: 'Uber',
    isReimbursable: false,
    amount: { amount: 45000, currency: 'INR' },
    date: daysAgoISO(1) as never,
    description: 'Ride to airport',
    notes: null,
    tags: [],
    attachmentUrl: null,
    isRecurring: false,
    recurringRuleId: null,
    createdAt: new Date(Date.now() - 86400000).toISOString() as never,
    updatedAt: new Date(Date.now() - 86400000).toISOString() as never,
  },
  {
    id: 'tx_recent_3' as TransactionId,
    userId: MOCK_USER_ID,
    accountId: MOCK_ACCOUNT_ID,
    type: 'income',
    categoryId: 'cat_salary' as CategoryId,
    source: 'Acme Corp',
    amount: { amount: 4500000, currency: 'INR' },
    date: daysAgoISO(2) as never,
    description: 'Monthly salary',
    notes: null,
    tags: [],
    attachmentUrl: null,
    isRecurring: true,
    recurringRuleId: null,
    createdAt: new Date(Date.now() - 172800000).toISOString() as never,
    updatedAt: new Date(Date.now() - 172800000).toISOString() as never,
  },
];

export const MOCK_DASHBOARD_CATEGORIES_BY_ID: ReadonlyMap<CategoryId, TransactionCategory> = new Map([
  ['cat_groceries' as CategoryId, { id: 'cat_groceries' as CategoryId, name: 'Groceries', kind: 'expense', icon: 'ShoppingCart', color: '#f43f5e', parentCategoryId: null, isSystemDefault: true }],
  ['cat_transport' as CategoryId, { id: 'cat_transport' as CategoryId, name: 'Transport', kind: 'expense', icon: 'Car', color: '#f59e0b', parentCategoryId: null, isSystemDefault: true }],
  ['cat_salary' as CategoryId, { id: 'cat_salary' as CategoryId, name: 'Salary', kind: 'income', icon: 'Wallet', color: '#10b981', parentCategoryId: null, isSystemDefault: true }],
]);
