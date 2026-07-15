// src/features/savings/pages/SavingsPage.tsx

import { useState, type JSX } from 'react';

import { Button } from '@/shared/components/Button';
import { ConfirmDialog } from '@/shared/components/ConfirmDialog';
import type { MinorUnits, SavingsGoal } from '@/shared/types';

import { useGoalsQuery } from '../api/useGoalsQuery';
import {
  useContributeToGoalMutation,
  useCreateGoalMutation,
  useDeleteGoalMutation,
  useUpdateGoalMutation,
} from '../api/useGoalMutations';
import { AddEditGoalModal } from '../components/AddEditGoalModal';
import { GoalCard } from '../components/GoalCard';
import { MOCK_GOALS } from '../utils/mockGoalsData';

export default function SavingsPage(): JSX.Element {
  const [modalState, setModalState] = useState<
    { mode: 'closed' } | { mode: 'create' } | { mode: 'edit'; goal: SavingsGoal }
  >({ mode: 'closed' });
  const [pendingDelete, setPendingDelete] = useState<SavingsGoal | null>(null);

  const { data, isLoading } = useGoalsQuery();
  const createMutation = useCreateGoalMutation();
  const updateMutation = useUpdateGoalMutation();
  const deleteMutation = useDeleteGoalMutation();
  const contributeMutation = useContributeToGoalMutation();

  const goals = data && data.length > 0 ? data : MOCK_GOALS;

  function handleContribute(goal: SavingsGoal, amount: MinorUnits): void {
    void contributeMutation.mutateAsync({ id: goal.id, amountMinorUnits: amount });
  }

  async function handleModalSubmit(values: Parameters<typeof createMutation.mutateAsync>[0]): Promise<void> {
    if (modalState.mode === 'edit') {
      await updateMutation.mutateAsync({ id: modalState.goal.id, payload: values });
    } else {
      await createMutation.mutateAsync(values);
    }
  }

  function confirmDelete(): void {
    if (!pendingDelete) return;
    void deleteMutation.mutateAsync(pendingDelete.id).then(() => setPendingDelete(null));
  }

  const isModalOpen = modalState.mode !== 'closed';
  const editingGoal = modalState.mode === 'edit' ? modalState.goal : undefined;
  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold text-text-primary">Savings Goals</h1>
          <p className="mt-1 text-sm text-text-secondary">
            Track progress toward what you're saving for.
          </p>
        </div>
        <Button onClick={() => setModalState({ mode: 'create' })}>New goal</Button>
      </div>

      {isLoading ? (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={`goal-skeleton-${index}`} className="skeleton h-56 rounded-2xl" />
          ))}
        </div>
      ) : goals.length === 0 ? (
        <div className="glass-surface mt-6 flex flex-col items-center justify-center rounded-2xl px-6 py-16 text-center">
          <p className="font-display text-lg font-semibold text-text-primary">No savings goals yet</p>
          <p className="mt-1 max-w-sm text-sm text-text-secondary">
            Create a goal to start tracking progress toward something you're saving for.
          </p>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {goals.map((goal) => (
            <GoalCard
              key={goal.id}
              goal={goal}
              onEdit={(g) => setModalState({ mode: 'edit', goal: g })}
              onDelete={setPendingDelete}
              onContribute={handleContribute}
              isContributing={contributeMutation.isPending}
            />
          ))}
        </div>
      )}

      <AddEditGoalModal
        isOpen={isModalOpen}
        onClose={() => setModalState({ mode: 'closed' })}
        editingGoal={editingGoal}
        onSubmit={handleModalSubmit}
        isSubmitting={isSubmitting}
      />

      <ConfirmDialog
        isOpen={pendingDelete !== null}
        onClose={() => setPendingDelete(null)}
        onConfirm={confirmDelete}
        title="Delete savings goal?"
        description={
          pendingDelete
            ? `This will delete "${pendingDelete.name}". Your saved progress record will be lost.`
            : ''
        }
        confirmLabel="Delete"
        tone="danger"
        isConfirming={deleteMutation.isPending}
      />
    </div>
  );
}
