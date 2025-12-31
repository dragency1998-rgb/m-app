'use client';

import React from 'react';
import { X, Download, FileText } from 'lucide-react';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCSVExport: () => void;
  onPDFExport: () => void;
  isLoading?: boolean;
}

export default function ExportModal({
  isOpen,
  onClose,
  onCSVExport,
  onPDFExport,
  isLoading = false
}: ExportModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-xl max-w-sm w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Download size={20} />
            Export Report
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-100 rounded-lg transition-colors"
            disabled={isLoading}
          >
            <X size={20} className="text-slate-600" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-3">
          {/* CSV Export Button */}
          <button
            onClick={onCSVExport}
            disabled={isLoading}
            className="w-full p-4 border-2 border-blue-300 bg-blue-50 hover:bg-blue-100 disabled:bg-slate-100 disabled:border-slate-200 rounded-lg transition-colors flex items-center gap-3 text-left"
          >
            <FileText size={24} className="text-blue-600 flex-shrink-0" />
            <div>
              <p className="font-semibold text-slate-800">Download as CSV</p>
              <p className="text-xs text-slate-600">Lightweight spreadsheet format</p>
            </div>
          </button>

          {/* PDF Export Button */}
          <button
            onClick={onPDFExport}
            disabled={isLoading}
            className="w-full p-4 border-2 border-red-300 bg-red-50 hover:bg-red-100 disabled:bg-slate-100 disabled:border-slate-200 rounded-lg transition-colors flex items-center gap-3 text-left"
          >
            <FileText size={24} className="text-red-600 flex-shrink-0" />
            <div>
              <p className="font-semibold text-slate-800">Download as PDF</p>
              <p className="text-xs text-slate-600">Professional, printer-friendly format</p>
            </div>
          </button>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 rounded-b-lg">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="w-full px-4 py-2 bg-slate-300 hover:bg-slate-400 disabled:bg-slate-200 text-slate-800 font-medium rounded-lg transition-colors"
          >
            Cancel
          </button>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="absolute inset-0 bg-white bg-opacity-50 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
              <p className="text-sm text-slate-600">Generating file...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
