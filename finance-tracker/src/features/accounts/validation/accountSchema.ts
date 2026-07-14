// src/features/accounts/validation/accountSchema.ts

import { z } from 'zod';

import { SUPPORTED_CURRENCIES } from '@/shared/types';

const ACCOUNT_TYPES = ['checking', 'savings', 'credit_card', 'cash', 'investment', 'loan'] as const;

export const accountFormSchema = z
  .object({
    name: z.string().trim().min(1, 'Name is required').max(100),
    type: z.enum(ACCOUNT_TYPES),
    institution: z.string().trim().max(100).nullable(),
    currentBalance: z.object({
      amount: z.number().int(), // deliberately NOT .positive() — credit
      // card / loan balances are legitimately negative (money owed), and
      // even a checking account can briefly go negative (overdraft). Only
      // creditLimit below is constrained to be positive.
      currency: z.enum(SUPPORTED_CURRENCIES),
    }),
    creditLimit: z
      .object({
        amount: z.number().int().positive(),
        currency: z.enum(SUPPORTED_CURRENCIES),
      })
      .nullable(),
    colorTag: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Must be a valid hex color'),
  })
  .strict()
  .refine(
    (data) => data.type !== 'credit_card' || data.creditLimit !== null,
    { message: 'Credit limit is required for credit card accounts', path: ['creditLimit'] },
  );

export type AccountFormValues = z.infer<typeof accountFormSchema>;

export { ACCOUNT_TYPES };
