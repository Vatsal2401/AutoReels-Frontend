"use client";

import { useUserSettings } from "@/lib/hooks/useUserSettings";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ClipExtractorStudio } from "@/components/clip-extractor/ClipExtractorStudio";
import { Scissors, Sparkles, Zap, Captions, ChevronRight, Loader2 } from "lucide-react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { clipExtractorApi } from "@/lib/api/clip-extractor";
import { cn } from "@/lib/utils/format";

const FEATURES = [
  { icon: Sparkles, label: "AI Virality Score", desc: "Every clip scored 0–100" },
  { icon: Captions, label: "Word Captions", desc: "CapCut-style highlights" },
  { icon: Zap, label: "9:16 Ready", desc: "Auto-converted for Shorts" },
];

export default function ClipExtractorPage() {
  const { clipExtractorEnabled, isLoading: settingsLoading } = useUserSettings();

  const { data: jobsData } = useQuery({
    queryKey: ["clip-extract-jobs"],
    queryFn: () => clipExtractorApi.listJobs(1, 5),
    enabled: clipExtractorEnabled,
    staleTime: 30_000,
  });

  if (settingsLoading) {
    return (
      <DashboardLayout>
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>
    );
  }

  if (!clipExtractorEnabled) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
            <Scissors className="h-8 w-8 text-muted-foreground" />
          </div>
          <h1 className="text-2xl font-bold">Clip Extractor</h1>
          <p className="max-w-sm text-muted-foreground text-sm">This feature is not enabled for your account.</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-3xl space-y-8 py-6 px-4">

        {/* Hero header */}
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
              <Scissors className="h-5 w-5 text-primary" />
            </div>
            <h1 className="text-2xl font-bold">Clip Extractor</h1>
          </div>
          <p className="text-sm text-muted-foreground pl-11">
            Paste a YouTube or TikTok URL — AI finds viral moments, adds captions, outputs 9:16 clips.
          </p>
        </div>

        {/* Feature pills */}
        <div className="flex flex-wrap gap-2">
          {FEATURES.map((f) => {
            const Icon = f.icon;
            return (
              <div key={f.label} className="flex items-center gap-1.5 rounded-full border bg-card px-3 py-1.5 text-xs">
                <Icon className="h-3 w-3 text-primary" />
                <span className="font-medium">{f.label}</span>
                <span className="text-muted-foreground">· {f.desc}</span>
              </div>
            );
          })}
        </div>

        {/* Form */}
        <div className="rounded-2xl border bg-card p-6">
          <ClipExtractorStudio />
        </div>

        {/* Recent jobs */}
        {jobsData && jobsData.items.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Recent</h2>
            <div className="overflow-hidden rounded-2xl border">
              {jobsData.items.map((job, i) => (
                <Link
                  key={job.id}
                  href={`/studio/clip-extractor/${job.id}`}
                  className={cn(
                    "flex items-center justify-between px-4 py-3 hover:bg-muted/40 transition-colors",
                    i !== 0 && "border-t"
                  )}
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {job.videoTitle ?? "Processing..."}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(job.createdAt).toLocaleDateString()} · {job.clipsCount} clip{job.clipsCount !== 1 ? "s" : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 ml-3 shrink-0">
                    <StatusPill status={job.status} />
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

function StatusPill({ status }: { status: string }) {
  const map: Record<string, { label: string; className: string }> = {
    completed: { label: "Done", className: "bg-green-500/10 text-green-600 dark:text-green-400" },
    failed: { label: "Failed", className: "bg-destructive/10 text-destructive" },
    rate_limited: { label: "Waiting", className: "bg-yellow-500/10 text-yellow-600" },
    pending: { label: "Queued", className: "bg-muted text-muted-foreground" },
  };
  const entry = map[status] ?? { label: "Running", className: "bg-primary/10 text-primary" };
  return (
    <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-semibold", entry.className)}>
      {entry.label}
    </span>
  );
}
