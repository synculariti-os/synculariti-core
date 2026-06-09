'use client';

import React from 'react';
import { ArrowLeftRight } from 'lucide-react';
import { TransfersTable } from '@/components/inventory/transfers-table';

export default function TransfersPage() {
  return (
    <div className="p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <header className="mb-6">
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2 bg-violet-100 dark:bg-violet-900/40 rounded-xl">
              <ArrowLeftRight className="w-6 h-6 text-violet-600 dark:text-violet-400" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">Inventory Transfers</h1>
          </div>
          <p className="text-zinc-500 dark:text-zinc-400 max-w-2xl text-lg">
            Move stock between restaurants within your franchise group.
          </p>
        </header>
        <section>
          <TransfersTable />
        </section>
      </div>
    </div>
  );
}
