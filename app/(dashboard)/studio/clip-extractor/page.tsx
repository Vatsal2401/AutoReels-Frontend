"use client";

import { useUserSettings } from "@/lib/hooks/useUserSettings";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ClipExtractorStudio } from "@/components/clip-extractor/ClipExtractorStudio";
import { Scissors } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { clipExtractorApi } from "@/lib/api/clip-extractor";
import { cn } from "@/lib/utils/format";

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
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
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
          <p className="max-w-sm text-muted-foreground">
            Extract viral-ready clips from long videos with AI-powered virality scoring and animated captions.
          </p>
          <p className="text-sm text-muted-foreground">This feature is not enabled for your account.</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-4xl space-y-8 py-6 px-4">
        {/* Header */}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Scissors className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold">Clip Extractor</h1>
          </div>
          <p className="text-muted-foreground">
            Paste a YouTube or TikTok URL — AI finds the viral moments, adds animated captions, and delivers ready-to-post clips.
          </p>
        </div>

        {/* Recent jobs */}
        {jobsData && jobsData.items.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Recent Jobs</h2>
            </div>
            <div className="space-y-2">
              {jobsData.items.map((job) => (
                <Link
                  key={job.id}
                  href={`/studio/clip-extractor/${job.id}`}
                  className="flex items-center justify-between rounded-xl border bg-card px-4 py-3 hover:bg-accent/50 transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {job.videoTitle ?? "Processing..."}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(job.createdAt).toLocaleDateString()} · {job.clipsCount} clip{job.clipsCount !== 1 ? "s" : ""}
                    </p>
                  </div>
                  <StatusPill status={job.status} />
                </Link>
              ))}
            </div>
            {jobsData.total > 5 && (
              <div className="text-center">
                <Link href="/studio/clip-extractor/history" className="text-xs text-primary hover:underline">
                  View all {jobsData.total} jobs
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Main form */}
        <div className="rounded-2xl border bg-card p-6">
          <h2 className="mb-6 text-lg font-semibold">New Extraction</h2>
          <ClipExtractorStudio />
        </div>
      </div>
    </DashboardLayout>
  );
}

function StatusPill({ status }: { status: string }) {
  const map: Record<string, { label: string; className: string }> = {
    completed: { label: "Done", className: "bg-green-500/10 text-green-600" },
    failed: { label: "Failed", className: "bg-destructive/10 text-destructive" },
    rate_limited: { label: "Waiting", className: "bg-yellow-500/10 text-yellow-600" },
    pending: { label: "Pending", className: "bg-muted text-muted-foreground" },
  };
  const entry = map[status] ?? { label: "Processing", className: "bg-primary/10 text-primary" };
  return (
    <span className={cn("ml-3 shrink-0 rounded-full px-2 py-0.5 text-xs font-medium", entry.className)}>
      {entry.label}
    </span>
  );
}
