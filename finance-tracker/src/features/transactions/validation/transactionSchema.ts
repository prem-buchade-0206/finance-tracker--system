// src/features/transactions/validation/transactionSchema.ts
// Zod schemas mirroring the Transaction discriminated union from
// @/shared/types. Kept as a DISTINCT set of schemas rather than trying to
// derive one from the other — the TypeScript union models what a valid
// STORED transaction looks like (immutable id, timestamps), while these
// schemas model what a valid FORM SUBMISSION looks like (no id yet, no
// timestamps, amount as user-entered MinorUnits from CurrencyInput). Trying
// to force one shape to serve both jobs is how you end up with `id?:
// TransactionId` optional-field soup creeping back into the domain type.

import { z } from 'zod';

import { SUPPORTED_CURRENCIES } from '@/shared/types';

// ----------------------------------------------------------------------------
// Shared field schemas
// ----------------------------------------------------------------------------

const moneyFieldSchema = z.object({
  amount: z
    .number()
    .int('Amount must be a whole number of minor units')
    .positive('Amount must be greater than zero'),
  currency: z.enum(SUPPORTED_CURRENCIES),
});

const baseTransactionFieldsSchema = z.object({
  accountId: z.string().uuid('Select an account'),
  amount: moneyFieldSchema,
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  description: z
    .string()
    .trim()
    .min(1, 'Description is required')
    .max(200, 'Description must be under 200 characters'),
  notes: z.string().trim().max(1000, 'Notes must be under 1000 characters').nullable(),
  tags: z.array(z.string().trim().min(1)).max(10, 'Up to 10 tags allowed'),
  attachmentUrl: z.string().url().nullable(),
  isRecurring: z.boolean(),
  recurringRuleId: z.string().uuid().nullable(),
});

// ----------------------------------------------------------------------------
// Discriminated union — mirrors IncomeTransaction / ExpenseTransaction /
// TransferTransaction exactly, so a form that validates against this schema
// produces a payload the API (and the shared Transaction type) will accept
// without a separate mapping step to catch mismatches.
// ----------------------------------------------------------------------------

const incomeFormSchema = baseTransactionFieldsSchema.extend({
  type: z.literal('income'),
  categoryId: z.string().uuid('Select a category'),
  source: z.string().trim().max(200).nullable(),
});

const expenseFormSchema = baseTransactionFieldsSchema.extend({
  type: z.literal('expense'),
  categoryId: z.string().uuid('Select a category'),
  merchant: z.string().trim().max(200).nullable(),
  isReimbursable: z.boolean(),
});

const transferFormSchema = baseTransactionFieldsSchema
  .extend({
    type: z.literal('transfer'),
    toAccountId: z.string().uuid('Select a destination account'),
    categoryId: z.null(),
  })
  .refine((data) => data.accountId !== data.toAccountId, {
    message: 'Source and destination accounts must be different',
    path: ['toAccountId'],
  });

export const transactionFormSchema = z.discriminatedUnion('type', [
  incomeFormSchema,
  expenseFormSchema,
  transferFormSchema,
]);

export type TransactionFormValues = z.infer<typeof transactionFormSchema>;

// ----------------------------------------------------------------------------
// Per-type exports — the Add/Edit Transaction modal needs to validate
// against ONE specific branch at a time (whichever tab/type is currently
// selected in the form), not the full union, since react-hook-form's
// resolver needs a concrete schema matching the currently-rendered fields.
// ----------------------------------------------------------------------------

export { incomeFormSchema, expenseFormSchema, transferFormSchema };
export type IncomeFormValues = z.infer<typeof incomeFormSchema>;
export type ExpenseFormValues = z.infer<typeof expenseFormSchema>;
export type TransferFormValues = z.infer<typeof transferFormSchema>;

// ----------------------------------------------------------------------------
// Filter form schema — for the transactions table's filter panel, distinct
// from the create/edit form above.
// ----------------------------------------------------------------------------

export const transactionFilterFormSchema = z.object({
  dateFrom: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable(),
  dateTo: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable(),
  accountIds: z.array(z.string().uuid()),
  categoryIds: z.array(z.string().uuid()),
  types: z.array(z.enum(['income', 'expense', 'transfer'])),
  searchQuery: z.string().trim().max(100),
  minAmount: z.number().int().nonnegative().nullable(),
  maxAmount: z.number().int().nonnegative().nullable(),
});

export type TransactionFilterFormValues = z.infer<typeof transactionFilterFormSchema>;
