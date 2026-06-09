'use client';

import React, { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api-client';
import { AlertTriangle, Loader2, Search } from 'lucide-react';

export function ParAlertsTable() {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    async function load() {
      try {
        setIsLoading(true);
        const res = await apiClient<{ data: any[] }>('/reports/par-alerts');
        setAlerts(res.data || []);
      } catch (err) {
        console.error('Failed to load par alerts:', err);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  const filtered = alerts.filter((a) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (a.item_name || '').toLowerCase().includes(q) || (a.sku || '').toLowerCase().includes(q);
  });

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm">
      <div className="p-4 border-b border-zinc-200 dark:border-zinc-800">
        <div className="relative max-w-md w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input type="text" placeholder="Search by item or SKU..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-9 pr-4 py-2 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow" />
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-zinc-600 dark:text-zinc-400">
          <thead className="text-xs text-zinc-500 uppercase bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-200 dark:border-zinc-800">
            <tr>
              <th className="px-6 py-4 font-medium">Item</th>
              <th className="px-6 py-4 font-medium">SKU</th>
              <th className="px-6 py-4 font-medium text-right">Par Level</th>
              <th className="px-6 py-4 font-medium text-right">On Hand</th>
              <th className="px-6 py-4 font-medium text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {isLoading ? (
              <tr><td colSpan={5} className="px-6 py-12 text-center"><div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-solid border-blue-600 border-r-transparent" /></td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={5} className="px-6 py-12 text-center text-zinc-500">
                <AlertTriangle className="w-12 h-12 mx-auto text-zinc-300 dark:text-zinc-700 mb-3" />
                <p className="text-base font-medium text-zinc-900 dark:text-zinc-100">All items above par</p>
                <p className="mt-1">No items are below their minimum par level.</p>
              </td></tr>
            ) : (
              filtered.map((a, i) => {
                const ratio = a.quantity_on_hand / a.par_level;
                return (
                  <tr key={i} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-zinc-900 dark:text-zinc-100">{a.item_name}</td>
                    <td className="px-6 py-4 text-zinc-400 font-mono text-xs">{a.sku || '-'}</td>
                    <td className="px-6 py-4 text-right">{a.par_level}</td>
                    <td className="px-6 py-4 text-right font-medium">{a.quantity_on_hand}</td>
                    <td className="px-6 py-4 text-right">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                        ratio <= 0.25 ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300' :
                        ratio <= 0.5 ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300' :
                        'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300'
                      }`}>
                        {ratio <= 0.25 ? 'Critical' : ratio <= 0.5 ? 'Low' : 'Below Par'}
                      </span>
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
