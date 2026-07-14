// src/app/providers/ErrorBoundary.tsx
// Class component is intentional and unavoidable here — React error
// boundaries have no hook equivalent as of React 18/19. This is the ONE
// sanctioned class component in the entire codebase.

import { Component, type ErrorInfo, type ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: (error: Error, reset: () => void) => ReactNode;
}

interface ErrorBoundaryState {
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = { error: null };

  public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Wired to Sentry once VITE_SENTRY_DSN is configured (see env.ts) —
    // deliberately not importing an observability SDK here to keep this
    // provider dependency-free; the reporting hook attaches in main.tsx.
    console.error('[ErrorBoundary] Uncaught render error:', error, errorInfo.componentStack);
  }

  private reset = (): void => {
    this.setState({ error: null });
  };

  public render(): ReactNode {
    const { error } = this.state;
    const { children, fallback } = this.props;

    if (error) {
      if (fallback) return fallback(error, this.reset);
      return <DefaultErrorFallback error={error} reset={this.reset} />;
    }

    return children;
  }
}

function DefaultErrorFallback({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}): JSX.Element {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-canvas px-6">
      <div className="glass-surface w-full max-w-md rounded-2xl p-8 text-center">
        <h1 className="font-display text-2xl font-semibold text-text-primary">
          Something went wrong
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-text-secondary">
          An unexpected error interrupted this view. Your data hasn&apos;t been
          affected — you can safely try again.
        </p>
        {import.meta.env.DEV && (
          <pre className="mt-4 overflow-auto rounded-lg bg-subtle p-3 text-left text-xs text-danger">
            {error.message}
          </pre>
        )}
        <button
          type="button"
          onClick={reset}
          className="mt-6 rounded-xl bg-brand-primary px-5 py-2.5 text-sm font-semibold text-text-inverse transition-colors duration-fast hover:bg-brand-primary-hover"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
