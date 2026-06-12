'use client';

import React, { useEffect, useState, useRef } from 'react';
import { apiClient } from '@/lib/api-client';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/use-auth-store';
import { useHasHydrated } from '@/hooks/use-has-hydrated';
import { Building2, Plus, X, Loader2, Search, Pencil, Upload, Download, FileUp, AlertCircle, CheckCircle2, Trash2 } from 'lucide-react';

export function VendorsTable() {
  const [vendors, setVendors] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingVendor, setEditingVendor] = useState<any | null>(null);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<{
    totalRows: number;
    createdCount: number;
    errorCount: number;
    errors: { row: number; item: string; message: string }[];
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const restaurantId = useAuthStore((state) => state.restaurantId);
  const isHydrated = useHasHydrated();
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const canWrite = isHydrated && hasPermission('PROCUREMENT.WRITE');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteConfirmVendor, setDeleteConfirmVendor] = useState<any | null>(null);
  const [deleteConfirmBulk, setDeleteConfirmBulk] = useState(false);

  const fetchVendors = async () => {
    try {
      setIsLoading(true);
      const res = await apiClient<{ data: any[] }>('/procurement/vendors');
      setVendors(res.data || []);
    } catch (err) {
      console.error('Failed to fetch vendors:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchVendors(); }, []);

  const filtered = vendors.filter((v) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return v.name.toLowerCase().includes(q) || (v.contactEmail || '').toLowerCase().includes(q);
  });

  const allFilteredSelected = filtered.length > 0 && filtered.every((v) => selectedIds.has(v.id));

  const handleSelectAll = () => {
    if (allFilteredSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filtered.map((v) => v.id)));
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

  const handleSingleDelete = async () => {
    if (!deleteConfirmVendor) return;
    setIsDeleting(true);
    try {
      await apiClient(`/procurement/vendors/${deleteConfirmVendor.id}`, { method: 'DELETE' });
      setDeleteConfirmVendor(null);
      setSelectedIds(new Set());
      await fetchVendors();
    } catch (err: any) {
      alert(err.message || 'Failed to delete vendor');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    setIsDeleting(true);
    try {
      await apiClient('/procurement/vendors/bulk-delete', {
        method: 'POST',
        body: { ids: Array.from(selectedIds) },
      });
      setDeleteConfirmBulk(false);
      setSelectedIds(new Set());
      await fetchVendors();
    } catch (err: any) {
      alert(err.message || 'Failed to delete vendors');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm">
      <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative max-w-md w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input type="text" placeholder="Search vendors..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-9 pr-4 py-2 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow" />
        </div>
        <div className="flex gap-2">
          <button
            onClick={async () => {
              try {
                const { data: { session } } = await supabase.auth.getSession();
                if (!session) return;
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/procurement/vendors/upload/template`, {
                  headers: { 'Authorization': `Bearer ${session.access_token}` },
                });
                if (!res.ok) throw new Error('Failed to download template');
                const blob = await res.blob();
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'vendors-upload-template.csv';
                a.click();
                URL.revokeObjectURL(url);
              } catch (err) {
                console.error('Failed to download template:', err);
              }
            }}
            className="inline-flex items-center justify-center px-3 py-2 border border-zinc-300 dark:border-zinc-700 text-sm font-medium rounded-lg shadow-sm text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
            title="Download CSV template"
          >
            <Download className="h-4 w-4 mr-2" />
            Template
          </button>
          {canWrite && (
            <button
              onClick={() => setIsUploadOpen(true)}
              className="inline-flex items-center justify-center px-3 py-2 border border-zinc-300 dark:border-zinc-700 text-sm font-medium rounded-lg shadow-sm text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload
            </button>
          )}
          {canWrite && (
            <button onClick={() => setIsCreateOpen(true)} className="flex items-center justify-center px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg font-medium text-sm transition-colors whitespace-nowrap shadow-sm">
              <Plus className="w-4 h-4 mr-2" /> Add Vendor
            </button>
          )}
        </div>
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
              <th className="px-6 py-4 font-medium">Name</th>
              <th className="px-6 py-4 font-medium">Email</th>
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
                <Building2 className="w-12 h-12 mx-auto text-zinc-300 dark:text-zinc-700 mb-3" />
                <p className="text-base font-medium text-zinc-900 dark:text-zinc-100">No vendors</p>
                <p className="mt-1 mb-4">Add your first supplier.</p>
                {canWrite && <button
 onClick={() => setIsCreateOpen(true)} className="inline-flex items-center px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg font-medium text-sm transition-colors shadow-sm"><Plus className="w-4 h-4 mr-2" /> Add Vendor</button>}
              </td></tr>
            ) : (
              filtered.map((v) => (
                <tr key={v.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                  <td className="px-4 py-4">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(v.id)}
                      onChange={() => handleSelectOne(v.id)}
                      className="rounded border-zinc-300 dark:border-zinc-600"
                    />
                  </td>
                  <td className="px-6 py-4 font-medium text-zinc-900 dark:text-zinc-100">{v.name}</td>
                  <td className="px-6 py-4 text-zinc-500">{v.contactEmail || '-'}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${v.isActive ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500'}`}>
                      {v.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-zinc-500 whitespace-nowrap">{new Date(v.createdAt).toLocaleDateString()}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {canWrite && <button
 onClick={() => setEditingVendor(v)} className="p-1.5 rounded-lg text-zinc-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"><Pencil className="w-4 h-4" /></button>}
                      {canWrite && <button
 onClick={() => setDeleteConfirmVendor(v)} className="p-1.5 rounded-lg text-zinc-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"><Trash2 className="w-4 h-4" /></button>}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {isCreateOpen && <VendorDialog onClose={() => setIsCreateOpen(false)} onSuccess={() => { setIsCreateOpen(false); fetchVendors(); }} />}
      {editingVendor && <VendorDialog vendor={editingVendor} onClose={() => setEditingVendor(null)} onSuccess={() => { setEditingVendor(null); fetchVendors(); }} />}

      {isUploadOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => { if (!isUploading) { setIsUploadOpen(false); setUploadFile(null); setUploadResult(null); } }}>
          <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl p-6 max-w-lg w-full mx-4 border border-zinc-200 dark:border-zinc-800" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">Bulk Upload Vendors</h3>
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
                    {uploadResult.createdCount} of {uploadResult.totalRows} vendors created.
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
                    onClick={() => { setIsUploadOpen(false); setUploadFile(null); setUploadResult(null); fetchVendors(); }}
                    className="px-4 py-2 text-sm font-medium bg-violet-600 hover:bg-violet-700 text-white rounded-lg transition-colors"
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div
                  className="border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-xl p-8 text-center cursor-pointer hover:border-violet-400 dark:hover:border-violet-500 transition-colors"
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

                        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/procurement/vendors/upload`, {
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
                    className="flex items-center px-4 py-2 text-sm font-medium bg-violet-600 hover:bg-violet-700 disabled:bg-zinc-300 dark:disabled:bg-zinc-700 text-white rounded-lg transition-colors"
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

      {/* Delete Confirmation — Single */}
      {deleteConfirmVendor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => !isDeleting && setDeleteConfirmVendor(null)}>
          <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl p-6 max-w-md w-full mx-4 border border-zinc-200 dark:border-zinc-800" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-2">Delete Vendor</h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-6">
              Are you sure you want to delete <strong className="text-zinc-900 dark:text-zinc-100">{deleteConfirmVendor.name}</strong>? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteConfirmVendor(null)}
                disabled={isDeleting}
                className="px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSingleDelete}
                disabled={isDeleting}
                className="flex items-center px-4 py-2 text-sm font-medium bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white rounded-lg transition-colors"
              >
                {isDeleting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Trash2 className="w-4 h-4 mr-2" />}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation — Bulk */}
      {deleteConfirmBulk && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => !isDeleting && setDeleteConfirmBulk(false)}>
          <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl p-6 max-w-md w-full mx-4 border border-zinc-200 dark:border-zinc-800" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-2">Delete Vendors</h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-6">
              Are you sure you want to delete <strong className="text-zinc-900 dark:text-zinc-100">{selectedIds.size}</strong> vendor{selectedIds.size !== 1 ? 's' : ''}? This action cannot be undone.
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

function VendorDialog({ vendor, onClose, onSuccess }: { vendor?: any; onClose: () => void; onSuccess: () => void }) {
  const [name, setName] = useState(vendor?.name || '');
  const [email, setEmail] = useState(vendor?.contactEmail || '');
  const [isActive, setIsActive] = useState(vendor?.isActive ?? true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const restaurantId = useAuthStore((state) => state.restaurantId);
  const franchiseGroupId = useAuthStore((state) => state.franchiseGroupId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) { setError('Name is required'); return; }
    try {
      setIsSubmitting(true);
      setError('');
      const body = { name, contactEmail: email || null, isActive, franchiseGroupId: null, restaurantId };
      if (vendor) {
        await apiClient(`/procurement/vendors/${vendor.id}`, { method: 'PATCH', body });
      } else {
        await apiClient('/procurement/vendors', { method: 'POST', body });
      }
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to save vendor');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl p-6 max-w-md w-full mx-4 border border-zinc-200 dark:border-zinc-800" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">{vendor ? 'Edit Vendor' : 'Add Vendor'}</h3>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" placeholder="Vendor name" />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Email (Optional)</label>
            <input value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" placeholder="contact@supplier.com" />
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="isActive" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} className="rounded border-zinc-300" />
            <label htmlFor="isActive" className="text-sm text-zinc-700 dark:text-zinc-300">Active</label>
          </div>
          {error && <p className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg">{error}</p>}
          <div className="flex gap-3 justify-end pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl text-sm font-medium border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="flex items-center px-4 py-2 rounded-xl text-sm font-medium bg-violet-600 hover:bg-violet-700 text-white transition-colors disabled:opacity-50">
              {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null} {vendor ? 'Save' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
