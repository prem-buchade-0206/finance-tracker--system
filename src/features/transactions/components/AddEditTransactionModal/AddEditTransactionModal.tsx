// src/features/transactions/components/AddEditTransactionModal/AddEditTransactionModal.tsx
// Wires the shared Modal/CurrencyInput/Combobox primitives to the
// discriminated-union transactionFormSchema. The trickiest part of this
// component is that react-hook-form + a Zod discriminated union works
// cleanly IF the form's `type` field always matches one of the union's
// literal discriminants — switching the segmented control just changes
// `type`, and Zod validates against whichever branch matches on submit.
// Fields belonging to other branches are simply ignored by Zod's parse
// (unknown keys are stripped, not rejected), so there's no need to reset
// the whole form on every type switch.

import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useMemo, type JSX } from 'react';
import { Controller, useForm } from 'react-hook-form';

import { Button } from '@/shared/components/Button';
import { Combobox, type ComboboxOption } from '@/shared/components/Combobox';
import { CurrencyInput } from '@/shared/components/Input';
import { Input } from '@/shared/components/Input';
import { Modal } from '@/shared/components/Modal';
import type {
  Account,
  AccountId,
  CategoryId,
  MinorUnits,
  Transaction,
  TransactionCategory,
} from '@/shared/types';
import { todayISO } from '@/shared/utils/date';

import {
  transactionFormSchema,
  type TransactionFormValues,
} from '../../validation/transactionSchema';

export interface AddEditTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Present when editing; absent (undefined) when creating a new transaction. */
  editingTransaction?: Transaction;
  accounts: readonly Account[];
  categories: readonly TransactionCategory[];
  onSubmit: (values: TransactionFormValues) => Promise<void>;
  isSubmitting: boolean;
}

const TRANSACTION_TYPES = [
  { value: 'expense', label: 'Expense' },
  { value: 'income', label: 'Income' },
  { value: 'transfer', label: 'Transfer' },
] as const;

function buildDefaultValues(
  editingTransaction: Transaction | undefined,
  defaultCurrency: TransactionFormValues['amount']['currency'],
): TransactionFormValues {
  if (!editingTransaction) {
    return {
      type: 'expense',
      accountId: '' as AccountId,
      amount: { amount: 0 as MinorUnits, currency: defaultCurrency },
      date: todayISO(),
      description: '',
      notes: null,
      tags: [],
      attachmentUrl: null,
      isRecurring: false,
      recurringRuleId: null,
      categoryId: '' as CategoryId,
      merchant: null,
      isReimbursable: false,
    };
  }

  const base = {
    accountId: editingTransaction.accountId,
    amount: editingTransaction.amount,
    date: editingTransaction.date,
    description: editingTransaction.description,
    notes: editingTransaction.notes,
    tags: editingTransaction.tags,
    attachmentUrl: editingTransaction.attachmentUrl,
    isRecurring: editingTransaction.isRecurring,
    recurringRuleId: editingTransaction.recurringRuleId,
  };

  if (editingTransaction.type === 'income') {
    return { ...base, type: 'income', categoryId: editingTransaction.categoryId, source: editingTransaction.source };
  }
  if (editingTransaction.type === 'expense') {
    return {
      ...base,
      type: 'expense',
      categoryId: editingTransaction.categoryId,
      merchant: editingTransaction.merchant,
      isReimbursable: editingTransaction.isReimbursable,
    };
  }
  return { ...base, type: 'transfer', toAccountId: editingTransaction.toAccountId, categoryId: null };
}

export function AddEditTransactionModal({
  isOpen,
  onClose,
  editingTransaction,
  accounts,
  categories,
  onSubmit,
  isSubmitting,
}: AddEditTransactionModalProps): JSX.Element {
  const {
    control,
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionFormSchema),
    defaultValues: buildDefaultValues(editingTransaction, 'INR'),
  });

  // Reset the form whenever the modal re-opens for a different transaction
  // (or a fresh "create" after previously editing) — without this, closing
  // an edit modal and immediately opening "Add Transaction" would show the
  // previous transaction's stale values for a frame.
  useEffect(() => {
    if (isOpen) {
      reset(buildDefaultValues(editingTransaction, 'INR'));
    }
  }, [isOpen, editingTransaction, reset]);

  const currentType = watch('type');

  const accountOptions = useMemo<ComboboxOption<AccountId>[]>(
    () => accounts.map((account) => ({ value: account.id, label: account.name })),
    [accounts],
  );

  const categoryOptions = useMemo<ComboboxOption<CategoryId>[]>(
    () =>
      categories
        .filter((cat) => cat.kind === (currentType === 'income' ? 'income' : 'expense'))
        .map((cat) => ({ value: cat.id, label: cat.name })),
    [categories, currentType],
  );

  const handleFormSubmit = handleSubmit(async (values) => {
    await onSubmit(values);
    onClose();
  });

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingTransaction ? 'Edit transaction' : 'Add transaction'}
      size="md"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disableMagnetic>
            Cancel
          </Button>
          <Button
            type="submit"
            form="transaction-form"
            isLoading={isSubmitting}
            disableMagnetic
          >
            {editingTransaction ? 'Save changes' : 'Add transaction'}
          </Button>
        </>
      }
    >
      <form id="transaction-form" onSubmit={(e) => void handleFormSubmit(e)} className="space-y-4">
        {/* Type segmented control */}
        <div className="grid grid-cols-3 gap-1 rounded-xl bg-subtle p-1">
          {TRANSACTION_TYPES.map((option) => (
            <Controller
              key={option.value}
              name="type"
              control={control}
              render={({ field }) => (
                <button
                  type="button"
                  onClick={() => field.onChange(option.value)}
                  className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors duration-fast ${
                    field.value === option.value
                      ? 'bg-surface text-text-primary shadow-sm'
                      : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  {option.label}
                </button>
              )}
            />
          ))}
        </div>

        <Controller
          name="amount"
          control={control}
          render={({ field }) => (
            <CurrencyInput
              label="Amount"
              value={field.value.amount}
              currency={field.value.currency}
              onChange={(minorUnits) => field.onChange({ ...field.value, amount: minorUnits })}
              error={errors.amount?.amount?.message}
              size="lg"
            />
          )}
        />

        <Input label="Description" error={errors.description?.message} {...register('description')} />

        <div className="grid grid-cols-2 gap-4">
          <Controller
            name="accountId"
            control={control}
            render={({ field }) => (
              <Combobox
                label={currentType === 'transfer' ? 'From account' : 'Account'}
                options={accountOptions}
                value={field.value || null}
                onChange={field.onChange}
                error={errors.accountId?.message}
              />
            )}
          />

          {currentType === 'transfer' ? (
            <Controller
              name="toAccountId"
              control={control}
              render={({ field }) => (
                <Combobox
                  label="To account"
                  options={accountOptions}
                  value={field.value || null}
                  onChange={field.onChange}
                  error={(errors as { toAccountId?: { message?: string } }).toAccountId?.message}
                />
              )}
            />
          ) : (
            <Controller
              name="categoryId"
              control={control}
              render={({ field }) => (
                <Combobox
                  label="Category"
                  options={categoryOptions}
                  value={(field.value as CategoryId) || null}
                  onChange={field.onChange}
                  error={(errors as { categoryId?: { message?: string } }).categoryId?.message}
                />
              )}
            />
          )}
        </div>

        <Input label="Date" type="date" error={errors.date?.message} {...register('date')} />

        {currentType === 'expense' && (
          <Input
            label="Merchant"
            placeholder="Optional"
            {...register('merchant' as const)}
          />
        )}

        {currentType === 'income' && (
          <Input label="Source" placeholder="Optional — e.g. employer name" {...register('source' as const)} />
        )}
      </form>
    </Modal>
  );
}
