// src/features/accounts/api/useAccountsQuery.ts
// This is the hook that replaces MOCK_ACCOUNTS in transactions/utils and
// budgets doesn't currently need accounts but would if account-linked
// budgets are added later. Once a real /accounts endpoint exists, every
// `import { MOCK_ACCOUNTS } from '../utils/mockReferenceData'` call site
// swaps to `useAccountsQuery()` — this hook is the target of that swap.

import { useQuery } from '@tanstack/react-query';

import { fetchAccounts } from '../services/accountsService';
import { accountKeys } from './queryKeys';

export function useAccountsQuery() {
  return useQuery({
    queryKey: accountKeys.lists(),
    queryFn: fetchAccounts,
    // Balances update whenever a transaction posts — moderately fresh data
    // matters more here than for budgets, so a shorter staleTime than the
    // budgets feature's 2 minutes.
    staleTime: 60 * 1000,
  });
}
