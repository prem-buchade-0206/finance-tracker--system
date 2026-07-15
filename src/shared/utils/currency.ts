// src/shared/utils/currency.ts
// SINGLE SOURCE OF TRUTH for all MinorUnits <-> display-string conversion.
// Rule enforced by convention + lint boundary (see eslint note at bottom):
// nowhere else in the codebase should call `.toFixed()`, `/ 100`, or
// `Intl.NumberFormat` directly on a monetary value. Everything routes here.

import type { CurrencyCode, CurrencyMeta, Money, MinorUnits } from '@/shared/types';

// ----------------------------------------------------------------------------
// 1. CURRENCY REGISTRY
// ----------------------------------------------------------------------------

export const CURRENCY_META: Readonly<Record<CurrencyCode, CurrencyMeta>> = {
  INR: { code: 'INR', symbol: '₹', minorUnitDecimals: 2, locale: 'en-IN' },
  USD: { code: 'USD', symbol: '$', minorUnitDecimals: 2, locale: 'en-US' },
  EUR: { code: 'EUR', symbol: '€', minorUnitDecimals: 2, locale: 'de-DE' },
  GBP: { code: 'GBP', symbol: '£', minorUnitDecimals: 2, locale: 'en-GB' },
  AED: { code: 'AED', symbol: 'د.إ', minorUnitDecimals: 2, locale: 'ar-AE' },
  JPY: { code: 'JPY', symbol: '¥', minorUnitDecimals: 0, locale: 'ja-JP' },
} as const;

export const DEFAULT_CURRENCY: CurrencyCode = 'INR';

// ----------------------------------------------------------------------------
// 2. CORE CONVERSION — the only place a monetary float is allowed to exist,
// and only transiently, as a function-local variable that never escapes.
// ----------------------------------------------------------------------------

/**
 * Converts a user-facing decimal amount (e.g. "1234.56" from an input field)
 * into integer minor units (123456) for storage/state. Rounds to the
 * currency's correct decimal precision before converting, to avoid
 * float artifacts like 1234.5599999999998.
 */
export function toMinorUnits(majorAmount: number, currency: CurrencyCode): MinorUnits {
  const { minorUnitDecimals } = CURRENCY_META[currency];
  const factor = 10 ** minorUnitDecimals;
  return Math.round(majorAmount * factor) as MinorUnits;
}

/**
 * Converts stored integer minor units back into a plain JS number in major
 * units, for feeding into a numeric input's default value. NOT for display —
 * use formatCurrency() for anything the user reads.
 */
export function fromMinorUnits(minorAmount: MinorUnits, currency: CurrencyCode): number {
  const { minorUnitDecimals } = CURRENCY_META[currency];
  const factor = 10 ** minorUnitDecimals;
  return minorAmount / factor;
}

// ----------------------------------------------------------------------------
// 3. DISPLAY FORMATTING
// ----------------------------------------------------------------------------

export interface FormatCurrencyOptions {
  /** Show the currency symbol. Default true. */
  showSymbol?: boolean;
  /** Show + sign for positive amounts (used for income rows). Default false. */
  showPositiveSign?: boolean;
  /** Compact notation for large numbers, e.g. ₹1.2L / $12.4K. Default false. */
  compact?: boolean;
}

/**
 * The ONLY function that should render a Money value as a string for the UI.
 * Wraps Intl.NumberFormat so locale-correct grouping (lakh/crore for en-IN,
 * thousands for en-US) is handled automatically per currency.
 */
export function formatCurrency(
  money: Money,
  options: FormatCurrencyOptions = {},
): string {
  const { showSymbol = true, showPositiveSign = false, compact = false } = options;
  const meta = CURRENCY_META[money.currency];
  const majorAmount = fromMinorUnits(money.amount, money.currency);

  const formatter = new Intl.NumberFormat(meta.locale, {
    style: showSymbol ? 'currency' : 'decimal',
    currency: money.currency,
    currencyDisplay: 'symbol',
    minimumFractionDigits: compact ? 0 : meta.minorUnitDecimals,
    maximumFractionDigits: meta.minorUnitDecimals,
    notation: compact ? 'compact' : 'standard',
    signDisplay: showPositiveSign ? 'exceptZero' : 'auto',
  });

  return formatter.format(majorAmount);
}

/**
 * Formats a raw minor-units delta (e.g. a chart tooltip value) without
 * needing a full Money object first. Convenience wrapper over formatCurrency.
 */
export function formatMinorUnits(
  amount: MinorUnits,
  currency: CurrencyCode = DEFAULT_CURRENCY,
  options?: FormatCurrencyOptions,
): string {
  return formatCurrency({ amount, currency }, options);
}

// ----------------------------------------------------------------------------
// 4. ARITHMETIC HELPERS — guard against mixing currencies silently
// ----------------------------------------------------------------------------

export class CurrencyMismatchError extends Error {
  constructor(a: CurrencyCode, b: CurrencyCode) {
    super(`Cannot operate on mismatched currencies: ${a} vs ${b}`);
    this.name = 'CurrencyMismatchError';
  }
}

function assertSameCurrency(a: Money, b: Money): void {
  if (a.currency !== b.currency) {
    throw new CurrencyMismatchError(a.currency, b.currency);
  }
}

export function addMoney(a: Money, b: Money): Money {
  assertSameCurrency(a, b);
  return { amount: (a.amount + b.amount) as MinorUnits, currency: a.currency };
}

export function subtractMoney(a: Money, b: Money): Money {
  assertSameCurrency(a, b);
  return { amount: (a.amount - b.amount) as MinorUnits, currency: a.currency };
}

export function sumMoney(items: readonly Money[], currency: CurrencyCode): Money {
  const total = items.reduce((acc, item) => {
    assertSameCurrency({ amount: 0 as MinorUnits, currency }, item);
    return acc + item.amount;
  }, 0);
  return { amount: total as MinorUnits, currency };
}

export function isPositive(money: Money): boolean {
  return money.amount > 0;
}

export function absMoney(money: Money): Money {
  return { amount: Math.abs(money.amount) as MinorUnits, currency: money.currency };
}

/**
 * Zero-value Money for a given currency — use instead of `{ amount: 0, ... }`
 * literals scattered around, so a currency change only touches one call site.
 */
export function zeroMoney(currency: CurrencyCode = DEFAULT_CURRENCY): Money {
  return { amount: 0 as MinorUnits, currency };
}

// ----------------------------------------------------------------------------
// NOTE FOR ESLint CONFIG (next infra file will wire this in):
// Add a `no-restricted-syntax` rule blocking direct `.toFixed(` and
// `new Intl.NumberFormat(` calls outside `src/shared/utils/currency.ts`,
// so every future contributor is forced through this module.
// ----------------------------------------------------------------------------
