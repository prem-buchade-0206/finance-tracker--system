// src/features/transactions/api/queryKeys.ts
// Centralized query key factory. Every hook in this feature builds its keys
// from here — never an inline `['transactions', ...]` array — so that
// invalidating "all transactions for account X" or "everything" is a single
// well-typed call site, not a hope that every hand-written key array
// happens to match the pattern being invalidated.

import type { FetchTransactionsParams } from '../services/transactionsService';

export const transactionKeys = {
  all: ['transactions'] as const,
  lists: () => [...transactionKeys.all, 'list'] as const,
  list: (params: FetchTransactionsParams) => [...transactionKeys.lists(), params] as const,
  details: () => [...transactionKeys.all, 'detail'] as const,
  detail: (id: string) => [...transactionKeys.details(), id] as const,
};
