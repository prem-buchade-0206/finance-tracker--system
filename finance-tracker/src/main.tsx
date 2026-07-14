// src/main.tsx
// Application entry point. Kept deliberately thin: import env FIRST (so a
// misconfigured .env throws before React even attempts to mount), then
// render the provider tree. Router is intentionally NOT wired here yet —
// AppRouter arrives in the next file (src/app/router/AppRouter.tsx) and
// gets composed in as a single addition to the tree below.

import '@/shared/constants/env'; // side-effect import: validates env at boot, throws if invalid

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { AppProviders } from '@/app/providers/AppProviders';
import { AppRouter } from '@/app/router/AppRouter';

import '@/styles/tokens.css';
import '@/styles/globals.css';

const rootElement = document.getElementById('root');

if (!rootElement) {
  // This should be structurally impossible given index.html, but a thrown
  // error here is far more debuggable than createRoot(null) failing deep
  // inside React internals with an opaque stack trace.
  throw new Error('Root element with id="root" was not found in index.html');
}

createRoot(rootElement).render(
  <StrictMode>
    <AppProviders>
      <AppRouter />
    </AppProviders>
  </StrictMode>,
);
