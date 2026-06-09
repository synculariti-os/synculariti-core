'use client';

import React from 'react';
import { Building2 } from 'lucide-react';
import { VendorsTable } from '@/components/procurement/vendors-table';

export default function VendorsPage() {
  return (
    <div className="p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <header className="mb-6">
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2 bg-violet-100 dark:bg-violet-900/40 rounded-xl">
              <Building2 className="w-6 h-6 text-violet-600 dark:text-violet-400" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">Vendors</h1>
          </div>
          <p className="text-zinc-500 dark:text-zinc-400 max-w-2xl text-lg">Manage your suppliers and their contact information.</p>
        </header>
        <section><VendorsTable /></section>
      </div>
    </div>
  );
}
