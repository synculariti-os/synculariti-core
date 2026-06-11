import { createBrowserSupabaseClient } from '@synculariti/shared-supabase';

export const supabase = createBrowserSupabaseClient();

// E2E test hook
if (typeof window !== 'undefined' && !(window as any).__supabase) {
  (window as any).__supabase = supabase;
}
