"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Scissors, Link2, ChevronDown, ChevronUp, Loader2, Youtube, Instagram, Music2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils/format";
import { clipExtractorApi, type CaptionStyle } from "@/lib/api/clip-extractor";
import { CaptionStylePicker } from "./CaptionStylePicker";

const YOUTUBE_RE = /^https?:\/\/(www\.|m\.)?(youtube\.com|youtu\.be)\/.+/;
const TIKTOK_RE = /^https?:\/\/(www\.|vm\.)?tiktok\.com\/.+/;

function isValidUrl(url: string): boolean {
  return YOUTUBE_RE.test(url) || TIKTOK_RE.test(url);
}

const OUTPUT_FORMATS = [
  { id: "portrait_9x16" as const, label: "YouTube Shorts", icon: Youtube, color: "text-red-500" },
  { id: "portrait_9x16" as const, label: "Instagram Reels", icon: Instagram, color: "text-pink-500" },
  { id: "portrait_9x16" as const, label: "TikTok", icon: Music2, color: "text-foreground" },
  { id: "original" as const, label: "Keep Original", icon: null, color: "text-muted-foreground" },
];

export function ClipExtractorStudio() {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [maxClips, setMaxClips] = useState(3);
  const [minClipSec, setMinClipSec] = useState(30);
  const [maxClipSec, setMaxClipSec] = useState(90);
  const [removeSilence, setRemoveSilence] = useState(true);
  const [captionStyle, setCaptionStyle] = useState<CaptionStyle>("bold");
  const [outputFormatIdx, setOutputFormatIdx] = useState(0); // YouTube Shorts by default
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const urlError = url.length > 0 && !isValidUrl(url);
  const outputFormat = OUTPUT_FORMATS[outputFormatIdx]!.id;

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
        outputFormat,
      });
      toast.success(`Extracting ${job.creditsDeducted} clip${job.creditsDeducted !== 1 ? "s" : ""}`);
      router.push(`/studio/clip-extractor/${job.id}`);
    } catch (err: unknown) {
      const axiosMsg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(axiosMsg ?? (err instanceof Error ? err.message : "Failed to create job"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* URL Input */}
      <div className="space-y-2">
        <div className={cn(
          "flex items-center gap-2 rounded-2xl border-2 bg-background px-4 py-3 transition-colors",
          urlError ? "border-destructive" : "border-border focus-within:border-primary"
        )}>
          <Link2 className="h-5 w-5 shrink-0 text-muted-foreground" />
          <input
            type="url"
            placeholder="Paste a YouTube or TikTok URL..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            disabled={submitting}
            autoFocus
          />
          {url && !urlError && (
            <div className="shrink-0 rounded-full bg-green-500/10 px-2 py-0.5 text-[10px] font-semibold text-green-600">
              ✓ Valid URL
            </div>
          )}
        </div>
        {urlError && (
          <p className="text-xs text-destructive pl-1">Only YouTube and TikTok URLs are supported</p>
        )}
      </div>

      {/* Output Format */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Output Format</label>
        <div className="flex flex-wrap gap-2">
          {OUTPUT_FORMATS.map((fmt, i) => {
            const Icon = fmt.icon;
            return (
              <button
                key={i}
                type="button"
                onClick={() => setOutputFormatIdx(i)}
                disabled={submitting}
                className={cn(
                  "flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-all",
                  outputFormatIdx === i
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border hover:border-primary/50"
                )}
              >
                {Icon && <Icon className={cn("h-3 w-3", outputFormatIdx === i ? "text-primary-foreground" : fmt.color)} />}
                {fmt.label}
              </button>
            );
          })}
        </div>
        {outputFormat === "portrait_9x16" && (
          <p className="text-[11px] text-muted-foreground pl-1">
            Landscape video auto-converted to 9:16 with blurred background
          </p>
        )}
      </div>

      {/* Caption Style */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Caption Style</label>
        <CaptionStylePicker value={captionStyle} onChange={setCaptionStyle} />
      </div>

      {/* Max Clips */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">Number of Clips</label>
          <div className="flex items-center gap-1">
            <span className="text-lg font-bold text-primary">{maxClips}</span>
            <span className="text-xs text-muted-foreground">clip{maxClips !== 1 ? "s" : ""} · {maxClips} credit{maxClips !== 1 ? "s" : ""}</span>
          </div>
        </div>
        <input
          type="range"
          min={1}
          max={5}
          value={maxClips}
          onChange={(e) => setMaxClips(Number(e.target.value))}
          className="w-full accent-primary"
          disabled={submitting}
        />
        <div className="flex justify-between text-[10px] text-muted-foreground">
          {[1,2,3,4,5].map(n => <span key={n}>{n}</span>)}
        </div>
      </div>

      {/* Advanced Options */}
      <div>
        <button
          type="button"
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          onClick={() => setShowAdvanced((v) => !v)}
        >
          {showAdvanced ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          Advanced Options
        </button>

        {showAdvanced && (
          <div className="mt-3 space-y-4 rounded-xl border bg-muted/20 p-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-medium">Min Length (s)</label>
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
                <label className="text-xs font-medium">Max Length (s)</label>
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

            <label className="flex cursor-pointer items-center justify-between select-none">
              <div>
                <p className="text-sm font-medium">Remove Silence</p>
                <p className="text-xs text-muted-foreground">Cut dead air from clips</p>
              </div>
              <div
                role="checkbox"
                aria-checked={removeSilence}
                onClick={() => !submitting && setRemoveSilence((v) => !v)}
                className={cn(
                  "relative h-6 w-11 cursor-pointer rounded-full transition-colors",
                  removeSilence ? "bg-primary" : "bg-muted"
                )}
              >
                <div className={cn(
                  "absolute top-1 h-4 w-4 rounded-full bg-white shadow transition-transform",
                  removeSilence ? "translate-x-6" : "translate-x-1"
                )} />
              </div>
            </label>
          </div>
        )}
      </div>

      {/* Submit */}
      <Button
        type="submit"
        disabled={submitting || !url || urlError}
        className="w-full gap-2 rounded-2xl py-6 text-base font-semibold"
        size="lg"
      >
        {submitting ? (
          <><Loader2 className="h-5 w-5 animate-spin" />Analyzing video...</>
        ) : (
          <><Scissors className="h-5 w-5" />Extract Viral Clips</>
        )}
      </Button>

      <p className="text-center text-xs text-muted-foreground">
        {maxClips} credit{maxClips !== 1 ? "s" : ""} reserved · refunded if extraction fails
      </p>
    </form>
  );
}
