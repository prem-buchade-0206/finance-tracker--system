// src/shared/hooks/useAuth.ts
// Minimal auth-state hook for routing purposes only. The full auth feature
// (login mutation, refresh-token rotation, user profile fetch) lives in
// features/auth once that module is generated — this hook intentionally
// exposes only what AppRouter's ProtectedRoute needs: "is there a valid
// session right now," nothing more, so the router doesn't reach into auth
// internals and violate the feature-boundary rule from eslint.config.js.

import { useCallback, useSyncExternalStore } from 'react';

import { env } from '@/shared/constants/env';

const TOKEN_KEY = env.VITE_AUTH_TOKEN_STORAGE_KEY;

function getSnapshot(): boolean {
  return window.localStorage.getItem(TOKEN_KEY) !== null;
}

function subscribe(callback: () => void): () => void {
  // 'storage' fires on OTHER tabs' writes, not the current tab's — combined
  // with the custom event dispatched by setToken/clearToken below, this
  // keeps every open tab's auth state in sync (e.g. logging out in one tab
  // immediately reflects in another).
  window.addEventListener('storage', callback);
  window.addEventListener('auth-token-changed', callback);
  return () => {
    window.removeEventListener('storage', callback);
    window.removeEventListener('auth-token-changed', callback);
  };
}

export function useAuth(): {
  isAuthenticated: boolean;
  setToken: (token: string) => void;
  clearToken: () => void;
} {
  const isAuthenticated = useSyncExternalStore(subscribe, getSnapshot);

  const setToken = useCallback((token: string) => {
    window.localStorage.setItem(TOKEN_KEY, token);
    window.dispatchEvent(new Event('auth-token-changed'));
  }, []);

  const clearToken = useCallback(() => {
    window.localStorage.removeItem(TOKEN_KEY);
    window.dispatchEvent(new Event('auth-token-changed'));
  }, []);

  return { isAuthenticated, setToken, clearToken };
}
