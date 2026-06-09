'use client';

import React, { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api-client';
import { ClipboardCheck, Plus, X, Loader2, ChevronDown, ChevronRight, Check, AlertTriangle, Download, Upload } from 'lucide-react';

interface CountBatch {
  id: string;
  status: 'OPEN' | 'SUBMITTED' | 'CLOSED';
  snapshotTimestamp: string;
  version: number;
  createdAt: string;
}

interface CountRow {
  id: string;
  batchId: string;
  itemId: string;
  expectedQty: number;
  actualQty: number | null;
}

const STATUS_STYLES: Record<string, string> = {
  OPEN: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300',
  SUBMITTED: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
  CLOSED: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300',
};

export function CountsTable() {
  const [batches, setBatches] = useState<CountBatch[]>([]);
  const [items, setItems] = useState<{ id: string; name: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isStarting, setIsStarting] = useState(false);
  const [error, setError] = useState('');
  const [expandedBatch, setExpandedBatch] = useState<string | null>(null);
  const [batchRows, setBatchRows] = useState<Record<string, CountRow[]>>({});
  const [loadingRows, setLoadingRows] = useState<Record<string, boolean>>({});
  const [editingValues, setEditingValues] = useState<Record<string, string>>({});
  const [savingRows, setSavingRows] = useState<Record<string, boolean>>({});
  const [closingBatch, setClosingBatch] = useState<string | null>(null);
  const [closeConfirm, setCloseConfirm] = useState<string | null>(null);
  const [importingBatch, setImportingBatch] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [batchesRes, itemsRes] = await Promise.all([
          apiClient<{ data: CountBatch[] }>('/inventory/counts'),
          apiClient<{ data: { id: string; name: string }[] }>('/items'),
        ]);
        if (cancelled) return;
        setBatches(batchesRes.data || []);
        setItems(itemsRes.data || []);
      } catch (err) {
        console.error('Failed to fetch count data:', err);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const refetchBatches = async () => {
    const res = await apiClient<{ data: CountBatch[] }>('/inventory/counts');
    setBatches(res.data || []);
  };

  const handleStartCount = async () => {
    try {
      setIsStarting(true);
      setError('');
      await apiClient('/inventory/counts/start', { method: 'POST' });
      await refetchBatches();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start count');
    } finally {
      setIsStarting(false);
    }
  };

  const toggleExpand = async (batchId: string) => {
    if (expandedBatch === batchId) {
      setExpandedBatch(null);
      return;
    }
    setExpandedBatch(batchId);
    if (!batchRows[batchId]) {
      setLoadingRows(prev => ({ ...prev, [batchId]: true }));
      try {
        const res = await apiClient<{ data: CountRow[] }>(`/inventory/counts/${batchId}/rows`);
        const rows = res.data || [];
        setBatchRows(prev => ({ ...prev, [batchId]: rows }));
        const batch = batches.find(b => b.id === batchId);
        if (batch?.status === 'OPEN') {
          const initial: Record<string, string> = {};
          for (const row of rows) {
            initial[row.id] = row.actualQty !== null ? String(row.actualQty) : '';
          }
          setEditingValues(prev => ({ ...prev, ...initial }));
        }
      } catch {
        setBatchRows(prev => ({ ...prev, [batchId]: [] }));
      } finally {
        setLoadingRows(prev => ({ ...prev, [batchId]: false }));
      }
    }
  };

  const handleActualQtyChange = (rowId: string, value: string) => {
    setEditingValues(prev => ({ ...prev, [rowId]: value }));
  };

  const handleSaveRow = async (batchId: string, rowId: string, itemId: string) => {
    const val = parseFloat(editingValues[rowId]);
    if (isNaN(val) || val < 0) {
      setError('Please enter a valid non-negative number');
      return;
    }
    try {
      setSavingRows(prev => ({ ...prev, [rowId]: true }));
      setError('');
      await apiClient(`/inventory/counts/${batchId}/rows/${rowId}`, {
        method: 'PUT',
        body: { itemId, actualQty: val },
      });
      setBatchRows(prev => ({
        ...prev,
        [batchId]: (prev[batchId] || []).map(r =>
          r.id === rowId ? { ...r, actualQty: val } : r
        ),
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save count');
    } finally {
      setSavingRows(prev => ({ ...prev, [rowId]: false }));
    }
  };

  const handleCloseBatch = async (batch: CountBatch) => {
    setClosingBatch(batch.id);
    setError('');
    setCloseConfirm(null);
    const rows = (batchRows[batch.id] || [])
      .filter(r => r.actualQty !== null)
      .map(r => ({ itemId: r.itemId, actualQty: r.actualQty! }));
    try {
      await apiClient<{ data: { closed: boolean } }>(`/inventory/counts/${batch.id}/close`, {
        method: 'POST',
        body: { batchId: batch.id, version: batch.version, rows },
      });
      await refetchBatches();
      setBatchRows(prev => ({ ...prev, [batch.id]: [] }));
      setExpandedBatch(null);
      // Success — status will update via refetchBatches
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to close batch');
    } finally {
      setClosingBatch(null);
    }
  };

  const itemName = (id: string) => items.find(i => i.id === id)?.name || id.slice(0, 8);

  const handleExport = async (batchId: string) => {
    try {
      const blob = await apiClient<Blob>(`/inventory/counts/${batchId}/export`, {
        method: 'GET',
        responseType: 'blob',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `count-batch-${batchId}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Export failed');
    }
  };

  const handleImport = async (batchId: string, file: File) => {
    try {
      setImportingBatch(batchId);
      setError('');
      const formData = new FormData();
      formData.append('file', file);
      const res = await apiClient<{ data: { updated: number } }>(`/inventory/counts/${batchId}/import`, {
        method: 'POST',
        body: formData,
      });
      await refetchBatches();
      if (expandedBatch === batchId) {
        const rowsRes = await apiClient<{ data: CountRow[] }>(`/inventory/counts/${batchId}/rows`);
        const newRows = rowsRes.data || [];
        setBatchRows(prev => ({ ...prev, [batchId]: newRows }));
        const updatedEditing: Record<string, string> = {};
        for (const row of newRows) {
          updatedEditing[row.id] = row.actualQty !== null ? String(row.actualQty) : '';
        }
        setEditingValues(prev => ({ ...prev, ...updatedEditing }));
      }
      setError(`Import complete: ${res.data?.updated ?? 0} rows updated`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Import failed');
    } finally {
      setImportingBatch(null);
    }
  };

  const computeVariance = (row: CountRow) => {
    const raw = editingValues[row.id] !== undefined ? parseFloat(editingValues[row.id]) : row.actualQty;
    const val = raw ?? 0;
    if (isNaN(val)) return null;
    return val - row.expectedQty;
  };

  const isRowSaved = (row: CountRow) => {
    const currentVal = editingValues[row.id];
    if (currentVal === undefined || currentVal === '') return row.actualQty !== null;
    return parseFloat(currentVal) === row.actualQty;
  };

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm">
      <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
        <div className="text-sm text-zinc-500">{batches.length} count batch{batches.length !== 1 ? 'es' : ''}</div>
        <button onClick={handleStartCount} disabled={isStarting} className="flex items-center justify-center px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium text-sm transition-colors whitespace-nowrap shadow-sm disabled:opacity-50">
          {isStarting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />} Start New Count
        </button>
      </div>
      {error && (
        <div className="px-4 py-2 text-sm text-red-500 bg-red-50 dark:bg-red-900/20 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError('')} className="text-red-400 hover:text-red-600">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-zinc-600 dark:text-zinc-400">
          <thead className="text-xs text-zinc-500 uppercase bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-200 dark:border-zinc-800">
            <tr>
              <th className="px-6 py-4 font-medium w-8"></th>
              <th className="px-6 py-4 font-medium">Status</th>
              <th className="px-6 py-4 font-medium">Snapshot</th>
              <th className="px-6 py-4 font-medium">Version</th>
              <th className="px-6 py-4 font-medium">Created</th>
              <th className="px-6 py-4 font-medium w-40"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {isLoading ? (
              <tr><td colSpan={6} className="px-6 py-12 text-center"><div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-solid border-blue-600 border-r-transparent" /></td></tr>
            ) : batches.length === 0 ? (
              <tr><td colSpan={6} className="px-6 py-12 text-center text-zinc-500">
                <ClipboardCheck className="w-12 h-12 mx-auto text-zinc-300 dark:text-zinc-700 mb-3" />
                <p className="text-base font-medium text-zinc-900 dark:text-zinc-100">No count batches</p>
                <p className="mt-1 mb-4">Start a physical inventory count.</p>
                <button onClick={handleStartCount} disabled={isStarting} className="inline-flex items-center px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium text-sm transition-colors shadow-sm disabled:opacity-50">
                  {isStarting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />} Start New Count
                </button>
              </td></tr>
            ) : (
              batches.map((batch) => (
                <React.Fragment key={batch.id}>
                  <tr className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors cursor-pointer" onClick={() => toggleExpand(batch.id)}>
                    <td className="px-6 py-4">
                      {expandedBatch === batch.id ? <ChevronDown className="w-4 h-4 text-zinc-400" /> : <ChevronRight className="w-4 h-4 text-zinc-400" />}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${STATUS_STYLES[batch.status] || ''}`}>{batch.status}</span>
                    </td>
                    <td className="px-6 py-4 text-zinc-500">{new Date(batch.snapshotTimestamp).toLocaleString()}</td>
                    <td className="px-6 py-4 text-zinc-500">{batch.version}</td>
                    <td className="px-6 py-4 text-zinc-500 whitespace-nowrap">{new Date(batch.createdAt).toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={(e) => { e.stopPropagation(); handleExport(batch.id); }}
                          className="p-1.5 rounded text-zinc-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                          title="Export CSV"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        <label className={`p-1.5 rounded text-zinc-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 cursor-pointer ${importingBatch === batch.id ? 'opacity-50 pointer-events-none' : ''}`}
                          title="Import CSV"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Upload className="w-4 h-4" />
                          <input
                            type="file"
                            accept=".csv"
                            className="hidden"
                            disabled={importingBatch === batch.id}
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleImport(batch.id, file);
                              e.target.value = '';
                            }}
                          />
                        </label>
                        {batch.status === 'OPEN' && (
                          <button
                            onClick={(e) => { e.stopPropagation(); setCloseConfirm(batch.id); }}
                            className="text-xs px-3 py-1.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-900/50 rounded-md font-medium transition-colors"
                          >
                            Close Batch
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                  {expandedBatch === batch.id && (
                    <tr>
                      <td colSpan={6} className="px-6 py-0 bg-zinc-50/50 dark:bg-zinc-800/30">
                        {loadingRows[batch.id] ? (
                          <div className="flex justify-center py-4"><div className="h-5 w-5 animate-spin rounded-full border-2 border-solid border-blue-600 border-r-transparent" /></div>
                        ) : (batchRows[batch.id]?.length === 0) ? (
                          <p className="text-sm text-zinc-400 py-4 text-center">No rows in this batch</p>
                        ) : (
                          <>
                            <table className="w-full text-left text-sm text-zinc-600 dark:text-zinc-400">
                              <thead>
                                <tr className="text-xs text-zinc-400 uppercase">
                                  <th className="px-8 py-2 font-medium w-2/5">Item</th>
                                  <th className="px-4 py-2 font-medium">Expected</th>
                                  <th className="px-4 py-2 font-medium">Actual</th>
                                  <th className="px-4 py-2 font-medium">Variance</th>
                                  {batch.status === 'OPEN' && <th className="px-4 py-2 font-medium w-24"></th>}
                                </tr>
                              </thead>
                              <tbody>
                                {(batchRows[batch.id] || []).map((row) => {
                                  const variance = computeVariance(row);
                                  return (
                                    <tr key={row.id} className="border-t border-zinc-200/50 dark:border-zinc-700/50">
                                      <td className="px-8 py-2 text-zinc-900 dark:text-zinc-100">{itemName(row.itemId)}</td>
                                      <td className="px-4 py-2">{row.expectedQty}</td>
                                      <td className="px-4 py-2">
                                        {batch.status === 'OPEN' ? (
                                          <div className="flex items-center gap-2">
                                            <input
                                              type="number"
                                              min="0"
                                              step="any"
                                              value={editingValues[row.id] ?? ''}
                                              onChange={(e) => handleActualQtyChange(row.id, e.target.value)}
                                              className="w-24 px-2 py-1 border border-zinc-300 dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-800 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                              placeholder="0"
                                            />
                                            {!isRowSaved(row) && (
                                              <button
                                                onClick={() => handleSaveRow(batch.id, row.id, row.itemId)}
                                                disabled={savingRows[row.id]}
                                                className="p-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md transition-colors disabled:opacity-50"
                                                title="Save count"
                                              >
                                                {savingRows[row.id] ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                                              </button>
                                            )}
                                          </div>
                                        ) : (
                                          row.actualQty ?? '-'
                                        )}
                                      </td>
                                      <td className={`px-4 py-2 ${variance !== null && variance !== 0 ? 'text-red-500 font-medium' : 'text-zinc-400'}`}>
                                        {variance !== null ? (variance !== 0 ? (variance > 0 ? '+' : '') + variance : '-') : '-'}
                                      </td>
                                      {batch.status === 'OPEN' && (
                                        <td className="px-4 py-2">
                                          {isRowSaved(row) && row.actualQty !== null && (
                                            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">Saved</span>
                                          )}
                                        </td>
                                      )}
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </>
                        )}
                        {closeConfirm === batch.id && (
                          <div className="px-8 py-3 border-t border-zinc-200 dark:border-zinc-700 bg-red-50/50 dark:bg-red-900/10 flex items-center justify-between">
                            <div className="flex items-center gap-2 text-sm text-red-700 dark:text-red-300">
                              <AlertTriangle className="w-4 h-4" />
                              <span>Close this batch?{batchRows[batch.id]?.length ? ' This will write adjustment entries to the ledger for any variances.' : ''}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => setCloseConfirm(null)}
                                className="px-3 py-1.5 text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 font-medium"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={() => handleCloseBatch(batch)}
                                disabled={closingBatch === batch.id}
                                className="inline-flex items-center px-3 py-1.5 text-sm bg-red-600 hover:bg-red-700 text-white rounded-md font-medium transition-colors disabled:opacity-50"
                              >
                                {closingBatch === batch.id ? <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> : null}
                                Confirm Close
                              </button>
                            </div>
                          </div>
                        )}
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
