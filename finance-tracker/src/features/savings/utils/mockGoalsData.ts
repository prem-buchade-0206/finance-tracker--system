// src/features/savings/utils/mockGoalsData.ts
// TEMPORARY — same bridging pattern as every other feature's mock data.

import type { GoalId, SavingsGoal, UserId } from '@/shared/types';

const MOCK_USER_ID = 'usr_dev_placeholder' as UserId;

export const MOCK_GOALS: readonly SavingsGoal[] = [
  {
    id: 'goal_emergency' as GoalId,
    userId: MOCK_USER_ID,
    name: 'Emergency Fund',
    targetAmount: { amount: 60000000, currency: 'INR' },
    currentAmount: { amount: 42000000, currency: 'INR' },
    targetDate: '2026-12-31' as never,
    linkedAccountId: null,
    icon: 'ShieldCheck',
    colorTag: '#10b981',
    isCompleted: false,
  },
  {
    id: 'goal_japan_trip' as GoalId,
    userId: MOCK_USER_ID,
    name: 'Japan Trip',
    targetAmount: { amount: 25000000, currency: 'INR' },
    currentAmount: { amount: 9500000, currency: 'INR' },
    targetDate: '2027-03-01' as never,
    linkedAccountId: null,
    icon: 'Plane',
    colorTag: '#3b82f6',
    isCompleted: false,
  },
  {
    id: 'goal_new_laptop' as GoalId,
    userId: MOCK_USER_ID,
    name: 'New Laptop',
    targetAmount: { amount: 15000000, currency: 'INR' },
    currentAmount: { amount: 15000000, currency: 'INR' },
    targetDate: null,
    linkedAccountId: null,
    icon: 'Laptop',
    colorTag: '#8b5cf6',
    isCompleted: true,
  },
];
