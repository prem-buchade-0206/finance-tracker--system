// src/features/budgets/api/queryKeys.ts

export const budgetKeys = {
  all: ['budgets'] as const,
  lists: () => [...budgetKeys.all, 'list'] as const,
  detail: (id: string) => [...budgetKeys.all, 'detail', id] as const,
};
