"use client";

import { use } from "react";
import { useQuery } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { JobProgress } from "@/components/clip-extractor/JobProgress";
import { ClipGallery } from "@/components/clip-extractor/ClipGallery";
import { clipExtractorApi } from "@/lib/api/clip-extractor";
import { ArrowLeft, Scissors, Clock, Trash2, Loader2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

// ─────────────────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────────────────

export default function ClipExtractorJobPage({
  params,
}: {
  params: Promise<{ jobId: string }>;
}) {
  const { jobId } = use(params);
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  const { data: job, isLoading } = useQuery({
    queryKey: ["clip-extract-job", jobId],
    queryFn: () => clipExtractorApi.getJob(jobId),
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      if (!status) return 3000;
      return ["completed", "failed"].includes(status) ? false : 3000;
    },
    staleTime: 0,
  });

  const handleDelete = async () => {
    if (!confirm("Delete this job? Credits will be refunded for pending jobs.")) return;
    setDeleting(true);
    try {
      await clipExtractorApi.deleteJob(jobId);
      toast.success("Job deleted");
      router.push("/studio/clip-extractor");
    } catch {
      toast.error("Failed to delete job");
    } finally {
      setDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>
    );
  }

  if (!job) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center gap-4 py-24 text-center">
          <Scissors className="h-10 w-10 text-muted-foreground" />
          <p className="text-muted-foreground">Job not found</p>
          <Link href="/studio/clip-extractor">
            <Button variant="outline" size="sm">Back to Clip Extractor</Button>
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  const isActive = !["completed", "failed", "rate_limited"].includes(job.status);
  const readyClips = job.clips.filter((c) => c.renderStatus === "done");

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-5xl space-y-8 py-6 px-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1 min-w-0">
            <Link
              href="/studio/clip-extractor"
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-3 w-3" />
              Clip Extractor
            </Link>
            <h1 className="truncate text-xl font-bold">
              {job.videoTitle ?? "Extracting clips..."}
            </h1>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {new Date(job.createdAt).toLocaleString()}
              </span>
              {job.sourceVideoDurationSec && (
                <span>{formatDuration(job.sourceVideoDurationSec)} source video</span>
              )}
            </div>
          </div>

          <Button
            variant="ghost"
            size="sm"
            className="shrink-0 text-muted-foreground hover:text-destructive"
            onClick={handleDelete}
            disabled={deleting || isActive}
            title={isActive ? "Cannot delete an active job" : "Delete job"}
          >
            {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
          </Button>
        </div>

        {/* Progress */}
        {job.status !== "completed" && (
          <div className="rounded-2xl border bg-card p-6">
            <h2 className="mb-4 text-sm font-semibold">Progress</h2>
            <JobProgress
              status={job.status}
              progressPct={job.progressPct}
              currentStage={job.currentStage}
              errorMessage={job.errorMessage}
            />
          </div>
        )}

        {/* Completed summary */}
        {job.status === "completed" && (
          <div className="rounded-2xl border border-green-500/30 bg-green-500/5 p-4">
            <p className="text-sm font-semibold text-green-700 dark:text-green-400">
              {readyClips.length} viral clip{readyClips.length !== 1 ? "s" : ""} extracted successfully
            </p>
          </div>
        )}

        {/* Clip gallery — shows clips as they trickle in during rendering */}
        <ClipGallery
          clips={job.clips}
          jobId={jobId}
          isLoading={isActive && job.clips.length === 0}
        />
      </div>
    </DashboardLayout>
  );
}

function formatDuration(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}m ${s}s`;
}
