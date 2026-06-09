'use client';

import React, { useEffect, useState, useRef } from 'react';
import { ItemWithOverride } from '@synculariti/types';
import { apiClient } from '@/lib/api-client';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/use-auth-store';
import { useHasHydrated } from '@/hooks/use-has-hydrated';
import { Package, Plus, Search, Tag, Scale, Pencil, Trash2, AlertTriangle, Upload, Download, X, Loader2, FileUp, AlertCircle, CheckCircle2, ArrowUpDown, ChevronUp, ChevronDown, ArrowRightLeft, LayoutList } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CreateItemDialog } from './create-item-dialog';
import { EditItemDialog } from './edit-item-dialog';
import { ItemUomConversionsDialog } from './item-uom-conversions-dialog';

function ConfirmDeleteModal({ onConfirm, onCancel, name }: { onConfirm: () => void; onCancel: () => void; name: string }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onCancel}>
      <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl p-6 max-w-sm w-full mx-4 border border-zinc-200 dark:border-zinc-800" onClick={e => e.stopPropagation()}>
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-full"><AlertTriangle className="w-5 h-5 text-red-500" /></div>
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">Delete Item</h3>
        </div>
        <p className="text-zinc-600 dark:text-zinc-400 mb-6 text-sm">Delete <span className="font-semibold text-zinc-900 dark:text-white">{name}</span>? This is permanent and cannot be undone.</p>
        <div className="flex gap-3 justify-end">
          <button onClick={onCancel} className="px-4 py-2 rounded-xl text-sm font-medium border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">Cancel</button>
          <button onClick={onConfirm} className="px-4 py-2 rounded-xl text-sm font-medium bg-red-600 hover:bg-red-700 text-white transition-colors">Delete</button>
        </div>
      </div>
    </div>
  );
}

type SortColumn = 'name' | 'type' | 'categoryName' | 'inventoryUom' | 'purchasingUom';
type SortDir = 'asc' | 'desc';

export function ItemsTable() {
  const [items, setItems] = useState<ItemWithOverride[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState<'all' | ItemWithOverride['type']>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortColumn, setSortColumn] = useState<SortColumn>('name');
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteConfirmBulk, setDeleteConfirmBulk] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ItemWithOverride | null>(null);
  const [deletingItem, setDeletingItem] = useState<ItemWithOverride | null>(null);
  const [uomItem, setUomItem] = useState<ItemWithOverride | null>(null);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<{ totalRows: number; createdCount: number; errorCount: number; errors: { row: number; item: string; message: string }[]; created: { row: number; name: string; sku: string }[] } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isHydrated = useHasHydrated();
  const { restaurantId, hasPermission } = useAuthStore();

  const canWrite = isHydrated && hasPermission('INVENTORY.WRITE');

  useEffect(() => {
    let isMounted = true;
    const fetchItems = async () => {
      try {
        setIsLoading(true);
        const data = await apiClient<{ data: ItemWithOverride[] }>('/items');
        if (isMounted) setItems(data.data || []);
      } catch (error) {
        console.error('Failed to fetch items:', error);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchItems();
    return () => {
      isMounted = false;
    };
  }, []);

  const refreshItems = () => {
    apiClient<{ data: ItemWithOverride[] }>('/items')
      .then(data => setItems(data.data || []))
      .catch(err => console.error(err));
  };

  const toggleSort = (col: SortColumn) => {
    if (sortColumn === col) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(col);
      setSortDir('asc');
    }
  };

  const sortIcon = (col: SortColumn) => {
    if (sortColumn !== col) return <ArrowUpDown className="w-3 h-3 ml-1 inline opacity-40" />;
    return sortDir === 'asc'
      ? <ChevronUp className="w-3 h-3 ml-1 inline" />
      : <ChevronDown className="w-3 h-3 ml-1 inline" />;
  };

  const sortedItems = [...items].sort((a, b) => {
    const aVal = (a[sortColumn] ?? '').toString().toLowerCase();
    const bVal = (b[sortColumn] ?? '').toString().toLowerCase();
    return sortDir === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
  });

  const typeFiltered = typeFilter === 'all' ? sortedItems : sortedItems.filter((i) => i.type === typeFilter);

  const filteredItems = typeFiltered.filter(
    (item) =>
      (item.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.sku || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.type || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.categoryName || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const allFilteredSelected = filteredItems.length > 0 && filteredItems.every((v) => selectedIds.has(v.id));

  const handleSelectAll = () => {
    if (allFilteredSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredItems.map((v) => v.id)));
    }
  };

  const handleSelectOne = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedIds(next);
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    setIsDeleting(true);
    try {
      await apiClient('/items/bulk-delete', {
        method: 'POST',
        body: { ids: Array.from(selectedIds) },
      });
      setDeleteConfirmBulk(false);
      setSelectedIds(new Set());
      refreshItems();
    } catch (err: any) {
      alert(err.message || 'Failed to delete items');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative w-full sm:max-w-xs">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-zinc-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-zinc-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm transition-all"
            placeholder="Search items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <button
            onClick={async () => {
              try {
                const { data: { session } } = await supabase.auth.getSession();
                if (!session) return;
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/items/upload/template`, {
                  headers: { 'Authorization': `Bearer ${session.access_token}` },
                });
                if (!res.ok) throw new Error('Failed to download template');
                const blob = await res.blob();
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'items-upload-template.csv';
                a.click();
                URL.revokeObjectURL(url);
              } catch (err) {
                console.error('Failed to download template:', err);
              }
            }}
            className="inline-flex items-center justify-center px-3 py-2 border border-zinc-300 dark:border-zinc-700 text-sm font-medium rounded-xl shadow-sm text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
            title="Download CSV template"
          >
            <Download className="h-4 w-4 mr-2" />
            Template
          </button>
          {canWrite && (
            <button
              onClick={() => setIsUploadOpen(true)}
              className="inline-flex items-center justify-center px-3 py-2 border border-zinc-300 dark:border-zinc-700 text-sm font-medium rounded-xl shadow-sm text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload
            </button>
          )}
          {canWrite && (
            <button
              onClick={() => setIsCreateOpen(true)}
              className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-xl shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Item
            </button>
          )}
        </div>
      </div>

      {selectedIds.size > 0 && (
        <div className="flex items-center gap-3 px-4 py-3 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800/30 rounded-3xl">
          <span className="text-sm font-medium text-red-700 dark:text-red-400">
            {selectedIds.size} selected
          </span>
          {canWrite && (
            <button
              onClick={() => setDeleteConfirmBulk(true)}
              className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-red-700 dark:text-red-400 bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-900/50 rounded-lg transition-colors"
            >
              <Trash2 className="w-4 h-4 mr-1.5" />
              Delete Selected
            </button>
          )}
          <button
            onClick={() => setSelectedIds(new Set())}
            className="text-sm text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 ml-auto transition-colors"
          >
            Clear selection
          </button>
        </div>
      )}

      <div className="flex items-center gap-1 overflow-x-auto pb-1">
        <button
          onClick={() => { setTypeFilter('all'); setSelectedIds(new Set()); }}
          className={cn(
            'inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-medium rounded-lg transition-colors',
            typeFilter === 'all'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800'
          )}
        >
          <LayoutList className="w-3.5 h-3.5" />
          All ({items.length})
        </button>
        {(['INGREDIENTS', 'PACKAGING', 'MERCHANDISE', 'SUPPLY', 'MISCELLANEOUS'] as const).map((t) => {
          const count = items.filter(i => i.type === t).length;
          const badgeColor =
            t === 'INGREDIENTS' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' :
            t === 'PACKAGING' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300' :
            t === 'MERCHANDISE' ? 'bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-300' :
            t === 'SUPPLY' ? 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300' :
            'bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-300';
          return (
            <button
              key={t}
              onClick={() => { setTypeFilter(t); setSelectedIds(new Set()); }}
              className={cn(
                'px-3 py-1.5 text-xs font-medium rounded-lg transition-colors',
                typeFilter === t
                  ? badgeColor
                  : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800'
              )}
            >
              {t} ({count})
            </button>
          );
        })}
      </div>

      <div className="bg-white/40 dark:bg-zinc-900/40 backdrop-blur-xl border border-zinc-200/50 dark:border-zinc-800/50 rounded-3xl overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="p-12 text-center text-zinc-500 dark:text-zinc-400 flex flex-col items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
            Loading master catalog...
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center justify-center text-zinc-500 dark:text-zinc-400">
            <Package className="h-12 w-12 mb-4 opacity-20" />
            <p className="text-lg font-medium text-zinc-900 dark:text-zinc-100">No items found</p>
            <p className="mt-1">Get started by creating a new inventory item.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-200/50 dark:border-zinc-800/50 bg-zinc-50/50 dark:bg-zinc-800/20 text-xs uppercase tracking-wider text-zinc-500 dark:text-zinc-400 font-semibold">
                  <th className="p-4 px-4 w-10">
                    <input
                      type="checkbox"
                      checked={allFilteredSelected}
                      onChange={handleSelectAll}
                      className="rounded border-zinc-300 dark:border-zinc-600"
                    />
                  </th>
                  <th className="p-4 px-6 font-medium cursor-pointer select-none hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors" onClick={() => toggleSort('name')}>Name {sortIcon('name')}</th>
                  <th className="p-4 px-6 font-medium cursor-pointer select-none hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors" onClick={() => toggleSort('type')}>Type {sortIcon('type')}</th>
                  <th className="p-4 px-6 font-medium cursor-pointer select-none hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors" onClick={() => toggleSort('categoryName')}>Groups {sortIcon('categoryName')}</th>
                  <th className="p-4 px-6 font-medium cursor-pointer select-none hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors" onClick={() => toggleSort('inventoryUom')}>Inv. UOM {sortIcon('inventoryUom')}</th>
                  <th className="p-4 px-6 font-medium hidden sm:table-cell cursor-pointer select-none hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors" onClick={() => toggleSort('purchasingUom')}>Purch. UOM {sortIcon('purchasingUom')}</th>
                  <th className="p-4 px-6 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200/50 dark:divide-zinc-800/50 text-sm">
                {filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors group">
                    <td className="p-4 px-4">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(item.id)}
                        onChange={() => handleSelectOne(item.id)}
                        className="rounded border-zinc-300 dark:border-zinc-600"
                      />
                    </td>
                    <td className="p-4 px-6 text-zinc-900 dark:text-zinc-100 font-medium">
                      <div className="flex flex-col">
                        <span>{item.name}</span>
                        <span className="text-xs text-zinc-500 dark:text-zinc-400 font-mono mt-0.5">{item.sku}</span>
                      </div>
                    </td>
                    <td className="p-4 px-6">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        item.type === 'INGREDIENTS' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' :
                        item.type === 'PACKAGING' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300' :
                        item.type === 'MERCHANDISE' ? 'bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-300' :
                        item.type === 'SUPPLY' ? 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300' :
                        'bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-300'
                      }`}>
                        {item.type}
                      </span>
                    </td>
                    <td className="p-4 px-6 text-zinc-500 dark:text-zinc-400">
                      <div className="flex items-center">
                        <Tag className="h-3 w-3 mr-1.5 opacity-70" />
                        {item.categoryName || 'Uncategorized'}
                      </div>
                    </td>
                    <td className="p-4 px-6 text-zinc-500 dark:text-zinc-400">
                      <div className="flex items-center">
                        <Scale className="h-3 w-3 mr-1.5 opacity-70" />
                        <span className="font-medium text-zinc-700 dark:text-zinc-300 mr-1">{item.inventoryUom}</span>
                      </div>
                    </td>
                    <td className="p-4 px-6 text-zinc-500 dark:text-zinc-400 hidden sm:table-cell">
                      {item.purchasingUom || '-'}
                    </td>
                    <td className="p-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          className="p-1.5 rounded-lg text-zinc-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors"
                          onClick={() => setUomItem(item)}
                          title="UOM conversions"
                        >
                          <ArrowRightLeft className="w-4 h-4" />
                        </button>
                        {canWrite && (
                          <button
                            className="p-1.5 rounded-lg text-zinc-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                            onClick={() => setEditingItem(item)}
                            title="Edit item"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                        )}
                        {canWrite && (
                          <button
                            className="p-1.5 rounded-lg text-zinc-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                            onClick={() => setDeletingItem(item)}
                            title="Delete item"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <CreateItemDialog 
        isOpen={isCreateOpen} 
        onClose={() => setIsCreateOpen(false)} 
        onSuccess={() => {
          setIsCreateOpen(false);
          refreshItems();
        }} 
      />

      <EditItemDialog
        item={editingItem}
        onOpenChange={(open) => !open && setEditingItem(null)}
        onSuccess={() => {
          setEditingItem(null);
          refreshItems();
        }}
      />

      {deletingItem && (
        <ConfirmDeleteModal
          name={deletingItem.name}
          onConfirm={async () => {
            try {
              await apiClient(`/items/${deletingItem.id}`, { method: 'DELETE' });
              setDeletingItem(null);
              refreshItems();
            } catch (err) {
              console.error('Failed to delete item', err);
            }
          }}
          onCancel={() => setDeletingItem(null)}
        />
      )}

      {uomItem && (
        <ItemUomConversionsDialog
          itemId={uomItem.id}
          itemName={uomItem.name}
          onClose={() => setUomItem(null)}
        />
      )}

      {isUploadOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => { if (!isUploading) { setIsUploadOpen(false); setUploadFile(null); setUploadResult(null); } }}>
          <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl p-6 max-w-lg w-full mx-4 border border-zinc-200 dark:border-zinc-800" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">Bulk Upload Items</h3>
              <button
                onClick={() => { setIsUploadOpen(false); setUploadFile(null); setUploadResult(null); }}
                className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
                disabled={isUploading}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {uploadResult ? (
              <div className="space-y-4">
                <div className={`p-4 rounded-xl text-sm ${uploadResult.errorCount === 0 ? 'bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800' : 'bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800'}`}>
                  <div className="flex items-center gap-2 font-medium mb-1">
                    {uploadResult.errorCount === 0 ? (
                      <><CheckCircle2 className="w-5 h-5 text-emerald-500" /> <span className="text-emerald-700 dark:text-emerald-400">Upload Complete</span></>
                    ) : (
                      <><AlertCircle className="w-5 h-5 text-amber-500" /> <span className="text-amber-700 dark:text-amber-400">Upload Completed with Errors</span></>
                    )}
                  </div>
                  <p className="text-zinc-600 dark:text-zinc-400">
                    {uploadResult.createdCount} of {uploadResult.totalRows} items created.
                    {uploadResult.errorCount > 0 && ` ${uploadResult.errorCount} errors.`}
                  </p>
                </div>

                {uploadResult.errors.length > 0 && (
                  <div className="max-h-48 overflow-y-auto space-y-1">
                    <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Errors:</p>
                    {uploadResult.errors.map((e, i) => (
                      <p key={i} className="text-xs text-red-600 dark:text-red-400">Row {e.row}: {e.item ? `${e.item} — ` : ''}{e.message}</p>
                    ))}
                  </div>
                )}

                <div className="flex justify-end">
                  <button
                    onClick={() => { setIsUploadOpen(false); setUploadFile(null); setUploadResult(null); refreshItems(); }}
                    className="px-4 py-2 text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div
                  className="border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-xl p-8 text-center cursor-pointer hover:border-blue-400 dark:hover:border-blue-500 transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <FileUp className="w-10 h-10 mx-auto text-zinc-400 mb-3" />
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-1">
                    {uploadFile ? uploadFile.name : 'Click to select a file'}
                  </p>
                  <p className="text-xs text-zinc-400 dark:text-zinc-500">.xlsx or .csv files only</p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".xlsx,.csv"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) setUploadFile(file);
                    }}
                  />
                </div>

                <div className="flex justify-end gap-3 mt-4">
                  <button
                    onClick={() => { setIsUploadOpen(false); setUploadFile(null); setUploadResult(null); }}
                    className="px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                    disabled={isUploading}
                  >
                    Cancel
                  </button>
                  <button
                    disabled={!uploadFile || isUploading}
                    onClick={async () => {
                      if (!uploadFile) return;
                      setIsUploading(true);
                      setUploadResult(null);
                      try {
                        const { data: { session } } = await supabase.auth.getSession();
                        if (!session || !restaurantId) throw new Error('Not authenticated');

                        const formData = new FormData();
                        formData.append('file', uploadFile);

                        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/items/upload`, {
                          method: 'POST',
                          headers: {
                            'Authorization': `Bearer ${session.access_token}`,
                            'x-restaurant-id': restaurantId,
                          },
                          body: formData,
                        });

                        if (!res.ok) {
                          let msg = res.statusText;
                          try { const d = await res.json(); msg = d.message || d.error?.message || msg; } catch {}
                          throw new Error(msg);
                        }

                        const result = await res.json();
                        setUploadResult(result.data ?? result);
                      } catch (err) {
                        console.error('Upload failed:', err);
                        alert(err instanceof Error ? err.message : 'Upload failed');
                      } finally {
                        setIsUploading(false);
                      }
                    }}
                    className="flex items-center px-4 py-2 text-sm font-medium bg-blue-600 hover:bg-blue-700 disabled:bg-zinc-300 dark:disabled:bg-zinc-700 text-white rounded-lg transition-colors"
                  >
                    {isUploading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
                    {isUploading ? 'Uploading...' : 'Upload'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Bulk Delete Confirmation */}
      {deleteConfirmBulk && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => !isDeleting && setDeleteConfirmBulk(false)}>
          <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl p-6 max-w-md w-full mx-4 border border-zinc-200 dark:border-zinc-800" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-2">Delete Items</h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-6">
              Are you sure you want to delete <strong className="text-zinc-900 dark:text-zinc-100">{selectedIds.size}</strong> item{selectedIds.size !== 1 ? 's' : ''}? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteConfirmBulk(false)}
                disabled={isDeleting}
                className="px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleBulkDelete}
                disabled={isDeleting}
                className="flex items-center px-4 py-2 text-sm font-medium bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white rounded-lg transition-colors"
              >
                {isDeleting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Trash2 className="w-4 h-4 mr-2" />}
                Delete {selectedIds.size}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
