// src/app/providers/ThemeProvider.tsx
// Owns theme state: 'light' | 'dark' | 'system'. Syncs to `data-theme` on
// <html> (which tokens.css and tailwind.config.ts both key off of) and
// persists the user's explicit choice to localStorage. When mode is
// 'system', it listens to the OS-level media query live.

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import type { ThemeMode } from '@/shared/types';

const THEME_STORAGE_KEY = 'finance_tracker_theme';
const DARK_MEDIA_QUERY = '(prefers-color-scheme: dark)';

type ResolvedTheme = 'light' | 'dark';

interface ThemeContextValue {
  /** The user's stored preference — may be 'system'. */
  mode: ThemeMode;
  /** The actual applied theme after resolving 'system' against the OS. */
  resolvedTheme: ResolvedTheme;
  setMode: (mode: ThemeMode) => void;
  toggle: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

function getStoredMode(): ThemeMode {
  if (typeof window === 'undefined') return 'system';
  const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
  if (stored === 'light' || stored === 'dark' || stored === 'system') {
    return stored;
  }
  return 'system';
}

function resolveTheme(mode: ThemeMode): ResolvedTheme {
  if (mode === 'system') {
    return window.matchMedia(DARK_MEDIA_QUERY).matches ? 'dark' : 'light';
  }
  return mode;
}

export function ThemeProvider({ children }: { children: ReactNode }): JSX.Element {
  const [mode, setModeState] = useState<ThemeMode>(getStoredMode);
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>(() =>
    resolveTheme(getStoredMode()),
  );

  // Apply to <html data-theme="..."> whenever the resolved theme changes —
  // this is the single DOM write-point every CSS token in tokens.css reacts to.
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', resolvedTheme);
  }, [resolvedTheme]);

  // Recompute resolvedTheme whenever `mode` changes.
  useEffect(() => {
    setResolvedTheme(resolveTheme(mode));
  }, [mode]);

  // While in 'system' mode, live-track OS-level scheme changes (e.g. user's
  // OS switches to dark mode at sunset) without requiring a page reload.
  useEffect(() => {
    if (mode !== 'system') return;

    const mediaQuery = window.matchMedia(DARK_MEDIA_QUERY);
    const handleChange = (event: MediaQueryListEvent): void => {
      setResolvedTheme(event.matches ? 'dark' : 'light');
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [mode]);

  const setMode = useCallback((next: ThemeMode) => {
    setModeState(next);
    window.localStorage.setItem(THEME_STORAGE_KEY, next);
  }, []);

  const toggle = useCallback(() => {
    // Toggling always lands on an explicit light/dark choice, never back
    // into 'system' — matches user expectation that a manual toggle "sticks."
    setMode(resolvedTheme === 'dark' ? 'light' : 'dark');
  }, [resolvedTheme, setMode]);

  const value = useMemo<ThemeContextValue>(
    () => ({ mode, resolvedTheme, setMode, toggle }),
    [mode, resolvedTheme, setMode, toggle],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
