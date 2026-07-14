// src/features/budgets/services/budgetsService.ts

import { axiosClient } from '@/shared/api/axiosClient';
import type { Budget, BudgetId } from '@/shared/types';

import type { BudgetFormValues } from '../validation/budgetSchema';

const BASE_PATH = '/budgets';

export async function fetchBudgets(): Promise<readonly Budget[]> {
  // Unlike transactions, budgets are NOT paginated — a user realistically
  // has single-digit-to-low-dozens of active budgets (one per tracked
  // category), never thousands, so fetching the full list in one request
  // is simpler and avoids building pagination UI nothing will ever need.
  const response = await axiosClient.get<readonly Budget[]>(BASE_PATH);
  return response.data;
}

export async function createBudget(payload: BudgetFormValues): Promise<Budget> {
  const response = await axiosClient.post<Budget>(BASE_PATH, payload);
  return response.data;
}

export async function updateBudget(id: BudgetId, payload: BudgetFormValues): Promise<Budget> {
  const response = await axiosClient.put<Budget>(`${BASE_PATH}/${id}`, payload);
  return response.data;
}

export async function deleteBudget(id: BudgetId): Promise<void> {
  await axiosClient.delete(`${BASE_PATH}/${id}`);
}
