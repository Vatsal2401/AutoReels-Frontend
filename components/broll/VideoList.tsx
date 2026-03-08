"use client";

import { useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Film,
  Loader2,
  RefreshCw,
  Trash2,
  Upload,
  CloudUpload,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Tip } from "./shared/Tip";
import { StatusBadge } from "./StatusBadge";
import { IndexProgressBar } from "./IndexProgressBar";
import { UploadQueue } from "./upload/UploadQueue";
import { VideoPreviewPanel } from "./VideoPreviewPanel";
import { EmptyState } from "./shared/EmptyState";
import { brollApi, type BrollVideo } from "@/lib/api/broll";
import { useUploadManager } from "@/lib/hooks/useUploadManager";

interface VideoListProps {
  libraryId: string;
  onRefreshStats?: () => void;
}

const VIDEO_EXTS = new Set([".mp4", ".mov", ".avi", ".mkv", ".webm"]);
const isVideoFile = (f: File) =>
  f.type.startsWith("video/") ||
  VIDEO_EXTS.has(f.name.slice(f.name.lastIndexOf(".")).toLowerCase());

function formatDuration(s: number | null): string {
  if (s == null) return "—";
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${String(sec).padStart(2, "0")}`;
}

export function VideoList({ libraryId, onRefreshStats }: VideoListProps) {
  const queryClient = useQueryClient();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [previewVideo, setPreviewVideo] = useState<BrollVideo | null>(null);

  const refreshAll = () => {
    queryClient.invalidateQueries({ queryKey: ["broll-videos", libraryId] });
    queryClient.invalidateQueries({ queryKey: ["broll-library", libraryId] });
    onRefreshStats?.();
  };

  const { uploads, addFiles: addUploads, cancelUpload, activeCount } = useUploadManager(
    libraryId,
    refreshAll,
  );

  const { data: videos = [], isLoading } = useQuery({
    queryKey: ["broll-videos", libraryId],
    queryFn: () => brollApi.listVideos(libraryId),
    refetchInterval: (query) => {
      const data = query.state.data ?? [];
      const hasActive = data.some(
        (v) => v.job_status === "active" || v.status === "processing" || v.job_status === "queued",
      );
      return hasActive ? 3000 : false;
    },
  });

  const { mutate: deleteVideo } = useMutation({
    mutationFn: (videoId: string) => brollApi.deleteVideo(libraryId, videoId),
    onSuccess: () => { refreshAll(); toast.success("Video removed"); },
    onError: () => toast.error("Failed to delete video"),
  });

  const { mutate: indexOne } = useMutation({
    mutationFn: (videoId: string) => brollApi.indexOne(libraryId, videoId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["broll-videos", libraryId] });
      toast.success("Indexing started");
    },
    onError: () => toast.error("Failed to start indexing"),
  });

  const { mutate: reindexOne } = useMutation({
    mutationFn: (videoId: string) => brollApi.reindexOne(libraryId, videoId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["broll-videos", libraryId] });
      toast.success("Re-indexing started");
    },
    onError: () => toast.error("Failed to re-index video"),
  });

  const pending = videos.filter((v) => v.status === "uploaded");
  const { mutate: indexAll, isPending: isIndexingAll } = useMutation({
    mutationFn: () => brollApi.indexAll(libraryId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["broll-videos", libraryId] });
      toast.success(`${data.queued} videos queued for indexing`);
    },
    onError: () => toast.error("Failed to start bulk index"),
  });

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    const filtered = Array.from(files).filter(isVideoFile);
    if (!filtered.length) return;
    addUploads(filtered);
  };

  return (
    <div
      className="flex flex-col gap-3 h-full relative p-5"
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) setDragging(false);
      }}
      onDrop={(e) => { e.preventDefault(); setDragging(false); handleFiles(e.dataTransfer.files); }}
    >
      {/* Drag-drop overlay */}
      {dragging && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-background/90 border-2 border-dashed border-primary rounded-xl pointer-events-none">
          <CloudUpload className="w-10 h-10 text-primary mb-3" />
          <p className="text-sm font-semibold text-primary">Drop videos to upload</p>
          <p className="text-xs text-muted-foreground mt-1">MP4, MOV, AVI, MKV, WebM supported</p>
        </div>
      )}

      {/* ── Toolbar ─────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-2.5 rounded-xl border border-border/60 bg-muted/30 px-3 py-2.5 sm:gap-3 sm:px-4 sm:py-3 shrink-0">
        <Button
          size="sm"
          variant="outline"
          className="h-9 gap-1.5 border-border/80 bg-background shadow-none hover:bg-muted/50 focus-visible:ring-2 focus-visible:ring-primary/20"
          onClick={() => inputRef.current?.click()}
        >
          <Upload className="w-3.5 h-3.5" />
          Upload Videos
        </Button>

        {pending.length > 0 && (
          <Button
            size="sm"
            className="h-9 gap-1.5"
            onClick={() => indexAll()}
            disabled={isIndexingAll}
          >
            {isIndexingAll ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <RefreshCw className="w-3.5 h-3.5" />
            )}
            Index All ({pending.length})
          </Button>
        )}

        {activeCount > 0 && (
          <span className="text-xs text-muted-foreground ml-1">
            {activeCount} uploading…
          </span>
        )}

        <input
          ref={inputRef}
          type="file"
          accept="video/*,.mov,.mp4,.avi,.mkv,.webm"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      {/* ── Upload queue ──────────────────────────────────────────── */}
      <UploadQueue uploads={uploads} onCancel={cancelUpload} />

      {/* ── Content ─────────────────────────────────────────────── */}
      {isLoading ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground py-6">
          <Loader2 className="w-4 h-4 animate-spin" /> Loading videos…
        </div>
      ) : videos.length === 0 ? (
        <EmptyState
          icon={CloudUpload}
          title="No videos yet"
          description="Upload your B-roll footage to get started. Drag & drop anywhere on this page, or click Upload."
          action={{ label: "Upload Videos", onClick: () => inputRef.current?.click() }}
        />
      ) : (
        <div className="flex-1 min-h-0 flex flex-col rounded-lg border border-border/60 bg-card shadow-[0_1px_2px_rgba(0,0,0,0.04)] overflow-hidden">
          <div className="flex-1 min-h-0 overflow-auto">
            <table className="w-full text-sm min-w-[580px]">
              <thead className="sticky top-0 z-10 bg-muted/80 border-b border-border/70">
                <tr>
                  <th className="py-3 px-3 text-left font-semibold text-foreground text-xs">
                    Name
                  </th>
                  <th className="py-3 px-3 text-right font-semibold text-foreground text-xs w-20">
                    Duration
                  </th>
                  <th className="py-3 px-3 text-right font-semibold text-foreground text-xs w-16">
                    Frames
                  </th>
                  <th className="py-3 px-3 text-left font-semibold text-foreground text-xs w-32">
                    Status
                  </th>
                  <th className="py-3 px-3 w-44" />
                </tr>
              </thead>
              <tbody>
                {videos.map((v) => (
                  <VideoRow
                    key={v.id}
                    video={v}
                    onIndex={() => indexOne(v.id)}
                    onReindex={() => reindexOne(v.id)}
                    onPreview={() => setPreviewVideo(v)}
                    onDelete={() => {
                      if (confirm(`Remove "${v.filename}" from this library?`)) deleteVideo(v.id);
                    }}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Video preview slide-in */}
      <VideoPreviewPanel
        libraryId={libraryId}
        video={previewVideo}
        onClose={() => setPreviewVideo(null)}
      />
    </div>
  );
}

function VideoRow({
  video,
  onIndex,
  onReindex,
  onPreview,
  onDelete,
}: {
  video: BrollVideo;
  onIndex: () => void;
  onReindex: () => void;
  onPreview: () => void;
  onDelete: () => void;
}) {
  const isProcessing =
    video.job_status === "active" ||
    video.status === "processing" ||
    video.job_status === "queued";

  return (
    <tr className="border-b border-border/50 last:border-b-0 transition-colors hover:bg-muted/40 group">
      <td className="px-3 py-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <Film className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
          <span className="font-medium truncate text-sm">{video.filename}</span>
        </div>
      </td>
      <td className="px-3 py-3 text-right text-muted-foreground tabular-nums text-xs">
        {formatDuration(video.duration_seconds)}
      </td>
      <td className="px-3 py-3 text-right text-muted-foreground tabular-nums text-xs">
        {video.status === "indexed" ? video.frame_count : "—"}
      </td>
      <td className="px-3 py-3">
        {isProcessing && video.job_status ? (
          <IndexProgressBar
            framesProcessed={video.job_frames_processed ?? 0}
            totalFrames={video.job_total_frames}
            stage={video.job_stage}
          />
        ) : (
          <div className="flex items-center gap-2">
            <StatusBadge status={video.status} />
            {video.error_message && (
              <span
                className="text-xs text-destructive truncate max-w-[140px]"
                title={video.error_message}
              >
                {video.error_message}
              </span>
            )}
          </div>
        )}
      </td>
      <td className="px-3 py-3">
        <div className="flex items-center gap-1">
          <Tip label="Preview this video clip">
            <button
              onClick={onPreview}
              className="inline-flex items-center gap-1 h-7 px-2 rounded text-xs font-medium border border-border/70 bg-background hover:bg-muted/60 transition-colors text-muted-foreground hover:text-foreground"
            >
              <Eye className="w-3.5 h-3.5" />
              Preview
            </button>
          </Tip>
          {(video.status === "uploaded" || video.status === "error") && (
            <Tip label="Extract frames and build CLIP embeddings for matching">
              <button
                onClick={onIndex}
                className="inline-flex items-center gap-1 h-7 px-2 rounded text-xs font-medium border border-border/70 bg-background hover:bg-muted/60 transition-colors text-muted-foreground hover:text-foreground"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Index
              </button>
            </Tip>
          )}
          {video.status === "indexed" && (
            <Tip label="Re-extract frames and rebuild embeddings (overwrites existing)">
              <button
                onClick={onReindex}
                className="inline-flex items-center gap-1 h-7 px-2 rounded text-xs font-medium border border-border/70 bg-background hover:bg-muted/60 transition-colors text-muted-foreground hover:text-foreground"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Re-index
              </button>
            </Tip>
          )}
          <Tip label="Remove video from this library">
            <button
              onClick={onDelete}
              className="h-7 w-7 flex items-center justify-center rounded border border-border/70 bg-background hover:bg-destructive/10 hover:border-destructive/40 transition-colors text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </Tip>
        </div>
      </td>
    </tr>
  );
}
