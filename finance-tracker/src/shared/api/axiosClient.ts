// src/shared/api/axiosClient.ts
// Single Axios instance every feature's api/ layer imports. Owns three
// responsibilities that must live in exactly one place: attaching the auth
// token, transparently refreshing it on 401, and normalizing every error
// into the shared ApiError shape so TanStack Query hooks never touch a raw
// AxiosError.

import axios, {
  AxiosError,
  type AxiosInstance,
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
} from 'axios';

import { env } from '@/shared/constants/env';
import type { ApiError } from '@/shared/types';

const TOKEN_KEY = env.VITE_AUTH_TOKEN_STORAGE_KEY;

// ----------------------------------------------------------------------------
// 1. BASE INSTANCE
// ----------------------------------------------------------------------------

export const axiosClient: AxiosInstance = axios.create({
  baseURL: env.VITE_API_BASE_URL,
  timeout: env.VITE_API_TIMEOUT_MS,
  headers: { 'Content-Type': 'application/json' },
});

// ----------------------------------------------------------------------------
// 2. REQUEST INTERCEPTOR — attach bearer token
// ----------------------------------------------------------------------------

axiosClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = window.localStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers.set('Authorization', `Bearer ${token}`);
  }
  return config;
});

// ----------------------------------------------------------------------------
// 3. RESPONSE INTERCEPTOR — transparent refresh-token rotation on 401
//
// Concurrency problem this solves: if 5 requests fire in parallel and the
// token has expired, all 5 get a 401 simultaneously. Without the queue
// below, that would trigger 5 separate refresh calls — a classic race that
// can invalidate the refresh token itself (single-use rotation) and log
// the user out even though refreshing should have kept them in. The queue
// ensures exactly ONE refresh call happens; the other 4 requests wait for
// it and then retry with the new token.
// ----------------------------------------------------------------------------

let isRefreshing = false;
let refreshQueue: Array<(token: string | null) => void> = [];

function subscribeToRefresh(callback: (token: string | null) => void): void {
  refreshQueue.push(callback);
}

function notifyRefreshSubscribers(token: string | null): void {
  refreshQueue.forEach((callback) => callback(token));
  refreshQueue = [];
}

async function refreshAccessToken(): Promise<string | null> {
  try {
    // Deliberately a raw axios call, NOT axiosClient — using axiosClient
    // here would recurse through this same interceptor and attach the
    // (expired) token to the refresh request itself.
    const response = await axios.post<{ accessToken: string }>(
      `${env.VITE_API_BASE_URL}${env.VITE_AUTH_REFRESH_ENDPOINT}`,
      {},
      { withCredentials: true }, // refresh token travels as an httpOnly cookie, not in JS-readable storage
    );
    const newToken = response.data.accessToken;
    window.localStorage.setItem(TOKEN_KEY, newToken);
    window.dispatchEvent(new Event('auth-token-changed'));
    return newToken;
  } catch {
    window.localStorage.removeItem(TOKEN_KEY);
    window.dispatchEvent(new Event('auth-token-changed'));
    return null;
  }
}

axiosClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as
      | (AxiosRequestConfig & { _retry?: boolean })
      | undefined;

    const status = error.response?.status;

    if (status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;

      if (!isRefreshing) {
        isRefreshing = true;
        const newToken = await refreshAccessToken();
        isRefreshing = false;
        notifyRefreshSubscribers(newToken);

        if (!newToken) {
          // Refresh itself failed — no point queuing further retries.
          // The 401 propagates; ProtectedRoute picks up the cleared token
          // on next navigation via useAuth's useSyncExternalStore.
          return Promise.reject(normalizeError(error));
        }

        return axiosClient(originalRequest);
      }

      // A refresh is already in flight — queue this request instead of
      // firing a second refresh call.
      return new Promise((resolve, reject) => {
        subscribeToRefresh((token) => {
          if (!token) {
            reject(normalizeError(error));
            return;
          }
          resolve(axiosClient(originalRequest));
        });
      });
    }

    return Promise.reject(normalizeError(error));
  },
);

// ----------------------------------------------------------------------------
// 4. ERROR NORMALIZATION
// Every thrown error from this client conforms to ApiError, so a TanStack
// Query hook's `error` field is always the same shape regardless of whether
// it was a network failure, a validation 422, or a 500.
// ----------------------------------------------------------------------------

interface BackendErrorPayload {
  code?: string;
  message?: string;
  errors?: Record<string, string>;
}

function normalizeError(error: AxiosError<BackendErrorPayload>): ApiError & {
  status?: number;
} {
  if (!error.response) {
    // Network failure, timeout, or CORS block — no response reached at all.
    return {
      code: 'NETWORK_ERROR',
      message: 'Unable to reach the server. Check your connection and try again.',
      fieldErrors: null,
    };
  }

  const { status, data } = error.response;

  return {
    code: data?.code ?? `HTTP_${status}`,
    message: data?.message ?? error.message,
    fieldErrors: data?.errors ?? null,
    status,
  };
}
