'use client';

import React from 'react';
import { ClipboardCheck } from 'lucide-react';
import { CountsTable } from '@/components/inventory/counts-table';

export default function CountsPage() {
  return (
    <div className="p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <header className="mb-6">
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2 bg-emerald-100 dark:bg-emerald-900/40 rounded-xl">
              <ClipboardCheck className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">Inventory Counts</h1>
          </div>
          <p className="text-zinc-500 dark:text-zinc-400 max-w-2xl text-lg">
            Perform and reconcile physical inventory counts.
          </p>
        </header>
        <section>
          <CountsTable />
        </section>
      </div>
    </div>
  );
}
