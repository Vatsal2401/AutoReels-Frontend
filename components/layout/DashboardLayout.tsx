'use client';

import { Suspense } from 'react';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <Suspense fallback={<div className="w-64" />}>
        <Sidebar />
      </Suspense>
      <div className="flex-1 lg:pl-64">
        <Suspense fallback={<div className="h-16" />}>
          <TopBar />
        </Suspense>
        <main className="p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
