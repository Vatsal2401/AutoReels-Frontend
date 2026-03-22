"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Download, Play, Flame, Zap, BarChart2, Clock, CalendarPlus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/format";
import { clipExtractorApi, type ExtractedClip } from "@/lib/api/clip-extractor";

// ─────────────────────────────────────────────────────────────────────────────
// Score badge
// ─────────────────────────────────────────────────────────────────────────────

function ScoreBadge({ score }: { score: number }) {
  if (score >= 80) {
    return (
      <div className="flex items-center gap-1 rounded-full bg-red-500/20 px-2 py-0.5 text-xs font-bold text-red-500">
        <Flame className="h-3 w-3" />
        {score} Viral
      </div>
    );
  }
  if (score >= 60) {
    return (
      <div className="flex items-center gap-1 rounded-full bg-orange-500/20 px-2 py-0.5 text-xs font-bold text-orange-500">
        <Zap className="h-3 w-3" />
        {score} Strong
      </div>
    );
  }
  return (
    <div className="flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs font-bold text-muted-foreground">
      <BarChart2 className="h-3 w-3" />
      {score} Decent
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ClipCard
// ─────────────────────────────────────────────────────────────────────────────

interface ClipCardProps {
  clip: ExtractedClip;
  jobId: string;
}

export function ClipCard({ clip, jobId }: ClipCardProps) {
  const [downloading, setDownloading] = useState(false);
  const [previewing, setPreviewing] = useState(false);
  const [thumbUrl, setThumbUrl] = useState<string | null>(null);

  const isReady = clip.renderStatus === "done" && clip.renderedClipS3Key;
  const durationStr = formatDuration(clip.durationSec ?? clip.endSec - clip.startSec);

  useEffect(() => {
    if (clip.thumbnailS3Key) {
      clipExtractorApi.getClipThumbUrl(clip.id)
        .then(setThumbUrl)
        .catch(() => {});
    }
  }, [clip.id, clip.thumbnailS3Key]);

  const handleDownload = async () => {
    if (!isReady) return;
    setDownloading(true);
    try {
      const { url } = await clipExtractorApi.getClipUrl(clip.id);
      const a = document.createElement("a");
      a.href = url;
      a.download = `clip_${clip.clipIndex + 1}_viral_${clip.viralScore}.mp4`;
      a.click();
    } catch {
      toast.error("Failed to get download link");
    } finally {
      setDownloading(false);
    }
  };

  const handlePreview = async () => {
    if (!isReady) return;
    setPreviewing(true);
    try {
      const { url } = await clipExtractorApi.getClipUrl(clip.id);
      window.open(url, "_blank", "noopener,noreferrer");
    } catch {
      toast.error("Failed to get preview link");
    } finally {
      setPreviewing(false);
    }
  };

  const handleAddToCampaign = () => {
    // Navigate to campaigns with clip metadata pre-filled as query params
    const params = new URLSearchParams({
      hookLine: clip.hookLine ?? "",
      tags: (clip.tags ?? []).join(","),
      clipId: clip.id,
      jobId,
    });
    window.location.href = `/campaigns/new?${params.toString()}`;
  };

  return (
    <div
      className={cn(
        "group relative flex flex-col rounded-2xl border bg-card overflow-hidden transition-shadow hover:shadow-lg",
        clip.renderStatus === "failed" && "opacity-60",
      )}
    >
      {/* Thumbnail / placeholder */}
      <div className="relative aspect-[9/16] bg-muted overflow-hidden">
        {thumbUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={thumbUrl}
            alt={`Clip ${clip.clipIndex + 1} thumbnail`}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            {clip.renderStatus === "rendering" || clip.renderStatus === "pending" ? (
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            ) : (
              <Play className="h-8 w-8 text-muted-foreground" />
            )}
          </div>
        )}

        {/* Score badge overlay */}
        <div className="absolute left-2 top-2">
          <ScoreBadge score={clip.viralScore} />
        </div>

        {/* Duration */}
        <div className="absolute bottom-2 right-2 flex items-center gap-1 rounded-md bg-black/60 px-1.5 py-0.5 text-[10px] text-white">
          <Clock className="h-2.5 w-2.5" />
          {durationStr}
        </div>

        {/* Play overlay on hover */}
        {isReady && (
          <button
            onClick={handlePreview}
            disabled={previewing}
            className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            {previewing ? (
              <Loader2 className="h-10 w-10 text-white animate-spin" />
            ) : (
              <Play className="h-10 w-10 text-white fill-white" />
            )}
          </button>
        )}
      </div>

      {/* Card body */}
      <div className="flex flex-1 flex-col gap-2 p-3">
        {/* Hook line */}
        {clip.hookLine && (
          <p className="text-sm font-semibold leading-snug line-clamp-2">{clip.hookLine}</p>
        )}

        {/* Tags */}
        {clip.tags && clip.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {clip.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Reasoning (collapsed) */}
        {clip.reasoning && (
          <p className="text-xs text-muted-foreground line-clamp-2">{clip.reasoning}</p>
        )}

        {/* Actions */}
        <div className="mt-auto flex gap-2 pt-2">
          <Button
            size="sm"
            variant="outline"
            className="flex-1 gap-1 text-xs"
            onClick={handleDownload}
            disabled={!isReady || downloading}
          >
            {downloading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Download className="h-3 w-3" />}
            Download
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="flex-1 gap-1 text-xs"
            onClick={handleAddToCampaign}
            disabled={!isReady}
            title="Add to campaign scheduler"
          >
            <CalendarPlus className="h-3 w-3" />
            Campaign
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function formatDuration(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = Math.round(sec % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}
