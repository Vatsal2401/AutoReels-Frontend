"use client";

import { Suspense, useState } from "react";
import { Sidebar } from "./Sidebar";
import { EmailVerificationBanner } from "./EmailVerificationBanner";
import { TooltipProvider } from "@/components/ui/tooltip";

export function BrollLayout({ children }: { children: React.ReactNode }) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <TooltipProvider delayDuration={400}>
    <div className="flex h-screen overflow-hidden bg-background">
      <Suspense fallback={<div className="hidden lg:block w-20 bg-card border-r border-border" />}>
        <Sidebar isOpen={isMobileOpen} onClose={() => setIsMobileOpen(false)} />
      </Suspense>
      <div className="flex-1 flex flex-col lg:pl-20 min-w-0 transition-all duration-300 overflow-hidden">
        <EmailVerificationBanner />
        <main className="flex-1 overflow-hidden flex flex-col min-h-0">{children}</main>
      </div>
    </div>
    </TooltipProvider>
  );
}
