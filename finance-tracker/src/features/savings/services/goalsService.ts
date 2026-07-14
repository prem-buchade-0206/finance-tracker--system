// src/features/savings/services/goalsService.ts

import { axiosClient } from '@/shared/api/axiosClient';
import type { GoalId, SavingsGoal } from '@/shared/types';

import type { GoalFormValues } from '../validation/goalSchema';

const BASE_PATH = '/savings-goals';

export async function fetchGoals(): Promise<readonly SavingsGoal[]> {
  const response = await axiosClient.get<readonly SavingsGoal[]>(BASE_PATH);
  return response.data;
}

export async function createGoal(payload: GoalFormValues): Promise<SavingsGoal> {
  const response = await axiosClient.post<SavingsGoal>(BASE_PATH, payload);
  return response.data;
}

export async function updateGoal(id: GoalId, payload: GoalFormValues): Promise<SavingsGoal> {
  const response = await axiosClient.put<SavingsGoal>(`${BASE_PATH}/${id}`, payload);
  return response.data;
}

export async function deleteGoal(id: GoalId): Promise<void> {
  await axiosClient.delete(`${BASE_PATH}/${id}`);
}

/** Dedicated endpoint for the common "add a contribution" action — kept
 *  distinct from the general updateGoal so the UI's most frequent
 *  interaction (quick-add ₹X to a goal) doesn't require sending the goal's
 *  full editable payload (name, icon, color, etc.) just to bump one number. */
export async function contributeToGoal(id: GoalId, amountMinorUnits: number): Promise<SavingsGoal> {
  const response = await axiosClient.post<SavingsGoal>(`${BASE_PATH}/${id}/contribute`, {
    amount: amountMinorUnits,
  });
  return response.data;
}
