// src/shared/constants/env.ts
// Validates import.meta.env ONCE, at module load (i.e. at app boot), via a
// Zod schema. Every other file imports the typed `env` object from here —
// nobody should ever reach for `import.meta.env.VITE_X` directly, because
// that gives you `string | undefined` with no coercion and no validation.

import { z } from 'zod';

// ----------------------------------------------------------------------------
// Helper: Vite env vars are always strings ("true"/"false"), never real
// booleans — this coerces the string form into a real boolean before Zod
// validates it, so downstream code gets `boolean`, not `"true" | "false"`.
// ----------------------------------------------------------------------------
const booleanFromString = z
  .enum(['true', 'false'])
  .transform((val) => val === 'true');

const envSchema = z.object({
  // --- API ---
  VITE_API_BASE_URL: z.string().url({ message: 'VITE_API_BASE_URL must be a valid URL' }),
  VITE_API_TIMEOUT_MS: z.coerce.number().int().positive().default(15000),

  // --- Auth ---
  VITE_AUTH_TOKEN_STORAGE_KEY: z.string().min(1),
  VITE_AUTH_REFRESH_ENDPOINT: z.string().min(1),

  // --- Feature flags ---
  VITE_FEATURE_INVESTMENTS_MODULE: booleanFromString.default('false'),
  VITE_FEATURE_MULTI_CURRENCY: booleanFromString.default('true'),
  VITE_FEATURE_EXPORT_PDF: booleanFromString.default('true'),
  VITE_FEATURE_AI_INSIGHTS: booleanFromString.default('false'),

  // --- Defaults ---
  VITE_DEFAULT_CURRENCY: z
    .enum(['INR', 'USD', 'EUR', 'GBP', 'AED', 'JPY'])
    .default('INR'),
  VITE_DEFAULT_LOCALE: z.string().min(2).default('en-IN'),

  // --- Observability (genuinely optional, app must boot without these) ---
  VITE_SENTRY_DSN: z.string().optional().default(''),
  VITE_ANALYTICS_WRITE_KEY: z.string().optional().default(''),

  // --- Build metadata ---
  VITE_APP_VERSION: z.string().default('0.0.0-dev'),

  // --- Vite built-ins (not user-defined, but validated for completeness) ---
  MODE: z.enum(['development', 'production', 'test']),
  DEV: z.boolean(),
  PROD: z.boolean(),
});

export type Env = z.infer<typeof envSchema>;

/**
 * Parses import.meta.env exactly once at module load. If any required
 * variable is missing or malformed, this throws immediately on app boot —
 * NOT three components deep when someone finally calls the broken value.
 * The thrown ZodError message lists every failing field at once.
 */
function loadEnv(): Env {
  const result = envSchema.safeParse(import.meta.env);

  if (!result.success) {
    const formatted = result.error.issues
      .map((issue) => `  - ${issue.path.join('.')}: ${issue.message}`)
      .join('\n');

    // Thrown at module load = fails the entire app render, loudly, with a
    // readable list — the correct failure mode for a misconfigured
    // financial app (silently defaulting the API URL would be worse).
    throw new Error(
      `Invalid environment configuration. Check your .env file against .env.example:\n${formatted}`,
    );
  }

  return result.data;
}

export const env = loadEnv();

// ----------------------------------------------------------------------------
// Convenience re-exports — feature flags in particular are read often enough
// across the codebase that a shorthand is worth it.
// ----------------------------------------------------------------------------
export const FEATURE_FLAGS = {
  investmentsModule: env.VITE_FEATURE_INVESTMENTS_MODULE,
  multiCurrency: env.VITE_FEATURE_MULTI_CURRENCY,
  exportPdf: env.VITE_FEATURE_EXPORT_PDF,
  aiInsights: env.VITE_FEATURE_AI_INSIGHTS,
} as const;

export const IS_DEV = env.DEV;
export const IS_PROD = env.PROD;
