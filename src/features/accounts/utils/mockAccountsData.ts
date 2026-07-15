// src/features/accounts/utils/mockAccountsData.ts
// TEMPORARY — same pattern as every other feature. This is now the
// CANONICAL mock account list; transactions/utils/mockReferenceData.ts's
// MOCK_ACCOUNTS is a duplicate that predates this feature's existence and
// should be deleted in favor of importing useAccountsQuery (or, until the
// real endpoint exists, this file) once that cleanup pass happens — flagged
// here rather than silently left as two diverging sources of truth.

import type { Account, AccountId, UserId } from '@/shared/types';

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
    creditLimit: { amount: 5000000, currency: 'INR' },
    colorTag: '#8b5cf6',
    isArchived: false,
    createdAt: '2026-01-01T00:00:00.000Z' as never,
    updatedAt: '2026-07-01T00:00:00.000Z' as never,
  },
];
