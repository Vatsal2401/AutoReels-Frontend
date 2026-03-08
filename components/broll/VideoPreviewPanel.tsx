"use client";

import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { SlidePanel } from "./shared/SlidePanel";
import { StatusBadge } from "./StatusBadge";
import { brollApi, type BrollVideo } from "@/lib/api/broll";

interface VideoPreviewPanelProps {
  libraryId: string;
  video: BrollVideo | null;
  onClose: () => void;
}

function formatDuration(s: number | null): string {
  if (s == null) return "—";
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${String(sec).padStart(2, "0")}`;
}

const MIME_MAP: Record<string, string> = {
  mp4: "video/mp4",
  mov: "video/mp4", // most MOV files from iOS/macOS are H.264 — declare as mp4 so Chrome plays them
  m4v: "video/mp4",
  webm: "video/webm",
  avi: "video/x-msvideo",
  mkv: "video/x-matroska",
};

function getMimeType(filename: string): string {
  const ext = filename.split(".").pop()?.toLowerCase() ?? "";
  return MIME_MAP[ext] ?? "video/mp4";
}

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatTimestamp(s: number): string {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${String(sec).padStart(2, "0")}`;
}

export function VideoPreviewPanel({ libraryId, video, onClose }: VideoPreviewPanelProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [loadingUrl, setLoadingUrl] = useState(false);

  useEffect(() => {
    if (!video) {
      setSignedUrl(null);
      return;
    }
    setLoadingUrl(true);
    setSignedUrl(null);
    brollApi
      .getVideoPreviewUrl(libraryId, video.id)
      .then((d) => setSignedUrl(d.signedUrl))
      .catch(() => setSignedUrl(null))
      .finally(() => setLoadingUrl(false));
  }, [libraryId, video]);

  const { data: frames = [], isLoading: framesLoading } = useQuery({
    queryKey: ["broll-frames", libraryId, video?.id],
    queryFn: () => brollApi.getVideoFrames(libraryId, video!.id),
    enabled: !!video && video.status === "indexed",
  });

  return (
    <SlidePanel
      open={!!video}
      onClose={onClose}
      title={video?.filename ?? "Preview"}
      subtitle={video ? `${formatDuration(video.duration_seconds)} · ${video.frame_count ?? 0} frames` : undefined}
      width="w-[480px]"
    >
      {video && (
        <div className="flex flex-col h-full">
          {/* Video player */}
          <div className="bg-black aspect-video flex items-center justify-center shrink-0">
            {loadingUrl ? (
              <Loader2 className="w-6 h-6 animate-spin text-white/40" />
            ) : signedUrl ? (
              <video
                ref={videoRef}
                controls
                className="w-full h-full object-contain"
                onError={() => {
                  // Hide video element on error — download link below will show
                  if (videoRef.current) videoRef.current.style.display = "none";
                }}
              >
                <source src={signedUrl} type={getMimeType(video.filename)} />
              </video>
            ) : (
              <p className="text-white/50 text-xs">Preview unavailable</p>
            )}
          </div>

          {/* Metadata */}
          <div className="p-5 space-y-4">
            <div className="grid grid-cols-2 gap-y-3 text-sm">
              <MetaRow label="Status">
                <StatusBadge status={video.status} />
              </MetaRow>
              <MetaRow label="Duration">{formatDuration(video.duration_seconds)}</MetaRow>
              <MetaRow label="Scenes indexed">{video.status === "indexed" ? video.frame_count : "—"}</MetaRow>
              <MetaRow label="Uploaded">{formatDate(video.ingested_at)}</MetaRow>
            </div>

            {video.error_message && (
              <div className="rounded-md bg-destructive/10 border border-destructive/20 px-3 py-2">
                <p className="text-xs text-destructive font-medium mb-0.5">Error</p>
                <p className="text-xs text-destructive/80">{video.error_message}</p>
              </div>
            )}

            {video.video_summary && (
              <div className="rounded-md bg-muted/50 px-3 py-2.5">
                <p className="text-xs text-muted-foreground font-medium mb-1">Video Summary</p>
                <p className="text-xs text-foreground/80 leading-relaxed">{video.video_summary}</p>
              </div>
            )}

            {video.status === "indexed" && (
              <div>
                <p className="text-xs text-muted-foreground font-medium mb-2">
                  Frame Index ({frames.length} frames)
                </p>
                <div className="space-y-0.5 max-h-64 overflow-y-auto rounded-md border border-border/50">
                  {framesLoading ? (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground px-2 py-3">
                      <Loader2 className="w-3 h-3 animate-spin" /> Loading frames…
                    </div>
                  ) : frames.length === 0 ? (
                    <p className="text-xs text-muted-foreground px-2 py-3">
                      No frame data — re-index this video to generate captions.
                    </p>
                  ) : (
                    frames.map((f) => (
                      <button
                        key={f.frameIndex}
                        className="w-full flex items-start gap-2.5 px-2 py-1.5 text-left hover:bg-muted/60 transition-colors"
                        onClick={() => {
                          if (videoRef.current) videoRef.current.currentTime = f.frameTime;
                        }}
                      >
                        <span className="text-xs tabular-nums text-muted-foreground shrink-0 w-8">
                          {formatTimestamp(f.frameTime)}
                        </span>
                        <span className="text-xs text-foreground/80 leading-relaxed">
                          {f.caption ?? "—"}
                        </span>
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}

            {signedUrl && (
              <a
                href={signedUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground underline-offset-4 hover:underline"
              >
                Open in new tab
              </a>
            )}
          </div>
        </div>
      )}
    </SlidePanel>
  );
}

function MetaRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <>
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-xs font-medium">{children}</span>
    </>
  );
}
