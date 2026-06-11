import { createBrowserClient } from '@supabase/ssr';
import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

export type TypedSupabaseClient = ReturnType<typeof createBrowserClient<Database>>;

interface CookieAdapter {
  getAll(): { name: string; value: string }[];
  setAll?(cookies: { name: string; value: string; options?: Record<string, unknown> }[]): void;
}

function supabaseUrl(): string {
  return process.env.NEXT_PUBLIC_SUPABASE_URL || '';
}

function supabaseAnonKey(): string {
  return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
}

function serviceRoleKey(): string {
  return process.env.SUPABASE_SERVICE_ROLE_KEY || '';
}

function hasCredentials(): boolean {
  return !!(supabaseUrl() && supabaseAnonKey());
}

// Lazy singleton for browser client
let browserInstance: ReturnType<typeof createBrowserClient<Database>> | null = null;

// Build-time mock for server-side when env vars aren't available
function buildMockClient(): TypedSupabaseClient {
  const mockFrom = () => ({
    select: () => mockFrom(),
    insert: () => mockFrom(),
    update: () => mockFrom(),
    delete: () => mockFrom(),
    eq: () => mockFrom(),
    neq: () => mockFrom(),
    gt: () => mockFrom(),
    gte: () => mockFrom(),
    lt: () => mockFrom(),
    lte: () => mockFrom(),
    in: () => mockFrom(),
    is: () => mockFrom(),
    order: () => mockFrom(),
    limit: () => mockFrom(),
    single: async () => ({ data: null, error: new Error('Supabase not configured during build time') }),
    maybeSingle: async () => ({ data: null, error: null }),
    then: (resolve: any) => resolve({ data: [], error: null }),
  }) as any;

  return {
    auth: {
      getSession: async () => ({ data: { session: null }, error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      signUp: async () => ({ data: { user: null, session: null }, error: null }),
      signInWithPassword: async () => ({ data: { user: null, session: null }, error: null }),
      signOut: async () => ({ error: null }),
      setSession: async () => ({ data: { session: null }, error: null }),
      refreshSession: async () => ({ data: { session: null }, error: null }),
    },
    from: mockFrom,
    rpc: async () => ({ data: null, error: new Error('Supabase not configured during build time') }),
    channel: () => ({
      on: () => ({ subscribe: () => ({ unsubscribe: () => {} }) }),
    }),
    removeChannel: () => {},
    removeAllChannels: () => {},
    getChannels: () => [],
    realtime: {} as any,
    storage: {} as any,
    functions: {} as any,
    schema: () => mockFrom(),
  } as unknown as TypedSupabaseClient;
}

export function createBrowserSupabaseClient(): TypedSupabaseClient {
  if (typeof window === 'undefined') {
    return buildMockClient();
  }
  if (!browserInstance) {
    browserInstance = createBrowserClient<Database>(supabaseUrl(), supabaseAnonKey());
  }
  return browserInstance;
}

export function createServerSupabaseClient(cookieStore: CookieAdapter): TypedSupabaseClient {
  if (!hasCredentials()) {
    return buildMockClient();
  }
  return createServerClient<Database>(supabaseUrl(), supabaseAnonKey(), {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        if (cookieStore.setAll) {
          cookieStore.setAll(cookiesToSet);
        }
      },
    },
  });
}

export function createServiceRoleClient(): ReturnType<typeof createClient<Database>> {
  return createClient<Database>(supabaseUrl(), serviceRoleKey(), {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
