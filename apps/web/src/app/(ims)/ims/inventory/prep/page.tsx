'use client';

import React from 'react';
import { ChefHat } from 'lucide-react';
import { PrepTable } from '@/components/inventory/prep-table';

export default function PrepPage() {
  return (
    <div className="p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <header className="mb-6">
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2 bg-amber-100 dark:bg-amber-900/40 rounded-xl">
              <ChefHat className="w-6 h-6 text-amber-600 dark:text-amber-400" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">Prep Production</h1>
          </div>
          <p className="text-zinc-500 dark:text-zinc-400 max-w-2xl text-lg">
            Log and track prep item production.
          </p>
        </header>
        <section>
          <PrepTable />
        </section>
      </div>
    </div>
  );
}
