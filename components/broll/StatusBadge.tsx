"use client";

import { cn } from "@/lib/utils";

const STATUS_STYLES: Record<string, string> = {
  draft: "bg-muted text-muted-foreground border-border",
  uploading: "bg-blue-500/10 text-blue-600 border-blue-500/30",
  importing: "bg-muted text-muted-foreground border-border",
  processing: "bg-yellow-500/10 text-yellow-600 border-yellow-500/30",
  indexed: "bg-green-500/10 text-green-600 border-green-500/30",
  active: "bg-green-500/10 text-green-600 border-green-500/30",
  error: "bg-destructive/10 text-destructive border-destructive/30",
  queued: "bg-muted text-muted-foreground border-border",
  completed: "bg-green-500/10 text-green-600 border-green-500/30",
  done: "bg-green-500/10 text-green-600 border-green-500/30",
  running: "bg-yellow-500/10 text-yellow-600 border-yellow-500/30",
  failed: "bg-destructive/10 text-destructive border-destructive/30",
  uploaded: "bg-blue-500/10 text-blue-600 border-blue-500/30",
};

const STATUS_DOTS: Record<string, string> = {
  draft: "bg-muted-foreground",
  uploading: "bg-blue-500 animate-pulse",
  importing: "bg-muted-foreground animate-pulse",
  processing: "bg-yellow-500 animate-pulse",
  indexed: "bg-green-500",
  active: "bg-green-500",
  error: "bg-destructive",
  queued: "bg-muted-foreground",
  completed: "bg-green-500",
  done: "bg-green-500",
  running: "bg-yellow-500 animate-pulse",
  failed: "bg-destructive",
  uploaded: "bg-blue-500",
};

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const styles = STATUS_STYLES[status] ?? "bg-muted text-muted-foreground border-border";
  const dot = STATUS_DOTS[status] ?? "bg-muted-foreground";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border",
        styles,
        className
      )}
    >
      <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", dot)} />
      {status === "importing" ? "Importing…" : status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}
