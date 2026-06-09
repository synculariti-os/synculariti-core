import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'dummy_anon_key';

export const supabase = createBrowserClient(supabaseUrl, supabaseKey);

// E2E test hook: exposes the supabase client globally so Playwright tests
// can call supabase.auth.setSession() to restore auth state without
// relying on cookie-based session recovery.
// E2E test hook: expose the supabase client globally so Playwright
// can restore auth state via setSession(). Guard against overwrite
// by dynamic import chunks that each bundle their own supabase.ts.
if (typeof window !== 'undefined' && !(window as any).__supabase) {
  (window as any).__supabase = supabase;
}
