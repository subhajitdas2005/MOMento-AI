'use client';

import React, { useState } from 'react';
import {
  Download,
  FileText,
  FileSpreadsheet,
  Copy,
  Check,
  Trash2,
} from 'lucide-react';
import { MoMData } from '@/types/mom';
import { exportToPDF } from '@/utils/pdfExport';
import { exportToDocx } from '@/utils/docxExport';
import { formatMoMToMarkdown } from '@/utils/markdownExport';
import confetti from 'canvas-confetti';

interface ExportActionsProps {
  mom: MoMData;
  onReset: () => void;
  onShowToast: (msg: string) => void;
}

export const ExportActions: React.FC<ExportActionsProps> = ({
  mom,
  onReset,
  onShowToast,
}) => {
  const [copiedMd, setCopiedMd] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [isExportingDocx, setIsExportingDocx] = useState(false);

  const handleExportPDF = () => {
    try {
      setIsExportingPdf(true);
      exportToPDF(mom);
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.85 },
      });
      onShowToast('PDF document generated & downloaded.');
    } catch (err: unknown) {
      console.error(err);
      const msg = err instanceof Error ? err.message : 'Unknown error';
      onShowToast(`Failed to export PDF: ${msg}`);
    } finally {
      setIsExportingPdf(false);
    }
  };

  const handleExportDOCX = async () => {
    try {
      setIsExportingDocx(true);
      await exportToDocx(mom);
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.85 },
      });
      onShowToast('Word (.docx) document generated & downloaded.');
    } catch (err: unknown) {
      console.error(err);
      const msg = err instanceof Error ? err.message : 'Unknown error';
      onShowToast(`Failed to export DOCX: ${msg}`);
    } finally {
      setIsExportingDocx(false);
    }
  };

  const handleCopyMarkdown = async () => {
    try {
      const md = formatMoMToMarkdown(mom);
      await navigator.clipboard.writeText(md);
      setCopiedMd(true);
      onShowToast('Markdown copied to clipboard.');
      setTimeout(() => setCopiedMd(false), 2000);
    } catch (err) {
      console.error(err);
      onShowToast('Failed to copy Markdown.');
    }
  };

  return (
    <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-4 sm:p-5 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
      <div className="flex items-center gap-3 self-start md:self-center">
        <div className="p-2.5 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-400">
          <Download className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-zinc-100">Export & Share MoM</h3>
          <p className="text-xs text-zinc-400">Download formatted executive documents or copy to notes</p>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
        {/* PDF Export */}
        <button
          type="button"
          onClick={handleExportPDF}
          disabled={isExportingPdf}
          className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-zinc-950 text-xs font-semibold flex items-center justify-center gap-1.5 shadow-md shadow-teal-500/20 transition-all cursor-pointer hover:scale-102 active:scale-98"
        >
          <FileText className="w-4 h-4" />
          <span>Export PDF</span>
        </button>

        {/* DOCX Export */}
        <button
          type="button"
          onClick={handleExportDOCX}
          disabled={isExportingDocx}
          className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-100 text-xs font-semibold flex items-center justify-center gap-1.5 border border-zinc-700/80 transition-all cursor-pointer hover:scale-102 active:scale-98"
        >
          <FileSpreadsheet className="w-4 h-4 text-blue-400" />
          <span>Export Word (.docx)</span>
        </button>

        {/* Copy Markdown */}
        <button
          type="button"
          onClick={handleCopyMarkdown}
          className="flex-1 sm:flex-initial px-3.5 py-2.5 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-zinc-300 text-xs font-medium flex items-center justify-center gap-1.5 border border-zinc-800 transition-all cursor-pointer"
        >
          {copiedMd ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copiedMd ? 'Copied MD' : 'Copy MD'}</span>
        </button>

        {/* Discard / New Meeting */}
        <button
          type="button"
          onClick={onReset}
          className="px-3.5 py-2.5 rounded-xl bg-red-950/30 hover:bg-red-900/40 text-red-300 border border-red-800/40 text-xs font-medium flex items-center justify-center gap-1.5 transition-all cursor-pointer"
          title="Discard all data and start a new meeting"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Purge & Reset</span>
        </button>
      </div>
    </div>
  );
};
