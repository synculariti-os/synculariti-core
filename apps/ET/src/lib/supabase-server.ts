import { cookies } from 'next/headers';
import { createServerSupabaseClient as createSharedServerClient, createServiceRoleClient } from '@synculariti/shared-supabase';

export async function createClient() {
  const cookieStore = await cookies();
  return createSharedServerClient(cookieStore);
}

export const createServiceClient = createServiceRoleClient;
