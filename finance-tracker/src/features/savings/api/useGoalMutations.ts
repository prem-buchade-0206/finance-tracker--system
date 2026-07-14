// src/features/savings/api/useGoalMutations.ts

import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { GoalId } from '@/shared/types';

import { contributeToGoal, createGoal, deleteGoal, updateGoal } from '../services/goalsService';
import type { GoalFormValues } from '../validation/goalSchema';
import { goalKeys } from './queryKeys';

export function useCreateGoalMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: GoalFormValues) => createGoal(payload),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: goalKeys.lists() }),
  });
}

export function useUpdateGoalMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: GoalId; payload: GoalFormValues }) => updateGoal(id, payload),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: goalKeys.lists() }),
  });
}

export function useDeleteGoalMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: GoalId) => deleteGoal(id),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: goalKeys.lists() }),
  });
}

export function useContributeToGoalMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, amountMinorUnits }: { id: GoalId; amountMinorUnits: number }) =>
      contributeToGoal(id, amountMinorUnits),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: goalKeys.lists() }),
  });
}
