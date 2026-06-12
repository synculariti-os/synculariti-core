'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { createBrowserSupabaseClient } from '@synculariti/shared-supabase';
import { formatCurrency, safeAmount } from '@/lib/utils';
import { ErrorBoundary } from '@/components/ErrorBoundary';

function LoadingState() {
  return (
    <div className="bento-card glass-card flex-col flex-center gap-4" style={{ padding: '40px 24px', textAlign: 'center' }}>
      <div className="spinner" style={{ width: 32, height: 32 }} />
      <p className="card-subtitle">Loading action...</p>
    </div>
  );
}

function ActionNotFound() {
  return (
    <div className="bento-card glass-card flex-col flex-center gap-4" style={{ padding: '40px 24px', textAlign: 'center' }}>
      <div style={{ fontSize: '48px' }}>⚠️</div>
      <h2 className="card-title text-gradient">Action Not Found</h2>
      <p className="card-subtitle" style={{ maxWidth: '320px' }}>
        This action does not belong to your account or has expired.
      </p>
    </div>
  );
}

function ActionCompleted() {
  return (
    <div className="bento-card glass-card flex-col flex-center gap-4" style={{ padding: '40px 24px', textAlign: 'center' }}>
      <div style={{ fontSize: '48px' }}>🔒</div>
      <h2 className="card-title text-gradient">Action Already Completed</h2>
      <p className="card-subtitle" style={{ maxWidth: '320px' }}>
        This action request has already been completed and cannot be submitted again.
      </p>
    </div>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="bento-card glass-card flex-col flex-center gap-4" style={{ padding: '40px 24px', textAlign: 'center' }}>
      <div style={{ fontSize: '48px' }}>❌</div>
      <h2 className="card-title text-gradient">Error</h2>
      <p className="card-subtitle" style={{ maxWidth: '320px' }}>{message}</p>
    </div>
  );
}

function ActionView({ payload, tenantName }: { payload: { title: string; description: string; options: string[]; metadata?: Record<string, any> }; tenantName: string }) {
  return (
    <div className="bento-card glass-card flex-col gap-4" style={{ padding: '28px 24px' }}>
      <div className="flex-col gap-1">
        <span className="status-badge status-info" style={{ width: 'fit-content' }}>
          {tenantName} Action Request
        </span>
        <h1 className="card-title text-gradient" style={{ fontSize: '22px', marginTop: '8px' }}>
          {payload.title}
        </h1>
        <p className="card-subtitle" style={{ marginTop: '4px' }}>
          {payload.description}
        </p>
      </div>
      <div style={{ borderTop: '1px solid var(--border-color)', margin: '8px 0' }} />
      <p className="card-subtitle" style={{ textAlign: 'center', padding: '12px 0' }}>
        Decision submission available through dashboard.
      </p>
      <a href="/" className="btn btn-primary" style={{ width: '100%', padding: '14px 20px', textDecoration: 'none', textAlign: 'center' }}>
        ← Back to Dashboard
      </a>
    </div>
  );
}

export function ActionPageClient() {
  const params = useParams<{ slug?: string[] }>();
  const actionId = params.slug?.[0] || '';

  const [state, setState] = useState<'loading' | 'not-found' | 'loaded' | 'completed' | 'error'>('loading');
  const [tenantName, setTenantName] = useState('');
  const [payload, setPayload] = useState<{ title: string; description: string; options: string[]; metadata?: Record<string, any> } | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (!actionId) {
      setState('not-found');
      return;
    }
    let cancelled = false;

    (async () => {
      try {
        const supabase = createBrowserSupabaseClient();

        const { data: record, error } = await supabase
          .from('whatsapp_outbox')
          .select('*, tenants!inner(name, id)')
          .eq('id', actionId)
          .single();

        if (error || !record) {
          if (!cancelled) setState('not-found');
          return;
        }

        if (record.status === 'COMPLETED') {
          if (!cancelled) setState('completed');
          return;
        }

        const meta = record.payload?.metadata || {};
        const desc = meta.description || (meta.amount ? formatCurrency(safeAmount(meta.amount), typeof meta.currency === 'string' ? meta.currency : 'EUR') : '');

        if (!cancelled) {
          setTenantName(record.tenants?.name || 'Synculariti Client');
          setPayload({
            title: record.payload?.name || 'Action Required',
            description: desc,
            options: record.payload?.options || [],
            metadata: meta,
          });
          setState('loaded');
        }
      } catch (e: unknown) {
        if (!cancelled) {
          setState('error');
          setErrorMsg(e instanceof Error ? e.message : 'Failed to load action');
        }
      }
    })();

    return () => { cancelled = true; };
  }, [actionId]);

  return (
    <ErrorBoundary module="App">
      <main style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        padding: '24px 16px',
        background: 'var(--bg-primary)'
      }}>
        <div style={{ width: '100%', maxWidth: '480px' }}>
          {state === 'loading' && <LoadingState />}
          {state === 'not-found' && <ActionNotFound />}
          {state === 'completed' && <ActionCompleted />}
          {state === 'error' && <ErrorState message={errorMsg} />}
          {state === 'loaded' && payload && (
            <ActionView payload={payload} tenantName={tenantName} />
          )}
        </div>
      </main>
    </ErrorBoundary>
  );
}
