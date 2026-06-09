'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabase } from '@/lib/supabase';

export default function HomePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSupabase().auth.getSession().then(({ data: { session } }: { data: { session: any } }) => {
      if (!session) {
        router.replace('/login');
        return;
      }
      setLoading(false);
    });
  }, [router]);

  if (loading) {
    return (
      <div className="flex-center" style={{ minHeight: '100dvh' }}>
        <div className="spinner-small" />
      </div>
    );
  }

  return (
    <div className="flex-center" style={{ minHeight: '100dvh', padding: 24 }}>
      <div style={{ maxWidth: 600, width: '100%', textAlign: 'center' }}>
        <div style={{ width: 80, height: 80, borderRadius: 20, background: 'var(--bg-hover)', margin: '0 auto 24px', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
          <img src="/brand/identity.png" alt="Synculariti" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>

        <h1 className="text-gradient" style={{ fontSize: 32, fontWeight: 800, marginBottom: 8 }}>Synculariti</h1>
        <p className="card-subtitle" style={{ fontSize: 16, marginBottom: 40, maxWidth: 400, margin: '0 auto 40px' }}>
          Choose a workspace to get started
        </p>

        <div className="flex-col gap-4" style={{ maxWidth: 400, margin: '0 auto' }}>
          <button
            onClick={() => router.push('/ims/dashboard')}
            className="btn btn-primary"
            style={{ width: '100%', padding: '20px', fontSize: 16, justifyContent: 'flex-start', gap: 16 }}
          >
            <span style={{ fontSize: 24 }}>📦</span>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontWeight: 700 }}>Inventory Management</div>
              <div style={{ fontSize: 12, opacity: 0.7 }}>Stock, procurement, recipes & reports</div>
            </div>
          </button>

          <button
            onClick={() => router.push('/et')}
            className="btn btn-primary"
            style={{ width: '100%', padding: '20px', fontSize: 16, justifyContent: 'flex-start', gap: 16 }}
          >
            <span style={{ fontSize: 24 }}>🧾</span>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontWeight: 700 }}>E-Receipts</div>
              <div style={{ fontSize: 12, opacity: 0.7 }}>Expense tracking, POS & analytics</div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
