// src/features/transactions/services/transactionsService.ts
// Raw API calls only — no caching, no React, no TanStack Query here. This
// is the ONLY file in the transactions feature that knows the actual
// endpoint URLs; the api/ hooks layer calls these functions, never axios
// directly, so a URL or request-shape change touches exactly one file.

import { axiosClient } from '@/shared/api/axiosClient';
import type {
  PaginatedResult,
  Transaction,
  TransactionFilters,
  TransactionId,
} from '@/shared/types';

import type { TransactionFormValues } from '../validation/transactionSchema';

const BASE_PATH = '/transactions';

export interface FetchTransactionsParams {
  filters: Partial<TransactionFilters>;
  page: number;
  pageSize: number;
  sortField?: string;
  sortDirection?: 'asc' | 'desc';
}

/**
 * Serializes filter/pagination state into query params. Kept as a pure,
 * separately-testable function rather than inlined into fetchTransactions —
 * the filter-to-querystring mapping is exactly the kind of logic that's
 * easy to silently break while refactoring the fetch function itself.
 */
export function buildTransactionsQueryParams(
  params: FetchTransactionsParams,
): Record<string, string | number | string[]> {
  const { filters, page, pageSize, sortField, sortDirection } = params;

  const query: Record<string, string | number | string[]> = {
    page,
    pageSize,
  };

  if (filters.dateRange?.from) query.dateFrom = filters.dateRange.from;
  if (filters.dateRange?.to) query.dateTo = filters.dateRange.to;
  if (filters.accountIds?.length) query.accountIds = filters.accountIds;
  if (filters.categoryIds?.length) query.categoryIds = filters.categoryIds;
  if (filters.types?.length) query.types = filters.types;
  if (filters.searchQuery) query.search = filters.searchQuery;
  if (filters.minAmount != null) query.minAmount = filters.minAmount;
  if (filters.maxAmount != null) query.maxAmount = filters.maxAmount;
  if (sortField) query.sortField = sortField;
  if (sortDirection) query.sortDirection = sortDirection;

  return query;
}

export async function fetchTransactions(
  params: FetchTransactionsParams,
): Promise<PaginatedResult<Transaction>> {
  const response = await axiosClient.get<PaginatedResult<Transaction>>(BASE_PATH, {
    params: buildTransactionsQueryParams(params),
    // Array params (accountIds, categoryIds, types) need repeat-key
    // serialization ("accountIds=a&accountIds=b"), not the default
    // bracket/comma form most backends (including FastAPI + Pydantic list
    // query params) expect.
    paramsSerializer: { indexes: null },
  });
  return response.data;
}

export async function fetchTransactionById(id: TransactionId): Promise<Transaction> {
  const response = await axiosClient.get<Transaction>(`${BASE_PATH}/${id}`);
  return response.data;
}

export async function createTransaction(
  payload: TransactionFormValues,
): Promise<Transaction> {
  const response = await axiosClient.post<Transaction>(BASE_PATH, payload);
  return response.data;
}

export async function updateTransaction(
  id: TransactionId,
  payload: TransactionFormValues,
): Promise<Transaction> {
  const response = await axiosClient.put<Transaction>(`${BASE_PATH}/${id}`, payload);
  return response.data;
}

export async function deleteTransaction(id: TransactionId): Promise<void> {
  await axiosClient.delete(`${BASE_PATH}/${id}`);
}

/** Bulk delete for the table's multi-select row actions — a single request
 *  rather than N sequential DELETE calls when a user selects 50 rows. */
export async function bulkDeleteTransactions(ids: readonly TransactionId[]): Promise<void> {
  await axiosClient.post(`${BASE_PATH}/bulk-delete`, { ids });
}
