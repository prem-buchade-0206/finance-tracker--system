// src/features/budgets/api/useBudgetMutations.ts

import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { BudgetId } from '@/shared/types';

import { createBudget, deleteBudget, updateBudget } from '../services/budgetsService';
import type { BudgetFormValues } from '../validation/budgetSchema';
import { budgetKeys } from './queryKeys';

export function useCreateBudgetMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: BudgetFormValues) => createBudget(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: budgetKeys.lists() });
    },
  });
}

export function useUpdateBudgetMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: BudgetId; payload: BudgetFormValues }) =>
      updateBudget(id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: budgetKeys.lists() });
    },
  });
}

export function useDeleteBudgetMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: BudgetId) => deleteBudget(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: budgetKeys.lists() });
    },
  });
}
