// src/features/accounts/components/AddEditAccountModal/AddEditAccountModal.tsx

import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, type JSX } from 'react';
import { Controller, useForm } from 'react-hook-form';

import { Button } from '@/shared/components/Button';
import { Combobox, type ComboboxOption } from '@/shared/components/Combobox';
import { CurrencyInput, Input } from '@/shared/components/Input';
import { Modal } from '@/shared/components/Modal';
import type { Account, MinorUnits } from '@/shared/types';

import { ACCOUNT_TYPES, accountFormSchema, type AccountFormValues } from '../../validation/accountSchema';

export interface AddEditAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingAccount?: Account;
  onSubmit: (values: AccountFormValues) => Promise<void>;
  isSubmitting: boolean;
}

const TYPE_OPTIONS: ComboboxOption<AccountFormValues['type']>[] = ACCOUNT_TYPES.map((type) => ({
  value: type,
  label: type.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
}));

const COLOR_PRESETS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#f43f5e', '#06b6d4'];

function buildDefaultValues(editingAccount: Account | undefined): AccountFormValues {
  if (!editingAccount) {
    return {
      name: '',
      type: 'checking',
      institution: null,
      currentBalance: { amount: 0 as MinorUnits, currency: 'INR' },
      creditLimit: null,
      colorTag: COLOR_PRESETS[0]!,
    };
  }
  return {
    name: editingAccount.name,
    type: editingAccount.type,
    institution: editingAccount.institution,
    currentBalance: editingAccount.currentBalance,
    creditLimit: editingAccount.creditLimit,
    colorTag: editingAccount.colorTag,
  };
}

export function AddEditAccountModal({
  isOpen,
  onClose,
  editingAccount,
  onSubmit,
  isSubmitting,
}: AddEditAccountModalProps): JSX.Element {
  const {
    control,
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<AccountFormValues>({
    resolver: zodResolver(accountFormSchema),
    defaultValues: buildDefaultValues(editingAccount),
  });

  useEffect(() => {
    if (isOpen) reset(buildDefaultValues(editingAccount));
  }, [isOpen, editingAccount, reset]);

  const currentType = watch('type');
  const isCreditCard = currentType === 'credit_card';

  const handleFormSubmit = handleSubmit(async (values) => {
    await onSubmit(values);
    onClose();
  });

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingAccount ? 'Edit account' : 'Add account'}
      size="sm"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disableMagnetic>
            Cancel
          </Button>
          <Button type="submit" form="account-form" isLoading={isSubmitting} disableMagnetic>
            {editingAccount ? 'Save changes' : 'Add account'}
          </Button>
        </>
      }
    >
      <form id="account-form" onSubmit={(e) => void handleFormSubmit(e)} className="space-y-4">
        <Input label="Account name" error={errors.name?.message} {...register('name')} />

        <Controller
          name="type"
          control={control}
          render={({ field }) => (
            <Combobox label="Type" options={TYPE_OPTIONS} value={field.value} onChange={field.onChange} />
          )}
        />

        <Input label="Institution" placeholder="Optional — e.g. HDFC Bank" {...register('institution')} />

        <Controller
          name="currentBalance"
          control={control}
          render={({ field }) => (
            <CurrencyInput
              label={isCreditCard ? 'Current balance owed' : 'Current balance'}
              value={field.value.amount}
              currency={field.value.currency}
              onChange={(amount) => field.onChange({ ...field.value, amount })}
              error={errors.currentBalance?.amount?.message}
            />
          )}
        />

        {isCreditCard && (
          <Controller
            name="creditLimit"
            control={control}
            render={({ field }) => (
              <CurrencyInput
                label="Credit limit"
                value={field.value?.amount ?? (0 as MinorUnits)}
                currency={field.value?.currency ?? 'INR'}
                onChange={(amount) =>
                  field.onChange({ amount, currency: field.value?.currency ?? 'INR' })
                }
                error={(errors as { creditLimit?: { message?: string } }).creditLimit?.message}
              />
            )}
          />
        )}

        <div>
          <span className="mb-1.5 block text-sm font-medium text-text-primary">Color</span>
          <Controller
            name="colorTag"
            control={control}
            render={({ field }) => (
              <div className="flex gap-2">
                {COLOR_PRESETS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => field.onChange(color)}
                    aria-label={`Select color ${color}`}
                    aria-pressed={field.value === color}
                    className="h-8 w-8 rounded-full transition-transform duration-fast"
                    style={{
                      backgroundColor: color,
                      transform: field.value === color ? 'scale(1.1)' : undefined,
                      boxShadow: field.value === color ? `0 0 0 2px ${color}` : undefined,
                    }}
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
