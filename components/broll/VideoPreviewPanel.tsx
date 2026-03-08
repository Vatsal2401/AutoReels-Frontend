"use client";

import { useEffect, useRef, useState } from "react";
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

  return (
    <SlidePanel
      open={!!video}
      onClose={onClose}
      title={video?.filename ?? "Preview"}
      subtitle={video ? `${formatDuration(video.duration_seconds)} · ${video.frame_count ?? 0} frames` : undefined}
      width="w-[420px]"
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
                src={signedUrl}
                controls
                className="w-full h-full object-contain"
              />
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
