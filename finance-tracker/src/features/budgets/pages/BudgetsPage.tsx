// src/features/budgets/pages/BudgetsPage.tsx
// Full end-to-end wiring, mirroring TransactionsPage's pattern: query hook
// drives the grid of BudgetCards, one modal handles create/edit, one
// ConfirmDialog gates delete. Categories come from mockReferenceData until
// a real categories source exists (see that file's top comment).

import { useState, type JSX } from 'react';

import { Button } from '@/shared/components/Button';
import { ConfirmDialog } from '@/shared/components/ConfirmDialog';
import type { Budget } from '@/shared/types';

import { useBudgetsQuery } from '../api/useBudgetsQuery';
import {
  useCreateBudgetMutation,
  useDeleteBudgetMutation,
  useUpdateBudgetMutation,
} from '../api/useBudgetMutations';
import { AddEditBudgetModal } from '../components/AddEditBudgetModal';
import { BudgetCard } from '../components/BudgetCard';
import { MOCK_BUDGETS, MOCK_CATEGORIES_BY_ID, MOCK_EXPENSE_CATEGORIES } from '../utils/mockReferenceData';

export default function BudgetsPage(): JSX.Element {
  const [modalState, setModalState] = useState<
    { mode: 'closed' } | { mode: 'create' } | { mode: 'edit'; budget: Budget }
  >({ mode: 'closed' });
  const [pendingDelete, setPendingDelete] = useState<Budget | null>(null);

  const { data, isLoading } = useBudgetsQuery();
  const createMutation = useCreateBudgetMutation();
  const updateMutation = useUpdateBudgetMutation();
  const deleteMutation = useDeleteBudgetMutation();

  // Falls back to MOCK_BUDGETS while the real endpoint doesn't exist yet /
  // returns nothing in dev — same bridging pattern as TransactionsPage,
  // kept visible rather than hidden behind a default in the query hook.
  const budgets = data && data.length > 0 ? data : MOCK_BUDGETS;

  function handleAdd(): void {
    setModalState({ mode: 'create' });
  }

  function handleEdit(budget: Budget): void {
    setModalState({ mode: 'edit', budget });
  }

  function handleDelete(budget: Budget): void {
    setPendingDelete(budget);
  }

  function confirmDelete(): void {
    if (!pendingDelete) return;
    void deleteMutation.mutateAsync(pendingDelete.id).then(() => setPendingDelete(null));
  }

  async function handleModalSubmit(values: Parameters<typeof createMutation.mutateAsync>[0]): Promise<void> {
    if (modalState.mode === 'edit') {
      await updateMutation.mutateAsync({ id: modalState.budget.id, payload: values });
    } else {
      await createMutation.mutateAsync(values);
    }
  }

  const isModalOpen = modalState.mode !== 'closed';
  const editingBudget = modalState.mode === 'edit' ? modalState.budget : undefined;
  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold text-text-primary">Budgets</h1>
          <p className="mt-1 text-sm text-text-secondary">
            Track spending against category limits.
          </p>
        </div>
        <Button onClick={handleAdd}>Create budget</Button>
      </div>

      {isLoading ? (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={`budget-skeleton-${index}`} className="skeleton h-44 rounded-2xl" />
          ))}
        </div>
      ) : budgets.length === 0 ? (
        <div className="glass-surface mt-6 flex flex-col items-center justify-center rounded-2xl px-6 py-16 text-center">
          <p className="font-display text-lg font-semibold text-text-primary">No budgets yet</p>
          <p className="mt-1 max-w-sm text-sm text-text-secondary">
            Create a budget to start tracking spending against a category limit.
          </p>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {budgets.map((budget) => (
            <BudgetCard
              key={budget.id}
              budget={budget}
              category={MOCK_CATEGORIES_BY_ID.get(budget.categoryId)}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      <AddEditBudgetModal
        isOpen={isModalOpen}
        onClose={() => setModalState({ mode: 'closed' })}
        editingBudget={editingBudget}
        expenseCategories={MOCK_EXPENSE_CATEGORIES}
        onSubmit={handleModalSubmit}
        isSubmitting={isSubmitting}
      />

      <ConfirmDialog
        isOpen={pendingDelete !== null}
        onClose={() => setPendingDelete(null)}
        onConfirm={confirmDelete}
        title="Delete budget?"
        description={
          pendingDelete
            ? `This will remove the "${MOCK_CATEGORIES_BY_ID.get(pendingDelete.categoryId)?.name ?? 'this'}" budget. Past spending data is not affected.`
            : ''
        }
        confirmLabel="Delete"
        tone="danger"
        isConfirming={deleteMutation.isPending}
      />
    </div>
  );
}
