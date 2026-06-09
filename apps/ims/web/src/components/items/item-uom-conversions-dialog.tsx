'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { X, Loader2, Plus, Trash2, ArrowRight, Scale } from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import type { UomConversion } from '@synculariti/types';
import { useAuthStore } from '@/store/use-auth-store';
import { useHasHydrated } from '@/hooks/use-has-hydrated';

interface ItemUomConversionsDialogProps {
  itemId: string;
  itemName: string;
  onClose: () => void;
}

export function ItemUomConversionsDialog({ itemId, itemName, onClose }: ItemUomConversionsDialogProps) {
  const isHydrated = useHasHydrated();
  const { hasPermission } = useAuthStore();
  const canWrite = isHydrated && hasPermission('INVENTORY.WRITE');

  const [conversions, setConversions] = useState<UomConversion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [fromUom, setFromUom] = useState('');
  const [toUom, setToUom] = useState('');
  const [multiplierFactor, setMultiplierFactor] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchConversions = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await apiClient<{ data: UomConversion[] }>(`/items/${itemId}/uom-conversions`);
      setConversions(res.data || []);
    } catch (err) {
      console.error('Failed to fetch UOM conversions:', err);
    } finally {
      setIsLoading(false);
    }
  }, [itemId]);

  useEffect(() => {
    fetchConversions();
  }, [fetchConversions]);

  const resetForm = () => {
    setFromUom('');
    setToUom('');
    setMultiplierFactor('');
    setError(null);
  };

  const handleAdd = () => {
    resetForm();
    setIsAdding(true);
    setEditingId(null);
  };

  const handleEdit = (conv: UomConversion) => {
    setFromUom(conv.fromUom);
    setToUom(conv.toUom);
    setMultiplierFactor(String(conv.multiplierFactor));
    setEditingId(conv.id);
    setIsAdding(false);
    setError(null);
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingId(null);
    resetForm();
  };

  const handleSubmit = async () => {
    if (!fromUom.trim() || !toUom.trim() || !multiplierFactor) return;
    const factor = Number(multiplierFactor);
    if (!factor || factor <= 0) {
      setError('Multiplier factor must be a positive number');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      await apiClient('/items/uom-conversions', {
        method: 'POST',
        body: { itemId, fromUom: fromUom.trim(), toUom: toUom.trim(), multiplierFactor: factor },
      });
      setIsAdding(false);
      setEditingId(null);
      resetForm();
      await fetchConversions();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to save conversion';
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await apiClient(`/items/uom-conversions/${id}`, { method: 'DELETE' });
      await fetchConversions();
    } catch (err) {
      console.error('Failed to delete conversion:', err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-zinc-900 w-full max-w-2xl rounded-3xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center p-6 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl">
              <Scale className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">UOM Conversions</h2>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">{itemName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-4">
          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl text-sm border border-red-100 dark:border-red-900/30">
              {error}
            </div>
          )}

          {isLoading ? (
            <div className="flex items-center justify-center py-12 text-zinc-400">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
          ) : conversions.length === 0 && !isAdding ? (
            <div className="text-center py-12 text-zinc-500 dark:text-zinc-400">
              <Scale className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="font-medium text-zinc-900 dark:text-zinc-100">No conversions defined</p>
              <p className="text-sm mt-1">Add conversion factors between units of measure for this item.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {conversions.map((conv) => (
                <div
                  key={conv.id}
                  className="flex items-center justify-between p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-zinc-200/50 dark:border-zinc-800"
                >
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-mono font-medium text-zinc-900 dark:text-zinc-100">{conv.fromUom}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-zinc-400" />
                    <span className="font-mono font-medium text-zinc-900 dark:text-zinc-100">{conv.toUom}</span>
                    <span className="text-zinc-400 mx-1">×</span>
                    <span className="font-mono text-zinc-700 dark:text-zinc-300">{conv.multiplierFactor}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleEdit(conv)}
                      className="p-1.5 rounded-lg text-zinc-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors text-xs"
                      title="Edit"
                    >
                      Edit
                    </button>
                    {canWrite && (
                      <button
                        onClick={() => handleDelete(conv.id)}
                        className="p-1.5 rounded-lg text-zinc-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {(isAdding || editingId) && (
            <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-zinc-200/50 dark:border-zinc-800 space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">From UOM</label>
                  <input
                    value={fromUom}
                    onChange={(e) => setFromUom(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all dark:text-white text-sm"
                    placeholder="e.g. KG"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">To UOM</label>
                  <input
                    value={toUom}
                    onChange={(e) => setToUom(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all dark:text-white text-sm"
                    placeholder="e.g. G"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">Multiplier</label>
                  <input
                    value={multiplierFactor}
                    onChange={(e) => setMultiplierFactor(e.target.value)}
                    type="number"
                    step="any"
                    min="0.0001"
                    className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all dark:text-white text-sm"
                    placeholder="e.g. 1000"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  onClick={handleCancel}
                  className="px-3 py-1.5 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting || !fromUom.trim() || !toUom.trim() || !multiplierFactor}
                  className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting && <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />}
                  {editingId ? 'Update' : 'Add'}
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900 flex justify-between">
          {canWrite && (
            <button
              onClick={handleAdd}
              disabled={!!editingId || isAdding}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Conversion
            </button>
          )}
          <button
            onClick={onClose}
            className="px-5 py-2 text-sm font-medium text-white bg-zinc-900 dark:bg-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-100 rounded-xl transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
