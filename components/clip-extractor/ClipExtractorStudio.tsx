"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Scissors, Link, ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils/format";
import { clipExtractorApi, type CaptionStyle } from "@/lib/api/clip-extractor";
import { CaptionStylePicker } from "./CaptionStylePicker";

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

const YOUTUBE_RE = /^https?:\/\/(www\.|m\.)?(youtube\.com|youtu\.be)\/.+/;
const TIKTOK_RE = /^https?:\/\/(www\.|vm\.)?tiktok\.com\/.+/;

function isValidUrl(url: string): boolean {
  return YOUTUBE_RE.test(url) || TIKTOK_RE.test(url);
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export function ClipExtractorStudio() {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [maxClips, setMaxClips] = useState(5);
  const [minClipSec, setMinClipSec] = useState(30);
  const [maxClipSec, setMaxClipSec] = useState(90);
  const [removeSilence, setRemoveSilence] = useState(true);
  const [captionStyle, setCaptionStyle] = useState<CaptionStyle>("bold");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const urlError = url.length > 0 && !isValidUrl(url);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidUrl(url)) {
      toast.error("Please enter a valid YouTube or TikTok URL");
      return;
    }

    setSubmitting(true);
    try {
      const job = await clipExtractorApi.createJob({
        sourceUrl: url,
        maxClips,
        minClipSec,
        maxClipSec,
        removeSilence,
        captionStyle,
      });
      toast.success(`Job created — ${job.creditsDeducted} credit${job.creditsDeducted !== 1 ? "s" : ""} reserved`);
      router.push(`/studio/clip-extractor/${job.id}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to create job";
      // Try to extract backend error message from axios
      const axiosMsg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(axiosMsg ?? msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      {/* URL input */}
      <div className="space-y-2">
        <label className="text-sm font-medium">YouTube or TikTok URL</label>
        <div className="relative">
          <Link className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="url"
            placeholder="https://youtube.com/watch?v=..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className={cn("pl-10", urlError && "border-destructive focus-visible:ring-destructive")}
            disabled={submitting}
          />
        </div>
        {urlError && (
          <p className="text-xs text-destructive">Only YouTube and TikTok URLs are supported</p>
        )}
      </div>

      {/* Caption Style */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Caption Style</label>
        <CaptionStylePicker value={captionStyle} onChange={setCaptionStyle} />
      </div>

      {/* Max clips */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">Number of Clips</label>
          <span className="text-sm font-semibold text-primary">{maxClips}</span>
        </div>
        <input
          type="range"
          min={1}
          max={10}
          value={maxClips}
          onChange={(e) => setMaxClips(Number(e.target.value))}
          className="w-full accent-primary"
          disabled={submitting}
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>1 clip</span>
          <span>10 clips ({maxClips} credit{maxClips !== 1 ? "s" : ""})</span>
        </div>
      </div>

      {/* Advanced options */}
      <div>
        <button
          type="button"
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
          onClick={() => setShowAdvanced((v) => !v)}
        >
          {showAdvanced ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          Advanced Options
        </button>

        {showAdvanced && (
          <div className="mt-4 space-y-4 rounded-xl border border-border p-4">
            {/* Min / Max clip duration */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-medium">Min Clip Length (s)</label>
                <Input
                  type="number"
                  min={15}
                  max={maxClipSec - 5}
                  value={minClipSec}
                  onChange={(e) => setMinClipSec(Number(e.target.value))}
                  disabled={submitting}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium">Max Clip Length (s)</label>
                <Input
                  type="number"
                  min={minClipSec + 5}
                  max={180}
                  value={maxClipSec}
                  onChange={(e) => setMaxClipSec(Number(e.target.value))}
                  disabled={submitting}
                />
              </div>
            </div>

            {/* Remove silence toggle */}
            <label className="flex items-center gap-3 cursor-pointer select-none">
              <div
                role="checkbox"
                aria-checked={removeSilence}
                onClick={() => setRemoveSilence((v) => !v)}
                className={cn(
                  "h-5 w-9 rounded-full transition-colors relative",
                  removeSilence ? "bg-primary" : "bg-muted",
                )}
              >
                <div
                  className={cn(
                    "absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform shadow-sm",
                    removeSilence ? "translate-x-4" : "translate-x-0.5",
                  )}
                />
              </div>
              <div>
                <p className="text-sm font-medium">Remove Silence</p>
                <p className="text-xs text-muted-foreground">Cuts dead air and pauses from clips</p>
              </div>
            </label>
          </div>
        )}
      </div>

      {/* Submit */}
      <Button
        type="submit"
        disabled={submitting || !url || urlError}
        className="w-full gap-2"
        size="lg"
      >
        {submitting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Creating job...
          </>
        ) : (
          <>
            <Scissors className="h-4 w-4" />
            Extract Viral Clips
          </>
        )}
      </Button>

      <p className="text-center text-xs text-muted-foreground">
        1 credit per clip extracted · Max {maxClips} credits · Credits reserved now, consumed on success
      </p>
    </form>
  );
}
