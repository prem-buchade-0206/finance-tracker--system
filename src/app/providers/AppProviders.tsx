// src/app/providers/AppProviders.tsx
// The single composed provider tree mounted once in main.tsx. Order matters:
// ErrorBoundary outermost (so a crash anywhere below is caught), then
// QueryClientProvider (data layer), then ThemeProvider (visual layer, needs
// to be inside ErrorBoundary so a theme bug doesn't take down data fetching
// state, but outside anything that reads theme).

import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import type { ReactNode } from 'react';

import { ErrorBoundary } from '@/app/providers/ErrorBoundary';
import { queryClient } from '@/app/providers/queryClient';
import { ThemeProvider } from '@/app/providers/ThemeProvider';
import { IS_DEV } from '@/shared/constants/env';

export function AppProviders({ children }: { children: ReactNode }): JSX.Element {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          {children}
          {IS_DEV && <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-left" />}
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
