// src/features/accounts/services/accountsService.ts

import { axiosClient } from '@/shared/api/axiosClient';
import type { Account, AccountId } from '@/shared/types';

import type { AccountFormValues } from '../validation/accountSchema';

const BASE_PATH = '/accounts';

export async function fetchAccounts(): Promise<readonly Account[]> {
  const response = await axiosClient.get<readonly Account[]>(BASE_PATH);
  return response.data;
}

export async function createAccount(payload: AccountFormValues): Promise<Account> {
  const response = await axiosClient.post<Account>(BASE_PATH, payload);
  return response.data;
}

export async function updateAccount(id: AccountId, payload: AccountFormValues): Promise<Account> {
  const response = await axiosClient.put<Account>(`${BASE_PATH}/${id}`, payload);
  return response.data;
}

/** Archives rather than hard-deletes — an account with transaction history
 *  attached should never be permanently erasable from the UI; archiving
 *  hides it from active views while preserving referential integrity for
 *  every transaction that still points at it. */
export async function archiveAccount(id: AccountId): Promise<void> {
  await axiosClient.post(`${BASE_PATH}/${id}/archive`);
}
