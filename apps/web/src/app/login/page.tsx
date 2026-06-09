'use client';

import { useState, Suspense } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter, useSearchParams } from 'next/navigation';

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'error' | 'success' } | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/';

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      router.push(redirectTo);
      router.refresh();
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Authentication failed';
      setMessage({ text: msg, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-center" style={{ minHeight: '100dvh', padding: 24 }}>
      <div className="glass-card" style={{ maxWidth: 440, width: '100%', padding: 40, borderRadius: 28, textAlign: 'center' }}>
        <div style={{ width: 80, height: 80, borderRadius: 20, background: 'var(--bg-hover)', margin: '0 auto 24px', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
          <img src="/brand/identity.png" alt="Synculariti" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>

        <h1 className="text-gradient" style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>Synculariti</h1>
        <p className="card-subtitle" style={{ marginBottom: 32 }}>Sign in to your workspace</p>

        {message && (
          <div className={`status-badge ${message.type === 'error' ? 'status-danger' : 'status-success'}`} style={{ marginBottom: 24, width: '100%', justifyContent: 'center', padding: '10px', display: 'flex' }}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleLogin} className="flex-col gap-4">
          <div className="flex-col gap-1" style={{ textAlign: 'left' }}>
            <label className="card-subtitle" style={{ fontSize: 11, fontWeight: 700, marginBottom: 4 }}>EMAIL</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="btn btn-secondary"
              style={{ textAlign: 'left', width: '100%', padding: '12px 16px' }}
              placeholder="name@company.com"
            />
          </div>

          <div className="flex-col gap-1" style={{ textAlign: 'left' }}>
            <label className="card-subtitle" style={{ fontSize: 11, fontWeight: 700, marginBottom: 4 }}>PASSWORD</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="btn btn-secondary"
              style={{ textAlign: 'left', width: '100%', padding: '12px 16px' }}
              placeholder="••••••••"
            />
          </div>

          <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: '100%', padding: '14px', marginTop: 12 }}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex-center" style={{ minHeight: '100dvh' }}>Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}
