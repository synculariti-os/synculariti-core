'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/use-auth-store';
import { useSidebarStore } from '@/store/use-sidebar-store';
import { useHasHydrated } from '@/hooks/use-has-hydrated';
import { Store, LogOut, Menu } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const isHydrated = useHasHydrated();
  const { restaurantId, restaurantName, userEmail, userFullName, clearContext } = useAuthStore();
  const { toggleMobile } = useSidebarStore();

  // Don't render navbar on login page
  if (pathname === '/login') return null;
  if (!isHydrated) return <header className="fixed top-0 left-0 right-0 lg:left-60 z-20 h-16 bg-white dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800" />;

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    clearContext();
    router.push('/login');
  };

  return (
    <header className="fixed top-0 left-0 right-0 lg:left-60 z-20 h-16 bg-white dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between px-4 lg:px-6">
      {/* Hamburger + breadcrumb */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={toggleMobile}
          className="lg:hidden p-1.5 rounded-md text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          aria-label="Toggle sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="text-sm text-zinc-500 dark:text-zinc-400 truncate">
          {pathname}
        </div>
      </div>

      {/* Right side: restaurant + user + sign out */}
      <div className="flex items-center gap-4">
        {restaurantId && (
          <div className="hidden sm:flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-3 py-1.5 rounded-lg">
            <Store className="w-4 h-4" />
            <span className="font-medium">{restaurantName || restaurantId.slice(0, 8)}</span>
          </div>
        )}
        <div className="text-sm text-zinc-700 dark:text-zinc-300 font-medium">
          {userFullName || userEmail || 'User'}
        </div>
        <button
          onClick={handleSignOut}
          className="flex items-center gap-1.5 text-sm text-zinc-500 hover:text-red-600 transition-colors px-2 py-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">Sign Out</span>
        </button>
      </div>
    </header>
  );
}
