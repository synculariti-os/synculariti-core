'use client';

import React, { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api-client';
import { ShoppingCart, Plus, X, Loader2, Search, Send, PackageCheck, Ban, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuthStore } from '@/store/use-auth-store';
import { useHasHydrated } from '@/hooks/use-has-hydrated';

const STATUS_STYLES: Record<string, string> = {
  DRAFT: 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400',
  SUBMITTED: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
  RECEIVED: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300',
  CANCELLED: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
};

export function OrdersTable() {
  const isHydrated = useHasHydrated();
  const { hasPermission } = useAuthStore();
  const canWrite = isHydrated && hasPermission('PROCUREMENT.WRITE');

  const [orders, setOrders] = useState<any[]>([]);
  const [vendors, setVendors] = useState<any[]>([]);
  const [items, setItems] = useState<{ id: string; name: string; type: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [lineItems, setLineItems] = useState<Record<string, any[]>>({});
  const [loadingLines, setLoadingLines] = useState<Record<string, boolean>>({});
  const [receiveOrderId, setReceiveOrderId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setIsLoading(true);
        const [ordersRes, vendorsRes, itemsRes] = await Promise.all([
          apiClient<{ data: any[] }>('/procurement/orders'),
          apiClient<{ data: any[] }>('/procurement/vendors'),
          apiClient<{ data: { id: string; name: string; type: string }[] }>('/items'),
        ]);
        if (cancelled) return;
        setOrders(ordersRes.data || []);
        setVendors(vendorsRes.data || []);
        setItems(itemsRes.data || []);
      } catch (err) {
        console.error('Failed to fetch orders:', err);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const refetchOrders = async () => {
    const res = await apiClient<{ data: any[] }>('/procurement/orders');
    setOrders(res.data || []);
  };

  const vendorName = (id: string) => vendors.find(v => v.id === id)?.name || id.slice(0, 8);
  const itemName = (id: string) => items.find(i => i.id === id)?.name || id.slice(0, 8);

  const handleAction = async (id: string, action: string) => {
    try {
      await apiClient(`/procurement/orders/${id}/${action}`, { method: 'PATCH' });
      refetchOrders();
    } catch (err) {
      console.error(`Failed to ${action} order:`, err);
    }
  };

  const toggleExpand = async (orderId: string) => {
    if (expandedOrder === orderId) {
      setExpandedOrder(null);
      return;
    }
    setExpandedOrder(orderId);
    if (!lineItems[orderId]) {
      setLoadingLines(prev => ({ ...prev, [orderId]: true }));
      try {
        const res = await apiClient<{ data: any[] }>(`/procurement/orders/${orderId}/line-items`);
        setLineItems(prev => ({ ...prev, [orderId]: res.data || [] }));
      } catch {
        setLineItems(prev => ({ ...prev, [orderId]: [] }));
      } finally {
        setLoadingLines(prev => ({ ...prev, [orderId]: false }));
      }
    }
  };

  const filtered = orders.filter((o) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return o.id.toLowerCase().includes(q) || o.status.toLowerCase().includes(q);
  });

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm">
      <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative max-w-md w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input type="text" placeholder="Search orders..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-9 pr-4 py-2 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow" />
        </div>
        {canWrite && (
          <button onClick={() => setIsCreateOpen(true)} className="flex items-center justify-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-sm transition-colors whitespace-nowrap shadow-sm">
            <Plus className="w-4 h-4 mr-2" /> Create PO
          </button>
        )}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-zinc-600 dark:text-zinc-400">
          <thead className="text-xs text-zinc-500 uppercase bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-200 dark:border-zinc-800">
            <tr>
              <th className="px-6 py-4 font-medium w-8"></th>
              <th className="px-6 py-4 font-medium">Vendor</th>
              <th className="px-6 py-4 font-medium">Status</th>
              <th className="px-6 py-4 font-medium">Order Date</th>
              <th className="px-6 py-4 font-medium">Delivery</th>
              <th className="px-6 py-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {isLoading ? (
              <tr><td colSpan={6} className="px-6 py-12 text-center"><div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-solid border-blue-600 border-r-transparent" /></td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={6} className="px-6 py-12 text-center text-zinc-500">
                <ShoppingCart className="w-12 h-12 mx-auto text-zinc-300 dark:text-zinc-700 mb-3" />
                <p className="text-base font-medium text-zinc-900 dark:text-zinc-100">No purchase orders</p>
                <p className="mt-1 mb-4">Create your first PO.</p>
                {canWrite && <button onClick={() => setIsCreateOpen(true)} className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-sm transition-colors shadow-sm"><Plus className="w-4 h-4 mr-2" /> Create PO</button>}
              </td></tr>
            ) : (
              filtered.map((po) => (
                <React.Fragment key={po.id}>
                  <tr className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors cursor-pointer" onClick={() => toggleExpand(po.id)}>
                    <td className="px-6 py-4">{expandedOrder === po.id ? <span className="text-zinc-400">▼</span> : <span className="text-zinc-400">▶</span>}</td>
                    <td className="px-6 py-4 font-medium text-zinc-900 dark:text-zinc-100">{vendorName(po.vendorId)}</td>
                    <td className="px-6 py-4"><span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${STATUS_STYLES[po.status] || ''}`}>{po.status}</span></td>
                    <td className="px-6 py-4 text-zinc-500 whitespace-nowrap">{new Date(po.orderDate).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-zinc-500 whitespace-nowrap">{po.expectedDeliveryDate ? new Date(po.expectedDeliveryDate).toLocaleDateString() : '-'}</td>
                    <td className="px-6 py-4 text-right" onClick={e => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1">
                        {po.status === 'DRAFT' && <button onClick={() => handleAction(po.id, 'submit')} className="p-1.5 rounded text-zinc-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20" title="Submit"><Send className="w-4 h-4" /></button>}
                        {(po.status === 'DRAFT' || po.status === 'SUBMITTED') && <button onClick={() => handleAction(po.id, 'cancel')} className="p-1.5 rounded text-zinc-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20" title="Cancel"><Ban className="w-4 h-4" /></button>}
                        {po.status === 'SUBMITTED' && <button onClick={() => setReceiveOrderId(po.id)} className="p-1.5 rounded text-zinc-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20" title="Receive"><PackageCheck className="w-4 h-4" /></button>}
                      </div>
                    </td>
                  </tr>
                  {expandedOrder === po.id && (
                    <tr>
                      <td colSpan={6} className="px-6 py-0 bg-zinc-50/50 dark:bg-zinc-800/30">
                        {loadingLines[po.id] ? (
                          <div className="flex justify-center py-4"><div className="h-5 w-5 animate-spin rounded-full border-2 border-solid border-blue-600 border-r-transparent" /></div>
                        ) : lineItems[po.id]?.length === 0 ? (
                          <p className="text-sm text-zinc-400 py-4 text-center">No line items</p>
                        ) : (
                          <table className="w-full text-left text-sm text-zinc-600 dark:text-zinc-400">
                            <thead>
                              <tr className="text-xs text-zinc-400 uppercase">
                                <th className="px-8 py-2 font-medium">Item</th>
                                <th className="px-4 py-2 font-medium">Ordered</th>
                                <th className="px-4 py-2 font-medium">Received</th>
                                <th className="px-4 py-2 font-medium">Unit Price</th>
                              </tr>
                            </thead>
                            <tbody>
                              {(lineItems[po.id] || []).map((li: any) => (
                                <tr key={li.id} className="border-t border-zinc-200/50 dark:border-zinc-700/50">
                                  <td className="px-8 py-2 text-zinc-900 dark:text-zinc-100">{itemName(li.itemId)}</td>
                                  <td className="px-4 py-2">{li.quantityOrdered}</td>
                                  <td className="px-4 py-2">{li.quantityReceived || '-'}</td>
                                  <td className="px-4 py-2">${Number(li.rawUnitPrice).toFixed(2)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        )}
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))
            )}
          </tbody>
        </table>
      </div>
      {isCreateOpen && <CreateOrderDialog vendors={vendors} items={items} onClose={() => setIsCreateOpen(false)} onSuccess={() => { setIsCreateOpen(false); refetchOrders(); }} />}
      {receiveOrderId && <ReceiveOrderDialog orderId={receiveOrderId} items={items} onClose={() => setReceiveOrderId(null)} onSuccess={() => { setReceiveOrderId(null); refetchOrders(); }} />}
    </div>
  );
}

function ReceiveOrderDialog({ orderId, items, onClose, onSuccess }: { orderId: string; items: { id: string; name: string }[]; onClose: () => void; onSuccess: () => void }) {
  const [loadingRows, setLoadingRows] = useState(true);
  const [receivingLines, setReceivingLines] = useState<{ itemId: string; quantityReceived: string }[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await apiClient<{ data: any[] }>(`/procurement/orders/${orderId}/line-items`);
        if (cancelled) return;
        setReceivingLines((res.data || []).map((li: any) => ({ itemId: li.itemId, quantityReceived: String(li.quantityOrdered) })));
      } catch {
        if (!cancelled) setError('Failed to load line items');
      } finally {
        if (!cancelled) setLoadingRows(false);
      }
    })();
    return () => { cancelled = true; };
  }, [orderId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validLines = receivingLines.filter(l => l.itemId && Number(l.quantityReceived) >= 0);
    if (validLines.length === 0) { setError('At least one line item is required'); return; }
    try {
      setIsSubmitting(true);
      setError('');
      await apiClient(`/procurement/orders/${orderId}/receive`, {
        method: 'PATCH',
        body: { lineItems: validLines.map(l => ({ itemId: l.itemId, quantityReceived: Number(l.quantityReceived) })) },
      });
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to receive PO');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl p-6 max-w-lg w-full mx-4 border border-zinc-200 dark:border-zinc-800 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">Receive Purchase Order</h3>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          {loadingRows ? (
            <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-zinc-400" /></div>
          ) : (
            <div className="space-y-2">
              {receivingLines.map((line, i) => (
                <div key={line.itemId} className="flex gap-2 items-center">
                  <span className="flex-1 text-sm text-zinc-900 dark:text-zinc-100">{items.find(it => it.id === line.itemId)?.name || line.itemId.slice(0, 8)}</span>
                  <input
                    type="number" step="any" min="0"
                    value={line.quantityReceived}
                    onChange={(e) => {
                      const next = [...receivingLines];
                      next[i].quantityReceived = e.target.value;
                      setReceivingLines(next);
                    }}
                    className="w-24 px-2 py-1.5 text-xs bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    placeholder="Qty"
                  />
                </div>
              ))}
            </div>
          )}
          {error && <p className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg">{error}</p>}
          <div className="flex gap-3 justify-end pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl text-sm font-medium border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">Cancel</button>
            <button type="submit" disabled={isSubmitting || loadingRows} className="flex items-center px-4 py-2 rounded-xl text-sm font-medium bg-emerald-600 hover:bg-emerald-700 text-white transition-colors disabled:opacity-50">
              {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <PackageCheck className="w-4 h-4 mr-2" />} Receive
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const PER_PAGE = 10;

function CreateOrderDialog({ vendors, items, onClose, onSuccess }: { vendors: any[]; items: { id: string; name: string; type: string }[]; onClose: () => void; onSuccess: () => void }) {
  const [vendorId, setVendorId] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [lineItems, setLineItems] = useState<{ itemId: string; qty: string; price: string }[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);

  const availableItems = items.filter(i => !lineItems.some(li => li.itemId === i.id));
  const totalPages = Math.ceil(lineItems.length / PER_PAGE);
  const paginatedItems = lineItems.slice(page * PER_PAGE, (page + 1) * PER_PAGE);

  const updateLineItems = (updater: (prev: typeof lineItems) => typeof lineItems) => {
    setLineItems(prev => {
      const next = updater(prev);
      if (next.length === 0) setPage(0);
      return next;
    });
  };

  const addLine = () => {
    updateLineItems(prev => [...prev, { itemId: '', qty: '25', price: '' }]);
    setPage(totalPages); // jump to last page
  };

  const removeLine = (i: number) => {
    // i is the index in the full list, not paginated
    const actualIndex = page * PER_PAGE + i;
    updateLineItems(prev => prev.filter((_, idx) => idx !== actualIndex));
  };

  const selectAll = () => {
    setLineItems(availableItems.map(i => ({ itemId: i.id, qty: '25', price: '' })));
    setPage(0);
  };

  const deselectAll = () => {
    setLineItems([]);
    setPage(0);
  };

  const updateItem = (paginatedIdx: number, field: 'itemId' | 'qty' | 'price', value: string) => {
    const actualIndex = page * PER_PAGE + paginatedIdx;
    setLineItems(prev => {
      const next = [...prev];
      next[actualIndex] = { ...next[actualIndex], [field]: value };
      return next;
    });
  };

  const itemName = (id: string) => items.find(i => i.id === id)?.name || id.slice(0, 8);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vendorId) { setError('Vendor is required'); return; }
    const validLines = lineItems.filter(l => l.itemId && l.qty);
    if (validLines.length === 0) { setError('At least one line item is required'); return; }
    try {
      setIsSubmitting(true);
      setError('');
      await apiClient('/procurement/orders', {
        method: 'POST',
        body: {
          vendorId,
          expectedDeliveryDate: deliveryDate || null,
          lineItems: validLines.map(l => ({ itemId: l.itemId, quantityOrdered: Number(l.qty), rawUnitPrice: l.price ? Number(l.price) : 0 })),
        },
      });
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to create PO');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl p-6 max-w-2xl w-full mx-4 border border-zinc-200 dark:border-zinc-800 max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4 shrink-0">
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">Create Purchase Order</h3>
          <button onClick={onClose} className="p-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors"><X className="w-5 h-5" /></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 flex flex-col flex-1 min-h-0">
          <div className="space-y-4 shrink-0">
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Vendor</label>
              <select value={vendorId} onChange={(e) => setVendorId(e.target.value)} className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm">
                <option value="">Select vendor...</option>
                {vendors.filter(v => v.is_active !== false).map((v) => <option key={v.id} value={v.id}>{v.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Expected Delivery (Optional)</label>
              <input type="date" value={deliveryDate} onChange={(e) => setDeliveryDate(e.target.value)} className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
            </div>
          </div>

          <div className="flex-1 min-h-0 flex flex-col">
            {vendorId && (
              <div className="flex items-center justify-between mb-2 shrink-0">
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Line Items</label>
                <div className="flex items-center gap-2">
                  {lineItems.length > 0 ? (
                    <button type="button" onClick={deselectAll} className="text-sm text-red-500 hover:text-red-600 font-medium px-2 py-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                      Deselect All
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={selectAll}
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium px-2 py-1 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                    >
                      Select All (25 each)
                    </button>
                  )}
                  <span className="text-zinc-300 dark:text-zinc-600">|</span>
                  <button type="button" onClick={addLine} className="text-sm text-blue-600 hover:text-blue-700 font-medium">+ Add Item</button>
                </div>
              </div>
            )}

            {!vendorId ? (
              <div className="flex-1 flex flex-col items-center justify-center py-8 text-zinc-400 dark:text-zinc-500 border-2 border-dashed border-zinc-200 dark:border-zinc-700 rounded-xl">
                <ShoppingCart className="w-8 h-8 mb-2 opacity-50" />
                <p className="text-sm font-medium">Select a vendor to add items</p>
              </div>
            ) : lineItems.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center py-8 text-zinc-400 dark:text-zinc-500 border-2 border-dashed border-zinc-200 dark:border-zinc-700 rounded-xl">
                <ShoppingCart className="w-8 h-8 mb-2 opacity-50" />
                <p className="text-sm font-medium">No line items yet</p>
                <p className="text-sm mt-1">Select All to populate with qty 25, or add items individually.</p>
              </div>
            ) : (
              <div className="flex-1 flex flex-col min-h-0">
                <div className="flex-1 overflow-y-auto border border-zinc-200 dark:border-zinc-700 rounded-xl">
                  <table className="w-full text-left text-sm">
                    <thead className="sticky top-0 bg-zinc-50 dark:bg-zinc-800 border-b border-zinc-200 dark:border-zinc-700 z-10">
                      <tr className="text-sm text-zinc-500 uppercase font-semibold">
                        <th className="px-3 py-2 w-8">#</th>
                        <th className="px-2 py-2">Item</th>
                        <th className="px-2 py-2 w-24 text-right">Qty</th>
                        <th className="px-2 py-2 w-32 text-right">Unit Price</th>
                        <th className="px-2 py-2 w-10"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                      {paginatedItems.map((line, pi) => {
                        const globalIndex = page * PER_PAGE + pi;
                        return (
                          <tr key={globalIndex} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                            <td className="px-3 py-1.5">
                              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-bold">
                                {globalIndex + 1}
                              </span>
                            </td>
                            <td className="px-2 py-1.5">
                              <select
                                value={line.itemId}
                                onChange={(e) => updateItem(pi, 'itemId', e.target.value)}
                                className="w-full px-2 py-2 text-sm bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-600 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                              >
                                <option value="">Select item...</option>
                                {items.map((item) => (
                                  <option key={item.id} value={item.id} disabled={item.id !== line.itemId && lineItems.some(li => li.itemId === item.id)}>
                                    {item.name}
                                  </option>
                                ))}
                              </select>
                            </td>
                            <td className="px-2 py-1.5">
                              <input
                                type="number" step="any" min="0"
                                value={line.qty}
                                onChange={(e) => updateItem(pi, 'qty', e.target.value)}
                                className="w-full px-2 py-2 text-sm bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-600 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 text-right"
                              />
                            </td>
                            <td className="px-2 py-1.5">
                              <input
                                type="number" step="0.01" min="0"
                                placeholder="Optional"
                                value={line.price}
                                onChange={(e) => updateItem(pi, 'price', e.target.value)}
                                className="w-full px-2 py-2 text-sm bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-600 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 text-right"
                              />
                            </td>
                            <td className="px-2 py-1.5">
                              <button type="button" onClick={() => removeLine(pi)} className="p-1 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors" title="Remove">
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                {totalPages > 1 && (
                  <div className="flex items-center justify-between pt-2 shrink-0">
                    <span className="text-sm text-zinc-500">
                      {lineItems.length} item{lineItems.length !== 1 ? 's' : ''}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setPage(p => Math.max(0, p - 1))}
                        disabled={page === 0}
                        className="p-1.5 rounded text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      {Array.from({ length: totalPages }, (_, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setPage(i)}
                          className={`min-w-[32px] h-8 text-sm rounded font-semibold transition-colors ${
                            i === page
                              ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                              : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                          }`}
                        >
                          {i + 1}
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                        disabled={page >= totalPages - 1}
                        className="p-1.5 rounded text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {error && <p className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg">{error}</p>}
          <div className="flex gap-3 justify-end pt-2 shrink-0 border-t border-zinc-100 dark:border-zinc-800">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl text-sm font-medium border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="flex items-center px-4 py-2 rounded-xl text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white transition-colors disabled:opacity-50">
              {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <ShoppingCart className="w-4 h-4 mr-2" />}
              {isSubmitting ? 'Creating...' : `Create PO (${lineItems.filter(l => l.itemId && l.qty).length} items)`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
