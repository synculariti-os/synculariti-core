import { cookies } from 'next/headers';
import { createServerSupabaseClient as createSharedServerClient, createServiceRoleClient } from '@synculariti/shared-supabase';
export { createServiceRoleClient };

export async function createServerSupabaseClient() {
  const cookieStore = await cookies();
  return createSharedServerClient(cookieStore);
}

// Alias for backward compat
export const createClient = createServerSupabaseClient;
export const createServiceClient = createServiceRoleClient;
