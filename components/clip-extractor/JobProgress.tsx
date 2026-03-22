"use client";

import { cn } from "@/lib/utils/format";
import type { ClipExtractStatus } from "@/lib/api/clip-extractor";
import { Download, Mic, Zap, Scissors, Film, CheckCircle2, XCircle, Clock, Loader2 } from "lucide-react";

const STAGES: {
  statuses: ClipExtractStatus[];
  label: string;
  icon: React.ElementType;
}[] = [
  { statuses: ["downloading"], label: "Download", icon: Download },
  { statuses: ["transcribing"], label: "Transcribe", icon: Mic },
  { statuses: ["analyzing"], label: "Analyze", icon: Zap },
  { statuses: ["clipping"], label: "Clip", icon: Scissors },
  { statuses: ["rendering"], label: "Render", icon: Film },
  { statuses: ["completed"], label: "Done", icon: CheckCircle2 },
];

const STATUS_IDX: Partial<Record<ClipExtractStatus, number>> = {
  pending: 0,
  downloading: 0,
  transcribing: 1,
  analyzing: 2,
  clipping: 3,
  rendering: 4,
  completed: 5,
};

interface JobProgressProps {
  status: ClipExtractStatus;
  progressPct: number;
  currentStage: string | null;
  errorMessage: string | null;
}

export function JobProgress({ status, progressPct, currentStage, errorMessage }: JobProgressProps) {
  if (status === "failed") {
    return (
      <div className="rounded-2xl border border-destructive/40 bg-destructive/5 p-6 space-y-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10">
            <XCircle className="h-5 w-5 text-destructive" />
          </div>
          <div>
            <p className="font-semibold text-destructive">Extraction failed</p>
            <p className="text-xs text-muted-foreground">Credits have been refunded</p>
          </div>
        </div>
        {errorMessage && (
          <p className="rounded-lg bg-muted/50 px-3 py-2 text-xs text-muted-foreground font-mono">{errorMessage}</p>
        )}
      </div>
    );
  }

  if (status === "rate_limited") {
    return (
      <div className="rounded-2xl border border-yellow-500/40 bg-yellow-500/5 p-6 space-y-2">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-500/10">
            <Clock className="h-5 w-5 text-yellow-600" />
          </div>
          <div>
            <p className="font-semibold text-yellow-700 dark:text-yellow-400">Rate limited</p>
            <p className="text-xs text-muted-foreground">YouTube is throttling — will retry automatically</p>
          </div>
        </div>
      </div>
    );
  }

  const currentIdx = STATUS_IDX[status] ?? 0;

  return (
    <div className="space-y-5">
      {/* Stage steps */}
      <div className="flex items-center">
        {STAGES.map((stage, i) => {
          const isDone = status === "completed" || i < currentIdx;
          const isActive = i === currentIdx && status !== "completed";
          const isPending = i > currentIdx;
          const Icon = stage.icon;

          return (
            <div key={i} className="flex flex-1 items-center">
              <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
                <div className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-full border-2 transition-all duration-300",
                  isDone && "border-primary bg-primary text-primary-foreground",
                  isActive && "border-primary bg-primary/10 text-primary",
                  isPending && "border-border bg-background text-muted-foreground"
                )}>
                  {isActive ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Icon className="h-4 w-4" />
                  )}
                </div>
                <span className={cn(
                  "text-[10px] font-medium whitespace-nowrap",
                  (isDone || isActive) ? "text-foreground" : "text-muted-foreground"
                )}>
                  {stage.label}
                </span>
              </div>
              {i < STAGES.length - 1 && (
                <div className={cn(
                  "h-0.5 flex-1 mx-1 mb-5 rounded transition-colors duration-500",
                  i < currentIdx ? "bg-primary" : "bg-border"
                )} />
              )}
            </div>
          );
        })}
      </div>

      {/* Progress bar + label */}
      <div className="space-y-2">
        <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-all duration-700 ease-out"
            style={{ width: `${Math.max(progressPct, 2)}%` }}
          />
        </div>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{currentStage ?? "Initializing..."}</span>
          <span className="font-semibold text-primary">{progressPct}%</span>
        </div>
      </div>
    </div>
  );
}
