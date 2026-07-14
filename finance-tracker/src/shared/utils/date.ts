// src/shared/utils/date.ts
// SINGLE SOURCE OF TRUTH for date formatting, parsing, and period-range math.
// Mirrors currency.ts's pattern: nowhere else should call `new Date().toLocaleDateString()`
// or hand-roll month/quarter arithmetic — it routes through here so a locale
// or fiscal-year-start change is a one-file edit.

import {
  addDays,
  addMonths,
  addQuarters,
  addWeeks,
  addYears,
  endOfMonth,
  endOfQuarter,
  endOfWeek,
  endOfYear,
  format,
  formatDistanceToNowStrict,
  isAfter,
  isBefore,
  isSameDay,
  isValid,
  parseISO,
  startOfMonth,
  startOfQuarter,
  startOfWeek,
  startOfYear,
} from 'date-fns';

import type { BudgetPeriod, DateRange, ISODateString, ISODateTimeString } from '@/shared/types';

// ----------------------------------------------------------------------------
// 1. CONSTRUCTION — the only place raw strings become branded ISO types
// ----------------------------------------------------------------------------

/** Converts a JS Date to the branded ISODateString ("2026-07-09"), local time. */
export function toISODateString(date: Date): ISODateString {
  return format(date, 'yyyy-MM-dd') as ISODateString;
}

/** Converts a JS Date to the branded ISODateTimeString (full ISO-8601, UTC). */
export function toISODateTimeString(date: Date): ISODateTimeString {
  return date.toISOString() as ISODateTimeString;
}

/** Today's date as an ISODateString — the one sanctioned "now" for date-only fields. */
export function todayISO(): ISODateString {
  return toISODateString(new Date());
}

// ----------------------------------------------------------------------------
// 2. PARSING — safe parse that never returns an Invalid Date silently
// ----------------------------------------------------------------------------

export class InvalidDateError extends Error {
  constructor(raw: string) {
    super(`Could not parse "${raw}" as a valid date`);
    this.name = 'InvalidDateError';
  }
}

/** Parses an ISODateString/ISODateTimeString into a JS Date, throwing loudly
 *  on malformed input instead of returning `Invalid Date` for callers to
 *  accidentally format/compare without noticing. */
export function parseISODate(raw: ISODateString | ISODateTimeString | string): Date {
  const parsed = parseISO(raw);
  if (!isValid(parsed)) {
    throw new InvalidDateError(raw);
  }
  return parsed;
}

// ----------------------------------------------------------------------------
// 3. DISPLAY FORMATTING
// ----------------------------------------------------------------------------

export type DateDisplayFormat = 'short' | 'medium' | 'long' | 'monthYear' | 'dayMonth';

const DISPLAY_FORMAT_PATTERNS: Record<DateDisplayFormat, string> = {
  short: 'dd/MM/yy', // 09/07/26
  medium: 'd MMM yyyy', // 9 Jul 2026
  long: 'EEEE, d MMMM yyyy', // Thursday, 9 July 2026
  monthYear: 'MMMM yyyy', // July 2026
  dayMonth: 'd MMM', // 9 Jul
};

/** The one sanctioned way to render a stored date for the UI. */
export function formatDate(
  raw: ISODateString | ISODateTimeString | Date,
  displayFormat: DateDisplayFormat = 'medium',
): string {
  const date = raw instanceof Date ? raw : parseISODate(raw);
  return format(date, DISPLAY_FORMAT_PATTERNS[displayFormat]);
}

/** Relative time for transaction rows / activity feeds: "3 days ago", "2 hours ago". */
export function formatRelativeTime(raw: ISODateTimeString | Date): string {
  const date = raw instanceof Date ? raw : parseISODate(raw);
  return `${formatDistanceToNowStrict(date)} ago`;
}

// ----------------------------------------------------------------------------
// 4. COMPARISON HELPERS — thin re-exports so components import from ONE
// module instead of mixing `@/shared/utils/date` and raw `date-fns` calls.
// ----------------------------------------------------------------------------

export function isDateAfter(a: ISODateString, b: ISODateString): boolean {
  return isAfter(parseISODate(a), parseISODate(b));
}

export function isDateBefore(a: ISODateString, b: ISODateString): boolean {
  return isBefore(parseISODate(a), parseISODate(b));
}

export function isSameCalendarDay(a: ISODateString, b: ISODateString): boolean {
  return isSameDay(parseISODate(a), parseISODate(b));
}

/** Inclusive range check — used by TransactionFilters.dateRange application. */
export function isWithinDateRange(date: ISODateString, range: DateRange): boolean {
  const target = parseISODate(date);
  if (range.from && isBefore(target, parseISODate(range.from))) return false;
  if (range.to && isAfter(target, parseISODate(range.to))) return false;
  return true;
}

// ----------------------------------------------------------------------------
// 5. BUDGET PERIOD RANGE MATH
// The single place that answers "what date range does this budget period
// cover, given a start date" — budgets.getBudgetStatus() and the analytics
// feature's period-over-period comparisons both depend on this being correct.
// ----------------------------------------------------------------------------

/**
 * Given a budget's period type and its startDate, returns the {from, to}
 * range for the CURRENT active cycle (e.g. for a 'monthly' budget started
 * any day, returns the current calendar month's start/end).
 */
export function getCurrentPeriodRange(period: BudgetPeriod): DateRange {
  const now = new Date();

  switch (period) {
    case 'weekly':
      return {
        from: toISODateString(startOfWeek(now, { weekStartsOn: 1 })), // Monday start
        to: toISODateString(endOfWeek(now, { weekStartsOn: 1 })),
      };
    case 'monthly':
      return {
        from: toISODateString(startOfMonth(now)),
        to: toISODateString(endOfMonth(now)),
      };
    case 'quarterly':
      return {
        from: toISODateString(startOfQuarter(now)),
        to: toISODateString(endOfQuarter(now)),
      };
    case 'yearly':
      return {
        from: toISODateString(startOfYear(now)),
        to: toISODateString(endOfYear(now)),
      };
  }
}

/** Advances a date forward by one period cycle — used when rolling a budget
 *  over to its next cycle (e.g. rolloverUnused handling). */
export function advanceByPeriod(date: ISODateString, period: BudgetPeriod): ISODateString {
  const parsed = parseISODate(date);
  switch (period) {
    case 'weekly':
      return toISODateString(addWeeks(parsed, 1));
    case 'monthly':
      return toISODateString(addMonths(parsed, 1));
    case 'quarterly':
      return toISODateString(addQuarters(parsed, 1));
    case 'yearly':
      return toISODateString(addYears(parsed, 1));
  }
}

/** Common convenience ranges for the transactions/analytics filter presets. */
export function getPresetDateRange(
  preset: 'last7days' | 'last30days' | 'thisMonth' | 'lastMonth' | 'thisYear',
): DateRange {
  const now = new Date();

  switch (preset) {
    case 'last7days':
      return { from: toISODateString(addDays(now, -6)), to: toISODateString(now) };
    case 'last30days':
      return { from: toISODateString(addDays(now, -29)), to: toISODateString(now) };
    case 'thisMonth':
      return {
        from: toISODateString(startOfMonth(now)),
        to: toISODateString(endOfMonth(now)),
      };
    case 'lastMonth': {
      const lastMonth = addMonths(now, -1);
      return {
        from: toISODateString(startOfMonth(lastMonth)),
        to: toISODateString(endOfMonth(lastMonth)),
      };
    }
    case 'thisYear':
      return {
        from: toISODateString(startOfYear(now)),
        to: toISODateString(endOfYear(now)),
      };
  }
}
