'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Recipe, RecipeIngredient } from '@synculariti/types';
import { apiClient } from '@/lib/api-client';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/use-auth-store';
import { Plus, Search, Layers, Pencil, Trash2, ChevronDown, ChevronRight, Package, Utensils, Link2, AlertTriangle, Loader2, Upload, Download, X, FileUp, AlertCircle, CheckCircle2, ArrowUpDown, ChevronUp, ChevronDown as ChevronDownIcon } from 'lucide-react';
import { CreateRecipeDialog } from './create-recipe-dialog';
import { EditRecipeDialog } from './edit-recipe-dialog';
import { cn } from '@/lib/utils';

function ConfirmDeleteModal({ onConfirm, onCancel, name }: { onConfirm: () => void; onCancel: () => void; name: string }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onCancel}>
      <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl p-6 max-w-sm w-full mx-4 border border-zinc-200 dark:border-zinc-800" onClick={e => e.stopPropagation()}>
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-full"><AlertTriangle className="w-5 h-5 text-red-500" /></div>
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">Delete Recipe</h3>
        </div>
        <p className="text-zinc-600 dark:text-zinc-400 mb-6 text-sm">Are you sure you want to delete <span className="font-semibold text-zinc-900 dark:text-white">{name}</span>? This will remove all its ingredients and any POS mappings.</p>
        <div className="flex gap-3 justify-end">
          <button onClick={onCancel} className="px-4 py-2 rounded-xl text-sm font-medium border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">Cancel</button>
          <button onClick={onConfirm} className="px-4 py-2 rounded-xl text-sm font-medium bg-red-600 hover:bg-red-700 text-white transition-colors">Delete</button>
        </div>
      </div>
    </div>
  );
}

function RecipeDetailRow({ recipe }: { recipe: Recipe }) {
  const [ingredients, setIngredients] = useState<RecipeIngredient[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchIngredients = useCallback(async () => {
    if (ingredients !== null) return;
    setIsLoading(true);
    try {
      const data = await apiClient<{ data: RecipeIngredient[] }>(`/recipes/${recipe.id}/ingredients`);
      setIngredients(data.data || []);
    } catch {
      setIngredients([]);
    } finally {
      setIsLoading(false);
    }
  }, [recipe.id, ingredients]);

  useEffect(() => { fetchIngredients(); }, [fetchIngredients]);

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 py-2 text-zinc-500 dark:text-zinc-400 text-sm">
        <Loader2 className="w-4 h-4 animate-spin" /> Loading ingredients...
      </div>
    );
  }

  if (!ingredients || ingredients.length === 0) {
    return <p className="text-sm text-zinc-500 dark:text-zinc-400 italic py-2">No ingredients defined yet.</p>;
  }

  return (
    <div className="space-y-2">
      {ingredients.map((ing) => (
        <div key={ing.id} className="flex items-center gap-3 text-sm">
          {ing.subRecipeId ? (
            <>
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300">
                <Link2 className="w-3 h-3 mr-1" /> Sub-recipe
              </span>
              <span className="font-medium text-zinc-800 dark:text-zinc-200">{ing.subRecipeName || ing.subRecipeId}</span>
            </>
          ) : (
            <>
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                <Package className="w-3 h-3 mr-1" /> Ingredient
              </span>
              <span className="font-medium text-zinc-800 dark:text-zinc-200">{ing.ingredientItemName || ing.ingredientItemId}</span>
            </>
          )}
          <span className="text-zinc-500 dark:text-zinc-400">× {ing.quantityRequired}</span>
        </div>
      ))}
    </div>
  );
}

type SortColumn = 'name' | 'type' | 'yieldQuantity';
type SortDir = 'asc' | 'desc';

export function RecipesTable() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null);
  const [deletingRecipe, setDeletingRecipe] = useState<Recipe | null>(null);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [isDeleting, setIsDeleting] = useState(false);
  const [sortColumn, setSortColumn] = useState<SortColumn>('name');
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<{ totalRows: number; createdCount: number; errorCount: number; errors: { row: number; message: string }[] } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { restaurantId } = useAuthStore();

  const fetchRecipes = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await apiClient<{ data: Recipe[] }>('/recipes');
      setRecipes(data.data || []);
    } catch (error) {
      console.error('Failed to fetch recipes:', error);
      setRecipes([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchRecipes(); }, [fetchRecipes]);

  const toggleRow = (id: string) => {
    setExpandedRows(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const handleDelete = async () => {
    if (!deletingRecipe) return;
    setIsDeleting(true);
    try {
      await apiClient(`/recipes/${deletingRecipe.id}`, { method: 'DELETE' });
      setDeletingRecipe(null);
      fetchRecipes();
    } catch (err) {
      console.error('Failed to delete recipe', err);
    } finally {
      setIsDeleting(false);
    }
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
      : <ChevronDownIcon className="w-3 h-3 ml-1 inline" />;
  };

  const sorted = [...recipes].sort((a, b) => {
    if (sortColumn === 'name') {
      const aName = (a.producesItemName || a.recipeName || '').toLowerCase();
      const bName = (b.producesItemName || b.recipeName || '').toLowerCase();
      return sortDir === 'asc' ? aName.localeCompare(bName) : bName.localeCompare(aName);
    }
    if (sortColumn === 'type') {
      const aType = a.producesItemId ? 'PREP' : 'MENU';
      const bType = b.producesItemId ? 'PREP' : 'MENU';
      return sortDir === 'asc' ? aType.localeCompare(bType) : bType.localeCompare(aType);
    }
    return sortDir === 'asc' ? a.yieldQuantity - b.yieldQuantity : b.yieldQuantity - a.yieldQuantity;
  });

  const filtered = sorted.filter(r => {
    const name = r.producesItemName || r.recipeName || '';
    return name.toLowerCase().includes(searchQuery.toLowerCase());
  });

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
            placeholder="Search recipes..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <button
            onClick={async () => {
              try {
                const { data: { session } } = await supabase.auth.getSession();
                if (!session) return;
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/recipes/upload/template`, {
                  headers: { 'Authorization': `Bearer ${session.access_token}` },
                });
                if (!res.ok) throw new Error('Failed to download template');
                const blob = await res.blob();
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'recipes-upload-template.csv';
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
          <button
            onClick={() => setIsUploadOpen(true)}
            className="inline-flex items-center justify-center px-3 py-2 border border-zinc-300 dark:border-zinc-700 text-sm font-medium rounded-xl shadow-sm text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
          >
            <Upload className="h-4 w-4 mr-2" />
            Upload
          </button>
          <button
            onClick={() => setIsCreateOpen(true)}
            className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-xl shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Recipe
          </button>
        </div>
      </div>

      <div className="bg-white/40 dark:bg-zinc-900/40 backdrop-blur-xl border border-zinc-200/50 dark:border-zinc-800/50 rounded-3xl overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="p-12 text-center text-zinc-500 dark:text-zinc-400 flex flex-col items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4" />
            Loading recipes...
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center justify-center text-zinc-500 dark:text-zinc-400">
            <Layers className="h-12 w-12 mb-4 opacity-20" />
            <p className="text-lg font-medium text-zinc-900 dark:text-zinc-100">No recipes found</p>
            <p className="mt-1">Create your first Bill of Materials (BOM) to get started.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-200/50 dark:border-zinc-800/50 bg-zinc-50/50 dark:bg-zinc-800/20 text-xs uppercase tracking-wider text-zinc-500 dark:text-zinc-400 font-semibold">
                  <th className="p-4 px-6 font-medium w-8" />
                  <th className="p-4 px-6 font-medium cursor-pointer select-none hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors" onClick={() => toggleSort('name')}>Name {sortIcon('name')}</th>
                  <th className="p-4 px-6 font-medium cursor-pointer select-none hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors" onClick={() => toggleSort('type')}>Type {sortIcon('type')}</th>
                  <th className="p-4 px-6 font-medium cursor-pointer select-none hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors" onClick={() => toggleSort('yieldQuantity')}>Yield Qty {sortIcon('yieldQuantity')}</th>
                  <th className="p-4 px-6 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200/50 dark:divide-zinc-800/50 text-sm">
                {filtered.map((recipe) => {
                  const isExpanded = expandedRows.has(recipe.id);
                  const name = recipe.producesItemId
                    ? (recipe.producesItemName || recipe.producesItemId)
                    : (recipe.recipeName || 'Unnamed');
                  return (
                    <React.Fragment key={recipe.id}>
                      <tr className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors group">
                        <td className="p-4 pl-6">
                          <button onClick={() => toggleRow(recipe.id)} className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors">
                            {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                          </button>
                        </td>
                        <td className="p-4 px-2 font-medium text-zinc-900 dark:text-zinc-100">{name}</td>
                        <td className="p-4 px-6">
                          {recipe.producesItemId ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                              <Package className="w-3 h-3" /> PREP
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
                              <Utensils className="w-3 h-3" /> MENU
                            </span>
                          )}
                        </td>
                        <td className="p-4 px-6 text-zinc-500 dark:text-zinc-400">{recipe.yieldQuantity}</td>
                        <td className="p-4 px-6 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => setEditingRecipe(recipe)}
                              className="p-1.5 rounded-lg text-zinc-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                              title="Edit recipe"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setDeletingRecipe(recipe)}
                              className="p-1.5 rounded-lg text-zinc-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                              title="Delete recipe"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                      {isExpanded && (
                        <tr>
                          <td />
                          <td colSpan={4} className="px-6 pb-4 pt-2 bg-zinc-50/50 dark:bg-zinc-800/20">
                            <div className="pl-2 border-l-2 border-blue-200 dark:border-blue-800">
                              <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-2">Ingredients & Sub-recipes</p>
                              <RecipeDetailRow recipe={recipe} />
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isCreateOpen && (
        <CreateRecipeDialog
          isOpen={isCreateOpen}
          onClose={() => setIsCreateOpen(false)}
          onSuccess={() => { setIsCreateOpen(false); fetchRecipes(); }}
        />
      )}

      {editingRecipe && (
        <EditRecipeDialog
          recipe={editingRecipe}
          onClose={() => setEditingRecipe(null)}
          onSuccess={() => { setEditingRecipe(null); fetchRecipes(); }}
        />
      )}

      {deletingRecipe && (
        <ConfirmDeleteModal
          name={deletingRecipe.producesItemName || deletingRecipe.recipeName || 'this recipe'}
          onConfirm={handleDelete}
          onCancel={() => setDeletingRecipe(null)}
        />
      )}

      {isUploadOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => { if (!isUploading) { setIsUploadOpen(false); setUploadFile(null); setUploadResult(null); } }}>
          <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl p-6 max-w-lg w-full mx-4 border border-zinc-200 dark:border-zinc-800" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">Bulk Upload Recipes</h3>
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
                    {uploadResult.createdCount} recipes created (missing items or categories were automatically created).
                    {uploadResult.errorCount > 0 && ` ${uploadResult.errorCount} errors.`}
                  </p>
                </div>

                {uploadResult.errors.length > 0 && (
                  <div className="max-h-48 overflow-y-auto space-y-1">
                    <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Errors:</p>
                    {uploadResult.errors.map((e, i) => (
                      <p key={i} className="text-xs text-red-600 dark:text-red-400">Row {e.row}: {e.message}</p>
                    ))}
                  </div>
                )}

                <div className="flex justify-end">
                  <button
                    onClick={() => { setIsUploadOpen(false); setUploadFile(null); setUploadResult(null); fetchRecipes(); }}
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

                        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/recipes/upload`, {
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
    </div>
  );
}
