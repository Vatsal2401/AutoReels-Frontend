"use client";

import { useState, useRef } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  CloudDownload,
  Loader2,
  Link2,
  ToggleLeft,
  ToggleRight,
  Film,
  ChevronLeft,
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
import {
  brollApi,
  type BrollAirImport,
  type AirBrowseResult,
  type AirClipPreview,
} from "@/lib/api/broll";

// ─── Types ────────────────────────────────────────────────────────────────────

type Step = "connect" | "browse" | "importing";

interface AirImportDialogProps {
  libraryId: string;
  open: boolean;
  onClose: () => void;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDuration(s?: number): string {
  if (!s) return "";
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

function formatBytes(b?: number): string {
  if (!b) return "";
  if (b < 1024 * 1024) return `${Math.round(b / 1024)}KB`;
  return `${(b / (1024 * 1024)).toFixed(1)}MB`;
}

// ─── ImportProgressView ───────────────────────────────────────────────────────

function statusLabel(status: string): string {
  switch (status) {
    case "completed":
      return "Import complete";
    case "partial":
      return "Partial import (some clips failed)";
    case "failed":
      return "Import failed";
    default:
      return status;
  }
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
          {job.status === "running"
            ? "Importing from AIR…"
            : statusLabel(job.status)}
        </span>
        <span className="tabular-nums text-muted-foreground">
          {job.importedClips}/{total > 0 ? total : "?"}
        </span>
      </div>

      <div className="h-2 rounded-full bg-muted overflow-hidden">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-500",
            job.status === "failed"
              ? "bg-destructive"
              : job.status === "partial"
                ? "bg-yellow-500"
                : "bg-primary"
          )}
          style={{ width: `${pct}%` }}
        />
      </div>

      {job.failedClips > 0 && (
        <p className="text-xs text-destructive">
          {job.failedClips} clip{job.failedClips !== 1 ? "s" : ""} failed to
          import
        </p>
      )}
      {job.errorMessage && (
        <p
          className="text-xs text-destructive truncate"
          title={job.errorMessage}
        >
          {job.errorMessage}
        </p>
      )}
      {(job.status === "completed" || job.status === "partial") && (
        <p className="text-xs text-muted-foreground">
          Import complete — videos will appear in the library. Index them to
          enable matching.
        </p>
      )}
    </div>
  );
}

// ─── ClipCard ─────────────────────────────────────────────────────────────────

function ClipCard({
  clip,
  selected,
  onToggle,
}: {
  clip: AirClipPreview;
  selected: boolean;
  onToggle: () => void;
}) {
  const meta = [formatDuration(clip.duration), formatBytes(clip.size)]
    .filter(Boolean)
    .join(" · ");

  return (
    <button
      type="button"
      onClick={onToggle}
      className={cn(
        "relative rounded-lg border text-left overflow-hidden transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        selected
          ? "border-primary ring-1 ring-primary"
          : "border-border/60 hover:border-border"
      )}
    >
      {/* Thumbnail */}
      <div className="aspect-video bg-muted flex items-center justify-center">
        {clip.thumbnailUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={clip.thumbnailUrl}
            alt={clip.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <Film className="w-8 h-8 text-muted-foreground/40" />
        )}
      </div>

      {/* Checkbox overlay */}
      <span
        className={cn(
          "absolute top-1.5 right-1.5 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors",
          selected
            ? "bg-primary border-primary"
            : "bg-background/80 border-border backdrop-blur-sm"
        )}
      >
        {selected && (
          <svg
            className="w-3 h-3 text-primary-foreground"
            viewBox="0 0 12 12"
            fill="none"
          >
            <path
              d="M2 6l3 3 5-5"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </span>

      {/* Meta */}
      <div className="p-2">
        <p className="text-xs font-medium leading-tight line-clamp-2 text-foreground">
          {clip.title || `${clip.id}.${clip.ext}`}
        </p>
        {meta && (
          <p className="text-[10px] text-muted-foreground mt-0.5">{meta}</p>
        )}
      </div>
    </button>
  );
}

// ─── AirImportDialog ─────────────────────────────────────────────────────────

export function AirImportDialog({
  libraryId,
  open,
  onClose,
}: AirImportDialogProps) {
  const queryClient = useQueryClient();

  const [step, setStep] = useState<Step>("connect");
  const [boardUrl, setBoardUrl] = useState("");
  const [browseResult, setBrowseResult] = useState<AirBrowseResult | null>(
    null
  );
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [autoIndex, setAutoIndex] = useState(false);
  const [activeJobId, setActiveJobId] = useState<string | null>(null);

  // Keep boardUrl in a ref so import mutation can read it without stale closure
  const boardUrlRef = useRef(boardUrl);
  boardUrlRef.current = boardUrl;

  // ── Step 1: browse ──
  const { mutate: browseBoard, isPending: isBrowsing } = useMutation({
    mutationFn: () =>
      brollApi.browseAirBoard(libraryId, { boardUrl: boardUrlRef.current }),
    onSuccess: (result) => {
      setBrowseResult(result);
      setSelectedIds(new Set(result.clips.map((c) => c.id)));
      setStep("browse");
    },
    onError: (err: Error) => {
      toast.error(err.message ?? "Failed to fetch AIR board clips");
    },
  });

  // ── Step 2: import selected ──
  const { mutate: startImport, isPending: isImporting } = useMutation({
    mutationFn: () =>
      brollApi.importFromAir(libraryId, {
        boardUrl: boardUrlRef.current,
        clipIds: [...selectedIds],
        autoIndex,
      }),
    onSuccess: (job: BrollAirImport) => {
      setActiveJobId(job.id);
      setStep("importing");
      toast.success("AIR import started — streaming videos to S3");
      queryClient.invalidateQueries({
        queryKey: ["broll-air-imports", libraryId],
      });
    },
    onError: (err: Error) => {
      toast.error(err.message ?? "Failed to start AIR import");
    },
  });

  const handleClose = () => {
    setStep("connect");
    setBoardUrl("");
    setBrowseResult(null);
    setSelectedIds(new Set());
    setAutoIndex(false);
    setActiveJobId(null);
    onClose();
    queryClient.invalidateQueries({ queryKey: ["broll-videos", libraryId] });
    queryClient.invalidateQueries({ queryKey: ["broll-library", libraryId] });
  };

  const toggleAll = () => {
    if (!browseResult) return;
    if (selectedIds.size === browseResult.clips.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(browseResult.clips.map((c) => c.id)));
    }
  };

  const toggleClip = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const allSelected =
    browseResult !== null && selectedIds.size === browseResult.clips.length;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CloudDownload className="w-5 h-5 text-primary" />
            Import from AIR
          </DialogTitle>
          {step === "connect" && (
            <DialogDescription>
              Paste a public AIR share link to browse and select clips — no API
              key needed.
            </DialogDescription>
          )}
        </DialogHeader>

        {/* ── Step: connect ── */}
        {step === "connect" && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!boardUrl.trim()) return;
              browseBoard();
            }}
            className="space-y-4 pt-1"
          >
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

            <div className="flex justify-end gap-2 pt-1">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleClose}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={isBrowsing || !boardUrl.trim()}
              >
                {isBrowsing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-1.5" />
                    Fetching clips…
                  </>
                ) : (
                  "Browse →"
                )}
              </Button>
            </div>
          </form>
        )}

        {/* ── Step: browse ── */}
        {step === "browse" && browseResult && (
          <div className="space-y-3">
            {/* Header row */}
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStep("connect")}
                className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                Back
              </button>
              <span className="text-sm font-medium">
                {browseResult.totalClips} clip
                {browseResult.totalClips !== 1 ? "s" : ""} found
              </span>
              <Button
                variant="ghost"
                size="sm"
                className="text-xs h-7"
                onClick={toggleAll}
              >
                {allSelected ? "Deselect All" : "Select All"}
              </Button>
            </div>

            {/* Clip grid */}
            <div className="max-h-[360px] overflow-y-auto pr-1">
              <div className="grid grid-cols-3 gap-2">
                {browseResult.clips.map((clip) => (
                  <ClipCard
                    key={clip.id}
                    clip={clip}
                    selected={selectedIds.has(clip.id)}
                    onToggle={() => toggleClip(clip.id)}
                  />
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between border-t border-border/60 pt-3">
              {/* Auto-index toggle */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setAutoIndex((v) => !v)}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={
                    autoIndex ? "Disable auto-index" : "Enable auto-index"
                  }
                >
                  {autoIndex ? (
                    <ToggleRight className="w-8 h-8 text-primary" />
                  ) : (
                    <ToggleLeft className="w-8 h-8" />
                  )}
                </button>
                <span className="text-xs text-muted-foreground">
                  Auto-index
                </span>
              </div>

              <Button
                size="sm"
                disabled={isImporting || selectedIds.size === 0}
                onClick={() => startImport()}
              >
                {isImporting ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-1.5" />
                ) : (
                  <CloudDownload className="w-4 h-4 mr-1.5" />
                )}
                Import {selectedIds.size} clip
                {selectedIds.size !== 1 ? "s" : ""} →
              </Button>
            </div>
          </div>
        )}

        {/* ── Step: importing ── */}
        {step === "importing" && activeJobId && (
          <ImportProgressView libraryId={libraryId} jobId={activeJobId} />
        )}
      </DialogContent>
    </Dialog>
  );
}
