'use client';

import React from 'react';
import { Camera } from 'lucide-react';
import { SnapshotsTable } from '@/components/reports/snapshots-table';

export default function SnapshotsPage() {
  return (
    <div className="p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <header className="mb-6">
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2 bg-cyan-100 dark:bg-cyan-900/40 rounded-xl">
              <Camera className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">Daily Snapshots</h1>
          </div>
          <p className="text-zinc-500 dark:text-zinc-400 max-w-2xl text-lg">End-of-day inventory snapshots with FIFO valuation.</p>
        </header>
        <section><SnapshotsTable /></section>
      </div>
    </div>
  );
}
