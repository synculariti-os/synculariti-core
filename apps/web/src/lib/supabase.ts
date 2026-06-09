import { createBrowserClient } from '@supabase/ssr';
import { SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Type for the mock client
interface MockSupabaseClient {
  auth: {
    getSession: () => Promise<{ data: { session: null }; error: null }>;
    onAuthStateChange: (callback: (event: string, session: null) => void) => { data: { subscription: { unsubscribe: () => void } } };
    signUp: (credentials: { email: string; password: string; options?: { emailRedirectTo?: string } }) => Promise<{ data: { user: any; session: any }; error: any }>;
    signInWithPassword: (credentials: { email: string; password: string }) => Promise<{ data: { user: any; session: any }; error: any }>;
    signInWithOAuth: (options: { provider: string; options?: { redirectTo?: string } }) => Promise<{ data: { user: any; session: any }; error: any }>;
    signOut: () => Promise<{ error: any }>;
  };
  from: (table: string) => any;
  rpc: (fn: string, params?: any) => Promise<{ data: null; error: Error }>;
  channel: (name: string) => any;
  removeChannel: (channel: any) => void;
}

// Lazy initialization to avoid build-time errors
let supabaseInstance: SupabaseClient<any, 'public', any> | null = null;

export function getSupabase(): SupabaseClient<any, 'public', any> | MockSupabaseClient {
  if (typeof window === 'undefined') {
    // Return a mock on server side
    const mock: MockSupabaseClient = {
      auth: {
        getSession: async () => ({ data: { session: null }, error: null }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
        signUp: async () => ({ data: { user: null, session: null }, error: null }),
        signInWithPassword: async () => ({ data: { user: null, session: null }, error: null }),
        signInWithOAuth: async () => ({ data: { user: null, session: null }, error: null }),
        signOut: async () => ({ error: null }),
      },
      from: () => ({
        select: () => mock.from(''),
        eq: () => mock.from(''),
        single: async () => ({ data: null, error: new Error('Supabase not configured during build time') }),
      }),
      rpc: async () => ({ data: null, error: new Error('Supabase not configured during build time') }),
      channel: () => ({
        on: () => ({
          subscribe: () => ({ unsubscribe: () => {} }),
        }),
      }),
      removeChannel: () => {},
    };
    return mock;
  }
  
  if (!supabaseInstance) {
    supabaseInstance = createBrowserClient(supabaseUrl, supabaseKey);
    if (typeof window !== 'undefined' && !(window as any).__supabase) {
      (window as any).__supabase = supabaseInstance;
    }
  }
  return supabaseInstance;
}

// Backward compatibility - export a proxy that initializes on first access
export const supabase = new Proxy({} as SupabaseClient<any, 'public', any> | MockSupabaseClient, {
  get(target, prop) {
    const instance = getSupabase();
    return instance[prop as keyof typeof instance];
  },
});
