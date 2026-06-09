'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/use-auth-store';
import type { Session } from '@supabase/supabase-js';

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const setProfile = useAuthStore((state) => state.setProfile);
  const restaurantId = useAuthStore((state) => state.restaurantId);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        supabase.auth.signOut().catch(() => {});
        useAuthStore.getState().clearContext();
        setSession(null);
        return;
      }
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (session?.user && restaurantId) {
      const profile = {
        sub: session.user.id,
        email: session.user.email ?? '',
        fullName: session.user.user_metadata?.full_name,
      };
      setProfile(profile as any);
    }
  }, [session?.user?.id, restaurantId]);

  return <>{children}</>;
}
