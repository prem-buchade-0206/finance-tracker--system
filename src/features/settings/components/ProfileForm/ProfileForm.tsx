// src/features/settings/components/ProfileForm/ProfileForm.tsx
// Deliberately its own form/submit boundary, separate from currency/week-
// start preferences — profile fields (name, email) likely hit a different
// backend endpoint than app preferences, and bundling them into one giant
// settings form means an unrelated validation error (e.g. malformed email)
// blocks saving a preference toggle that has nothing to do with it.

import { zodResolver } from '@hookform/resolvers/zod';
import type { JSX } from 'react';
import { useForm } from 'react-hook-form';

import { Button } from '@/shared/components/Button';
import { Input } from '@/shared/components/Input';

import { profileFormSchema, type ProfileFormValues } from '../../validation/settingsSchema';

export interface ProfileFormProps {
  defaultValues: ProfileFormValues;
  onSubmit: (values: ProfileFormValues) => Promise<void>;
}

export function ProfileForm({ defaultValues, onSubmit }: ProfileFormProps): JSX.Element {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues,
  });

  const handleFormSubmit = handleSubmit(async (values) => {
    await onSubmit(values);
  });

  return (
    <form onSubmit={(e) => void handleFormSubmit(e)} className="glass-surface rounded-2xl p-5">
      <h3 className="font-display text-base font-semibold text-text-primary">Profile</h3>
      <p className="mt-1 text-sm text-text-secondary">Your personal account details.</p>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input label="Full name" error={errors.fullName?.message} {...register('fullName')} />
        <Input label="Email" type="email" error={errors.email?.message} {...register('email')} />
      </div>

      <div className="mt-4 flex justify-end">
        <Button type="submit" isLoading={isSubmitting} disabled={!isDirty} disableMagnetic>
          Save changes
        </Button>
      </div>
    </form>
  );
}
