import { createBrowserSupabaseClient } from './client';
import type { Database } from './types';
import type { SupabaseClient } from '@supabase/supabase-js';

// Singleton browser client (shared‑supabase already provides a typed client factory)
export const supabase = createBrowserSupabaseClient<Database>();

/** Typed wrapper for `from` – guarantees the table name exists in the generated DB types */
export function fromTyped<T extends keyof Database['public']['Tables']>(table: T) {
  return supabase.from(table);
}

/** Typed wrapper for RPC calls */
export function rpcTyped<
  Fn extends keyof Database['public']['Functions'],
  Args extends Record<string, any> = {}
>(fn: Fn, args?: Args) {
  // Supabase client's rpc method is loosely typed; we cast to any inside the helper.
  return (supabase as unknown as SupabaseClient).rpc(fn as any, args);
}
