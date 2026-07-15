// src/app/router/RouteSkeleton.tsx
// Suspense fallback for lazy-loaded route chunks. Deliberately mimics the
// coarse shape of the app shell (header bar + content blocks) rather than a
// centered spinner — reduces perceived layout shift when the real page
// mounts a beat later. Uses the .skeleton shimmer utility from globals.css.

import type { JSX } from 'react';

export function RouteSkeleton(): JSX.Element {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8" role="status" aria-live="polite">
      <span className="sr-only">Loading page content</span>

      <div className="skeleton mb-6 h-9 w-48" />

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={`stat-skeleton-${index}`} className="skeleton h-28 rounded-2xl" />
        ))}
      </div>

      <div className="skeleton mb-6 h-80 rounded-2xl" />

      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={`row-skeleton-${index}`} className="skeleton h-14 rounded-xl" />
        ))}
      </div>
    </div>
  );
}
