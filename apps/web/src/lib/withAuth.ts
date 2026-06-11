import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import { ServerLogger } from '@/lib/logger-server';
import { getErrorMessage } from '@/lib/utils';
import { SecureHandler } from './types/api';

/**
 * withAuth: Centralized API route authentication middleware.
 *
 * Wraps any API handler with:
 * 1. Session verification (rejects if no valid Supabase session)
 * 2. Tenant resolution (from session, never from client payload)
 * 3. Structured error logging via ServerLogger
 *
 * Pattern: Injects auth data into the context object to maintain Next.js App Router compliance.
 */
export function withAuth(handler: SecureHandler) {
  return async (req: Request, context: { params: Promise<Record<string, string | string[] | undefined>> }): Promise<NextResponse> => {
    console.log('[withAuth] Function called, checking build-time...');
    // Skip auth if Supabase credentials are not available (build time)
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    console.log('[withAuth] Build-time check:', { supabaseUrl: supabaseUrl ? 'SET' : 'NOT SET', supabaseKey: supabaseKey ? 'SET' : 'NOT SET' });
    if (!supabaseUrl || !supabaseKey || supabaseUrl === '' || supabaseKey === '') {
      console.log('[withAuth] Skipping auth during build time');
      return handler(req, { 
        ...context, 
        auth: { 
          tenantId: 'build-time', 
          user: { 
            id: 'build-time',
            app_metadata: {},
            user_metadata: {},
            aud: 'authenticated',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            role: 'authenticated',
            email: 'build@time.local',
            email_confirmed_at: new Date().toISOString(),
            phone: '',
            confirmed_at: new Date().toISOString(),
            last_sign_in_at: new Date().toISOString(),
            is_anonymous: false,
            identities: [],
            factors: []
          } as any 
        } 
      });
    }

    try {
      const supabase = await createClient();

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        await ServerLogger.system('WARN', 'Auth', 'Unauthenticated API request rejected', {
          url: req.url,
          method: req.method,
        });
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      // Resolve tenant from RPC — canonical, RLS-enforced, not from client
      const { data: tenantId, error: tenantErr } = await (supabase.rpc('get_my_tenant') as any) as { data: string | null; error: any };

      if (tenantErr || !tenantId) {
        await ServerLogger.system('ERROR', 'Auth', 'Tenant resolution failed in withAuth', {
          userId: session.user.id,
          error: tenantErr?.message,
        });
        return NextResponse.json({ error: 'Tenant not found' }, { status: 403 });
      }

      // Merge auth into the existing context object
      const secureContext = {
        ...context,
        auth: { tenantId, user: session.user }
      };

      return await handler(req, secureContext);
    } catch (e: unknown) {
      const msg = getErrorMessage(e);
      await ServerLogger.system('ERROR', 'API', 'Unhandled error in withAuth wrapper', { error: msg });
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
  };
}
