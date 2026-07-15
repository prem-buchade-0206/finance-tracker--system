// src/app/router/StatusPages.tsx
// 404 and 403 share this file since both are small, purely presentational,
// and used only by AppRouter's errorElement / explicit route entries.

import type { JSX } from 'react';
import { Link } from 'react-router-dom';

function StatusPage({
  code,
  title,
  description,
}: {
  code: string;
  title: string;
  description: string;
}): JSX.Element {
  return (
    <div className="flex min-h-dvh items-center justify-center px-6">
      <div className="glass-surface w-full max-w-md rounded-2xl p-8 text-center">
        <p className="font-display text-5xl font-bold text-brand-primary">{code}</p>
        <h1 className="mt-3 font-display text-xl font-semibold text-text-primary">
          {title}
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-text-secondary">{description}</p>
        <Link
          to="/dashboard"
          className="mt-6 inline-block rounded-xl bg-brand-primary px-5 py-2.5 text-sm font-semibold text-text-inverse transition-colors duration-fast hover:bg-brand-primary-hover"
        >
          Back to dashboard
        </Link>
      </div>
    </div>
  );
}

export function NotFoundPage(): JSX.Element {
  return (
    <StatusPage
      code="404"
      title="Page not found"
      description="The page you're looking for doesn't exist or may have moved."
    />
  );
}

export function ForbiddenPage(): JSX.Element {
  return (
    <StatusPage
      code="403"
      title="Access denied"
      description="You don't have permission to view this page."
    />
  );
}
