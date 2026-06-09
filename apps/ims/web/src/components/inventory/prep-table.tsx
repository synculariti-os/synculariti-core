'use client';

import React, { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api-client';
import { ChefHat, LayoutGrid, List, Check, X, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PrepLog {
  id: string;
  prep_item_id: string;
  yield_qty_produced: number;
  produced_at: string;
}

interface PrepRecipe {
  id: string;
  producesItemId: string | null;
  producesItemName?: string;
  recipeName?: string;
  yieldQuantity: number;
}

const FOOD_EMOJI_MAP: [string, string][] = [
  ['lettuce', '🥬'], ['salad', '🥗'], ['greens', '🥬'], ['spinach', '🥬'],
  ['tomato', '🍅'], ['onion', '🧅'], ['garlic', '🧄'],
  ['cheese', '🧀'], ['mozzarella', '🧀'], ['cheddar', '🧀'],
  ['beef', '🥩'], ['chicken', '🍗'], ['pork', '🥩'], ['meat', '🥩'],
  ['bacon', '🥓'], ['fish', '🐟'], ['salmon', '🐟'], ['tuna', '🐟'],
  ['shrimp', '🦐'], ['egg', '🥚'], ['milk', '🥛'], ['cream', '🥛'],
  ['butter', '🧈'], ['yogurt', '🫙'], ['bread', '🍞'], ['bun', '🍔'],
  ['tortilla', '🫓'], ['potato', '🥔'], ['fry', '🍟'],
  ['carrot', '🥕'], ['celery', '🥬'], ['cucumber', '🥒'],
  ['pepper', '🫑'], ['bell', '🫑'], ['mushroom', '🍄'],
  ['broccoli', '🥦'], ['corn', '🌽'], ['pea', '🫛'],
  ['bean', '🫘'], ['rice', '🍚'], ['pasta', '🍝'], ['noodle', '🍜'],
  ['sauce', '🫙'], ['dressing', '🫙'], ['mayo', '🫙'], ['ketchup', '🫙'],
  ['oil', '🫒'], ['olive', '🫒'], ['vinegar', '🫗'],
  ['herb', '🌿'], ['basil', '🌿'], ['parsley', '🌿'], ['cilantro', '🌿'],
  ['lemon', '🍋'], ['lime', '🍋'], ['orange', '🍊'],
  ['berry', '🍓'], ['strawberry', '🍓'], ['blueberry', '🫐'],
  ['apple', '🍎'], ['avocado', '🥑'], ['salsa', '🫙'],
  ['cookie', '🍪'], ['cake', '🎂'], ['pie', '🥧'],
  ['soup', '🍜'], ['broth', '🍲'], ['stock', '🍲'],
];

function emojiForItem(name: string): string {
  const lower = name.toLowerCase();
  for (const [keyword, emoji] of FOOD_EMOJI_MAP) {
    if (lower.includes(keyword)) return emoji;
  }
  return '🥘';
}

export function PrepTable() {
  const [logs, setLogs] = useState<PrepLog[]>([]);
  const [recipes, setRecipes] = useState<PrepRecipe[]>([]);
  const [stock, setStock] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [gridInputs, setGridInputs] = useState<Record<string, string>>({});
  const [listInputs, setListInputs] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState<Record<string, boolean>>({});
  const [batchSubmitting, setBatchSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setIsLoading(true);
        const [logsRes, recipesRes, stockRes] = await Promise.all([
          apiClient<{ data: PrepLog[] }>('/inventory/prep'),
          apiClient<{ data: PrepRecipe[] }>('/recipes'),
          apiClient<{ data: { itemId: string; qty: number }[] }>('/inventory/stock'),
        ]);
        if (cancelled) return;
        setLogs(logsRes.data || []);
        
        // Only show recipes that produce an inventory item (PREP recipes)
        const prepRecipes = (recipesRes.data || []).filter(r => r.producesItemId);
        setRecipes(prepRecipes);

        const stockMap: Record<string, number> = {};
        for (const s of stockRes.data || []) stockMap[s.itemId] = s.qty;
        setStock(stockMap);
      } catch (err) {
        console.error('Failed to fetch prep data:', err);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const refetchData = async () => {
    const [logsRes, stockRes] = await Promise.all([
      apiClient<{ data: PrepLog[] }>('/inventory/prep'),
      apiClient<{ data: { itemId: string; qty: number }[] }>('/inventory/stock'),
    ]);
    setLogs(logsRes.data || []);
    const stockMap: Record<string, number> = {};
    for (const s of stockRes.data || []) stockMap[s.itemId] = s.qty;
    setStock(stockMap);
  };

  const submitPrep = async (recipeId: string, itemId: string, qty: number, inputKey: string) => {
    const recipe = recipes.find(r => r.id === recipeId);
    const itemName = recipe?.producesItemName || recipe?.recipeName || 'Item';
    try {
      setSubmitting(prev => ({ ...prev, [inputKey]: true }));
      setError('');
      await apiClient('/inventory/prep', {
        method: 'POST',
        body: { prepItemId: itemId, yieldQtyProduced: qty },
      });
      setGridInputs(prev => ({ ...prev, [recipeId]: '' }));
      setListInputs(prev => ({ ...prev, [recipeId]: '' }));
      setSuccess(`Logged +${qty} ${itemName}`);
      refetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to log prep production');
    } finally {
      setSubmitting(prev => ({ ...prev, [inputKey]: false }));
    }
  };

  const submitAll = async () => {
    const entries = Object.entries(listInputs)
      .filter(([, v]) => {
        const n = parseFloat(v);
        return !isNaN(n) && n > 0;
      })
      .map(([recipeId, qty]) => {
        const recipe = recipes.find(r => r.id === recipeId);
        return { recipeId, itemId: recipe?.producesItemId!, qty: parseFloat(qty) };
      });

    if (entries.length === 0) {
      setError('Enter at least one quantity');
      return;
    }
    try {
      setBatchSubmitting(true);
      setError('');
      let count = 0;
      for (const { itemId, qty } of entries) {
        await apiClient('/inventory/prep', {
          method: 'POST',
          body: { prepItemId: itemId, yieldQtyProduced: qty },
        });
        count++;
      }
      setListInputs({});
      setSuccess(`Logged ${count} item${count > 1 ? 's' : ''}`);
      refetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to log prep production');
    } finally {
      setBatchSubmitting(false);
    }
  };

  const clearMessages = () => { setError(''); setSuccess(''); };

  return (
    <div className="space-y-6">
      {/* View Toggle + Header */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">Prep Items</h3>
            <span className="text-sm text-zinc-500">{recipes.length} items</span>
          </div>
          <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800 rounded-lg p-0.5">
            <button
              onClick={() => setView('grid')}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all',
                view === 'grid'
                  ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
              )}
            >
              <LayoutGrid className="w-3.5 h-3.5" /> Grid
            </button>
            <button
              onClick={() => setView('list')}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all',
                view === 'list'
                  ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
              )}
            >
              <List className="w-3.5 h-3.5" /> List
            </button>
          </div>
        </div>

        {/* Status messages */}
        {(error || success) && (
          <div className={cn(
            'px-4 py-2 text-sm flex items-center justify-between border-b',
            error ? 'text-red-500 bg-red-50 dark:bg-red-900/20 border-zinc-200 dark:border-zinc-800' : 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 border-zinc-200 dark:border-zinc-800'
          )}>
            <span>{error || success}</span>
            <button onClick={clearMessages} className="opacity-60 hover:opacity-100">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {recipes.length === 0 ? (
          <div className="p-12 text-center">
            <ChefHat className="w-12 h-12 mx-auto text-zinc-300 dark:text-zinc-700 mb-3" />
            <p className="text-base font-medium text-zinc-900 dark:text-zinc-100">No prep items</p>
            <p className="text-sm text-zinc-500 mt-1">Only items with recipes in BOM are shown here.</p>
          </div>
        ) : view === 'grid' ? (
          <div className="p-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {recipes.map((recipe) => {
                const inputKey = `grid-${recipe.id}`;
                const isSubmittingItem = submitting[inputKey];
                const itemName = recipe.producesItemName || recipe.recipeName || 'Item';
                const itemId = recipe.producesItemId!;
                return (
                  <div
                    key={recipe.id}
                    className={cn(
                      'relative flex flex-col items-center gap-2 p-4 rounded-xl border transition-all',
                      'border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800/50',
                      gridInputs[recipe.id] !== undefined && gridInputs[recipe.id] !== ''
                        ? 'ring-2 ring-amber-500 shadow-md'
                        : 'hover:border-amber-300 dark:hover:border-amber-600 hover:shadow-sm cursor-pointer'
                    )}
                    onClick={() => {
                      if (!gridInputs[recipe.id] && !isSubmittingItem) {
                        setGridInputs(prev => ({ ...prev, [recipe.id]: '' }));
                      }
                    }}
                  >
                    <div className="text-3xl sm:text-4xl">{emojiForItem(itemName)}</div>
                    <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300 text-center leading-tight">
                      {itemName}
                    </span>
                    <div className="text-[10px] font-mono text-zinc-400 dark:text-zinc-500">
                      Stock: {stock[itemId] !== undefined ? stock[itemId].toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '—'}
                    </div>
                    {gridInputs[recipe.id] !== undefined && (
                      <div className="w-full mt-1" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            min="0"
                            step="any"
                            value={gridInputs[recipe.id] ?? ''}
                            onChange={(e) => setGridInputs(prev => ({ ...prev, [recipe.id]: e.target.value }))}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                const val = parseFloat(gridInputs[recipe.id]);
                                if (!isNaN(val) && val > 0) submitPrep(recipe.id, itemId, val, inputKey);
                              }
                              if (e.key === 'Escape') {
                                setGridInputs(prev => ({ ...prev, [recipe.id]: '' }));
                              }
                            }}
                            autoFocus
                            className="w-full px-2 py-1 text-xs border border-zinc-300 dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-amber-500"
                            placeholder="Qty"
                          />
                          <button
                            onClick={() => {
                              const val = parseFloat(gridInputs[recipe.id]);
                              if (!isNaN(val) && val > 0) submitPrep(recipe.id, itemId, val, inputKey);
                            }}
                            disabled={isSubmittingItem}
                            className="p-1 bg-amber-600 hover:bg-amber-700 text-white rounded-md transition-colors disabled:opacity-50 shrink-0"
                          >
                            {isSubmittingItem ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                          </button>
                          <button
                            onClick={() => setGridInputs(prev => ({ ...prev, [recipe.id]: '' }))}
                            className="p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 shrink-0"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs text-zinc-500 uppercase bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-200 dark:border-zinc-800">
                <tr>
                  <th className="px-6 py-3 font-medium">Item</th>
                  <th className="px-6 py-3 font-medium text-right">Current Stock</th>
                  <th className="px-6 py-3 font-medium w-48">Yield Quantity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {recipes.map((recipe) => {
                  const itemName = recipe.producesItemName || recipe.recipeName || 'Item';
                  const itemId = recipe.producesItemId!;
                  return (
                    <tr key={recipe.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors">
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-3">
                          <span className="text-xl">{emojiForItem(itemName)}</span>
                          <span className="font-medium text-zinc-900 dark:text-zinc-100">{itemName}</span>
                        </div>
                      </td>
                      <td className="px-6 py-3 text-right font-mono text-sm text-zinc-600 dark:text-zinc-400">
                        {stock[itemId] !== undefined ? stock[itemId].toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '—'}
                      </td>
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min="0"
                            step="any"
                            value={listInputs[recipe.id] ?? ''}
                            onChange={(e) => setListInputs(prev => ({ ...prev, [recipe.id]: e.target.value }))}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                const val = parseFloat(listInputs[recipe.id]);
                                if (!isNaN(val) && val > 0) submitPrep(recipe.id, itemId, val, `list-${recipe.id}`);
                              }
                            }}
                            className="w-28 px-3 py-1.5 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                            placeholder="0"
                          />
                          {listInputs[recipe.id] && parseFloat(listInputs[recipe.id]) > 0 && (
                            <button
                              onClick={() => {
                                const val = parseFloat(listInputs[recipe.id]);
                                if (!isNaN(val) && val > 0) submitPrep(recipe.id, itemId, val, `list-${recipe.id}`);
                              }}
                              disabled={submitting[`list-${recipe.id}`]}
                              className="p-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-md transition-colors disabled:opacity-50"
                            >
                              {submitting[`list-${recipe.id}`] ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <div className="px-6 py-4 border-t border-zinc-200 dark:border-zinc-800 flex justify-end">
              <button
                onClick={submitAll}
                disabled={batchSubmitting}
                className="flex items-center px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-medium text-sm transition-colors shadow-sm disabled:opacity-50"
              >
                {batchSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <ChefHat className="w-4 h-4 mr-2" />}
                Log All
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Recent Logs */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800">
          <h3 className="text-base font-semibold text-zinc-900 dark:text-white">Recent Production Logs</h3>
        </div>
        {isLoading ? (
          <div className="p-8 text-center text-zinc-500"><Loader2 className="w-5 h-5 animate-spin mx-auto" /></div>
        ) : logs.length === 0 ? (
          <div className="p-8 text-center text-zinc-400 text-sm">No production logged yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-zinc-600 dark:text-zinc-400">
              <thead className="text-xs text-zinc-500 uppercase bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-200 dark:border-zinc-800">
                <tr>
                  <th className="px-6 py-3 font-medium">Item</th>
                  <th className="px-6 py-3 font-medium text-right">Yield</th>
                  <th className="px-6 py-3 font-medium">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {logs.slice(0, 20).map((log) => {
                  const recipe = recipes.find(r => r.producesItemId === log.prep_item_id);
                  const itemName = recipe?.producesItemName || recipe?.recipeName || log.prep_item_id.slice(0, 8);
                  return (
                    <tr key={log.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors">
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-2">
                          <span>{emojiForItem(itemName)}</span>
                          <span className="font-medium text-zinc-900 dark:text-white">{itemName}</span>
                        </div>
                      </td>
                      <td className="px-6 py-3 text-right text-amber-600 font-medium">+{log.yield_qty_produced}</td>
                      <td className="px-6 py-3 text-zinc-500 whitespace-nowrap">{new Date(log.produced_at).toLocaleString()}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
