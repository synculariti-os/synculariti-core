'use client';

import { TenantProvider } from '@/context/TenantContext';
import { IdentityGateWrapper } from '@/modules/identity/IdentityGateWrapper';
import { NavBar } from '@/components/NavBar';
import { MobileBottomNav } from '@/components/MobileBottomNav';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { PWAInstallPrompt } from '@/components/PWAInstallPrompt';

export default function ETLayout({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary module="App">
      <TenantProvider>
        <IdentityGateWrapper>
          <NavBar />
          <div className="app-container">
            <ErrorBoundary module="Finance">
              {children}
            </ErrorBoundary>
          </div>
          <MobileBottomNav />
          <PWAInstallPrompt />
        </IdentityGateWrapper>
      </TenantProvider>
    </ErrorBoundary>
  );
}
