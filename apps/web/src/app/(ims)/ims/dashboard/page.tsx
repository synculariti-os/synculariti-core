'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  LayoutDashboard, Package, ShoppingCart, Layers, UploadCloud,
  BarChart3, Shield, Store, ClipboardList, ArrowRight,
  AlertTriangle, TrendingDown, ClipboardCheck, Truck,
  DollarSign,
} from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { useAuthStore } from '@/store/use-auth-store';
import { supabase } from '@/lib/supabase';
import type { PermissionCode } from '@synculariti/types';

interface Stat {
  label: string;
  value: string;
  icon: React.ElementType;
  href: string;
  color: string;
}

interface ParAlert {
  item_name: string;
  sku: string;
  current_qty: number;
  par_level: number;
  deficit: number;
}

interface WasteItem {
  item_name: string;
  quantity: number;
  reason: string;
  recorded_at: string;
}

interface CountVariance {
  item_name: string;
  expected_qty: number;
  actual_qty: number;
  variance_qty: number;
  variance_pct: number;
}

const ALL_LINKS = [
  { label: 'Item Master', href: '/items', icon: ClipboardList, description: 'Manage items, categories, UOM conversions', permission: 'INVENTORY.READ' as PermissionCode },
  { label: 'Inventory', href: '/inventory', icon: Package, description: 'Stock levels, transfers, counts', permission: 'INVENTORY.READ' as PermissionCode },
  { label: 'Procurement', href: '/procurement/vendors', icon: ShoppingCart, description: 'Vendors and purchase orders', permission: 'PROCUREMENT.READ' as PermissionCode },
  { label: 'Recipes', href: '/recipes', icon: Layers, description: 'Bill of materials and POS mappings', permission: 'RECIPE.READ' as PermissionCode },
  { label: 'Sales Import', href: '/sales/import', icon: UploadCloud, description: 'Upload and process POS sales files', permission: 'SALES.IMPORT' as PermissionCode },
  { label: 'Insights', href: '/ims/insights', icon: BarChart3, description: 'Variance waterfall & loss tunnel visualisation', permission: 'REPORTING.READ' as PermissionCode },
  { label: 'Admin', href: '/admin/franchise-groups', icon: Shield, description: 'Users, roles, tenancy settings', permission: 'ADMIN.TENANTS' as PermissionCode },
];

export default function DashboardPage() {
  const permissions = useAuthStore((state) => state.permissions);
  const restaurantId = useAuthStore((state) => state.restaurantId);
  const hasPerm = (code: PermissionCode) => permissions.includes(code);

  const [stats, setStats] = useState<Stat[]>(() => {
    const initial: Stat[] = [
      { label: 'Items', value: '...', icon: ClipboardList, href: '/items', color: 'bg-emerald-500' },
      { label: 'Vendors', value: '...', icon: ShoppingCart, href: '/procurement/vendors', color: 'bg-violet-500' },
      { label: 'Recipes', value: '...', icon: Layers, href: '/recipes', color: 'bg-amber-500' },
      { label: 'POs (30d)', value: '...', icon: Truck, href: '/procurement/orders', color: 'bg-blue-500' },
    ];
    if (hasPerm('ADMIN.TENANTS')) {
      initial.unshift({ label: 'Restaurants', value: '...', icon: Store, href: '/admin/restaurants', color: 'bg-blue-500' });
    }
    return initial;
  });

  const [parAlerts, setParAlerts] = useState<ParAlert[]>([]);
  const [recentWaste, setRecentWaste] = useState<WasteItem[]>([]);
  const [topVariance, setTopVariance] = useState<CountVariance[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const rId = useAuthStore.getState().restaurantId;
      if (!rId) return;

      try {
        const [itemsRes, vendorsRes, recipesRes, posRes] = await Promise.all([
          apiClient<{ data: any[] }>('/items').catch(() => null),
          apiClient<{ data: any[] }>('/procurement/vendors').catch(() => null),
          apiClient<{ data: any[] }>('/recipes').catch(() => null),
          apiClient<{ data: any[] }>('/procurement/purchase-orders?days=30').catch(() => null),
        ]);

        const updated: Stat[] = [
          { label: 'Items', value: String(itemsRes?.data?.length ?? '-'), icon: ClipboardList, href: '/items', color: 'bg-emerald-500' },
          { label: 'Vendors', value: String(vendorsRes?.data?.length ?? '-'), icon: ShoppingCart, href: '/procurement/vendors', color: 'bg-violet-500' },
          { label: 'Recipes', value: String(recipesRes?.data?.length ?? '-'), icon: Layers, href: '/recipes', color: 'bg-amber-500' },
          { label: 'POs (30d)', value: String(posRes?.data?.length ?? '-'), icon: Truck, href: '/procurement/orders', color: 'bg-blue-500' },
        ];
        if (hasPerm('ADMIN.TENANTS')) {
          const restRes = await apiClient<{ data: any[] }>('/tenant/restaurants').catch(() => null);
          updated.unshift({ label: 'Restaurants', value: String(restRes?.data?.length ?? '-'), icon: Store, href: '/admin/restaurants', color: 'bg-blue-500' });
        }
        setStats(updated);
      } catch {}

      // ── PAR alerts ──
      try {
        const { data: parItems } = await supabase
          .from('item_restaurant_overrides')
          .select('par_level, item:items!inner(name, sku)')
          .eq('restaurant_id', rId)
          .eq('is_active', true)
          .limit(50);
        if (parItems) {
          const alerts: ParAlert[] = (parItems as any[])
            .filter((i: any) => i.par_level > 0)
            .slice(0, 5)
            .map((i: any) => ({
              item_name: i.item?.name ?? 'Unknown',
              sku: i.item?.sku ?? '',
              current_qty: 0,
              par_level: i.par_level,
              deficit: i.par_level,
            }));
          setParAlerts(alerts);
        }
      } catch {}

      // ── Recent waste ──
      try {
        const { data: waste } = await supabase
          .from('waste_logs')
          .select('quantity, reason, recorded_at, item:items!inner(name)')
          .eq('restaurant_id', rId)
          .order('recorded_at', { ascending: false })
          .limit(5);
        if (waste) {
          setRecentWaste((waste as any[]).map((w: any) => ({
            item_name: w.item?.name ?? 'Unknown',
            quantity: w.quantity,
            reason: w.reason,
            recorded_at: w.recorded_at,
          })));
        }
      } catch {}

      // ── Top variances from latest count batch ──
      try {
        const { data: batches } = await supabase
          .from('inventory_count_batches')
          .select('id')
          .eq('restaurant_id', rId)
          .eq('status', 'CLOSED')
          .order('snapshot_timestamp', { ascending: false })
          .limit(1);
        if (batches && batches.length > 0) {
          const { data: rows } = await supabase
            .from('inventory_count_rows')
            .select('expected_qty, actual_qty, variance_qty, item:items!inner(name)')
            .eq('batch_id', (batches[0] as any).id)
            .limit(5);
          if (rows) {
            setTopVariance((rows as any[])
              .filter((r: any) => Math.abs(r.variance_qty) > 0)
              .map((r: any) => ({
                item_name: r.item?.name ?? 'Unknown',
                expected_qty: r.expected_qty,
                actual_qty: r.actual_qty,
                variance_qty: r.variance_qty,
                variance_pct: r.expected_qty > 0
                  ? Math.round((r.variance_qty / r.expected_qty) * 100)
                  : 0,
              })));
          }
        }
      } catch {}

      setLoading(false);
    }

    loadData();
  }, []);

  const quickLinks = ALL_LINKS.filter((link) => hasPerm(link.permission));

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <header className="mb-2">
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/40 rounded-xl">
              <LayoutDashboard className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
                Operations
              </h1>
              <p className="text-zinc-500 dark:text-zinc-400 text-sm">
                Kitchen command centre &mdash; inventory, waste &amp; procurement at a glance
              </p>
            </div>
          </div>
        </header>

        {/* ── Stat Cards ── */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <Link
              key={stat.label}
              href={stat.href}
              className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 hover:shadow-md transition-shadow group"
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`p-2 rounded-lg ${stat.color} bg-opacity-20`}>
                  <stat.icon className="w-5 h-5 text-white" />
                </div>
                <ArrowRight className="w-4 h-4 text-zinc-300 dark:text-zinc-600 group-hover:text-zinc-500 transition-colors" />
              </div>
              <p className="text-2xl font-bold text-zinc-900 dark:text-white">{stat.value}</p>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">{stat.label}</p>
            </Link>
          ))}
        </section>

        {/* ── Alert & Insight Row ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* PAR Alerts */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              <h2 className="font-semibold text-zinc-900 dark:text-white">PAR Alerts</h2>
            </div>
            {parAlerts.length === 0 ? (
              <p className="text-sm text-zinc-400">No items below reorder point.</p>
            ) : (
              <div className="space-y-3">
                {parAlerts.map((a, i) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <div>
                      <p className="font-medium text-zinc-800 dark:text-zinc-200">{a.item_name}</p>
                      <p className="text-zinc-400 text-xs">{a.sku}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-amber-600 dark:text-amber-400 font-semibold">
                        PAR {a.par_level}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Waste */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <TrendingDown className="w-5 h-5 text-red-500" />
              <h2 className="font-semibold text-zinc-900 dark:text-white">Recent Waste</h2>
            </div>
            {recentWaste.length === 0 ? (
              <p className="text-sm text-zinc-400">No waste recorded recently.</p>
            ) : (
              <div className="space-y-3">
                {recentWaste.map((w, i) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <div>
                      <p className="font-medium text-zinc-800 dark:text-zinc-200">{w.item_name}</p>
                      <p className="text-zinc-400 text-xs capitalize">{w.reason.toLowerCase()}</p>
                    </div>
                    <span className="text-red-600 dark:text-red-400 font-medium">
                      {w.quantity} {w.quantity >= 0 ? 'units' : ''}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Count Variance */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <ClipboardCheck className="w-5 h-5 text-blue-500" />
              <h2 className="font-semibold text-zinc-900 dark:text-white">Latest Count Variance</h2>
            </div>
            {topVariance.length === 0 ? (
              <p className="text-sm text-zinc-400">No count data yet. Run your first inventory count.</p>
            ) : (
              <div className="space-y-3">
                {topVariance.map((v, i) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-zinc-800 dark:text-zinc-200 truncate">{v.item_name}</p>
                      <p className="text-zinc-400 text-xs">
                        expected {v.expected_qty} &middot; actual {v.actual_qty}
                      </p>
                    </div>
                    <span className={`font-semibold ml-2 ${v.variance_qty < 0 ? 'text-red-500' : 'text-emerald-500'}`}>
                      {v.variance_qty > 0 ? '+' : ''}{v.variance_qty}
                      <span className="text-xs ml-1">({v.variance_pct}%)</span>
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Quick Links ── */}
        <section>
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-white mb-4">Modules</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {quickLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 hover:shadow-md hover:border-zinc-300 dark:hover:border-zinc-700 transition-all group"
              >
                <div className="flex items-center gap-3 mb-2">
                  <link.icon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <h3 className="font-semibold text-zinc-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {link.label}
                  </h3>
                </div>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">{link.description}</p>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
