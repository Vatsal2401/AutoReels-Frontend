"use client";

import { cn } from "@/lib/utils/format";
import { ReactNode } from "react";

interface ReelGridProps {
  children: ReactNode;
  className?: string;
}

export function ReelGrid({ children, className }: ReelGridProps) {
  return (
    <div
      className={cn(
        "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4",
        className
      )}
    >
      {children}
    </div>
  );
}
