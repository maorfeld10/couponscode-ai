import React, { useState, useRef } from 'react';
import { X, Upload, FileText, CheckCircle2, AlertTriangle, Loader2, Download, Info } from 'lucide-react';
import Papa from 'papaparse';
import { motion, AnimatePresence } from 'motion/react';
import * as supabaseService from '../../services/supabaseService';
import { Merchant } from '../../data/mockData';
import { useAdminAuth } from './AdminGuard';

interface BulkUpdateAboutMerchantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  merchants: Merchant[];
}

interface CSVRow {
  id?: string;
  name?: string;
  about_merchant?: string;
}

interface ValidationResult {
  total: number;
  matched: { id: string; name: string; about_merchant: string }[];
  unmatched: { identifier: string; row: number; reason: string }[];
  duplicates: string[];
  isValid: boolean;
}

export const BulkUpdateAboutMerchantModal: React.FC<BulkUpdateAboutMerchantModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  merchants
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [parsing, setParsing] = useState(false);
  const [validating, setValidating] = useState(false);
  const [importing, setImporting] = useState(false);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [importSummary, setImportSummary] = useState<{ success: number; failed: number } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { adminUser } = useAdminAuth();

  if (!isOpen) return null;

  const resetState = () => {
    setFile(null);
    setParsing(false);
    setValidating(false);
    setImporting(false);
    setValidationResult(null);
    setError(null);
    setImportSummary(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type !== 'text/csv' && !selectedFile.name.endsWith('.csv')) {
        setError('Please upload a valid CSV file.');
        return;
      }
      setFile(selectedFile);
      setError(null);
      setValidationResult(null);
      setImportSummary(null);
      parseCSV(selectedFile);
    }
  };

  const parseCSV = (file: File) => {
    setParsing(true);
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.trim().toLowerCase(),
      complete: (results) => {
        setParsing(false);
        validateData(results.data as CSVRow[]);
      },
      error: (err) => {
        setParsing(false);
        setError(`Error parsing CSV: ${err.message}`);
      }
    });
  };

  const validateData = (data: CSVRow[]) => {
    setValidating(true);
    
    const matched: ValidationResult['matched'] = [];
    const unmatched: ValidationResult['unmatched'] = [];
    const seenIdentifiers = new Set<string>();
    const duplicates: string[] = [];

    data.forEach((row, index) => {
      const rowNum = index + 2; // +1 for 0-index, +1 for header row
      const id = row.id?.toString().trim();
      const name = row.name?.toString().trim();
      const aboutMerchant = row.about_merchant?.toString().trim();

      if (!id && !name) {
        unmatched.push({ identifier: 'N/A', row: rowNum, reason: 'Missing both ID and Name' });
        return;
      }

      if (!aboutMerchant) {
        unmatched.push({ identifier: id || name || 'N/A', row: rowNum, reason: 'Missing about_merchant content' });
        return;
      }

      const identifier = id || name!;
      if (seenIdentifiers.has(identifier)) {
        duplicates.push(identifier);
        unmatched.push({ identifier, row: rowNum, reason: `Duplicate identifier: ${identifier}` });
        return;
      }
      seenIdentifiers.add(identifier);

      let merchantMatch: Merchant | undefined;
      if (id) {
        merchantMatch = merchants.find(m => m.id.toString() === id);
      } else if (name) {
        // Case-insensitive exact match
        merchantMatch = merchants.find(m => m.name.toLowerCase() === name.toLowerCase());
      }

      if (merchantMatch) {
        matched.push({
          id: merchantMatch.id.toString(),
          name: merchantMatch.name,
          about_merchant: aboutMerchant
        });
      } else {
        unmatched.push({ identifier, row: rowNum, reason: `Merchant not found: ${identifier}` });
      }
    });

    setValidationResult({
      total: data.length,
      matched,
      unmatched,
      duplicates,
      isValid: unmatched.length === 0
    });
    setValidating(false);
  };

  const handleImport = async () => {
    if (!validationResult || !validationResult.isValid) return;

    setImporting(true);
    try {
      const result = await supabaseService.bulkUpdateMerchantsAbout(validationResult.matched);
      
      // Log audit
      await supabaseService.createAuditLog({
        admin_email: adminUser?.email || 'unknown@admin.com',
        action_type: 'edited',
        entity_type: 'merchant',
        details: `Bulk updated 'about_merchant' for ${result.success} merchants via CSV.`
      });

      setImportSummary({ success: result.success, failed: result.failed });
      if (result.failed === 0) {
        onSuccess();
      }
    } catch (err: any) {
      setError(`Import failed: ${err.message}`);
    } finally {
      setImporting(false);
    }
  };

  const downloadTemplate = () => {
    const csv = Papa.unparse([
      { id: 'merchant-uuid-here', about_merchant: '<h3>About Store</h3><p>Content here...</p>' },
      { name: 'Store Name Here', about_merchant: '<h3>About Store</h3><p>Content here...</p>' }
    ]);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'about_merchant_template.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 sm:p-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative bg-white w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-3xl shadow-2xl flex flex-col"
        >
          <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-headline font-bold text-gray-900 flex items-center gap-2">
                <FileText className="w-6 h-6 text-primary" />
                Bulk Update About Merchant
              </h2>
              <p className="text-sm text-gray-500">Update long-form editorial content via CSV.</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-900"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {!file && !importSummary && (
              <div className="space-y-4">
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-200 rounded-2xl p-12 text-center hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer group"
                >
                  <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                    <Upload className="w-8 h-8 text-gray-400 group-hover:text-primary" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">Upload CSV File</h3>
                  <p className="text-sm text-gray-500 max-w-xs mx-auto">
                    Drag and drop your CSV file here, or click to browse.
                  </p>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept=".csv"
                    className="hidden"
                  />
                </div>

                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex gap-3">
                  <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-800">
                    <p className="font-bold mb-1">CSV Requirements:</p>
                    <ul className="list-disc list-inside space-y-1 opacity-90">
                      <li>Must include <strong>id</strong> OR <strong>name</strong> column.</li>
                      <li>Must include <strong>about_merchant</strong> column (HTML supported).</li>
                      <li>Rows with unmatched identifiers will block the import.</li>
                    </ul>
                  </div>
                </div>

                <button
                  onClick={downloadTemplate}
                  className="w-full flex items-center justify-center gap-2 py-3 border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition-all"
                >
                  <Download className="w-4 h-4" />
                  Download CSV Template
                </button>
              </div>
            )}

            {(parsing || validating) && (
              <div className="py-12 text-center space-y-4">
                <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto" />
                <p className="text-gray-600 font-medium">
                  {parsing ? 'Parsing CSV file...' : 'Validating merchant data...'}
                </p>
              </div>
            )}

            {validationResult && !importing && !importSummary && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="bg-gray-50 rounded-2xl p-4 text-center">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Total Rows</p>
                    <p className="text-2xl font-black text-gray-900">{validationResult.total}</p>
                  </div>
                  <div className="bg-emerald-50 rounded-2xl p-4 text-center">
                    <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-1">Matched</p>
                    <p className="text-2xl font-black text-emerald-700">{validationResult.matched.length}</p>
                  </div>
                  <div className={`rounded-2xl p-4 text-center ${validationResult.unmatched.length > 0 ? 'bg-red-50' : 'bg-gray-50'}`}>
                    <p className={`text-xs font-bold uppercase tracking-wider mb-1 ${validationResult.unmatched.length > 0 ? 'text-red-600' : 'text-gray-500'}`}>Unmatched</p>
                    <p className={`text-2xl font-black ${validationResult.unmatched.length > 0 ? 'text-red-700' : 'text-gray-900'}`}>{validationResult.unmatched.length}</p>
                  </div>
                  <div className={`rounded-2xl p-4 text-center ${validationResult.duplicates.length > 0 ? 'bg-amber-50' : 'bg-gray-50'}`}>
                    <p className={`text-xs font-bold uppercase tracking-wider mb-1 ${validationResult.duplicates.length > 0 ? 'text-amber-600' : 'text-gray-500'}`}>Duplicates</p>
                    <p className={`text-2xl font-black ${validationResult.duplicates.length > 0 ? 'text-amber-700' : 'text-gray-900'}`}>{validationResult.duplicates.length}</p>
                  </div>
                </div>

                {validationResult.unmatched.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-sm font-bold text-red-600 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" />
                      Validation Errors ({validationResult.unmatched.length})
                    </h4>
                    <div className="bg-red-50 border border-red-100 rounded-xl overflow-hidden">
                      <div className="max-h-48 overflow-y-auto">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-red-100/50 sticky top-0">
                            <tr>
                              <th className="px-3 py-2 font-bold text-red-800">Row</th>
                              <th className="px-3 py-2 font-bold text-red-800">Identifier</th>
                              <th className="px-3 py-2 font-bold text-red-800">Reason</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-red-100">
                            {validationResult.unmatched.map((err, i) => (
                              <tr key={i}>
                                <td className="px-3 py-2 text-red-700">{err.row}</td>
                                <td className="px-3 py-2 text-red-700 font-medium">{err.identifier}</td>
                                <td className="px-3 py-2 text-red-700">{err.reason}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                    <p className="text-xs text-red-500 italic">
                      Please fix these errors in your CSV and upload again. All rows must match to proceed.
                    </p>
                  </div>
                )}

                {validationResult.isValid && (
                  <div className="space-y-3">
                    <h4 className="text-sm font-bold text-emerald-600 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4" />
                      Ready to Import
                    </h4>
                    <div className="bg-emerald-50 border border-emerald-100 rounded-xl overflow-hidden">
                      <div className="max-h-48 overflow-y-auto">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-emerald-100/50 sticky top-0">
                            <tr>
                              <th className="px-3 py-2 font-bold text-emerald-800">Merchant</th>
                              <th className="px-3 py-2 font-bold text-emerald-800">Content Preview</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-emerald-100">
                            {validationResult.matched.slice(0, 10).map((m, i) => (
                              <tr key={i}>
                                <td className="px-3 py-2 text-emerald-700 font-medium">{m.name}</td>
                                <td className="px-3 py-2 text-emerald-600 truncate max-w-[200px]">
                                  {m.about_merchant.replace(/<[^>]*>/g, '').substring(0, 50)}...
                                </td>
                              </tr>
                            ))}
                            {validationResult.matched.length > 10 && (
                              <tr>
                                <td colSpan={2} className="px-3 py-2 text-emerald-600 text-center italic">
                                  + {validationResult.matched.length - 10} more merchants
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {importing && (
              <div className="py-12 text-center space-y-4">
                <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto" />
                <p className="text-gray-600 font-medium">Updating merchants in database...</p>
              </div>
            )}

            {importSummary && (
              <div className="py-8 text-center space-y-6">
                <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-gray-900 mb-2">Import Complete!</h3>
                  <div className="flex justify-center gap-8">
                    <div className="text-center">
                      <p className="text-3xl font-black text-emerald-600">{importSummary.success}</p>
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Successful</p>
                    </div>
                    {importSummary.failed > 0 && (
                      <div className="text-center">
                        <p className="text-3xl font-black text-red-600">{importSummary.failed}</p>
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Failed</p>
                      </div>
                    )}
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="px-8 py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 transition-all"
                >
                  Close
                </button>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-xl flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 shrink-0" />
                <p className="text-sm font-medium">{error}</p>
              </div>
            )}
          </div>

          <div className="p-6 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between">
            <button
              onClick={resetState}
              disabled={importing || parsing || validating}
              className="text-sm font-bold text-gray-500 hover:text-gray-900 transition-colors disabled:opacity-50"
            >
              Start Over
            </button>
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-bold text-gray-600 hover:bg-gray-100 rounded-xl transition-all"
              >
                Cancel
              </button>
              {validationResult && !importSummary && (
                <button
                  onClick={handleImport}
                  disabled={!validationResult.isValid || importing}
                  className="px-6 py-2 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {importing ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                  Confirm Import
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
