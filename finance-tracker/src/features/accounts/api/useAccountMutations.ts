// src/features/accounts/api/useAccountMutations.ts

import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { AccountId } from '@/shared/types';

import { archiveAccount, createAccount, updateAccount } from '../services/accountsService';
import type { AccountFormValues } from '../validation/accountSchema';
import { accountKeys } from './queryKeys';

export function useCreateAccountMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: AccountFormValues) => createAccount(payload),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: accountKeys.lists() }),
  });
}

export function useUpdateAccountMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: AccountId; payload: AccountFormValues }) =>
      updateAccount(id, payload),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: accountKeys.lists() }),
  });
}

export function useArchiveAccountMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: AccountId) => archiveAccount(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: accountKeys.lists() });
      // An archived account can no longer be a valid selection in the
      // transaction form's account Combobox — invalidate transaction lists
      // too so any cached view showing that account's name stays correct
      // if the backend also renames/flags it server-side.
      void queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
  });
}
