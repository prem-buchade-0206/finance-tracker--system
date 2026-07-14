// src/features/settings/validation/settingsSchema.ts

import { z } from 'zod';

import { SUPPORTED_CURRENCIES } from '@/shared/types';

export const profileFormSchema = z.object({
  fullName: z.string().trim().min(1, 'Name is required').max(100),
  email: z.string().email('Enter a valid email address'),
});

export type ProfileFormValues = z.infer<typeof profileFormSchema>;

export const preferencesFormSchema = z.object({
  defaultCurrency: z.enum(SUPPORTED_CURRENCIES),
  weekStartsOn: z.enum(['monday', 'sunday']),
});

export type PreferencesFormValues = z.infer<typeof preferencesFormSchema>;
