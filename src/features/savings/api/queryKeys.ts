// src/features/savings/api/queryKeys.ts

export const goalKeys = {
  all: ['savings-goals'] as const,
  lists: () => [...goalKeys.all, 'list'] as const,
  detail: (id: string) => [...goalKeys.all, 'detail', id] as const,
};
