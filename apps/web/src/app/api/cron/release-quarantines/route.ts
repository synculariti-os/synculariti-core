import { NextRequest, NextResponse } from 'next/server';
import { createServiceRoleClient } from '@synculariti/shared-supabase';
import { timingSafeEqual } from '@/lib/utils';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const secret = request.headers.get('x-cron-secret');
  if (!secret || !timingSafeEqual(secret, process.env.CRON_SECRET || '')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const supabase = createServiceRoleClient();

    const { data, error } = await supabase.rpc('release_expired_quarantines_v1');
    if (error) throw error;

    return NextResponse.json({ released: data });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'RPC failed';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
