// src/features/transactions/api/useTransactionsQuery.ts

import { keepPreviousData, useQuery } from '@tanstack/react-query';

import type { FetchTransactionsParams } from '../services/transactionsService';
import { fetchTransactions } from '../services/transactionsService';
import { transactionKeys } from './queryKeys';

export function useTransactionsQuery(params: FetchTransactionsParams) {
  return useQuery({
    queryKey: transactionKeys.list(params),
    queryFn: () => fetchTransactions(params),
    // Keeps the PREVIOUS page's data visible (not a loading skeleton) while
    // the next page fetches — critical for the paginated table: without
    // this, clicking "next page" on a virtualized 10k-row table flashes an
    // empty/skeleton state on every single page turn, which reads as janky
    // rather than premium.
    placeholderData: keepPreviousData,
  });
}
