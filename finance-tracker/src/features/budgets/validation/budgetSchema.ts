// src/features/budgets/validation/budgetSchema.ts

import { z } from 'zod';

import { SUPPORTED_CURRENCIES } from '@/shared/types';

export const budgetFormSchema = z
  .object({
    categoryId: z.string().uuid('Select a category'),
    period: z.enum(['weekly', 'monthly', 'quarterly', 'yearly']),
    limit: z.object({
      amount: z.number().int().positive('Budget limit must be greater than zero'),
      currency: z.enum(SUPPORTED_CURRENCIES),
    }),
    startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
    rolloverUnused: z.boolean(),
    alertThresholdPercent: z
      .number()
      .int()
      .min(1, 'Threshold must be at least 1%')
      .max(100, 'Threshold cannot exceed 100%'),
  })
  .strict();

export type BudgetFormValues = z.infer<typeof budgetFormSchema>;
