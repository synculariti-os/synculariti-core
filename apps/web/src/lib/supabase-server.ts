import { createServerClient } from '@supabase/ssr';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

console.log('[supabase-server] Module loaded:', { 
  supabaseUrl: supabaseUrl ? `SET (${supabaseUrl.substring(0, 20)}...)` : 'NOT SET', 
  supabaseKey: supabaseKey ? `SET (${supabaseKey.substring(0, 10)}...)` : 'NOT SET',
});


// Check if we're in a build-time context (no Supabase credentials available)
function isBuildTime(): boolean {
  const result = !supabaseUrl || !supabaseKey || supabaseUrl === '' || supabaseKey === '';
  console.log('[supabase-server] isBuildTime():', { supabaseUrl, supabaseKey, result });
  return result;
}

export async function createServerSupabaseClient() {
  console.log('[supabase-server] createServerSupabaseClient called');
  // During build time, return a mock client that throws helpful errors
  if (isBuildTime()) {
    console.log('[supabase-server] Returning mock client');
    return createMockClient();
  }
  
  const cookieStore = await cookies();

  return createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          cookieStore.set(name, value, options);
        });
      },
    },
  });
}

export async function createClient() {
  console.log('[supabase-server] createClient called');
  return createServerSupabaseClient();
}

export function createServiceClient() {
  // During build time, return a mock client
  if (isBuildTime()) {
    return createMockClient();
  }
  
  return createSupabaseClient(
    supabaseUrl,
    serviceRoleKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );
}

// Create a mock client that throws helpful errors when methods are called
function createMockClient() {
  const mockAuth = {
    getSession: async () => ({ data: { session: null }, error: new Error('Supabase not configured during build time') }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
  };
  
  const mockFrom = (table: string) => ({
    select: () => mockFrom(table),
    eq: () => mockFrom(table),
    order: () => mockFrom(table),
    single: async () => ({ data: null, error: new Error('Supabase not configured during build time') }),
  });
  
  const mockRpc = async () => ({ data: null, error: new Error('Supabase not configured during build time') });
  
  return {
    auth: mockAuth,
    from: mockFrom,
    rpc: mockRpc,
  } as any;
}
