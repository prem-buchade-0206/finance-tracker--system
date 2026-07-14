// src/features/savings/api/useGoalsQuery.ts

import { useQuery } from '@tanstack/react-query';

import { fetchGoals } from '../services/goalsService';
import { goalKeys } from './queryKeys';

export function useGoalsQuery() {
  return useQuery({
    queryKey: goalKeys.lists(),
    queryFn: fetchGoals,
    staleTime: 2 * 60 * 1000,
  });
}
