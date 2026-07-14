// src/features/savings/components/GoalCard/GoalCard.tsx

import { useState, type JSX } from 'react';

import { Button } from '@/shared/components/Button';
import { CurrencyInput } from '@/shared/components/Input';
import type { MinorUnits, SavingsGoal } from '@/shared/types';
import { formatCurrency } from '@/shared/utils/currency';
import { formatDate, parseISODate } from '@/shared/utils/date';
import { cn } from '@/shared/utils/cn';

export interface GoalCardProps {
  goal: SavingsGoal;
  onEdit: (goal: SavingsGoal) => void;
  onDelete: (goal: SavingsGoal) => void;
  onContribute: (goal: SavingsGoal, amount: MinorUnits) => void;
  isContributing: boolean;
}

export function GoalCard({
  goal,
  onEdit,
  onDelete,
  onContribute,
  isContributing,
}: GoalCardProps): JSX.Element {
  const [isContributeOpen, setIsContributeOpen] = useState(false);
  const [contributeAmount, setContributeAmount] = useState<MinorUnits>(0 as MinorUnits);

  const progressRatio = Math.min(goal.currentAmount.amount / goal.targetAmount.amount, 1);
  const progressPercent = Math.round(progressRatio * 100);

  const daysRemaining = goal.targetDate
    ? Math.ceil((parseISODate(goal.targetDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null;

  function handleContributeSubmit(): void {
    if (contributeAmount <= 0) return;
    onContribute(goal, contributeAmount);
    setContributeAmount(0 as MinorUnits);
    setIsContributeOpen(false);
  }

  return (
    <div className="glass-surface rounded-2xl p-5">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <span
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-lg"
            style={{ backgroundColor: `${goal.colorTag}20`, color: goal.colorTag }}
            aria-hidden="true"
          >
            🎯
          </span>
          <div className="min-w-0">
            <p className="truncate font-display text-base font-semibold text-text-primary">
              {goal.name}
            </p>
            {goal.isCompleted ? (
              <span className="badge-positive mt-0.5 inline-block">Completed</span>
            ) : (
              daysRemaining !== null && (
                <p className="mt-0.5 text-xs text-text-tertiary">
                  {daysRemaining > 0 ? `${daysRemaining} days left` : 'Target date passed'}
                </p>
              )
            )}
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onEdit(goal)}
            aria-label={`Edit ${goal.name} goal`}
            className="rounded-lg p-1.5 text-text-tertiary transition-colors duration-fast hover:bg-subtle hover:text-text-primary"
          >
            <EditIcon />
          </button>
          <button
            type="button"
            onClick={() => onDelete(goal)}
            aria-label={`Delete ${goal.name} goal`}
            className="rounded-lg p-1.5 text-text-tertiary transition-colors duration-fast hover:bg-subtle hover:text-danger"
          >
            <TrashIcon />
          </button>
        </div>
      </div>

      <div className="mt-4">
        <div className="flex items-baseline justify-between">
          <span data-numeric="true" className="text-lg font-semibold text-text-primary">
            {formatCurrency(goal.currentAmount)}
          </span>
          <span className="text-xs text-text-tertiary">
            of {formatCurrency(goal.targetAmount)}
          </span>
        </div>

        <div className="mt-2 h-2 overflow-hidden rounded-full bg-subtle">
          <div
            className={cn(
              'h-full rounded-full transition-[width] duration-slower ease-decelerate',
              goal.isCompleted ? 'bg-financial-positive' : 'bg-brand-primary',
            )}
            style={{ width: `${progressPercent}%` }}
            role="progressbar"
            aria-valuenow={progressPercent}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`${progressPercent}% of goal reached`}
          />
        </div>
        <p className="mt-1 text-xs text-text-tertiary">{progressPercent}% funded</p>
      </div>

      {!goal.isCompleted && (
        <div className="mt-4">
          {isContributeOpen ? (
            <div className="flex items-end gap-2">
              <CurrencyInput
                value={contributeAmount}
                onChange={setContributeAmount}
                currency={goal.targetAmount.currency}
                size="sm"
                containerClassName="flex-1"
                hideLabel
                label="Contribution amount"
              />
              <Button
                size="sm"
                onClick={handleContributeSubmit}
                isLoading={isContributing}
                disableMagnetic
              >
                Add
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsContributeOpen(false)}
                disableMagnetic
              >
                Cancel
              </Button>
            </div>
          ) : (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsContributeOpen(true)}
              disableMagnetic
              className="w-full"
            >
              Add contribution
            </Button>
          )}
        </div>
      )}

      {goal.targetDate && (
        <p className="mt-3 text-xs text-text-tertiary">
          Target: {formatDate(goal.targetDate, 'medium')}
        </p>
      )}
    </div>
  );
}

function EditIcon(): JSX.Element {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function TrashIcon(): JSX.Element {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
