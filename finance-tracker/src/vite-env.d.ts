/// <reference types="vite/client" />
// src/vite-env.d.ts
// Types import.meta.env so raw access (before env.ts's Zod parse) is still
// type-checked rather than `any`. env.ts is still the sanctioned way to
// READ these values app-wide; this file only prevents TS errors on the
// raw import.meta.env object that Zod's safeParse receives.

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  readonly VITE_API_TIMEOUT_MS: string;

  readonly VITE_AUTH_TOKEN_STORAGE_KEY: string;
  readonly VITE_AUTH_REFRESH_ENDPOINT: string;

  readonly VITE_FEATURE_INVESTMENTS_MODULE: string;
  readonly VITE_FEATURE_MULTI_CURRENCY: string;
  readonly VITE_FEATURE_EXPORT_PDF: string;
  readonly VITE_FEATURE_AI_INSIGHTS: string;

  readonly VITE_DEFAULT_CURRENCY: string;
  readonly VITE_DEFAULT_LOCALE: string;

  readonly VITE_SENTRY_DSN: string;
  readonly VITE_ANALYTICS_WRITE_KEY: string;

  readonly VITE_APP_VERSION: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
