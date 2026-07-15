// src/shared/types/index.ts
// Global type contracts. Every feature module imports from here via `@/shared/types`.
// Rule: discriminated unions over optional-field soup — a Transaction can never
// be in an ambiguous state because TypeScript narrows on the `type` field.

// ----------------------------------------------------------------------------
// 1. BRANDED PRIMITIVES
// Prevents accidentally passing a raw string where a typed ID is expected
// (e.g. swapping accountId and categoryId args in a function signature).
// ----------------------------------------------------------------------------

declare const brand: unique symbol;
type Brand<T, B extends string> = T & { readonly [brand]: B };

export type UUID = Brand<string, 'UUID'>;
export type AccountId = Brand<UUID, 'AccountId'>;
export type TransactionId = Brand<UUID, 'TransactionId'>;
export type CategoryId = Brand<UUID, 'CategoryId'>;
export type BudgetId = Brand<UUID, 'BudgetId'>;
export type GoalId = Brand<UUID, 'GoalId'>;
export type UserId = Brand<UUID, 'UserId'>;

/** ISO-8601 date string, e.g. "2026-07-09" — never a raw `Date` in state/API payloads. */
export type ISODateString = Brand<string, 'ISODateString'>;

/** ISO-8601 timestamp string, e.g. "2026-07-09T14:32:00.000Z". */
export type ISODateTimeString = Brand<string, 'ISODateTimeString'>;

/**
 * Monetary amounts are stored as integer minor units (paise/cents), never
 * floats. Prevents classic 0.1 + 0.2 floating point drift in financial math.
 * Convert to major units ONLY at the presentation layer via formatCurrency().
 */
export type MinorUnits = Brand<number, 'MinorUnits'>;

// ----------------------------------------------------------------------------
// 2. CURRENCY
// ----------------------------------------------------------------------------

export const SUPPORTED_CURRENCIES = ['INR', 'USD', 'EUR', 'GBP', 'AED', 'JPY'] as const;
export type CurrencyCode = (typeof SUPPORTED_CURRENCIES)[number];

export interface CurrencyMeta {
  readonly code: CurrencyCode;
  readonly symbol: string;
  readonly minorUnitDecimals: 0 | 2 | 3; // JPY = 0, most = 2, some (BHD-style) = 3
  readonly locale: string; // e.g. 'en-IN' for Intl.NumberFormat
}

export interface Money {
  readonly amount: MinorUnits;
  readonly currency: CurrencyCode;
}

// ----------------------------------------------------------------------------
// 3. ACCOUNTS
// ----------------------------------------------------------------------------

export type AccountType = 'checking' | 'savings' | 'credit_card' | 'cash' | 'investment' | 'loan';

export interface Account {
  readonly id: AccountId;
  readonly userId: UserId;
  name: string;
  type: AccountType;
  institution: string | null;
  currentBalance: Money;
  /** Credit cards / loans carry a limit; other account types leave this null. */
  creditLimit: Money | null;
  colorTag: string; // hex, used for chart series + account chip coloring
  isArchived: boolean;
  createdAt: ISODateTimeString;
  updatedAt: ISODateTimeString;
}

// ----------------------------------------------------------------------------
// 4. CATEGORIES
// ----------------------------------------------------------------------------

export type CategoryKind = 'income' | 'expense';

export interface TransactionCategory {
  readonly id: CategoryId;
  name: string;
  kind: CategoryKind;
  icon: string; // lucide-react icon name
  color: string; // hex
  parentCategoryId: CategoryId | null; // supports one level of sub-categories
  isSystemDefault: boolean; // seeded categories cannot be deleted, only archived
}

// ----------------------------------------------------------------------------
// 5. TRANSACTIONS — discriminated union on `type`
// This is the core contract. A transfer, income entry, and expense entry
// have genuinely different required fields, so modeling them as one flat
// interface with optional fields would let invalid states compile.
// ----------------------------------------------------------------------------

interface TransactionBase {
  readonly id: TransactionId;
  readonly userId: UserId;
  accountId: AccountId;
  amount: Money; // always stored positive; sign is implied by `type`
  date: ISODateString;
  description: string;
  notes: string | null;
  tags: readonly string[];
  attachmentUrl: string | null;
  isRecurring: boolean;
  recurringRuleId: UUID | null;
  createdAt: ISODateTimeString;
  updatedAt: ISODateTimeString;
}

export interface IncomeTransaction extends TransactionBase {
  type: 'income';
  categoryId: CategoryId; // must reference a category with kind: 'income'
  source: string | null; // e.g. employer name, client name
}

export interface ExpenseTransaction extends TransactionBase {
  type: 'expense';
  categoryId: CategoryId; // must reference a category with kind: 'expense'
  merchant: string | null;
  isReimbursable: boolean;
}

export interface TransferTransaction extends TransactionBase {
  type: 'transfer';
  /** For a transfer, `accountId` on the base is the SOURCE account. */
  toAccountId: AccountId;
  categoryId: null; // transfers are never categorized for budgeting purposes
}

export type Transaction = IncomeTransaction | ExpenseTransaction | TransferTransaction;

/** Narrowing helpers — prefer these over inline `tx.type === '...'` checks
 *  scattered across components, so the narrowing logic has one home. */
export function isIncome(tx: Transaction): tx is IncomeTransaction {
  return tx.type === 'income';
}
export function isExpense(tx: Transaction): tx is ExpenseTransaction {
  return tx.type === 'expense';
}
export function isTransfer(tx: Transaction): tx is TransferTransaction {
  return tx.type === 'transfer';
}

// ----------------------------------------------------------------------------
// 6. BUDGETS
// ----------------------------------------------------------------------------

export type BudgetPeriod = 'weekly' | 'monthly' | 'quarterly' | 'yearly';

export interface Budget {
  readonly id: BudgetId;
  readonly userId: UserId;
  categoryId: CategoryId;
  period: BudgetPeriod;
  limit: Money;
  /** Denormalized rolling spend, kept in sync by the budgets feature's
   *  service layer whenever a matching expense transaction is written. */
  currentSpend: Money;
  startDate: ISODateString;
  rolloverUnused: boolean;
  alertThresholdPercent: number; // 0-100, triggers a warning toast/badge
}

export type BudgetStatus = 'on_track' | 'approaching_limit' | 'over_budget';

export function getBudgetStatus(budget: Budget): BudgetStatus {
  const ratio = budget.currentSpend.amount / budget.limit.amount;
  if (ratio >= 1) return 'over_budget';
  if (ratio >= budget.alertThresholdPercent / 100) return 'approaching_limit';
  return 'on_track';
}

// ----------------------------------------------------------------------------
// 7. SAVINGS GOALS
// ----------------------------------------------------------------------------

export interface SavingsGoal {
  readonly id: GoalId;
  readonly userId: UserId;
  name: string;
  targetAmount: Money;
  currentAmount: Money;
  targetDate: ISODateString | null;
  linkedAccountId: AccountId | null;
  icon: string;
  colorTag: string;
  isCompleted: boolean;
}

// ----------------------------------------------------------------------------
// 8. ANALYTICS / CHART DATA SHAPES
// Kept separate from domain entities — analytics types describe DERIVED,
// aggregated shapes returned by the analytics API, not persisted records.
// ----------------------------------------------------------------------------

export interface CashflowDataPoint {
  date: ISODateString;
  income: MinorUnits;
  expense: MinorUnits;
  net: MinorUnits;
}

export interface CategoryBreakdownSlice {
  categoryId: CategoryId;
  categoryName: string;
  color: string;
  total: MinorUnits;
  percentOfTotal: number;
}

export interface NetWorthDataPoint {
  date: ISODateString;
  assets: MinorUnits;
  liabilities: MinorUnits;
  netWorth: MinorUnits;
}

// ----------------------------------------------------------------------------
// 9. API ENVELOPE TYPES
// Every TanStack Query hook resolves to `ApiResult<T>`, never a bare T,
// so pagination/error metadata is available without a second round trip.
// ----------------------------------------------------------------------------

export interface PaginationMeta {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

export interface PaginatedResult<T> {
  items: readonly T[];
  meta: PaginationMeta;
}

export type ApiError = {
  code: string;
  message: string;
  fieldErrors: Readonly<Record<string, string>> | null;
};

export type ApiResult<T> =
  | { status: 'success'; data: T }
  | { status: 'error'; error: ApiError };

// ----------------------------------------------------------------------------
// 10. FILTER / SORT SHAPES (shared across TanStack Table + Query hooks)
// ----------------------------------------------------------------------------

export interface DateRange {
  from: ISODateString | null;
  to: ISODateString | null;
}

export interface TransactionFilters {
  dateRange: DateRange;
  accountIds: readonly AccountId[];
  categoryIds: readonly CategoryId[];
  types: readonly Transaction['type'][];
  searchQuery: string;
  minAmount: MinorUnits | null;
  maxAmount: MinorUnits | null;
}

export type SortDirection = 'asc' | 'desc';

export interface SortRule<TField extends string = string> {
  field: TField;
  direction: SortDirection;
}

// ----------------------------------------------------------------------------
// 11. THEME
// ----------------------------------------------------------------------------

export type ThemeMode = 'light' | 'dark' | 'system';
