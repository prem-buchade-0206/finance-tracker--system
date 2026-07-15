// src/features/budgets/components/AddEditBudgetModal/AddEditBudgetModal.tsx

import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useMemo, type JSX } from 'react';
import { Controller, useForm } from 'react-hook-form';

import { Button } from '@/shared/components/Button';
import { Combobox, type ComboboxOption } from '@/shared/components/Combobox';
import { CurrencyInput, Input } from '@/shared/components/Input';
import { Modal } from '@/shared/components/Modal';
import type { Budget, BudgetPeriod, CategoryId, MinorUnits, TransactionCategory } from '@/shared/types';
import { todayISO } from '@/shared/utils/date';

import { budgetFormSchema, type BudgetFormValues } from '../../validation/budgetSchema';

export interface AddEditBudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingBudget?: Budget;
  /** Only expense-kind categories are relevant — budgets track outgoing
   *  spend, never income. Filtering happens at the call site so this
   *  component doesn't need to know about category `kind` at all. */
  expenseCategories: readonly TransactionCategory[];
  onSubmit: (values: BudgetFormValues) => Promise<void>;
  isSubmitting: boolean;
}

const PERIOD_OPTIONS: ComboboxOption<BudgetPeriod>[] = [
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'yearly', label: 'Yearly' },
];

function buildDefaultValues(editingBudget: Budget | undefined): BudgetFormValues {
  if (!editingBudget) {
    return {
      categoryId: '' as CategoryId,
      period: 'monthly',
      limit: { amount: 0 as MinorUnits, currency: 'INR' },
      startDate: todayISO(),
      rolloverUnused: false,
      alertThresholdPercent: 80,
    };
  }
  return {
    categoryId: editingBudget.categoryId,
    period: editingBudget.period,
    limit: editingBudget.limit,
    startDate: editingBudget.startDate,
    rolloverUnused: editingBudget.rolloverUnused,
    alertThresholdPercent: editingBudget.alertThresholdPercent,
  };
}

export function AddEditBudgetModal({
  isOpen,
  onClose,
  editingBudget,
  expenseCategories,
  onSubmit,
  isSubmitting,
}: AddEditBudgetModalProps): JSX.Element {
  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<BudgetFormValues>({
    resolver: zodResolver(budgetFormSchema),
    defaultValues: buildDefaultValues(editingBudget),
  });

  useEffect(() => {
    if (isOpen) reset(buildDefaultValues(editingBudget));
  }, [isOpen, editingBudget, reset]);

  const categoryOptions = useMemo<ComboboxOption<CategoryId>[]>(
    () => expenseCategories.map((cat) => ({ value: cat.id, label: cat.name })),
    [expenseCategories],
  );

  const handleFormSubmit = handleSubmit(async (values) => {
    await onSubmit(values);
    onClose();
  });

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingBudget ? 'Edit budget' : 'Create budget'}
      size="sm"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disableMagnetic>
            Cancel
          </Button>
          <Button type="submit" form="budget-form" isLoading={isSubmitting} disableMagnetic>
            {editingBudget ? 'Save changes' : 'Create budget'}
          </Button>
        </>
      }
    >
      <form id="budget-form" onSubmit={(e) => void handleFormSubmit(e)} className="space-y-4">
        <Controller
          name="categoryId"
          control={control}
          render={({ field }) => (
            <Combobox
              label="Category"
              options={categoryOptions}
              value={field.value || null}
              onChange={field.onChange}
              error={errors.categoryId?.message}
            />
          )}
        />

        <Controller
          name="limit"
          control={control}
          render={({ field }) => (
            <CurrencyInput
              label="Budget limit"
              value={field.value.amount}
              currency={field.value.currency}
              onChange={(amount) => field.onChange({ ...field.value, amount })}
              error={errors.limit?.amount?.message}
              size="lg"
            />
          )}
        />

        <Controller
          name="period"
          control={control}
          render={({ field }) => (
            <Combobox
              label="Period"
              options={PERIOD_OPTIONS}
              value={field.value}
              onChange={field.onChange}
            />
          )}
        />

        <Input label="Start date" type="date" error={errors.startDate?.message} {...register('startDate')} />

        <Input
          label="Alert threshold (%)"
          type="number"
          min={1}
          max={100}
          helperText="Warn me when spending reaches this percentage of the limit"
          error={errors.alertThresholdPercent?.message}
          {...register('alertThresholdPercent', { valueAsNumber: true })}
        />

        <label className="flex items-center gap-2.5">
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-border-strong accent-brand-primary"
            {...register('rolloverUnused')}
          />
          <span className="text-sm text-text-primary">
            Roll over unused budget to next period
          </span>
        </label>
      </form>
    </Modal>
  );
}
