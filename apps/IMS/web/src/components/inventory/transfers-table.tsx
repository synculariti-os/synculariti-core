'use client';

import React, { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api-client';
import { ArrowLeftRight, Plus, X, Loader2, Search, CheckCircle } from 'lucide-react';

interface Transfer {
  id: string;
  item_id: string;
  origin_restaurant_id: string;
  destination_restaurant_id: string;
  qty: number;
  status: 'PENDING' | 'IN_TRANSIT' | 'COMPLETED' | 'CANCELLED';
  created_at: string;
}

const STATUS_STYLES: Record<string, string> = {
  PENDING: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300',
  IN_TRANSIT: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
  COMPLETED: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300',
  CANCELLED: 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400',
};

export function TransfersTable() {
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [items, setItems] = useState<{ id: string; name: string }[]>([]);
  const [restaurants, setRestaurants] = useState<{ id: string; name: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [lookupsLoaded, setLookupsLoaded] = useState(false);

  const fetchTransfers = async () => {
    try {
      setIsLoading(true);
      const res = await apiClient<{ data: Transfer[] }>('/inventory/transfers');
      setTransfers(res.data || []);
    } catch (err) {
      console.error('Failed to fetch transfers:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchLookups = async () => {
    try {
      const [itemsRes, restRes] = await Promise.all([
        apiClient<{ data: { id: string; name: string }[] }>('/items'),
        apiClient<{ data: { id: string; name: string }[] }>('/tenant/restaurants'),
      ]);
      setItems(itemsRes.data || []);
      setRestaurants(restRes.data || []);
    } catch {} finally {
      setLookupsLoaded(true);
    }
  };

  useEffect(() => { fetchTransfers(); fetchLookups(); }, []);

  const handleComplete = async (id: string) => {
    try {
      await apiClient(`/inventory/transfers/${id}/complete`, { method: 'PATCH' });
      fetchTransfers();
    } catch (err) {
      console.error('Failed to complete transfer:', err);
    }
  };

  const itemName = (id: string) => items.find(i => i.id === id)?.name || id.slice(0, 8);
  const restName = (id: string) => restaurants.find(r => r.id === id)?.name || id.slice(0, 8);

  const filtered = transfers.filter((t) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return t.id.toLowerCase().includes(q) || t.status.toLowerCase().includes(q);
  });

  const hasMultipleRestaurants = restaurants.length >= 2;

  if (lookupsLoaded && !hasMultipleRestaurants) {
    return (
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm p-12 text-center">
        <ArrowLeftRight className="w-16 h-16 mx-auto text-zinc-300 dark:text-zinc-700 mb-4" />
        <h3 className="text-xl font-semibold text-zinc-900 dark:text-white mb-2">Transfers Unavailable</h3>
        <p className="text-zinc-500 dark:text-zinc-400 max-w-md mx-auto">
          Inventory transfers require at least two restaurants to be configured. Add a destination restaurant before creating transfers.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm">
      <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative max-w-md w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input type="text" placeholder="Search transfers..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-9 pr-4 py-2 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow" />
        </div>
        <button onClick={() => setIsCreateOpen(true)} className="flex items-center justify-center px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg font-medium text-sm transition-colors whitespace-nowrap shadow-sm">
          <Plus className="w-4 h-4 mr-2" /> New Transfer
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-zinc-600 dark:text-zinc-400">
          <thead className="text-xs text-zinc-500 uppercase bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-200 dark:border-zinc-800">
            <tr>
              <th className="px-6 py-4 font-medium">Item</th>
              <th className="px-6 py-4 font-medium">Qty</th>
              <th className="px-6 py-4 font-medium">Route</th>
              <th className="px-6 py-4 font-medium">Status</th>
              <th className="px-6 py-4 font-medium">Created</th>
              <th className="px-6 py-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {isLoading ? (
              <tr><td colSpan={6} className="px-6 py-12 text-center"><div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-solid border-blue-600 border-r-transparent" /></td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={6} className="px-6 py-12 text-center text-zinc-500">
                <ArrowLeftRight className="w-12 h-12 mx-auto text-zinc-300 dark:text-zinc-700 mb-3" />
                <p className="text-base font-medium text-zinc-900 dark:text-zinc-100">No transfers</p>
                <p className="mt-1 mb-4">Create a transfer to move stock between restaurants.</p>
                <button onClick={() => setIsCreateOpen(true)} className="inline-flex items-center px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg font-medium text-sm transition-colors shadow-sm"><Plus className="w-4 h-4 mr-2" /> New Transfer</button>
              </td></tr>
            ) : (
              filtered.map((t) => (
                <tr key={t.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-zinc-900 dark:text-zinc-100">{itemName(t.item_id)}</td>
                  <td className="px-6 py-4 text-zinc-900 dark:text-zinc-100">{t.qty}</td>
                  <td className="px-6 py-4 text-zinc-500">
                    <span className="text-xs font-medium">{restName(t.origin_restaurant_id)}</span>
                    <span className="mx-1.5 text-zinc-300 dark:text-zinc-600">→</span>
                    <span className="text-xs font-medium">{restName(t.destination_restaurant_id)}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${STATUS_STYLES[t.status] || ''}`}>{t.status}</span>
                  </td>
                  <td className="px-6 py-4 text-zinc-500 whitespace-nowrap">{new Date(t.created_at).toLocaleString()}</td>
                  <td className="px-6 py-4 text-right">
                    {t.status === 'PENDING' && (
                      <button onClick={() => handleComplete(t.id)} className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-200 dark:hover:bg-emerald-900/50 transition-colors">
                        <CheckCircle className="w-3.5 h-3.5 mr-1" /> Complete
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {isCreateOpen && (
        <CreateTransferDialog
          items={items}
          restaurants={restaurants}
          onClose={() => setIsCreateOpen(false)}
          onSuccess={() => { setIsCreateOpen(false); fetchTransfers(); }}
        />
      )}
    </div>
  );
}

function CreateTransferDialog({
  items, restaurants, onClose, onSuccess,
}: {
  items: { id: string; name: string }[];
  restaurants: { id: string; name: string }[];
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [itemId, setItemId] = useState('');
  const [originId, setOriginId] = useState('');
  const [destId, setDestId] = useState('');
  const [qty, setQty] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemId || !originId || !destId || !qty) { setError('All fields are required'); return; }
    if (originId === destId) { setError('Origin and destination must be different'); return; }
    try {
      setIsSubmitting(true);
      setError('');
      await apiClient('/inventory/transfers', {
        method: 'POST',
        body: { itemId, originRestaurantId: originId, destinationRestaurantId: destId, qty: Number(qty) },
      });
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to create transfer');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl p-6 max-w-md w-full mx-4 border border-zinc-200 dark:border-zinc-800" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">New Transfer</h3>
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
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Origin Restaurant</label>
            <select value={originId} onChange={(e) => setOriginId(e.target.value)} className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm">
              <option value="">Select origin...</option>
              {restaurants.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Destination Restaurant</label>
            <select value={destId} onChange={(e) => setDestId(e.target.value)} className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm">
              <option value="">Select destination...</option>
              {restaurants.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Quantity</label>
            <input type="number" step="any" min="0" value={qty} onChange={(e) => setQty(e.target.value)} className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" placeholder="e.g. 10" />
          </div>
          {error && <p className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg">{error}</p>}
          <div className="flex gap-3 justify-end pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl text-sm font-medium border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="flex items-center px-4 py-2 rounded-xl text-sm font-medium bg-violet-600 hover:bg-violet-700 text-white transition-colors disabled:opacity-50">
              {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null} Create Transfer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
