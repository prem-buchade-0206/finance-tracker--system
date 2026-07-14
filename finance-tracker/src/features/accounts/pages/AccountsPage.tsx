// src/features/accounts/pages/AccountsPage.tsx

import { useState, type JSX } from 'react';

import { Button } from '@/shared/components/Button';
import { ConfirmDialog } from '@/shared/components/ConfirmDialog';
import type { Account } from '@/shared/types';
import { addMoney, formatCurrency, zeroMoney } from '@/shared/utils/currency';

import { useAccountsQuery } from '../api/useAccountsQuery';
import {
  useArchiveAccountMutation,
  useCreateAccountMutation,
  useUpdateAccountMutation,
} from '../api/useAccountMutations';
import { AccountCard } from '../components/AccountCard';
import { AddEditAccountModal } from '../components/AddEditAccountModal';
import { MOCK_ACCOUNTS } from '../utils/mockAccountsData';

export default function AccountsPage(): JSX.Element {
  const [modalState, setModalState] = useState<
    { mode: 'closed' } | { mode: 'create' } | { mode: 'edit'; account: Account }
  >({ mode: 'closed' });
  const [pendingArchive, setPendingArchive] = useState<Account | null>(null);

  const { data, isLoading } = useAccountsQuery();
  const createMutation = useCreateAccountMutation();
  const updateMutation = useUpdateAccountMutation();
  const archiveMutation = useArchiveAccountMutation();

  const accounts = data && data.length > 0 ? data : MOCK_ACCOUNTS;
  const activeAccounts = accounts.filter((a) => !a.isArchived);

  // Net worth here is a naive sum across accounts that may hold different
  // currencies — addMoney throws on a currency mismatch (see currency.ts),
  // so this only actually works when every account shares one currency.
  // Flagged rather than silently wrong: a correct multi-currency net worth
  // needs an FX-conversion step server-side before summing, which is out
  // of scope for this page as currently built.
  const netWorth = activeAccounts.reduce(
    (sum, account) => addMoney(sum, account.currentBalance),
    zeroMoney('INR'),
  );

  async function handleModalSubmit(values: Parameters<typeof createMutation.mutateAsync>[0]): Promise<void> {
    if (modalState.mode === 'edit') {
      await updateMutation.mutateAsync({ id: modalState.account.id, payload: values });
    } else {
      await createMutation.mutateAsync(values);
    }
  }

  function confirmArchive(): void {
    if (!pendingArchive) return;
    void archiveMutation.mutateAsync(pendingArchive.id).then(() => setPendingArchive(null));
  }

  const isModalOpen = modalState.mode !== 'closed';
  const editingAccount = modalState.mode === 'edit' ? modalState.account : undefined;
  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold text-text-primary">Accounts</h1>
          <p className="mt-1 text-sm text-text-secondary">
            Net worth:{' '}
            <span data-numeric="true" className="font-semibold text-text-primary">
              {formatCurrency(netWorth)}
            </span>
          </p>
        </div>
        <Button onClick={() => setModalState({ mode: 'create' })}>Add account</Button>
      </div>

      {isLoading ? (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={`account-skeleton-${index}`} className="skeleton h-40 rounded-2xl" />
          ))}
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {activeAccounts.map((account) => (
            <AccountCard
              key={account.id}
              account={account}
              onEdit={(a) => setModalState({ mode: 'edit', account: a })}
              onArchive={setPendingArchive}
            />
          ))}
        </div>
      )}

      <AddEditAccountModal
        isOpen={isModalOpen}
        onClose={() => setModalState({ mode: 'closed' })}
        editingAccount={editingAccount}
        onSubmit={handleModalSubmit}
        isSubmitting={isSubmitting}
      />

      <ConfirmDialog
        isOpen={pendingArchive !== null}
        onClose={() => setPendingArchive(null)}
        onConfirm={confirmArchive}
        title="Archive account?"
        description={
          pendingArchive
            ? `"${pendingArchive.name}" will be hidden from active views. Its transaction history is preserved and nothing is deleted.`
            : ''
        }
        confirmLabel="Archive"
        tone="danger"
        isConfirming={archiveMutation.isPending}
      />
    </div>
  );
}
