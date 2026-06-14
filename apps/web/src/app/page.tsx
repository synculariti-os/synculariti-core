'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabase } from '@/lib/supabase';

type AccessType = 'ims' | 'et' | 'both' | 'none';

export default function HomePage() {
  const router = useRouter();
  const [access, setAccess] = useState<AccessType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function checkAccess() {
      const supabase = getSupabase();
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        router.replace('/login');
        return;
      }

      const userId = session.user.id;

      // Check IMS access: do they have user_restaurant_roles?
      const { count: imsCount } = await supabase
        .from('user_restaurant_roles')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      // Check ET access: are they a tenant member?
      const { count: etCount } = await supabase
        .from('tenant_members')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      if (cancelled) return;

      const hasIMS = (imsCount ?? 0) > 0;
      const hasET = (etCount ?? 0) > 0;

      if (hasIMS && hasET) {
        setAccess('both');
      } else if (hasIMS) {
        router.replace('/ims/dashboard');
        return;
      } else if (hasET) {
        router.replace('/et');
        return;
      } else {
        setAccess('none');
      }
      setLoading(false);
    }

    checkAccess();
    return () => { cancelled = true; };
  }, [router]);

  if (loading || !access) {
    return (
      <div className="flex-center" style={{ minHeight: '100dvh' }}>
        <div className="spinner-small" />
      </div>
    );
  }

  if (access === 'none') {
    return (
      <div className="flex-center" style={{ minHeight: '100dvh', padding: 24 }}>
        <div style={{ maxWidth: 400, width: '100%', textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🔒</div>
          <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8, color: 'var(--text-primary)' }}>
            No Access Yet
          </h1>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 24, lineHeight: 1.6 }}>
            Your account hasn&apos;t been assigned to any workspace.
            Contact your franchise administrator to get started.
          </p>
          <button
            onClick={async () => {
              const supabase = getSupabase();
              await supabase.auth.signOut();
              window.location.reload();
            }}
            className="btn btn-secondary"
            style={{ padding: '12px 24px' }}
          >
            Sign Out
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-center" style={{ minHeight: '100dvh', padding: 24 }}>
      <div style={{ maxWidth: 600, width: '100%', textAlign: 'center' }}>
        <div style={{
          width: 80, height: 80, borderRadius: 20,
          background: 'var(--bg-hover)', margin: '0 auto 24px',
          overflow: 'hidden', border: '1px solid var(--border-color)',
        }}>
          <img src="/brand/identity.png" alt="Synculariti" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>

        <h1 className="text-gradient" style={{ fontSize: 32, fontWeight: 800, marginBottom: 8 }}>
          Synculariti
        </h1>
        <p className="card-subtitle" style={{ fontSize: 16, marginBottom: 40, maxWidth: 400, margin: '0 auto 40px' }}>
          Choose a workspace to continue
        </p>

        <div className="flex-col gap-4" style={{ maxWidth: 400, margin: '0 auto' }}>
          <button
            onClick={() => router.push('/ims/dashboard')}
            className="btn btn-primary"
            style={{
              width: '100%', padding: '20px', fontSize: 16,
              justifyContent: 'flex-start', gap: 16,
            }}
          >
            <span style={{ fontSize: 24 }}>🔪</span>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontWeight: 700 }}>Operations</div>
              <div style={{ fontSize: 12, opacity: 0.7 }}>
                Kitchen inventory, procurement, recipes &amp; variance tracking
              </div>
            </div>
          </button>

          <button
            onClick={() => router.push('/et')}
            className="btn btn-primary"
            style={{
              width: '100%', padding: '20px', fontSize: 16,
              justifyContent: 'flex-start', gap: 16,
            }}
          >
            <span style={{ fontSize: 24 }}>📊</span>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontWeight: 700 }}>Finance</div>
              <div style={{ fontSize: 12, opacity: 0.7 }}>
                Expense tracking, POS analytics, budget &amp; food cost intelligence
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
