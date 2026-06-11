import { createBrowserSupabaseClient, createServiceRoleClient } from '@synculariti/shared-supabase';
export type { TypedSupabaseClient } from '@synculariti/shared-supabase';

export { createBrowserSupabaseClient, createServiceRoleClient };

// Backward-compat: lazy singleton via proxy
export const supabase = createBrowserSupabaseClient();

// E2E test hook: expose so Playwright can restore auth state
if (typeof window !== 'undefined' && !(window as any).__supabase) {
  (window as any).__supabase = supabase;
}

// Deprecated alias
export const getSupabase = createBrowserSupabaseClient;
