// src/features/transactions/pages/TransactionsPage.tsx
// Full end-to-end wiring: useTransactionsQuery drives the table, the modal
// handles both create and edit via a single `editingTransaction` piece of
// state, and CSV export operates on the currently-loaded page's rows.
// Accounts/categories come from MOCK_ACCOUNTS/MOCK_CATEGORIES for now (see
// utils/mockReferenceData.ts) until those feature modules exist.

import { useMemo, useState, type JSX } from 'react';

import { Button } from '@/shared/components/Button';
import { ConfirmDialog } from '@/shared/components/ConfirmDialog';
import type { Transaction, TransactionId } from '@/shared/types';
import { buildExportFilename, exportToCsv, moneyColumn, dateColumn, textColumn } from '@/shared/utils/csvExport';

import { AddEditTransactionModal } from '../components/AddEditTransactionModal';
import { TransactionTable } from '../components/TransactionTable';
import { useTransactionsQuery } from '../api/useTransactionsQuery';
import {
  useBulkDeleteTransactionsMutation,
  useCreateTransactionMutation,
  useDeleteTransactionMutation,
  useUpdateTransactionMutation,
} from '../api/useTransactionMutations';
import { MOCK_ACCOUNTS, MOCK_CATEGORIES, MOCK_CATEGORIES_BY_ID } from '../utils/mockReferenceData';

const PAGE_SIZE = 50;

export default function TransactionsPage(): JSX.Element {
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<readonly string[]>([]);
  const [modalState, setModalState] = useState<
    { mode: 'closed' } | { mode: 'create' } | { mode: 'edit'; transaction: Transaction }
  >({ mode: 'closed' });
  const [pendingDelete, setPendingDelete] = useState<Transaction | null>(null);
  const [pendingBulkDelete, setPendingBulkDelete] = useState(false);

  const queryParams = useMemo(
    () => ({
      filters: {},
      page,
      pageSize: PAGE_SIZE,
      sortField: 'date',
      sortDirection: 'desc' as const,
    }),
    [page],
  );

  const { data, isLoading, isFetching } = useTransactionsQuery(queryParams);

  const createMutation = useCreateTransactionMutation();
  const updateMutation = useUpdateTransactionMutation();
  const deleteMutation = useDeleteTransactionMutation();
  const bulkDeleteMutation = useBulkDeleteTransactionsMutation();

  const transactions = data?.items ?? [];
  const meta = data?.meta;

  function handleAdd(): void {
    setModalState({ mode: 'create' });
  }

  function handleEdit(transaction: Transaction): void {
    setModalState({ mode: 'edit', transaction });
  }

  function handleDelete(transaction: Transaction): void {
    setPendingDelete(transaction);
  }

  function confirmSingleDelete(): void {
    if (!pendingDelete) return;
    void deleteMutation.mutateAsync(pendingDelete.id).then(() => {
      setPendingDelete(null);
    });
  }

  function handleBulkDelete(): void {
    setPendingBulkDelete(true);
  }

  function confirmBulkDelete(): void {
    void bulkDeleteMutation.mutateAsync(selectedIds as TransactionId[]).then(() => {
      setSelectedIds([]);
      setPendingBulkDelete(false);
    });
  }

  async function handleModalSubmit(values: Parameters<typeof createMutation.mutateAsync>[0]): Promise<void> {
    if (modalState.mode === 'edit') {
      await updateMutation.mutateAsync({ id: modalState.transaction.id, payload: values });
    } else {
      await createMutation.mutateAsync(values);
    }
  }

  function handleExportCsv(): void {
    exportToCsv(
      transactions,
      [
        dateColumn<Transaction>('Date', (tx) => tx.date),
        textColumn<Transaction>('Description', (tx) => tx.description),
        textColumn<Transaction>('Type', (tx) => tx.type),
        moneyColumn<Transaction>('Amount', (tx) => tx.amount),
      ],
      { filename: buildExportFilename('transactions', 'csv') },
    );
  }

  const isModalOpen = modalState.mode !== 'closed';
  const editingTransaction = modalState.mode === 'edit' ? modalState.transaction : undefined;
  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold text-text-primary">Transactions</h1>
          <p className="mt-1 text-sm text-text-secondary">
            {meta ? `${meta.totalItems} transactions` : 'Loading…'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={handleExportCsv} disableMagnetic>
            Export CSV
          </Button>
          <Button onClick={handleAdd}>Add transaction</Button>
        </div>
      </div>

      {selectedIds.length > 0 && (
        <div className="mt-4 flex items-center justify-between rounded-xl bg-brand-primary/10 px-4 py-2.5">
          <span className="text-sm font-medium text-text-primary">
            {selectedIds.length} selected
          </span>
          <Button
            variant="danger"
            size="sm"
            onClick={handleBulkDelete}
            isLoading={bulkDeleteMutation.isPending}
            disableMagnetic
          >
            Delete selected
          </Button>
        </div>
      )}

      <div className="mt-6">
        <TransactionTable
          transactions={transactions}
          categoriesById={MOCK_CATEGORIES_BY_ID}
          isLoading={isLoading}
          actions={{ onEdit: handleEdit, onDelete: handleDelete }}
          selectedIds={selectedIds}
          onSelectionChange={setSelectedIds}
        />
      </div>

      {meta && meta.totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            disableMagnetic
          >
            Previous
          </Button>
          <span className="text-sm text-text-secondary">
            Page {meta.page} of {meta.totalPages} {isFetching && '· updating…'}
          </span>
          <Button
            variant="ghost"
            size="sm"
            disabled={page >= meta.totalPages}
            onClick={() => setPage((p) => p + 1)}
            disableMagnetic
          >
            Next
          </Button>
        </div>
      )}

      <AddEditTransactionModal
        isOpen={isModalOpen}
        onClose={() => setModalState({ mode: 'closed' })}
        editingTransaction={editingTransaction}
        accounts={MOCK_ACCOUNTS}
        categories={MOCK_CATEGORIES}
        onSubmit={handleModalSubmit}
        isSubmitting={isSubmitting}
      />

      <ConfirmDialog
        isOpen={pendingDelete !== null}
        onClose={() => setPendingDelete(null)}
        onConfirm={confirmSingleDelete}
        title="Delete transaction?"
        description={
          pendingDelete
            ? `This will permanently remove "${pendingDelete.description}". This can't be undone.`
            : ''
        }
        confirmLabel="Delete"
        tone="danger"
        isConfirming={deleteMutation.isPending}
      />

      <ConfirmDialog
        isOpen={pendingBulkDelete}
        onClose={() => setPendingBulkDelete(false)}
        onConfirm={confirmBulkDelete}
        title={`Delete ${selectedIds.length} transactions?`}
        description="This will permanently remove all selected transactions. This can't be undone."
        confirmLabel="Delete all"
        tone="danger"
        isConfirming={bulkDeleteMutation.isPending}
      />
    </div>
  );
}
