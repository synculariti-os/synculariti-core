'use client';

import React, { useEffect, useState } from 'react';
import { Category } from '@synculariti/types';
import { apiClient } from '@/lib/api-client';
import { useAuthStore } from '@/store/use-auth-store';
import { useHasHydrated } from '@/hooks/use-has-hydrated';
import { Tag, Plus, Search, Pencil, Trash2, AlertTriangle, Loader2, ArrowUpDown, ChevronUp, ChevronDown, LayoutList } from 'lucide-react';
import { CreateCategoryDialog } from './create-category-dialog';
import { EditCategoryDialog } from './edit-category-dialog';

function ConfirmDeleteModal({ onConfirm, onCancel, name }: { onConfirm: () => void; onCancel: () => void; name: string }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onCancel}>
      <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl p-6 max-w-sm w-full mx-4 border border-zinc-200 dark:border-zinc-800" onClick={e => e.stopPropagation()}>
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-full"><AlertTriangle className="w-5 h-5 text-red-500" /></div>
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">Delete Category</h3>
        </div>
        <p className="text-zinc-600 dark:text-zinc-400 mb-6 text-sm">Delete the category <span className="font-semibold text-zinc-900 dark:text-white">{name}</span>? Items in this category won&apos;t be deleted.</p>
        <div className="flex gap-3 justify-end">
          <button onClick={onCancel} className="px-4 py-2 rounded-xl text-sm font-medium border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">Cancel</button>
          <button onClick={onConfirm} className="px-4 py-2 rounded-xl text-sm font-medium bg-red-600 hover:bg-red-700 text-white transition-colors">Delete</button>
        </div>
      </div>
    </div>
  );
}

type SortColumn = 'name' | 'description' | 'itemType' | 'categoryGroup';
type SortDir = 'asc' | 'desc';

export function CategoriesTable() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortColumn, setSortColumn] = useState<SortColumn>('name');
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteConfirmBulk, setDeleteConfirmBulk] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null);

  const isHydrated = useHasHydrated();
  const { restaurantId, hasPermission } = useAuthStore();
  const canWrite = isHydrated && hasPermission('INVENTORY.WRITE');

  const fetchCategories = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient<Category[]>('/items/categories');
      setCategories(Array.isArray(response) ? response : (response as { data: Category[] }).data || []);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

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

  const ITEM_TYPE_ORDER = ['INGREDIENTS', 'PACKAGING', 'MERCHANDISE', 'SUPPLY', 'MISCELLANEOUS'];

  const sortedCategories = [...categories].sort((a, b) => {
    const aVal = (a[sortColumn] ?? '').toString().toLowerCase();
    const bVal = (b[sortColumn] ?? '').toString().toLowerCase();
    return sortDir === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
  });

  const filteredCategories = sortedCategories.filter((cat) => {
    if (typeFilter !== 'all' && cat.itemType !== typeFilter) return false;
    return (
      cat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (cat.description && cat.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (cat.itemType && cat.itemType.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (cat.categoryGroup && cat.categoryGroup.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  });

  const groupedCategories = filteredCategories.reduce<Record<string, Category[]>>((acc, cat) => {
    const key = cat.itemType || 'UNCATEGORIZED';
    if (!acc[key]) acc[key] = [];
    acc[key].push(cat);
    return acc;
  }, {});

  const groupKeys = Object.keys(groupedCategories).sort((a, b) => {
    const ai = ITEM_TYPE_ORDER.indexOf(a);
    const bi = ITEM_TYPE_ORDER.indexOf(b);
    return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
  });

  const itemTypeStyles: Record<string, string> = {
    INGREDIENTS: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    PACKAGING: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
    MERCHANDISE: 'bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-300',
    SUPPLY: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300',
    MISCELLANEOUS: 'bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-300',
    UNCATEGORIZED: 'bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-300',
  };

  const allFilteredSelected = filteredCategories.length > 0 && filteredCategories.every((v) => selectedIds.has(v.id));

  const handleSelectAll = () => {
    if (allFilteredSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredCategories.map((v) => v.id)));
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
      await apiClient('/items/categories/bulk-delete', {
        method: 'POST',
        body: { ids: Array.from(selectedIds) },
      });
      setDeleteConfirmBulk(false);
      setSelectedIds(new Set());
      fetchCategories();
    } catch (err: any) {
      alert(err.message || 'Failed to delete categories');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm">
      {/* Header Actions */}
      <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative max-w-md w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            type="text"
            placeholder="Search categories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
          />
        </div>
        {canWrite && (
          <div className="flex gap-2">
            <button
              onClick={() => setIsCreateOpen(true)}
              className="flex items-center justify-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-sm transition-colors whitespace-nowrap shadow-sm"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Category
            </button>
          </div>
        )}
      </div>

      {/* Type Filter Tabs */}
      <div className="flex items-center gap-1 overflow-x-auto px-4 py-2 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/20">
        <button
          onClick={() => setTypeFilter('all')}
          className={'inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-medium rounded-lg transition-colors ' + (typeFilter === 'all' ? 'bg-blue-600 text-white shadow-sm' : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800')}
        >
          <LayoutList className="w-3.5 h-3.5" />
          All ({categories.length})
        </button>
        {(['INGREDIENTS', 'PACKAGING', 'MERCHANDISE', 'SUPPLY', 'MISCELLANEOUS'] as const).map((t) => {
          const count = categories.filter(c => c.itemType === t).length;
          const badgeColor =
            t === 'INGREDIENTS' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' :
            t === 'PACKAGING' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300' :
            t === 'MERCHANDISE' ? 'bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-300' :
            t === 'SUPPLY' ? 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300' :
            'bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-300';
          return (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={'px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ' + (typeFilter === t ? badgeColor : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800')}
            >
              {t} ({count})
            </button>
          );
        })}
      </div>

      {selectedIds.size > 0 && (
        <div className="flex items-center gap-3 px-4 py-3 bg-red-50 dark:bg-red-900/10 border-b border-red-200 dark:border-red-800/30">
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
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-zinc-600 dark:text-zinc-400">
          <thead className="text-xs text-zinc-500 uppercase bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-200 dark:border-zinc-800">
            <tr>
              <th className="px-4 py-4 w-10">
                <input
                  type="checkbox"
                  checked={allFilteredSelected}
                  onChange={handleSelectAll}
                  className="rounded border-zinc-300 dark:border-zinc-600"
                />
              </th>
              <th className="px-6 py-4 font-medium cursor-pointer select-none hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors" onClick={() => toggleSort('name')}>Name {sortIcon('name')}</th>
              <th className="px-6 py-4 font-medium cursor-pointer select-none hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors" onClick={() => toggleSort('itemType')}>Item Type {sortIcon('itemType')}</th>
              <th className="px-6 py-4 font-medium cursor-pointer select-none hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors" onClick={() => toggleSort('categoryGroup')}>Group {sortIcon('categoryGroup')}</th>
              <th className="px-6 py-4 font-medium cursor-pointer select-none hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors" onClick={() => toggleSort('description')}>Description {sortIcon('description')}</th>
              <th className="px-6 py-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center">
                  <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-solid border-blue-600 border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
                </td>
              </tr>
            ) : filteredCategories.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-zinc-500">
                  <Tag className="w-12 h-12 mx-auto text-zinc-300 dark:text-zinc-700 mb-3" />
                  <p className="text-base font-medium text-zinc-900 dark:text-zinc-100">No categories found</p>
                  <p className="mt-1 mb-4">Get started by adding a new category.</p>
                  {canWrite && (
                    <button
                      onClick={() => setIsCreateOpen(true)}
                      className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-sm transition-colors shadow-sm"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Category
                    </button>
                  )}
                </td>
              </tr>
            ) : (
              groupKeys.map((groupKey) => (
                <React.Fragment key={groupKey}>
                  <tr className="bg-zinc-100/80 dark:bg-zinc-800/80 border-b border-t border-zinc-200 dark:border-zinc-700">
                    <td colSpan={6} className="px-6 py-2.5">
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider ${itemTypeStyles[groupKey] || 'bg-zinc-100 text-zinc-800'}`}>
                          {groupKey === 'UNCATEGORIZED' ? 'Uncategorized' : groupKey}
                        </span>
                        <span className="text-xs text-zinc-400 dark:text-zinc-500 font-medium">
                          {groupedCategories[groupKey].length} categor{groupedCategories[groupKey].length === 1 ? 'y' : 'ies'}
                        </span>
                      </div>
                    </td>
                  </tr>
                  {groupedCategories[groupKey].map((category) => (
                    <tr key={category.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors divide-y divide-zinc-200 dark:divide-zinc-800">
                      <td className="px-4 py-4">
                        <input
                          type="checkbox"
                          checked={selectedIds.has(category.id)}
                          onChange={() => handleSelectOne(category.id)}
                          className="rounded border-zinc-300 dark:border-zinc-600"
                        />
                      </td>
                      <td className="px-6 py-4 font-medium text-zinc-900 dark:text-zinc-100">
                        {category.name}
                      </td>
                      <td className="px-6 py-4">
                        {category.itemType ? (
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${itemTypeStyles[category.itemType] || 'bg-zinc-100 text-zinc-800'}`}>
                            {category.itemType}
                          </span>
                        ) : (
                          <span className="text-zinc-400 dark:text-zinc-500 text-xs italic">None</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-zinc-500 dark:text-zinc-400">
                        {category.categoryGroup || '-'}
                      </td>
                      <td className="px-6 py-4 text-zinc-500 dark:text-zinc-400">
                        {category.description || '-'}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {canWrite && (
                            <button
                              className="p-1.5 rounded-lg text-zinc-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                              onClick={() => setEditingCategory(category)}
                              title="Edit category"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                          )}
                          {canWrite && (
                            <button
                              className="p-1.5 rounded-lg text-zinc-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                              onClick={() => setDeletingCategory(category)}
                              title="Delete category"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </React.Fragment>
              ))
            )}
          </tbody>
        </table>
      </div>

      {isCreateOpen && (
        <CreateCategoryDialog
          onOpenChange={setIsCreateOpen}
          onSuccess={fetchCategories}
        />
      )}

      {editingCategory && (
        <EditCategoryDialog
          category={editingCategory}
          onOpenChange={(open) => !open && setEditingCategory(null)}
          onSuccess={fetchCategories}
        />
      )}

      {deletingCategory && (
        <ConfirmDeleteModal
          name={deletingCategory.name}
          onConfirm={async () => {
            try {
              await apiClient(`/items/categories/${deletingCategory.id}`, { method: 'DELETE' });
              setDeletingCategory(null);
              fetchCategories();
            } catch (err) {
              console.error('Failed to delete category', err);
            }
          }}
          onCancel={() => setDeletingCategory(null)}
        />
      )}

      {/* Bulk Delete Confirmation */}
      {deleteConfirmBulk && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => !isDeleting && setDeleteConfirmBulk(false)}>
          <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl p-6 max-w-md w-full mx-4 border border-zinc-200 dark:border-zinc-800" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-2">Delete Categories</h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-6">
              Are you sure you want to delete <strong className="text-zinc-900 dark:text-zinc-100">{selectedIds.size}</strong> categor{selectedIds.size !== 1 ? 'ies' : 'y'}? This action cannot be undone.
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
