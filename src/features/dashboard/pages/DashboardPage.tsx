// src/features/dashboard/pages/DashboardPage.tsx
// Composes StatCards (net worth / income / expenses / savings rate),
// CashflowChart, and RecentTransactions into the landing view. All figures
// currently derive from mockDashboardData.ts + budgets/transactions mock
// data — see this file's imports for exactly which pieces are still mocked
// and what replaces each one.

import { useMemo, type JSX } from 'react';

import { StatCard } from '../components/StatCard';
import { CashflowChart } from '../components/CashflowChart';
import { RecentTransactions } from '../components/RecentTransactions';
import {
  MOCK_CASHFLOW_DATA,
  MOCK_DASHBOARD_CATEGORIES_BY_ID,
  MOCK_RECENT_TRANSACTIONS,
} from '../utils/mockDashboardData';
import { formatCurrency } from '@/shared/utils/currency';
import type { MinorUnits } from '@/shared/types';

export default function DashboardPage(): JSX.Element {
  const { totalIncome, totalExpense, netCashflow, savingsRatePercent } = useMemo(() => {
    const income = MOCK_CASHFLOW_DATA.reduce((sum, point) => sum + point.income, 0);
    const expense = MOCK_CASHFLOW_DATA.reduce((sum, point) => sum + point.expense, 0);
    const net = income - expense;
    const rate = income > 0 ? (net / income) * 100 : 0;
    return { totalIncome: income, totalExpense: expense, netCashflow: net, savingsRatePercent: rate };
  }, []);

  // Net worth would normally come from summing all account balances (a
  // dedicated accounts query) — hardcoded here since the accounts feature
  // doesn't exist yet, consistent with every other mock-data flag in this
  // codebase so far.
  const netWorth = 55600000 as MinorUnits;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="font-display text-2xl font-semibold text-text-primary">Dashboard</h1>
      <p className="mt-1 text-sm text-text-secondary">
        Your financial overview for the last 14 days.
      </p>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Net worth"
          value={formatCurrency({ amount: netWorth, currency: 'INR' })}
        />
        <StatCard
          label="Income (14d)"
          value={formatCurrency({ amount: totalIncome as MinorUnits, currency: 'INR' })}
          changePercent={8.2}
        />
        <StatCard
          label="Expenses (14d)"
          value={formatCurrency({ amount: totalExpense as MinorUnits, currency: 'INR' })}
          changePercent={-3.4}
          invertChangeColor
        />
        <StatCard
          label="Savings rate"
          value={`${Math.round(savingsRatePercent)}%`}
          changePercent={netCashflow >= 0 ? 2.1 : -2.1}
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <CashflowChart data={MOCK_CASHFLOW_DATA} isLoading={false} />
        </div>
        <div>
          <RecentTransactions
            transactions={MOCK_RECENT_TRANSACTIONS}
            categoriesById={MOCK_DASHBOARD_CATEGORIES_BY_ID}
            isLoading={false}
          />
        </div>
      </div>
    </div>
  );
}
