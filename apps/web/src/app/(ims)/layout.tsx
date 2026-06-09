'use client';

import { TanstackQueryProvider } from '@/providers/tanstack-query-provider';
import { AppShell } from '@/components/ui/app-shell';
import { SessionProvider } from '@/providers/session-provider';

export default function IMSLayout({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <TanstackQueryProvider>
        <AppShell>{children}</AppShell>
      </TanstackQueryProvider>
    </SessionProvider>
  );
}
