// src/app/router/AppShellLayout.tsx
// Layout for all authenticated routes. Renders once and persists across
// child route navigation (React Router layout-route pattern) — the nav
// sidebar/topbar does NOT remount when navigating from /transactions to
// /budgets, only the <Outlet /> content below it does.

import type { JSX } from 'react';
import { NavLink, Outlet } from 'react-router-dom';

import { useAuth } from '@/shared/hooks/useAuth';

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/accounts', label: 'Accounts' },
  { to: '/transactions', label: 'Transactions' },
  { to: '/budgets', label: 'Budgets' },
  { to: '/savings', label: 'Savings' },
  { to: '/analytics', label: 'Analytics' },
  { to: '/settings', label: 'Settings' },
] as const;

export function AppShellLayout(): JSX.Element {
  const { clearToken } = useAuth();

  return (
    <div className="min-h-dvh">
      <header className="glass-surface sticky top-0 z-sticky border-b border-border-subtle">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <span className="font-display text-lg font-semibold text-text-primary">
            Finance Tracker
          </span>

          <nav className="hidden items-center gap-1 md:flex" aria-label="Primary">
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  [
                    'rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-fast',
                    isActive
                      ? 'bg-brand-primary text-text-inverse'
                      : 'text-text-secondary hover:bg-subtle hover:text-text-primary',
                  ].join(' ')
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <button
            type="button"
            onClick={clearToken}
            className="rounded-lg px-3 py-2 text-sm font-medium text-text-secondary transition-colors duration-fast hover:bg-subtle hover:text-danger"
          >
            Sign out
          </button>
        </div>
      </header>

      <main>
        <Outlet />
      </main>
    </div>
  );
}
