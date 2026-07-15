// src/features/settings/components/ThemeToggle/ThemeToggle.tsx
// Thin UI wrapper around useTheme (from app/providers/ThemeProvider) — all
// the actual logic (resolving 'system', persisting to localStorage, live
// OS-preference tracking) already lives there. This component only needs
// to render the three options and reflect `mode`, not `resolvedTheme` —
// see ThemeProvider.tsx's own comment on why that distinction matters:
// showing "system" as selected here is correct even when the OS currently
// resolves to dark, since the user's actual preference IS "system."

import type { JSX } from 'react';

import { useTheme } from '@/app/providers/ThemeProvider';
import type { ThemeMode } from '@/shared/types';
import { cn } from '@/shared/utils/cn';

const THEME_OPTIONS: { value: ThemeMode; label: string; icon: JSX.Element }[] = [
  { value: 'light', label: 'Light', icon: <SunIcon /> },
  { value: 'dark', label: 'Dark', icon: <MoonIcon /> },
  { value: 'system', label: 'System', icon: <MonitorIcon /> },
];

export function ThemeToggle(): JSX.Element {
  const { mode, setMode } = useTheme();

  return (
    <div className="inline-flex gap-1 rounded-xl bg-subtle p-1" role="radiogroup" aria-label="Theme preference">
      {THEME_OPTIONS.map((option) => (
        <button
          key={option.value}
          type="button"
          role="radio"
          aria-checked={mode === option.value}
          onClick={() => setMode(option.value)}
          className={cn(
            'flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors duration-fast',
            mode === option.value
              ? 'bg-surface text-text-primary shadow-sm'
              : 'text-text-secondary hover:text-text-primary',
          )}
        >
          {option.icon}
          {option.label}
        </button>
      ))}
    </div>
  );
}

function SunIcon(): JSX.Element {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function MoonIcon(): JSX.Element {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function MonitorIcon(): JSX.Element {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="2" y="3" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="2" />
      <path d="M8 21h8M12 17v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
