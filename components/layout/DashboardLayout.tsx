"use client";

import { Suspense } from "react";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";
import { EmailVerificationBanner } from "./EmailVerificationBanner";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Suspense fallback={<div className="w-20 lg:w-64 bg-card border-r border-border" />}>
        <Sidebar />
      </Suspense>
      <div className="flex-1 flex flex-col lg:pl-20 min-w-0">
        <div className="shrink-0 z-40">
           <EmailVerificationBanner />
           <Suspense fallback={<div className="h-16 border-b border-border" />}>
             <TopBar />
           </Suspense>
        </div>
        <main className="flex-1 overflow-y-auto scrollbar-saas relative">{children}</main>
      </div>
    </div>
  );
}
