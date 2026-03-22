"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Download, Play, Flame, Zap, BarChart2, Clock, CalendarPlus, Loader2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils/format";
import { clipExtractorApi, type ExtractedClip } from "@/lib/api/clip-extractor";

function ScoreBadge({ score }: { score: number }) {
  if (score >= 80) return (
    <div className="flex items-center gap-1 rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-bold text-white shadow">
      <Flame className="h-2.5 w-2.5" />{Math.round(score)}
    </div>
  );
  if (score >= 60) return (
    <div className="flex items-center gap-1 rounded-full bg-orange-500 px-2 py-0.5 text-[10px] font-bold text-white shadow">
      <Zap className="h-2.5 w-2.5" />{Math.round(score)}
    </div>
  );
  return (
    <div className="flex items-center gap-1 rounded-full bg-zinc-600 px-2 py-0.5 text-[10px] font-bold text-white shadow">
      <BarChart2 className="h-2.5 w-2.5" />{Math.round(score)}
    </div>
  );
}

interface ClipCardProps {
  clip: ExtractedClip;
  jobId: string;
}

export function ClipCard({ clip, jobId }: ClipCardProps) {
  const [downloading, setDownloading] = useState(false);
  const [thumbUrl, setThumbUrl] = useState<string | null>(null);

  const isReady = clip.renderStatus === "done" && clip.renderedClipS3Key;
  const isFailed = clip.renderStatus === "failed";
  const durationSec = clip.durationSec ?? (clip.endSec - clip.startSec);
  const durationStr = `${Math.floor(durationSec / 60)}:${String(Math.round(durationSec % 60)).padStart(2, "0")}`;

  useEffect(() => {
    if (clip.thumbnailS3Key) {
      clipExtractorApi.getClipThumbUrl(clip.id).then(setThumbUrl).catch(() => {});
    }
  }, [clip.id, clip.thumbnailS3Key]);

  const handlePreview = async () => {
    if (!isReady) return;
    try {
      const { url } = await clipExtractorApi.getClipUrl(clip.id);
      if (url) window.open(url, "_blank", "noopener,noreferrer");
    } catch {
      toast.error("Failed to get preview link");
    }
  };

  const handleDownload = async () => {
    if (!isReady) return;
    setDownloading(true);
    try {
      const { url } = await clipExtractorApi.getClipUrl(clip.id);
      if (url) {
        const a = document.createElement("a");
        a.href = url;
        a.download = `clip_${clip.clipIndex + 1}_score${Math.round(clip.viralScore)}.mp4`;
        a.click();
      }
    } catch {
      toast.error("Failed to get download link");
    } finally {
      setDownloading(false);
    }
  };

  const handleAddToCampaign = () => {
    const params = new URLSearchParams({
      hookLine: clip.hookLine ?? "",
      tags: (clip.tags ?? []).join(","),
      clipId: clip.id,
      jobId,
    });
    window.location.href = `/campaigns/new?${params.toString()}`;
  };

  return (
    <div className={cn(
      "group flex flex-col overflow-hidden rounded-2xl border bg-card transition-all hover:shadow-xl hover:-translate-y-0.5",
      isFailed && "opacity-50"
    )}>
      {/* Thumbnail — 9:16 aspect */}
      <div className="relative aspect-[9/16] bg-muted overflow-hidden">
        {thumbUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={thumbUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center">
            {(clip.renderStatus === "rendering" || clip.renderStatus === "pending") ? (
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground/50" />
                <span className="text-[10px] text-muted-foreground">Rendering...</span>
              </div>
            ) : isFailed ? (
              <div className="flex flex-col items-center gap-2">
                <AlertCircle className="h-8 w-8 text-destructive/50" />
                <span className="text-[10px] text-muted-foreground">Failed</span>
              </div>
            ) : (
              <Play className="h-8 w-8 text-muted-foreground/30" />
            )}
          </div>
        )}

        {/* Overlay badges */}
        <div className="absolute left-2 top-2">
          <ScoreBadge score={clip.viralScore} />
        </div>
        <div className="absolute bottom-2 right-2 flex items-center gap-1 rounded-md bg-black/70 px-1.5 py-0.5 text-[10px] text-white">
          <Clock className="h-2.5 w-2.5" />{durationStr}
        </div>

        {/* Play overlay */}
        {isReady && (
          <button
            onClick={handlePreview}
            className="absolute inset-0 flex items-center justify-center bg-black/0 transition-all group-hover:bg-black/30"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/0 transition-all group-hover:bg-white/20 group-hover:scale-110">
              <Play className="h-6 w-6 text-white opacity-0 transition-opacity group-hover:opacity-100 fill-white" />
            </div>
          </button>
        )}
      </div>

      {/* Card body */}
      <div className="flex flex-col gap-2 p-3">
        {clip.hookLine && (
          <p className="text-[11px] font-semibold leading-snug line-clamp-2">{clip.hookLine}</p>
        )}
        {clip.tags && clip.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {clip.tags.slice(0, 3).map((tag) => (
              <span key={tag} className="rounded-full bg-muted px-1.5 py-0.5 text-[9px] text-muted-foreground">
                #{tag}
              </span>
            ))}
          </div>
        )}
        <div className="mt-auto flex gap-1.5 pt-1">
          <button
            onClick={handleDownload}
            disabled={!isReady || downloading}
            className={cn(
              "flex flex-1 items-center justify-center gap-1 rounded-lg py-2 text-[11px] font-medium transition-colors",
              isReady ? "bg-primary text-primary-foreground hover:bg-primary/90" : "bg-muted text-muted-foreground cursor-not-allowed"
            )}
          >
            {downloading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Download className="h-3 w-3" />}
            Download
          </button>
          <button
            onClick={handleAddToCampaign}
            disabled={!isReady}
            className="flex items-center justify-center rounded-lg bg-muted px-2.5 py-2 transition-colors hover:bg-muted/70 disabled:cursor-not-allowed disabled:opacity-50"
            title="Add to Campaign"
          >
            <CalendarPlus className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
