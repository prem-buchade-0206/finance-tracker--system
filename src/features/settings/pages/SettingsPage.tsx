// src/features/settings/pages/SettingsPage.tsx

import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState, type JSX } from 'react';

import { Combobox, type ComboboxOption } from '@/shared/components/Combobox';
import { useAuth } from '@/shared/hooks/useAuth';
import type { CurrencyCode } from '@/shared/types';
import { SUPPORTED_CURRENCIES } from '@/shared/types';

import { ProfileForm } from '../components/ProfileForm';
import { ThemeToggle } from '../components/ThemeToggle';
import {
  preferencesFormSchema,
  type PreferencesFormValues,
  type ProfileFormValues,
} from '../validation/settingsSchema';

const CURRENCY_OPTIONS: ComboboxOption<CurrencyCode>[] = SUPPORTED_CURRENCIES.map((code) => ({
  value: code,
  label: code,
}));

const WEEK_START_OPTIONS: ComboboxOption<'monday' | 'sunday'>[] = [
  { value: 'monday', label: 'Monday' },
  { value: 'sunday', label: 'Sunday' },
];

export default function SettingsPage(): JSX.Element {
  const { clearToken } = useAuth();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const { control } = useForm<PreferencesFormValues>({
    resolver: zodResolver(preferencesFormSchema),
    defaultValues: { defaultCurrency: 'INR', weekStartsOn: 'monday' },
  });

  async function handleProfileSubmit(values: ProfileFormValues): Promise<void> {
    // TODO-FOR-NEXT-STEP: wire to a real PUT /users/me once the settings
    // API service layer exists — same bridging pattern flagged throughout
    // every other feature in this codebase.
    await new Promise((resolve) => setTimeout(resolve, 400));
    console.info('Profile saved (mock):', values);
  }

  function handleSignOut(): void {
    setIsSigningOut(true);
    clearToken();
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="font-display text-2xl font-semibold text-text-primary">Settings</h1>
      <p className="mt-1 text-sm text-text-secondary">
        Manage your profile, preferences, and appearance.
      </p>

      <div className="mt-6 space-y-6">
        <ProfileForm
          defaultValues={{ fullName: 'Prem', email: 'prem@example.com' }}
          onSubmit={handleProfileSubmit}
        />

        <div className="glass-surface rounded-2xl p-5">
          <h3 className="font-display text-base font-semibold text-text-primary">Preferences</h3>
          <p className="mt-1 text-sm text-text-secondary">
            Defaults applied across the app.
          </p>

          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Controller
              name="defaultCurrency"
              control={control}
              render={({ field }) => (
                <Combobox
                  label="Default currency"
                  options={CURRENCY_OPTIONS}
                  value={field.value}
                  onChange={field.onChange}
                />
              )}
            />
            <Controller
              name="weekStartsOn"
              control={control}
              render={({ field }) => (
                <Combobox
                  label="Week starts on"
                  options={WEEK_START_OPTIONS}
                  value={field.value}
                  onChange={field.onChange}
                />
              )}
            />
          </div>
        </div>

        <div className="glass-surface rounded-2xl p-5">
          <h3 className="font-display text-base font-semibold text-text-primary">Appearance</h3>
          <p className="mt-1 text-sm text-text-secondary">
            Choose how Finance Tracker looks on this device.
          </p>
          <div className="mt-4">
            <ThemeToggle />
          </div>
        </div>

        <div className="glass-surface rounded-2xl p-5">
          <h3 className="font-display text-base font-semibold text-danger">Danger zone</h3>
          <p className="mt-1 text-sm text-text-secondary">
            Sign out of Finance Tracker on this device.
          </p>
          <button
            type="button"
            onClick={handleSignOut}
            disabled={isSigningOut}
            className="mt-4 rounded-xl border border-danger px-4 py-2 text-sm font-semibold text-danger transition-colors duration-fast hover:bg-danger hover:text-text-inverse disabled:cursor-not-allowed disabled:opacity-50"
          >
            Sign out
          </button>
        </div>
      </div>
    </div>
  );
}
