"use client";

import { cn } from "@/lib/utils/format";

interface ReelSkeletonProps {
  count?: number;
  className?: string;
}

export function ReelSkeleton({ count = 8, className }: ReelSkeletonProps) {
  return (
    <div
      className={cn(
        "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4",
        className
      )}
    >
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex flex-col animate-pulse">
          <div className="aspect-[9/16] rounded-lg bg-muted/60" />
          <div className="mt-3 h-4 w-3/4 rounded bg-muted/60" />
          <div className="mt-2 h-3 w-1/2 rounded bg-muted/40" />
        </div>
      ))}
    </div>
  );
}
