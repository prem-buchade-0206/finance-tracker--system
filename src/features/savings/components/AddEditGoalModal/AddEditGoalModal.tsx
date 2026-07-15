// src/features/savings/components/AddEditGoalModal/AddEditGoalModal.tsx

import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, type JSX } from 'react';
import { Controller, useForm } from 'react-hook-form';

import { Button } from '@/shared/components/Button';
import { CurrencyInput, Input } from '@/shared/components/Input';
import { Modal } from '@/shared/components/Modal';
import type { MinorUnits, SavingsGoal } from '@/shared/types';

import { goalFormSchema, type GoalFormValues } from '../../validation/goalSchema';

export interface AddEditGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingGoal?: SavingsGoal;
  onSubmit: (values: GoalFormValues) => Promise<void>;
  isSubmitting: boolean;
}

const GOAL_COLOR_PRESETS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#f43f5e', '#06b6d4'];

function buildDefaultValues(editingGoal: SavingsGoal | undefined): GoalFormValues {
  if (!editingGoal) {
    return {
      name: '',
      targetAmount: { amount: 0 as MinorUnits, currency: 'INR' },
      currentAmount: { amount: 0 as MinorUnits, currency: 'INR' },
      targetDate: null,
      linkedAccountId: null,
      icon: 'Target',
      colorTag: GOAL_COLOR_PRESETS[0]!,
    };
  }
  return {
    name: editingGoal.name,
    targetAmount: editingGoal.targetAmount,
    currentAmount: editingGoal.currentAmount,
    targetDate: editingGoal.targetDate,
    linkedAccountId: editingGoal.linkedAccountId,
    icon: editingGoal.icon,
    colorTag: editingGoal.colorTag,
  };
}

export function AddEditGoalModal({
  isOpen,
  onClose,
  editingGoal,
  onSubmit,
  isSubmitting,
}: AddEditGoalModalProps): JSX.Element {
  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<GoalFormValues>({
    resolver: zodResolver(goalFormSchema),
    defaultValues: buildDefaultValues(editingGoal),
  });

  useEffect(() => {
    if (isOpen) reset(buildDefaultValues(editingGoal));
  }, [isOpen, editingGoal, reset]);

  const handleFormSubmit = handleSubmit(async (values) => {
    await onSubmit(values);
    onClose();
  });

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingGoal ? 'Edit savings goal' : 'Create savings goal'}
      size="sm"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disableMagnetic>
            Cancel
          </Button>
          <Button type="submit" form="goal-form" isLoading={isSubmitting} disableMagnetic>
            {editingGoal ? 'Save changes' : 'Create goal'}
          </Button>
        </>
      }
    >
      <form id="goal-form" onSubmit={(e) => void handleFormSubmit(e)} className="space-y-4">
        <Input label="Goal name" placeholder="e.g. Emergency fund" error={errors.name?.message} {...register('name')} />

        <Controller
          name="targetAmount"
          control={control}
          render={({ field }) => (
            <CurrencyInput
              label="Target amount"
              value={field.value.amount}
              currency={field.value.currency}
              onChange={(amount) => field.onChange({ ...field.value, amount })}
              error={errors.targetAmount?.amount?.message}
              size="lg"
            />
          )}
        />

        <Controller
          name="currentAmount"
          control={control}
          render={({ field }) => (
            <CurrencyInput
              label="Starting amount"
              value={field.value.amount}
              currency={field.value.currency}
              onChange={(amount) => field.onChange({ ...field.value, amount })}
              error={errors.currentAmount?.amount?.message}
              helperText="How much you've already saved toward this goal"
            />
          )}
        />

        <Input
          label="Target date"
          type="date"
          helperText="Optional"
          {...register('targetDate')}
        />

        <div>
          <span className="mb-1.5 block text-sm font-medium text-text-primary">Color</span>
          <Controller
            name="colorTag"
            control={control}
            render={({ field }) => (
              <div className="flex gap-2">
                {GOAL_COLOR_PRESETS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => field.onChange(color)}
                    aria-label={`Select color ${color}`}
                    aria-pressed={field.value === color}
                    className={`h-8 w-8 rounded-full transition-transform duration-fast ${
                      field.value === color ? 'scale-110 ring-2 ring-offset-2 ring-offset-surface' : ''
                    }`}
                    style={{ backgroundColor: color, ...(field.value === color && { boxShadow: `0 0 0 2px ${color}` }) }}
                  />
                ))}
              </div>
            )}
          />
        </div>
      </form>
    </Modal>
  );
}
