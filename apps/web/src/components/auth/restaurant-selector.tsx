'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api-client';
import { useAuthStore, loadAuthProfile } from '@/store/use-auth-store';
import { supabase } from '@/lib/supabase';
import { Loader2, Store } from 'lucide-react';
import type { Restaurant } from '@synculariti/types';

export function RestaurantSelector() {
  const router = useRouter();
  const setContext = useAuthStore((state) => state.setContext);
  
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selecting, setSelecting] = useState<string | null>(null);

  useEffect(() => {
    async function loadRestaurants() {
      try {
        const { data } = await apiClient<{ data: Restaurant[] }>('/tenant/context');
        setRestaurants(data);

        // Auto-select if there is exactly 1 restaurant
        if (data.length === 1) {
          await handleSelect(data[0]);
        }
      } catch (err: any) {
        const msg = err.message || '';
        // If token is invalid/expired, sign out and reload to show login form
        if (msg.includes('Invalid or expired token') || msg.includes('401') || msg.includes('Unauthorized')) {
          await supabase.auth.signOut();
          window.location.reload();
          return;
        }
        setError(msg || 'Failed to load restaurants');
      } finally {
        if (restaurants.length !== 1) {
          setLoading(false);
        }
      }
    }

    loadRestaurants();
  }, []);

  const handleSelect = async (restaurant: Restaurant) => {
    setSelecting(restaurant.id);
    try {
      // First, set the context in global state (Zustand)
      setContext(restaurant.id, restaurant.franchiseGroupId, restaurant.name);
      
      // Optionally validate selection with backend
      await apiClient('/auth/select-restaurant', { method: 'POST', body: { restaurantId: restaurant.id } });
      
      // Load user profile + permissions
      const profile = await loadAuthProfile();
      
      // Redirect based on permissions
      const perms = profile?.permissions || [];
      if (perms.includes('ADMIN.TENANTS') || perms.includes('ADMIN.ROLES')) {
        router.push('/admin/franchise-groups');
      } else if (perms.includes('SALES.IMPORT')) {
        router.push('/sales/import');
      } else if (perms.includes('INVENTORY.READ')) {
        router.push('/inventory');
      } else if (perms.includes('RECIPE.READ')) {
        router.push('/recipes');
      } else {
        router.push('/sales/import');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to select restaurant');
      setSelecting(null);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-8 space-y-4 text-zinc-500">
        <Loader2 className="w-8 h-8 animate-spin" />
        <p className="text-sm font-medium">Loading your access...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 dark:bg-red-900/30 rounded-xl border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400">
        <p className="font-medium text-center">{error}</p>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h2 className="text-xl font-bold text-center text-zinc-900 dark:text-white mb-2">
        Select a Restaurant
      </h2>
      <p className="text-center text-sm text-zinc-500 dark:text-zinc-400 mb-6">
        Choose the location you want to manage.
      </p>

      <div className="grid gap-3">
        {restaurants.map((restaurant) => (
          <button
            key={restaurant.id}
            onClick={() => handleSelect(restaurant)}
            disabled={selecting !== null}
            className={`flex items-center gap-4 p-4 rounded-xl border transition-all duration-200 ${
              selecting === restaurant.id 
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-blue-300 hover:shadow-md cursor-pointer'
            }`}
          >
            <div className={`p-2 rounded-lg ${selecting === restaurant.id ? 'bg-blue-100 text-blue-600 dark:bg-blue-800 dark:text-blue-300' : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400'}`}>
              {selecting === restaurant.id ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Store className="w-5 h-5" />
              )}
            </div>
            <div className="flex-1 text-left">
              <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">
                {restaurant.name}
              </h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                {restaurant.timezone}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
