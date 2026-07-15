// src/features/budgets/api/useBudgetsQuery.ts

import { useQuery } from '@tanstack/react-query';

import { fetchBudgets } from '../services/budgetsService';
import { budgetKeys } from './queryKeys';

export function useBudgetsQuery() {
  return useQuery({
    queryKey: budgetKeys.lists(),
    queryFn: fetchBudgets,
    // Budgets change less often than transactions (a user sets them up once
    // and mostly just watches currentSpend accumulate via the backend as
    // new transactions are categorized) — a longer staleTime than the
    // global default avoids refetching the whole budget list on every
    // dashboard/budgets-page navigation.
    staleTime: 2 * 60 * 1000,
  });
}
