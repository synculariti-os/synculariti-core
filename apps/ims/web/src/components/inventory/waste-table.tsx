'use client';

import React, { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api-client';
import { Trash2, Plus, X, Loader2, Search } from 'lucide-react';

interface WasteLog {
  id: string;
  item_id: string;
  quantity: number;
  reason: string | null;
  recorded_at: string;
}

export function WasteTable() {
  const [logs, setLogs] = useState<WasteLog[]>([]);
  const [items, setItems] = useState<{ id: string; name: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const fetchLogs = async () => {
    try {
      setIsLoading(true);
      const res = await apiClient<{ data: WasteLog[] }>('/inventory/waste');
      setLogs(res.data || []);
    } catch (err) {
      console.error('Failed to fetch waste logs:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchItems = async () => {
    try {
      const res = await apiClient<{ data: { id: string; name: string }[] }>('/items');
      setItems(res.data || []);
    } catch {}
  };

  useEffect(() => { fetchLogs(); fetchItems(); }, []);

  const filteredLogs = logs.filter((l) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (l.reason || '').toLowerCase().includes(q) || l.id.toLowerCase().includes(q);
  });

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm">
      <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative max-w-md w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input type="text" placeholder="Search waste logs..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-9 pr-4 py-2 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow" />
        </div>
        <button onClick={() => setIsCreateOpen(true)} className="flex items-center justify-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium text-sm transition-colors whitespace-nowrap shadow-sm">
          <Plus className="w-4 h-4 mr-2" /> Log Waste
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-zinc-600 dark:text-zinc-400">
          <thead className="text-xs text-zinc-500 uppercase bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-200 dark:border-zinc-800">
            <tr>
              <th className="px-6 py-4 font-medium">Item</th>
              <th className="px-6 py-4 font-medium">Quantity</th>
              <th className="px-6 py-4 font-medium">Reason</th>
              <th className="px-6 py-4 font-medium">Timestamp</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {isLoading ? (
              <tr><td colSpan={4} className="px-6 py-12 text-center"><div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-solid border-blue-600 border-r-transparent" /></td></tr>
            ) : filteredLogs.length === 0 ? (
              <tr><td colSpan={4} className="px-6 py-12 text-center text-zinc-500">
                <Trash2 className="w-12 h-12 mx-auto text-zinc-300 dark:text-zinc-700 mb-3" />
                <p className="text-base font-medium text-zinc-900 dark:text-zinc-100">No waste logged</p>
                <p className="mt-1 mb-4">Record waste and spoilage here.</p>
                <button onClick={() => setIsCreateOpen(true)} className="inline-flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium text-sm transition-colors shadow-sm"><Plus className="w-4 h-4 mr-2" /> Log Waste</button>
              </td></tr>
            ) : (
              filteredLogs.map((log) => {
                const item = items.find(i => i.id === log.item_id);
                return (
                  <tr key={log.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-zinc-900 dark:text-zinc-100">{item?.name || log.item_id.slice(0, 8)}</td>
                    <td className="px-6 py-4 text-red-600 font-medium">-{log.quantity}</td>
                    <td className="px-6 py-4 text-zinc-500">{log.reason || '-'}</td>
                    <td className="px-6 py-4 text-zinc-500 whitespace-nowrap">{new Date(log.recorded_at).toLocaleString()}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {isCreateOpen && <CreateWasteDialog items={items} onClose={() => setIsCreateOpen(false)} onSuccess={() => { setIsCreateOpen(false); fetchLogs(); }} />}
    </div>
  );
}

function CreateWasteDialog({ items, onClose, onSuccess }: { items: { id: string; name: string }[]; onClose: () => void; onSuccess: () => void }) {
  const [itemId, setItemId] = useState('');
  const [quantity, setQuantity] = useState('');
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemId || !quantity) { setError('Item and quantity are required'); return; }
    try {
      setIsSubmitting(true);
      setError('');
      await apiClient('/inventory/waste', {
        method: 'POST',
        body: { itemId, quantity: Number(quantity), reason: reason || null },
      });
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to log waste');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl p-6 max-w-md w-full mx-4 border border-zinc-200 dark:border-zinc-800" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">Log Waste</h3>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Item</label>
            <select value={itemId} onChange={(e) => setItemId(e.target.value)} className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm">
              <option value="">Select item...</option>
              {items.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Quantity</label>
            <input type="number" step="any" min="0" value={quantity} onChange={(e) => setQuantity(e.target.value)} className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" placeholder="e.g. 5" />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Reason (Optional)</label>
            <textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={2} className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" placeholder="e.g. Spoiled, damaged, expired" />
          </div>
          {error && <p className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg">{error}</p>}
          <div className="flex gap-3 justify-end pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl text-sm font-medium border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="flex items-center px-4 py-2 rounded-xl text-sm font-medium bg-red-600 hover:bg-red-700 text-white transition-colors disabled:opacity-50">
              {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null} Log Waste
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
