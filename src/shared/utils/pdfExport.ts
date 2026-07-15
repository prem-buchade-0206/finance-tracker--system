// src/shared/utils/pdfExport.ts
// SINGLE SOURCE OF TRUTH for PDF export. Wraps jsPDF + jspdf-autotable for
// tabular statement/report exports. Deliberately mirrors csvExport.ts's
// CsvColumn shape so feature code can define columns once and export to
// either format without duplicating formatting logic.

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

import { FEATURE_FLAGS } from '@/shared/constants/env';
import { formatCurrency } from '@/shared/utils/currency';
import { formatDate } from '@/shared/utils/date';
import { buildExportFilename } from '@/shared/utils/csvExport';
import type { Money, ISODateString } from '@/shared/types';

// ----------------------------------------------------------------------------
// 1. COLUMN DEFINITION — parallel to CsvColumn, kept as a separate type
// rather than shared, because PDF cells can carry alignment metadata that
// a CSV cell has no concept of.
// ----------------------------------------------------------------------------

export interface PdfColumn<TRow> {
  header: string;
  accessor: (row: TRow) => string;
  align?: 'left' | 'right' | 'center';
}

export function pdfMoneyColumn<TRow>(
  header: string,
  accessor: (row: TRow) => Money,
): PdfColumn<TRow> {
  return {
    header,
    // Unlike the CSV export, symbol IS shown here — a PDF statement is read
    // by a human, not opened in a spreadsheet formula, so the currency
    // symbol adds clarity rather than breaking anything.
    accessor: (row) => formatCurrency(accessor(row)),
    align: 'right',
  };
}

export function pdfDateColumn<TRow>(
  header: string,
  accessor: (row: TRow) => ISODateString,
): PdfColumn<TRow> {
  return { header, accessor: (row) => formatDate(accessor(row), 'short') };
}

export function pdfTextColumn<TRow>(
  header: string,
  accessor: (row: TRow) => string | null | undefined,
): PdfColumn<TRow> {
  return { header, accessor: (row) => accessor(row) ?? '' };
}

// ----------------------------------------------------------------------------
// 2. CORE EXPORT
// ----------------------------------------------------------------------------

export interface ExportPdfOptions {
  filename: string;
  title: string;
  /** Optional subtitle line — typically a date range, e.g. "1 Jun – 30 Jun 2026". */
  subtitle?: string;
}

export class PdfExportDisabledError extends Error {
  constructor() {
    super('PDF export is disabled (VITE_FEATURE_EXPORT_PDF=false).');
    this.name = 'PdfExportDisabledError';
  }
}

/**
 * Renders rows into a titled, tabular PDF and triggers a download.
 * Throws PdfExportDisabledError if the feature flag is off — callers
 * (e.g. an "Export PDF" button) should check FEATURE_FLAGS.exportPdf
 * themselves to hide the button entirely rather than relying on this throw,
 * but the guard exists here too as a hard backstop.
 */
export function exportToPdf<TRow>(
  rows: readonly TRow[],
  columns: readonly PdfColumn<TRow>[],
  options: ExportPdfOptions,
): void {
  if (!FEATURE_FLAGS.exportPdf) {
    throw new PdfExportDisabledError();
  }

  const doc = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });

  const pageWidth = doc.internal.pageSize.getWidth();
  const marginX = 40;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text(options.title, marginX, 48);

  if (options.subtitle) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(options.subtitle, marginX, 66);
    doc.setTextColor(0);
  }

  autoTable(doc, {
    startY: options.subtitle ? 84 : 66,
    margin: { left: marginX, right: marginX },
    head: [columns.map((col) => col.header)],
    body: rows.map((row) => columns.map((col) => col.accessor(row))),
    columnStyles: Object.fromEntries(
      columns.map((col, index) => [
        index,
        { halign: col.align ?? 'left' },
      ]),
    ),
    headStyles: {
      fillColor: [37, 99, 235], // matches --primitive-blue-600 from tokens.css
      textColor: 255,
      fontStyle: 'bold',
    },
    alternateRowStyles: { fillColor: [248, 250, 252] }, // --primitive-slate-50
    styles: { fontSize: 9, cellPadding: 6 },
    didDrawPage: (data) => {
      // Footer: page number + generation timestamp on every page, not just
      // the last — required for multi-page bank/budget statement exports.
      const pageCount = doc.getNumberOfPages();
      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.text(
        `Page ${data.pageNumber} of ${pageCount} — Generated ${new Date().toLocaleString()}`,
        marginX,
        doc.internal.pageSize.getHeight() - 20,
      );
      doc.setTextColor(0);
    },
  });

  doc.save(buildExportFilename(options.filename, 'pdf'));
}
