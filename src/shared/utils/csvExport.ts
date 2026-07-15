// src/shared/utils/csvExport.ts
// SINGLE SOURCE OF TRUTH for CSV export. Wraps PapaParse's unparse so every
// feature (transactions table, budget summary, analytics) generates CSVs
// through one consistent path — same column-formatting rules, same money/
// date formatting (via currency.ts / date.ts), same download mechanism.

import Papa from 'papaparse';

import { formatCurrency } from '@/shared/utils/currency';
import { formatDate } from '@/shared/utils/date';
import type { Money, ISODateString } from '@/shared/types';

// ----------------------------------------------------------------------------
// 1. COLUMN DEFINITION — declarative, so each feature just describes WHAT to
// export, not HOW (escaping, formatting, download plumbing all live here).
// ----------------------------------------------------------------------------

export interface CsvColumn<TRow> {
  header: string;
  /** Extracts and formats the cell value as a plain string. Receives the
   *  full row so a column can combine multiple fields if needed. */
  accessor: (row: TRow) => string;
}

// ----------------------------------------------------------------------------
// 2. TYPED FORMATTING HELPERS — for the common cell-type cases, so feature
// code building column defs doesn't reach for formatCurrency/formatDate
// directly and risk inconsistent options between exports.
// ----------------------------------------------------------------------------

export function moneyColumn<TRow>(
  header: string,
  accessor: (row: TRow) => Money,
): CsvColumn<TRow> {
  return {
    header,
    // showSymbol: false — CSVs open in Excel/Sheets, where a currency
    // symbol embedded in a numeric-looking string breaks SUM() formulas
    // for the person receiving the export. Symbol goes in the header instead.
    accessor: (row) => formatCurrency(accessor(row), { showSymbol: false }),
  };
}

export function dateColumn<TRow>(
  header: string,
  accessor: (row: TRow) => ISODateString,
): CsvColumn<TRow> {
  return {
    header,
    accessor: (row) => formatDate(accessor(row), 'short'),
  };
}

export function textColumn<TRow>(
  header: string,
  accessor: (row: TRow) => string | null | undefined,
): CsvColumn<TRow> {
  return { header, accessor: (row) => accessor(row) ?? '' };
}

// ----------------------------------------------------------------------------
// 3. CORE EXPORT
// ----------------------------------------------------------------------------

export interface ExportCsvOptions {
  filename: string;
}

/**
 * Builds a CSV string from typed rows + column definitions, then triggers
 * a browser download. Returns the CSV string too, primarily so tests can
 * assert on content without needing to mock the download mechanism.
 */
export function exportToCsv<TRow>(
  rows: readonly TRow[],
  columns: readonly CsvColumn<TRow>[],
  options: ExportCsvOptions,
): string {
  const data = rows.map((row) =>
    Object.fromEntries(columns.map((col) => [col.header, col.accessor(row)])),
  );

  // PapaParse's unparse handles quoting/escaping of commas, quotes, and
  // newlines within cell values correctly — do not hand-roll CSV joining.
  const csv = Papa.unparse(data, {
    columns: columns.map((col) => col.header),
  });

  triggerDownload(csv, options.filename, 'text/csv;charset=utf-8;');
  return csv;
}

// ----------------------------------------------------------------------------
// 4. DOWNLOAD MECHANISM — shared by csvExport and (indirectly) pdfExport
// ----------------------------------------------------------------------------

export function triggerDownload(content: string | Blob, filename: string, mimeType: string): void {
  const blob = content instanceof Blob ? content : new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // Revoke on a delay, not synchronously — some browsers (notably older
  // Safari) fail the download if the object URL is revoked before the
  // click's navigation has actually started.
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** Timestamped filename helper so repeated exports don't overwrite each
 *  other in the user's downloads folder: "transactions_2026-07-10.csv" */
export function buildExportFilename(baseName: string, extension: 'csv' | 'pdf' | 'xlsx'): string {
  const timestamp = new Date().toISOString().slice(0, 10);
  return `${baseName}_${timestamp}.${extension}`;
}
