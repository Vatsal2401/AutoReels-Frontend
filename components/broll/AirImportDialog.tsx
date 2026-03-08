"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  CloudDownload,
  Loader2,
  Key,
  Link2,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { brollApi, type BrollAirImport } from "@/lib/api/broll";

interface AirImportDialogProps {
  libraryId: string;
  open: boolean;
  onClose: () => void;
}

function ImportProgressView({
  libraryId,
  jobId,
}: {
  libraryId: string;
  jobId: string;
}) {
  const { data: jobs = [] } = useQuery({
    queryKey: ["broll-air-imports", libraryId],
    queryFn: () => brollApi.listImportJobs(libraryId),
    refetchInterval: (query) => {
      const job = (query.state.data ?? []).find((j) => j.id === jobId);
      if (!job) return 3000;
      return job.status === "running" ? 3000 : false;
    },
  });

  const job = jobs.find((j) => j.id === jobId);

  if (!job) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground py-4">
        <Loader2 className="w-4 h-4 animate-spin" />
        Starting import…
      </div>
    );
  }

  const total = job.totalClips;
  const done = job.importedClips + job.failedClips;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;

  return (
    <div className="space-y-4 py-2">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium">
          {job.status === "running" ? "Importing from AIR…" : statusLabel(job.status)}
        </span>
        <span className="tabular-nums text-muted-foreground">
          {job.importedClips}/{total > 0 ? total : "?"}
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-2 rounded-full bg-muted overflow-hidden">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-500",
            job.status === "failed" ? "bg-destructive" :
            job.status === "partial" ? "bg-yellow-500" :
            "bg-primary"
          )}
          style={{ width: `${pct}%` }}
        />
      </div>

      {job.failedClips > 0 && (
        <p className="text-xs text-destructive">
          {job.failedClips} clip{job.failedClips !== 1 ? "s" : ""} failed to import
        </p>
      )}
      {job.errorMessage && (
        <p className="text-xs text-destructive truncate" title={job.errorMessage}>
          {job.errorMessage}
        </p>
      )}
      {(job.status === "completed" || job.status === "partial") && (
        <p className="text-xs text-muted-foreground">
          Import complete — videos will appear in the library. Index them to enable matching.
        </p>
      )}
    </div>
  );
}

function statusLabel(status: string): string {
  switch (status) {
    case "completed": return "Import complete";
    case "partial": return "Partial import (some clips failed)";
    case "failed": return "Import failed";
    default: return status;
  }
}

export function AirImportDialog({ libraryId, open, onClose }: AirImportDialogProps) {
  const queryClient = useQueryClient();
  const [boardUrl, setBoardUrl] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [autoIndex, setAutoIndex] = useState(false);
  const [activeJobId, setActiveJobId] = useState<string | null>(null);

  const { mutate: startImport, isPending } = useMutation({
    mutationFn: () =>
      brollApi.importFromAir(libraryId, {
        boardUrl,
        airApiKey: apiKey,
        autoIndex,
      }),
    onSuccess: (job: BrollAirImport) => {
      setActiveJobId(job.id);
      toast.success("AIR import started — streaming videos to S3");
      queryClient.invalidateQueries({ queryKey: ["broll-air-imports", libraryId] });
    },
    onError: (err: Error) => {
      toast.error(err.message ?? "Failed to start AIR import");
    },
  });

  const handleClose = () => {
    if (!activeJobId) {
      setBoardUrl("");
      setApiKey("");
      setAutoIndex(false);
    }
    setActiveJobId(null);
    onClose();
    // Refresh library videos after close
    queryClient.invalidateQueries({ queryKey: ["broll-videos", libraryId] });
    queryClient.invalidateQueries({ queryKey: ["broll-library", libraryId] });
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CloudDownload className="w-5 h-5 text-primary" />
            Import from AIR
          </DialogTitle>
          <DialogDescription>
            Stream videos from an AIR board directly to your library — no download required.
          </DialogDescription>
        </DialogHeader>

        {activeJobId ? (
          <ImportProgressView libraryId={libraryId} jobId={activeJobId} />
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!boardUrl.trim() || !apiKey.trim()) return;
              startImport();
            }}
            className="space-y-4 pt-1"
          >
            {/* Board URL */}
            <div className="space-y-1.5">
              <label htmlFor="air-board-url" className="text-sm font-medium">
                Board URL
              </label>
              <div className="relative">
                <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="air-board-url"
                  type="url"
                  placeholder="https://app.air.inc/a/xxx/b/…"
                  value={boardUrl}
                  onChange={(e) => setBoardUrl(e.target.value)}
                  className="pl-9"
                  required
                />
              </div>
            </div>

            {/* API Key */}
            <div className="space-y-1.5">
              <label htmlFor="air-api-key" className="text-sm font-medium">
                AIR API Key
              </label>
              <div className="relative">
                <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="air-api-key"
                  type="password"
                  placeholder="Your AIR API key"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="pl-9"
                  required
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Found in AIR → Settings → API. Never stored after the request.
              </p>
            </div>

            {/* Auto-index toggle */}
            <div className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/30 px-3 py-2.5">
              <div>
                <p className="text-sm font-medium">Auto-index after import</p>
                <p className="text-xs text-muted-foreground">
                  Trigger CLIP embedding immediately (slower import)
                </p>
              </div>
              <button
                type="button"
                onClick={() => setAutoIndex((v) => !v)}
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label={autoIndex ? "Disable auto-index" : "Enable auto-index"}
              >
                {autoIndex ? (
                  <ToggleRight className="w-8 h-8 text-primary" />
                ) : (
                  <ToggleLeft className="w-8 h-8" />
                )}
              </button>
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <Button type="button" variant="ghost" size="sm" onClick={handleClose}>
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={isPending || !boardUrl.trim() || !apiKey.trim()}
              >
                {isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-1.5" />
                ) : (
                  <CloudDownload className="w-4 h-4 mr-1.5" />
                )}
                Start Import
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
