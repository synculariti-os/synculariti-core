'use client';

import React, { useEffect, useState, useCallback } from 'react';
import {
  BarChart3, TrendingDown, AlertTriangle, ArrowRight,
  DollarSign, Scale, ChevronRight, ChevronDown,
  Layers, ShieldAlert,
} from 'lucide-react';
import { useAuthStore } from '@/store/use-auth-store';

interface WaterfallStep {
  label: string;
  valueEur: number;
  valueKg: number;
  unit: string;
  isSubtotal?: boolean;
  isActual?: boolean;
  isVariance?: boolean;
  isLoss?: boolean;
}

interface WaterfallData {
  steps: WaterfallStep[];
  totalBought: number;
  totalSold: number;
  totalLost: number;
  totalVariance: number;
}

interface TunnelCategory {
  name: string;
  categoryId: string;
  valueEur: number;
  valueKg: number;
  itemCount: number;
}

interface TunnelData {
  categories: TunnelCategory[];
}

function formatEur(v: number): string {
  const abs = Math.abs(v);
  const s = abs >= 1000
    ? `€${(abs / 1000).toFixed(1)}K`
    : `€${abs.toFixed(0)}`;
  return v < 0 ? `-${s}` : s;
}

function formatKg(v: number): string {
  const abs = Math.abs(v);
  const s = abs >= 1000 ? `${(abs / 1000).toFixed(1)}K` : `${abs.toFixed(0)}`;
  return v < 0 ? `-${s}` : s;
}

function WaterfallBar({ step, maxVal, mode }: {
  step: WaterfallStep;
  maxVal: number;
  mode: 'kg' | 'eur';
}) {
  const val = mode === 'eur' ? step.valueEur : step.valueKg;
  const pct = maxVal > 0 ? Math.abs(val) / maxVal : 0;
  const barWidth = Math.min(pct * 100, 100);

  let barColor = 'bg-blue-500';
  if (step.isLoss) barColor = 'bg-red-400';
  if (step.isSubtotal) barColor = 'bg-zinc-400';
  if (step.isActual) barColor = 'bg-emerald-500';
  if (step.isVariance) {
    barColor = val < 0 ? 'bg-red-600' : 'bg-emerald-500';
  }

  const displayVal = mode === 'eur' ? formatEur(val) : formatKg(val);

  return (
    <div className="flex items-center gap-3 text-sm">
      <div className="w-36 text-right text-zinc-600 dark:text-zinc-400 shrink-0 truncate" title={step.label}>
        {step.label}
      </div>
      <div className="flex-1 h-7 bg-zinc-100 dark:bg-zinc-800 rounded overflow-hidden relative">
        <div
          className={`h-full rounded ${barColor} transition-all duration-500`}
          style={{
            width: `${barWidth}%`,
            marginLeft: val < 0 ? 'auto' : undefined,
            float: val < 0 ? 'right' : 'left',
            opacity: step.isSubtotal ? 0.6 : 0.85,
          }}
        />
      </div>
      <div className={`w-24 text-right font-mono text-xs shrink-0 ${
        step.isVariance ? (val < 0 ? 'text-red-500' : 'text-emerald-500') : 'text-zinc-700 dark:text-zinc-300'
      }`}>
        {val >= 0 && !step.isVariance ? '+' : ''}{displayVal}
      </div>
    </div>
  );
}

function TunnelCategoryCard({ cat, mode, onDrill }: {
  cat: TunnelCategory;
  mode: 'kg' | 'eur';
  onDrill: (id: string) => void;
}) {
  const val = mode === 'eur' ? cat.valueEur : cat.valueKg;
  const displayVal = mode === 'eur' ? formatEur(val) : formatKg(val);

  return (
    <button
      onClick={() => onDrill(cat.categoryId)}
      className="w-full text-left bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-3 hover:border-blue-400 dark:hover:border-blue-600 transition-colors"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 min-w-0">
          <Layers className="w-4 h-4 text-zinc-400 shrink-0" />
          <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200 truncate">
            {cat.name}
          </span>
          <span className="text-xs text-zinc-400 shrink-0">({cat.itemCount})</span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className={`font-mono text-sm font-semibold ${val < 0 ? 'text-red-500' : 'text-emerald-500'}`}>
            {displayVal}
          </span>
          <ChevronRight className="w-4 h-4 text-zinc-300" />
        </div>
      </div>
    </button>
  );
}

export default function InsightsPage() {
  const restaurantId = useAuthStore((s) => s.restaurantId);

  const [mode, setMode] = useState<'kg' | 'eur'>('eur');
  const [waterfall, setWaterfall] = useState<WaterfallData | null>(null);
  const [tunnel, setTunnel] = useState<TunnelData | null>(null);
  const [loading, setLoading] = useState(true);
  const [drillCategory, setDrillCategory] = useState<string | null>(null);
  const [drillItems, setDrillItems] = useState<any[] | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [wfRes, tunRes] = await Promise.all([
        fetch(`/api/insights/waterfall?mode=${mode}`),
        fetch(`/api/insights/tunnel?mode=${mode}`),
      ]);
      if (wfRes.ok) setWaterfall(await wfRes.json());
      if (tunRes.ok) setTunnel(await tunRes.json());
    } catch (e) {
      console.error('Fetch error:', e);
    }
    setLoading(false);
  }, [mode]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleCategoryDrill = async (catId: string) => {
    setDrillCategory(catId === drillCategory ? null : catId);
    if (drillCategory === catId) {
      setDrillItems(null);
      return;
    }
    try {
      const res = await fetch(`/api/insights/tunnel?mode=${mode}&category_id=${catId}`);
      if (res.ok) {
        const data = await res.json();
        setDrillItems(data.category?.items || null);
      }
    } catch { setDrillItems(null); }
  };

  const maxVal = waterfall
    ? Math.max(...waterfall.steps.map((s) => Math.abs(mode === 'eur' ? s.valueEur : s.valueKg)), 1)
    : 1;

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 dark:bg-amber-900/40 rounded-xl">
              <BarChart3 className="w-6 h-6 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
                Insights
              </h1>
              <p className="text-zinc-500 dark:text-zinc-400 text-sm">
                Variance waterfall &amp; loss tunnel
              </p>
            </div>
          </div>
          {/* kg↔€ Toggle */}
          <div className="flex items-center bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl p-1">
            <button
              onClick={() => setMode('eur')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                mode === 'eur'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200'
              }`}
            >
              <DollarSign className="w-3.5 h-3.5" />
              €
            </button>
            <button
              onClick={() => setMode('kg')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                mode === 'kg'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200'
              }`}
            >
              <Scale className="w-3.5 h-3.5" />
              kg
            </button>
          </div>
        </header>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full" />
          </div>
        ) : (
          <>
            {/* Summary Cards */}
            {waterfall && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4">
                  <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Total Bought</p>
                  <p className="text-2xl font-bold text-zinc-900 dark:text-white">
                    {mode === 'eur' ? formatEur(waterfall.totalBought) : formatKg(waterfall.totalBought)}
                  </p>
                </div>
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4">
                  <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Total Sold</p>
                  <p className="text-2xl font-bold text-emerald-600">
                    {mode === 'eur' ? formatEur(waterfall.totalSold) : formatKg(waterfall.totalSold)}
                  </p>
                </div>
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4">
                  <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Total Lost</p>
                  <p className="text-2xl font-bold text-red-500">
                    {mode === 'eur' ? formatEur(waterfall.totalLost) : formatKg(waterfall.totalLost)}
                  </p>
                </div>
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4">
                  <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Variance</p>
                  <p className={`text-2xl font-bold ${waterfall.totalVariance < 0 ? 'text-red-500' : 'text-emerald-500'}`}>
                    {mode === 'eur' ? formatEur(waterfall.totalVariance) : formatKg(waterfall.totalVariance)}
                  </p>
                </div>
              </div>
            )}

            {/* Main Grid: Waterfall + Tunnel */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
              {/* Variance Waterfall */}
              <div className="lg:col-span-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5">
                <div className="flex items-center gap-2 mb-5">
                  <TrendingDown className="w-5 h-5 text-amber-500" />
                  <h2 className="font-semibold text-zinc-900 dark:text-white">Variance Waterfall</h2>
                  <span className="text-xs text-zinc-400 ml-auto">
                    {mode === 'eur' ? 'in EUR' : 'in units'}
                  </span>
                </div>
                {waterfall ? (
                  <div className="space-y-2.5">
                    {waterfall.steps.map((step, i) => (
                      <WaterfallBar key={i} step={step} maxVal={maxVal} mode={mode} />
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-zinc-400">No data available.</p>
                )}
              </div>

              {/* Loss Tunnel */}
              <div className="lg:col-span-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5">
                <div className="flex items-center gap-2 mb-4">
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                  <h2 className="font-semibold text-zinc-900 dark:text-white">Loss Tunnel</h2>
                  <span className="text-xs text-zinc-400 ml-auto">
                    {mode === 'eur' ? 'in EUR' : 'in units'}
                  </span>
                </div>
                {tunnel ? (
                  <div className="space-y-2">
                    {tunnel.categories.slice(0, 8).map((cat) => (
                      <div key={cat.categoryId}>
                        <TunnelCategoryCard
                          cat={cat}
                          mode={mode}
                          onDrill={handleCategoryDrill}
                        />
                        {drillCategory === cat.categoryId && drillItems && (
                          <div className="ml-4 mt-1 space-y-1 border-l-2 border-blue-200 dark:border-blue-800 pl-3">
                            {drillItems.map((item: any) => {
                              const itemVal = mode === 'eur' ? item.cost : item.qty;
                              const itemDisplay = mode === 'eur' ? formatEur(itemVal) : formatKg(itemVal);
                              return (
                                <div key={item.itemId} className="flex items-center justify-between py-1 text-xs">
                                  <span className="text-zinc-600 dark:text-zinc-400 truncate">{item.itemName}</span>
                                  <span className={`font-mono font-medium ${
                                    itemVal < 0 ? 'text-red-500' : 'text-emerald-500'
                                  }`}>
                                    {itemDisplay}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    ))}
                    {tunnel.categories.length === 0 && (
                      <p className="text-sm text-zinc-400">No categories with loss data.</p>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-zinc-400">Loading...</p>
                )}

                {/* Explanation */}
                <div className="mt-4 p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg border border-zinc-200 dark:border-zinc-700">
                  <div className="flex items-start gap-2">
                    <ShieldAlert className="w-4 h-4 text-zinc-400 mt-0.5 shrink-0" />
                    <div className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                      <strong>How it works:</strong> The tunnel starts with all loss categories at the entrance
                      (broadest view). Click any category to drill into specific items. Each step narrows
                      toward root causes. Items with the highest loss appear at the top. The toggle above
                      switches between <strong>€ cost impact</strong> and <strong>physical quantity (kg)</strong>.
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Unit Cost Explanation */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <Scale className="w-5 h-5 text-blue-500" />
                <h2 className="font-semibold text-zinc-900 dark:text-white">Unit Cost Derivation</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg">
                  <p className="font-medium text-zinc-800 dark:text-zinc-200 mb-1">Weighted Average</p>
                  <p className="text-zinc-500 dark:text-zinc-400 leading-relaxed">
                    €模式下,每个单位的成本来自加权平均: 
                    <code className="block mt-1 font-mono text-xs bg-zinc-100 dark:bg-zinc-700 p-1 rounded">
                      unit_cost = Σ(PO qty × PO price) / Σ(PO qty)
                    </code>
                    这适用于在多个采购批次中平滑价格波动。
                  </p>
                </div>
                <div className="p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg">
                  <p className="font-medium text-zinc-800 dark:text-zinc-200 mb-1">FIFO Cost Layer</p>
                  <p className="text-zinc-500 dark:text-zinc-400 leading-relaxed">
                    当涉及易腐品时,使用先进先出假设:
                    <code className="block mt-1 font-mono text-xs bg-zinc-100 dark:bg-zinc-700 p-1 rounded">
                      cost_of_goods = latest_PO_price × qty_sold + next_latest × remaining
                    </code>
                    这匹配了库存实际流动的物理现实。
                  </p>
                </div>
                <div className="p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg">
                  <p className="font-medium text-zinc-800 dark:text-zinc-200 mb-1">Why kg→€ Matters</p>
                  <p className="text-zinc-500 dark:text-zinc-400 leading-relaxed">
                    kg 视图回答"我们浪费了多少物理数量?"<br />
                    € 视图回答"那浪费了多少利润?"<br />
                    当配方转换涉及产量损耗(例如,1kg 原料 ≠ 1kg 成品)时,差异会很大。
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
