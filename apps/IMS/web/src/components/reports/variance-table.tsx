'use client';

import React, { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api-client';
import { BarChart3, Loader2, Search } from 'lucide-react';

export function VarianceTable() {
  const [rows, setRows] = useState<any[]>([]);
  const [items, setItems] = useState<{ id: string; name: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    async function load() {
      try {
        setIsLoading(true);
        const [res, itemsRes] = await Promise.all([
          apiClient<{ data: any[] }>('/reports/variance'),
          apiClient<{ data: { id: string; name: string }[] }>('/items'),
        ]);
        setRows(res.data || []);
        setItems(itemsRes.data || []);
      } catch (err) {
        console.error('Failed to load variance data:', err);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  const itemName = (id: string) => items.find(i => i.id === id)?.name || id?.slice(0, 8) || '-';

  const filtered = rows.filter((r) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (itemName(r.item_id).toLowerCase().includes(q)) || (r.reporting_month || '').includes(q);
  });

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm">
      <div className="p-4 border-b border-zinc-200 dark:border-zinc-800">
        <div className="relative max-w-md w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input type="text" placeholder="Search by item or month..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-9 pr-4 py-2 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow" />
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-zinc-600 dark:text-zinc-400">
          <thead className="text-xs text-zinc-500 uppercase bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-200 dark:border-zinc-800">
            <tr>
              <th className="px-6 py-4 font-medium">Item</th>
              <th className="px-6 py-4 font-medium">Month</th>
              <th className="px-6 py-4 font-medium text-right">Actual Qty</th>
              <th className="px-6 py-4 font-medium text-right">Theoretical Qty</th>
              <th className="px-6 py-4 font-medium text-right">Variance</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {isLoading ? (
              <tr><td colSpan={5} className="px-6 py-12 text-center"><div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-solid border-blue-600 border-r-transparent" /></td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={5} className="px-6 py-12 text-center text-zinc-500">
                <BarChart3 className="w-12 h-12 mx-auto text-zinc-300 dark:text-zinc-700 mb-3" />
                <p className="text-base font-medium text-zinc-900 dark:text-zinc-100">No variance data</p>
                <p className="mt-1">Run sales imports to generate variance analytics.</p>
              </td></tr>
            ) : (
              filtered.map((r, i) => {
                const variance = Number(r.unexplained_variance_qty ?? 0);
                return (
                  <tr key={i} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-zinc-900 dark:text-zinc-100">{itemName(r.item_id)}</td>
                    <td className="px-6 py-4 text-zinc-500">{r.reporting_month || '-'}</td>
                    <td className="px-6 py-4 text-right">{r.actual_qty ?? '-'}</td>
                    <td className="px-6 py-4 text-right">{r.theoretical_qty ?? '-'}</td>
                    <td className={`px-6 py-4 text-right font-medium ${variance < 0 ? 'text-red-500' : variance > 0 ? 'text-amber-500' : 'text-zinc-400'}`}>
                      {variance !== 0 ? (variance > 0 ? '+' : '') + variance.toFixed(2) : '-'}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
