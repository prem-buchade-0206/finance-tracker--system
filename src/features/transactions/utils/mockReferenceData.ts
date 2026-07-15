// src/features/transactions/utils/mockReferenceData.ts
// TEMPORARY, explicitly flagged: accounts and categories are their own
// domains (an accounts feature and a categories concept shared across
// budgets/transactions) that haven't been generated yet. Rather than block
// TransactionsPage on building those full features first, this provides
// realistic-shaped static data so the table/modal/mutations can be wired
// and exercised end-to-end NOW. Replace with useAccountsQuery() /
// useCategoriesQuery() once those feature modules exist — every call site
// that imports from this file is meant to be a one-line swap at that point.

import type { Account, AccountId, CategoryId, TransactionCategory, UserId } from '@/shared/types';

const MOCK_USER_ID = 'usr_dev_placeholder' as UserId;

export const MOCK_ACCOUNTS: readonly Account[] = [
  {
    id: 'acc_checking_001' as AccountId,
    userId: MOCK_USER_ID,
    name: 'HDFC Checking',
    type: 'checking',
    institution: 'HDFC Bank',
    currentBalance: { amount: 12450000, currency: 'INR' },
    creditLimit: null,
    colorTag: '#3b82f6',
    isArchived: false,
    createdAt: '2026-01-01T00:00:00.000Z' as never,
    updatedAt: '2026-07-01T00:00:00.000Z' as never,
  },
  {
    id: 'acc_savings_001' as AccountId,
    userId: MOCK_USER_ID,
    name: 'ICICI Savings',
    type: 'savings',
    institution: 'ICICI Bank',
    currentBalance: { amount: 45000000, currency: 'INR' },
    creditLimit: null,
    colorTag: '#10b981',
    isArchived: false,
    createdAt: '2026-01-01T00:00:00.000Z' as never,
    updatedAt: '2026-07-01T00:00:00.000Z' as never,
  },
  {
    id: 'acc_credit_001' as AccountId,
    userId: MOCK_USER_ID,
    name: 'Amex Platinum',
    type: 'credit_card',
    institution: 'American Express',
    currentBalance: { amount: -1850000, currency: 'INR' },
    creditLimit: { amount: 50000000, currency: 'INR' },
    colorTag: '#8b5cf6',
    isArchived: false,
    createdAt: '2026-01-01T00:00:00.000Z' as never,
    updatedAt: '2026-07-01T00:00:00.000Z' as never,
  },
];

export const MOCK_CATEGORIES: readonly TransactionCategory[] = [
  { id: 'cat_salary' as CategoryId, name: 'Salary', kind: 'income', icon: 'Wallet', color: '#10b981', parentCategoryId: null, isSystemDefault: true },
  { id: 'cat_freelance' as CategoryId, name: 'Freelance', kind: 'income', icon: 'Briefcase', color: '#34d399', parentCategoryId: null, isSystemDefault: true },
  { id: 'cat_groceries' as CategoryId, name: 'Groceries', kind: 'expense', icon: 'ShoppingCart', color: '#f43f5e', parentCategoryId: null, isSystemDefault: true },
  { id: 'cat_dining' as CategoryId, name: 'Dining Out', kind: 'expense', icon: 'Utensils', color: '#fb7185', parentCategoryId: null, isSystemDefault: true },
  { id: 'cat_transport' as CategoryId, name: 'Transport', kind: 'expense', icon: 'Car', color: '#f59e0b', parentCategoryId: null, isSystemDefault: true },
  { id: 'cat_utilities' as CategoryId, name: 'Utilities', kind: 'expense', icon: 'Zap', color: '#fbbf24', parentCategoryId: null, isSystemDefault: true },
  { id: 'cat_entertainment' as CategoryId, name: 'Entertainment', kind: 'expense', icon: 'Film', color: '#a78bfa', parentCategoryId: null, isSystemDefault: true },
];

export const MOCK_CATEGORIES_BY_ID: ReadonlyMap<CategoryId, TransactionCategory> = new Map(
  MOCK_CATEGORIES.map((category) => [category.id, category]),
);
