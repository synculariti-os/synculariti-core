'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/use-auth-store';
import type { Session } from '@supabase/supabase-js';

interface TenantInfo {
  tenantId: string | null;
  tenantName: string | null;
  tenantType: 'ims' | 'et' | null;
}

interface UnifiedSessionContextType extends TenantInfo {
  session: Session | null;
  isLoading: boolean;
  setTenant: (tenantId: string, tenantName: string, tenantType: 'ims' | 'et') => void;
  clearTenant: () => void;
}

const UnifiedSessionContext = createContext<UnifiedSessionContextType | undefined>(undefined);

export function UnifiedSessionProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [tenant, setTenantState] = useState<TenantInfo>({
    tenantId: null,
    tenantName: null,
    tenantType: null,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Only access Supabase on the client side
    if (typeof window === 'undefined') {
      setIsLoading(false);
      return;
    }

    // Only access Supabase if environment variables are available
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      setIsLoading(false);
      return;
    }

    // Use dynamic import to prevent build-time analysis
    const initializeAuth = async () => {
      try {
        const { supabase } = await import('@/lib/supabase');
        
        supabase.auth.getSession().then(({ data: { session } }) => {
          setSession(session);
          setIsLoading(false);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
          setSession(session);
          setTenantState({ tenantId: null, tenantName: null, tenantType: null });
          useAuthStore.getState().clearContext();
          setIsLoading(false);
        });

        return () => subscription.unsubscribe();
      } catch (error) {
        console.warn('Failed to initialize auth:', error);
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const setTenant = useCallback((tenantId: string, tenantName: string, tenantType: 'ims' | 'et') => {
    setTenantState({ tenantId, tenantName, tenantType });
  }, []);

  const clearTenant = useCallback(() => {
    setTenantState({ tenantId: null, tenantName: null, tenantType: null });
    useAuthStore.getState().clearContext();
  }, []);

  return (
    <UnifiedSessionContext.Provider
      value={{
        session,
        isLoading,
        ...tenant,
        setTenant,
        clearTenant,
      }}
    >
      {children}
    </UnifiedSessionContext.Provider>
  );
}

export function useUnifiedSession() {
  const ctx = useContext(UnifiedSessionContext);
  if (!ctx) throw new Error('useUnifiedSession must be used within UnifiedSessionProvider');
  return ctx;
}
