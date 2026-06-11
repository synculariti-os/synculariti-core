import { cookies } from 'next/headers';
import { createServerSupabaseClient as createSharedServerClient } from '@synculariti/shared-supabase';

export async function createServerSupabaseClient() {
  const cookieStore = await cookies();
  return createSharedServerClient(cookieStore);
}
