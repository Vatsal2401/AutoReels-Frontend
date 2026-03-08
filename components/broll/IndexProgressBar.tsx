"use client";

import { cn } from "@/lib/utils";

interface IndexProgressBarProps {
  framesProcessed: number;
  totalFrames: number | null;
  stage: string | null;
}

export function IndexProgressBar({ framesProcessed, totalFrames, stage }: IndexProgressBarProps) {
  const pct = totalFrames && totalFrames > 0 ? Math.round((framesProcessed / totalFrames) * 100) : null;

  return (
    <div className="space-y-1 min-w-0">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span className="capitalize">{stage ?? "Processing"}…</span>
        {pct != null && <span className="tabular-nums">{pct}%</span>}
      </div>
      <div className="h-1 bg-muted rounded-full overflow-hidden">
        <div
          className={cn(
            "h-full rounded-full transition-all",
            pct != null ? "bg-primary" : "bg-primary animate-pulse w-full"
          )}
          style={{ width: pct != null ? `${pct}%` : "100%" }}
        />
      </div>
      {totalFrames != null && (
        <p className="text-xs text-muted-foreground tabular-nums">
          {framesProcessed}/{totalFrames} frames
        </p>
      )}
    </div>
  );
}
