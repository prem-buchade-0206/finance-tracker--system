// src/app/providers/queryClient.ts
// Single QueryClient instance for the whole app. Defaults are tuned
// specifically for financial data characteristics, not left at TanStack
// Query's generic defaults.

import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Account balances / transaction lists don't change every second —
      // 60s staleTime avoids refetch storms on every route navigation
      // while still feeling "live enough" for a finance dashboard.
      staleTime: 60 * 1000,
      gcTime: 5 * 60 * 1000,

      // Refetch on window focus is valuable here (user tabs back after
      // adding a transaction on their phone) but disabled on reconnect
      // spam — reconnect events can fire repeatedly on flaky mobile networks.
      refetchOnWindowFocus: true,
      refetchOnReconnect: 'always',

      retry: (failureCount, error) => {
        // Never retry 4xx errors (bad request, unauthorized, not found) —
        // retrying a 401 just re-triggers the same auth failure 3 times
        // before the interceptor gets a chance to redirect to login.
        const status = (error as { status?: number } | undefined)?.status;
        if (status && status >= 400 && status < 500) return false;
        return failureCount < 2;
      },
      retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 10000),
    },

    mutations: {
      // Mutations (creating a transaction, updating a budget) should NEVER
      // silently retry — a retried POST could double-write a transaction.
      retry: false,
    },
  },
});
