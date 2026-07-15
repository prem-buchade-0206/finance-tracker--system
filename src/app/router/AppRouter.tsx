// src/app/router/AppRouter.tsx
// React Router v7 route tree. Every feature page is lazy-loaded via
// React.lazy so the initial bundle only contains the shell + router itself
// — Recharts, TanStack Table, etc. only download when their route is
// actually visited (reinforced by the manualChunks split in vite.config.ts).

import { lazy, Suspense, type JSX } from 'react';
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom';

import { AppShellLayout } from '@/app/router/AppShellLayout';
import { ProtectedRoute } from '@/app/router/ProtectedRoute';
import { RouteSkeleton } from '@/app/router/RouteSkeleton';
import { ForbiddenPage, NotFoundPage } from '@/app/router/StatusPages';

const LoginPage = lazy(() => import('@/features/auth/pages/LoginPage'));
const DashboardPage = lazy(() => import('@/features/dashboard/pages/DashboardPage'));
const AccountsPage = lazy(() => import('@/features/accounts/pages/AccountsPage'));
const TransactionsPage = lazy(() => import('@/features/transactions/pages/TransactionsPage'));
const BudgetsPage = lazy(() => import('@/features/budgets/pages/BudgetsPage'));
const SavingsPage = lazy(() => import('@/features/savings/pages/SavingsPage'));
const AnalyticsPage = lazy(() => import('@/features/analytics/pages/AnalyticsPage'));
const SettingsPage = lazy(() => import('@/features/settings/pages/SettingsPage'));

/** Wraps a lazy page in its own Suspense boundary so ONE slow chunk doesn't
 *  block sibling routes' fallback rendering, and so RouteSkeleton — not a
 *  blank screen — shows during the chunk fetch. */
function withSuspense(element: JSX.Element): JSX.Element {
  return <Suspense fallback={<RouteSkeleton />}>{element}</Suspense>;
}

const router = createBrowserRouter([
  {
    path: '/login',
    element: withSuspense(<LoginPage />),
  },
  {
    path: '/403',
    element: <ForbiddenPage />,
  },
  {
    element: <ProtectedRoute />,
    errorElement: <NotFoundPage />,
    children: [
      {
        element: <AppShellLayout />,
        children: [
          { index: true, element: <Navigate to="/dashboard" replace /> },
          { path: 'dashboard', element: withSuspense(<DashboardPage />) },
          { path: 'accounts', element: withSuspense(<AccountsPage />) },
          { path: 'transactions', element: withSuspense(<TransactionsPage />) },
          { path: 'budgets', element: withSuspense(<BudgetsPage />) },
          { path: 'savings', element: withSuspense(<SavingsPage />) },
          { path: 'analytics', element: withSuspense(<AnalyticsPage />) },
          { path: 'settings', element: withSuspense(<SettingsPage />) },
        ],
      },
    ],
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
]);

export function AppRouter(): JSX.Element {
  return <RouterProvider router={router} />;
}
