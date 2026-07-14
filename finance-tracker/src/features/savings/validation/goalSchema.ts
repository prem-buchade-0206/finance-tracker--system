// src/features/savings/validation/goalSchema.ts

import { z } from 'zod';

import { SUPPORTED_CURRENCIES } from '@/shared/types';

export const goalFormSchema = z
  .object({
    name: z.string().trim().min(1, 'Name is required').max(100, 'Name must be under 100 characters'),
    targetAmount: z.object({
      amount: z.number().int().positive('Target amount must be greater than zero'),
      currency: z.enum(SUPPORTED_CURRENCIES),
    }),
    currentAmount: z.object({
      amount: z.number().int().nonnegative('Current amount cannot be negative'),
      currency: z.enum(SUPPORTED_CURRENCIES),
    }),
    targetDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')
      .nullable(),
    linkedAccountId: z.string().uuid().nullable(),
    icon: z.string().min(1, 'Pick an icon'),
    colorTag: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Must be a valid hex color'),
  })
  .strict()
  .refine((data) => data.currentAmount.amount <= data.targetAmount.amount, {
    message: 'Current amount cannot exceed the target',
    path: ['currentAmount', 'amount'],
  })
  .refine((data) => data.currentAmount.currency === data.targetAmount.currency, {
    message: 'Current and target amounts must use the same currency',
    path: ['currentAmount', 'currency'],
  });

export type GoalFormValues = z.infer<typeof goalFormSchema>;
