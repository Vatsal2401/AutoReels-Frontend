"use client";

import { cn } from "@/lib/utils/format";
import type { ClipExtractStatus } from "@/lib/api/clip-extractor";
import { Download, Mic, Zap, Scissors, Film, CheckCircle, XCircle, Clock } from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
// Stage config
// ─────────────────────────────────────────────────────────────────────────────

const STAGES: {
  status: ClipExtractStatus;
  label: string;
  description: string;
  icon: React.ElementType;
  progressRange: [number, number]; // pct
}[] = [
  { status: "downloading", label: "Download", description: "Fetching video", icon: Download, progressRange: [0, 20] },
  { status: "transcribing", label: "Transcribe", description: "Extracting speech", icon: Mic, progressRange: [20, 45] },
  { status: "analyzing", label: "Analyze", description: "Finding viral moments", icon: Zap, progressRange: [45, 55] },
  { status: "clipping", label: "Clip", description: "Cutting segments", icon: Scissors, progressRange: [55, 70] },
  { status: "rendering", label: "Render", description: "Adding captions", icon: Film, progressRange: [70, 95] },
  { status: "completed", label: "Done", description: "Clips ready", icon: CheckCircle, progressRange: [95, 100] },
];

const STATUS_ORDER: Record<ClipExtractStatus, number> = {
  pending: -1,
  downloading: 0,
  transcribing: 1,
  analyzing: 2,
  clipping: 3,
  rendering: 4,
  completed: 5,
  failed: -1,
  rate_limited: -1,
};

// ─────────────────────────────────────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────────────────────────────────────

interface JobProgressProps {
  status: ClipExtractStatus;
  progressPct: number;
  currentStage: string | null;
  errorMessage: string | null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export function JobProgress({ status, progressPct, currentStage, errorMessage }: JobProgressProps) {
  const currentStageIdx = STATUS_ORDER[status] ?? -1;
  const isFailed = status === "failed";
  const isRateLimited = status === "rate_limited";

  if (isFailed) {
    return (
      <div className="rounded-xl border border-destructive/50 bg-destructive/5 p-6 space-y-3">
        <div className="flex items-center gap-3 text-destructive">
          <XCircle className="h-5 w-5 shrink-0" />
          <p className="font-semibold">Extraction failed</p>
        </div>
        {errorMessage && (
          <p className="text-sm text-muted-foreground">{errorMessage}</p>
        )}
        <p className="text-xs text-muted-foreground">Credits have been refunded to your account.</p>
      </div>
    );
  }

  if (isRateLimited) {
    return (
      <div className="rounded-xl border border-yellow-500/50 bg-yellow-500/5 p-6 space-y-2">
        <div className="flex items-center gap-3 text-yellow-600">
          <Clock className="h-5 w-5 shrink-0" />
          <p className="font-semibold">Rate limited — waiting to retry</p>
        </div>
        <p className="text-sm text-muted-foreground">
          YouTube is temporarily rate limiting requests. Your job will automatically retry in a few minutes.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Stage timeline */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1">
        {STAGES.map((stage, i) => {
          const stageIdx = i; // index in STAGES matches STATUS_ORDER for active stages
          const isDone = status === "completed" || stageIdx < currentStageIdx;
          const isActive = stageIdx === currentStageIdx;
          const isPending = stageIdx > currentStageIdx;
          const Icon = stage.icon;

          return (
            <div key={stage.status} className="flex items-center shrink-0">
              <div className="flex flex-col items-center gap-1 min-w-[60px]">
                <div
                  className={cn(
                    "h-8 w-8 rounded-full flex items-center justify-center transition-all",
                    isDone && "bg-primary text-primary-foreground",
                    isActive && "bg-primary/20 text-primary ring-2 ring-primary",
                    isPending && "bg-muted text-muted-foreground",
                  )}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <span
                  className={cn(
                    "text-[10px] font-medium text-center",
                    (isDone || isActive) ? "text-foreground" : "text-muted-foreground",
                  )}
                >
                  {stage.label}
                </span>
              </div>

              {i < STAGES.length - 1 && (
                <div
                  className={cn(
                    "h-0.5 w-6 mx-0.5 rounded transition-all",
                    stageIdx < currentStageIdx ? "bg-primary" : "bg-muted",
                  )}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Progress bar */}
      <div className="space-y-1.5">
        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-all duration-500"
            style={{ width: `${progressPct}%` }}
          />
        </div>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{currentStage ?? "Processing..."}</span>
          <span>{progressPct}%</span>
        </div>
      </div>
    </div>
  );
}
