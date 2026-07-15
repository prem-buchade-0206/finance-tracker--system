// src/features/transactions/api/useTransactionMutations.ts
// All write operations for the transactions feature. Grouped in one file
// (rather than 4 separate hook files) because they share the exact same
// invalidation target (transactionKeys.lists()) and it's easier to keep
// that consistent when it's visible in one place rather than duplicated
// across four files that could drift.

import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { Transaction, TransactionId } from '@/shared/types';

import {
  bulkDeleteTransactions,
  createTransaction,
  deleteTransaction,
  updateTransaction,
} from '../services/transactionsService';
import type { TransactionFormValues } from '../validation/transactionSchema';
import { transactionKeys } from './queryKeys';

export function useCreateTransactionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: TransactionFormValues) => createTransaction(payload),
    onSuccess: () => {
      // Invalidate all list queries regardless of their filter params —
      // a new transaction could affect any filtered view (it might match
      // the current filters, might not; simplest correct behavior is
      // "any list might now be stale," not trying to predict which ones).
      void queryClient.invalidateQueries({ queryKey: transactionKeys.lists() });
    },
  });
}

export function useUpdateTransactionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: TransactionId; payload: TransactionFormValues }) =>
      updateTransaction(id, payload),
    onSuccess: (updated) => {
      void queryClient.invalidateQueries({ queryKey: transactionKeys.lists() });
      queryClient.setQueryData(transactionKeys.detail(updated.id), updated);
    },
  });
}

export function useDeleteTransactionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: TransactionId) => deleteTransaction(id),

    // Optimistic removal: a delete should feel instant in a table UI —
    // waiting for the round trip before removing the row makes the app
    // feel slow for an operation that (almost always) succeeds.
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: transactionKeys.lists() });

      const previousLists = queryClient.getQueriesData<{
        items: Transaction[];
        meta: unknown;
      }>({ queryKey: transactionKeys.lists() });

      // Remove the transaction from every cached list snapshot currently
      // held, across all filter/pagination variants — not just the one
      // the user is looking at, so switching tabs doesn't reveal the
      // "deleted" row still present in a different filtered view's cache.
      previousLists.forEach(([queryKey, data]) => {
        if (!data) return;
        queryClient.setQueryData(queryKey, {
          ...data,
          items: data.items.filter((tx) => tx.id !== id),
        });
      });

      return { previousLists };
    },

    onError: (_error, _id, context) => {
      // Roll back every snapshot exactly as captured — a partial rollback
      // (e.g. only restoring the currently-visible list) would leave other
      // cached views permanently missing a transaction that still exists.
      context?.previousLists.forEach(([queryKey, data]) => {
        queryClient.setQueryData(queryKey, data);
      });
    },

    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: transactionKeys.lists() });
    },
  });
}

export function useBulkDeleteTransactionsMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ids: readonly TransactionId[]) => bulkDeleteTransactions(ids),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: transactionKeys.lists() });
    },
  });
}
