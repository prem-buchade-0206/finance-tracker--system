// src/app/router/ProtectedRoute.tsx

import type { JSX } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';

import { useAuth } from '@/shared/hooks/useAuth';

export function ProtectedRoute(): JSX.Element {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    // `state.from` lets the login page redirect back to wherever the user
    // was actually trying to go, instead of always dropping them on /dashboard.
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
}
