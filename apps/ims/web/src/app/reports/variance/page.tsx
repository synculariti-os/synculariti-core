'use client';

import React from 'react';
import { BarChart3 } from 'lucide-react';
import { VarianceTable } from '@/components/reports/variance-table';

export default function VariancePage() {
  return (
    <div className="p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <header className="mb-6">
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2 bg-indigo-100 dark:bg-indigo-900/40 rounded-xl">
              <BarChart3 className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">Variance Analysis</h1>
          </div>
          <p className="text-zinc-500 dark:text-zinc-400 max-w-2xl text-lg">Compare actual usage against theoretical consumption to identify unexplained variance.</p>
        </header>
        <section><VarianceTable /></section>
      </div>
    </div>
  );
}
