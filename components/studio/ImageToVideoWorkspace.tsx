"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { animateImage, type VideoFormat } from "@/lib/api/image-to-video";
import { useUserSettings } from "@/lib/hooks/useUserSettings";
import {
  Clapperboard,
  Upload,
  Loader2,
  Download,
  AlertCircle,
  Lock,
  RefreshCw,
  ImageIcon,
} from "lucide-react";
import { cn } from "@/lib/utils/format";

// Motion bucket maps slider 0-100 → 20-180
function sliderToMotionBucket(v: number): number {
  return Math.round(20 + (v / 100) * 160);
}

const FORMATS: { value: VideoFormat; label: string; sub: string; w: number; h: number }[] = [
  { value: "vertical",   label: "9:16",  sub: "Vertical",    w: 9,  h: 16 },
  { value: "square",     label: "1:1",   sub: "Square",      w: 1,  h: 1  },
  { value: "horizontal", label: "16:9",  sub: "Horizontal",  w: 16, h: 9  },
];

function FormatPreview({ w, h, active }: { w: number; h: number; active: boolean }) {
  const MAX = 24;
  const scale = MAX / Math.max(w, h);
  const pw = Math.round(w * scale);
  const ph = Math.round(h * scale);
  return (
    <div
      className={cn(
        "rounded border-2 transition-colors",
        active ? "border-primary bg-primary/20" : "border-border bg-muted/40"
      )}
      style={{ width: pw, height: ph }}
    />
  );
}

export function ImageToVideoWorkspace() {
  const { imageToVideoEnabled, isLoading: settingsLoading } = useUserSettings();

  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [format, setFormat] = useState<VideoFormat>("vertical");
  const [motionSlider, setMotionSlider] = useState(66); // ~127 bucket
  const [quality, setQuality] = useState<"fast" | "quality">("fast");
  const [frames, setFrames] = useState<14 | 25>(25);
  const [isLoading, setIsLoading] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [result, setResult] = useState<{ video_base64: string; frames: number; seed_used: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Elapsed timer
  useEffect(() => {
    if (isLoading) {
      setElapsed(0);
      timerRef.current = setInterval(() => setElapsed((s) => s + 1), 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isLoading]);

  const handleFile = useCallback((f: File) => {
    if (!f.type.startsWith("image/")) {
      setError("Please upload a PNG or JPEG image.");
      return;
    }
    setFile(f);
    setPreviewUrl(URL.createObjectURL(f));
    setResult(null);
    setError(null);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  }, [handleFile]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) handleFile(f);
  };

  async function handleGenerate() {
    if (!file) { setError("Please upload an image first."); return; }
    setIsLoading(true);
    setError(null);
    setResult(null);
    try {
      const data = await animateImage(file, {
        format,
        num_frames: frames,
        num_inference_steps: quality === "quality" ? 25 : 15,
        fps: 7,
        motion_bucket_id: sliderToMotionBucket(motionSlider),
        noise_aug_strength: 0.02,
        seed: -1,
      });
      setResult(data);
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.message || "Generation failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  function handleReset() {
    setResult(null);
    setError(null);
    setFile(null);
    setPreviewUrl(null);
  }

  if (settingsLoading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[60vh]">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!imageToVideoEnabled) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[60vh] gap-6 p-8">
        <div className="w-16 h-16 rounded-2xl bg-muted border border-border flex items-center justify-center">
          <Lock className="h-7 w-7 text-muted-foreground" />
        </div>
        <div className="text-center space-y-2 max-w-sm">
          <h2 className="text-lg font-semibold text-foreground">Image to Video is Locked</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            This feature is currently in early access. Contact support to get it enabled for your account.
          </p>
        </div>
      </div>
    );
  }

  const videoDataUrl = result ? `data:video/mp4;base64,${result.video_base64}` : null;

  return (
    <div className="flex h-full min-h-0 w-full gap-0">

      {/* ── Left panel: Controls ─────────────────────────────────────── */}
      <div className="flex flex-col w-full max-w-[420px] flex-shrink-0 border-r border-border bg-background overflow-y-auto">
        <div className="flex flex-col gap-6 p-6 lg:p-8">

          {/* Header */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10">
                <Clapperboard className="h-4 w-4 text-primary" />
              </div>
              <h1 className="text-base font-semibold text-foreground tracking-tight">Image to Video</h1>
            </div>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed pl-10">
              Animate any image into a short cinematic video using Stable Video Diffusion.
            </p>
          </div>

          {/* Upload area */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Image
            </label>
            <div
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              onClick={() => !isLoading && inputRef.current?.click()}
              className={cn(
                "relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed transition-all duration-150 cursor-pointer",
                "min-h-[160px]",
                isLoading ? "opacity-50 cursor-not-allowed" : "hover:border-primary/60 hover:bg-muted/20",
                previewUrl ? "border-primary/40 bg-primary/5" : "border-border bg-muted/20"
              )}
            >
              <input
                ref={inputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="hidden"
                onChange={handleInputChange}
                disabled={isLoading}
              />
              {previewUrl ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={previewUrl}
                  alt="Uploaded image"
                  className="max-h-[200px] w-auto rounded-lg object-contain p-2"
                />
              ) : (
                <div className="flex flex-col items-center gap-3 py-8 px-4 text-center">
                  <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                    <Upload className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Drop image here</p>
                    <p className="text-xs text-muted-foreground mt-0.5">or click to browse · PNG, JPEG, WebP</p>
                  </div>
                </div>
              )}
            </div>
            {previewUrl && !isLoading && (
              <button
                onClick={() => { setFile(null); setPreviewUrl(null); setResult(null); }}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors self-end"
              >
                Remove image
              </button>
            )}
          </div>

          {/* Format */}
          <div className="flex flex-col gap-3">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Format
            </label>
            <div className="grid grid-cols-3 gap-2">
              {FORMATS.map((f) => {
                const active = format === f.value;
                return (
                  <button
                    key={f.value}
                    onClick={() => setFormat(f.value)}
                    disabled={isLoading}
                    className={cn(
                      "flex flex-col items-center gap-2.5 rounded-xl border p-3 transition-all duration-150",
                      active
                        ? "border-primary bg-primary/5 shadow-sm"
                        : "border-border bg-background hover:border-primary/40 hover:bg-muted/30"
                    )}
                  >
                    <FormatPreview w={f.w} h={f.h} active={active} />
                    <div className="flex flex-col items-center gap-0.5">
                      <span className={cn("text-xs font-semibold leading-none", active ? "text-foreground" : "text-muted-foreground")}>
                        {f.label}
                      </span>
                      <span className="text-[10px] text-muted-foreground/70">{f.sub}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Motion Intensity */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Motion Intensity
              </label>
              <span className="text-xs tabular-nums text-muted-foreground">
                {sliderToMotionBucket(motionSlider)}
              </span>
            </div>
            <input
              type="range"
              value={motionSlider}
              onChange={(e) => setMotionSlider(Number(e.target.value))}
              min={0}
              max={100}
              step={1}
              disabled={isLoading}
              className="w-full accent-primary h-2 rounded-full cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
            />
            <div className="flex justify-between text-[10px] text-muted-foreground/60">
              <span>Subtle</span>
              <span>Dramatic</span>
            </div>
          </div>

          {/* Quality */}
          <div className="flex flex-col gap-3">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Quality
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(["fast", "quality"] as const).map((q) => (
                <button
                  key={q}
                  onClick={() => setQuality(q)}
                  disabled={isLoading}
                  className={cn(
                    "flex flex-col items-start gap-1 rounded-xl border p-3 text-left transition-all duration-150",
                    quality === q
                      ? "border-primary bg-primary/5 shadow-sm"
                      : "border-border bg-background hover:border-primary/40 hover:bg-muted/30"
                  )}
                >
                  <span className={cn("text-xs font-semibold", quality === q ? "text-foreground" : "text-muted-foreground")}>
                    {q === "fast" ? "Fast" : "Quality"}
                  </span>
                  <span className="text-[10px] text-muted-foreground/70">
                    {q === "fast" ? "15 steps · ~60s" : "25 steps · ~100s"}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Frames */}
          <div className="flex flex-col gap-3">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Frames
            </label>
            <div className="grid grid-cols-2 gap-2">
              {([14, 25] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFrames(f)}
                  disabled={isLoading}
                  className={cn(
                    "flex flex-col items-start gap-1 rounded-xl border p-3 text-left transition-all duration-150",
                    frames === f
                      ? "border-primary bg-primary/5 shadow-sm"
                      : "border-border bg-background hover:border-primary/40 hover:bg-muted/30"
                  )}
                >
                  <span className={cn("text-xs font-semibold", frames === f ? "text-foreground" : "text-muted-foreground")}>
                    {f} frames
                  </span>
                  <span className="text-[10px] text-muted-foreground/70">
                    {f === 14 ? "~2s · faster" : "~3.5s · smoother"}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-start gap-2.5 rounded-xl border border-destructive/30 bg-destructive/5 p-3.5">
              <AlertCircle className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
              <p className="text-sm text-destructive leading-relaxed">{error}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col gap-2">
            <Button
              onClick={handleGenerate}
              disabled={isLoading || !file}
              className="w-full h-11 text-sm font-semibold gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generating… {elapsed}s
                </>
              ) : (
                <>
                  <Clapperboard className="h-4 w-4" />
                  Generate Video
                </>
              )}
            </Button>
            {result && (
              <Button variant="outline" onClick={handleReset} className="w-full h-10 gap-2 text-sm">
                <RefreshCw className="h-3.5 w-3.5" />
                New Generation
              </Button>
            )}
          </div>

        </div>
      </div>

      {/* ── Right panel: Preview ──────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-h-0 bg-muted/20 relative overflow-hidden">
        {videoDataUrl ? (
          <div className="flex flex-col h-full min-h-0">
            <div className="flex-1 flex items-center justify-center p-8 min-h-0 overflow-hidden">
              {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
              <video
                src={videoDataUrl}
                controls
                autoPlay
                loop
                className="max-h-full max-w-full rounded-2xl shadow-2xl object-contain"
              />
            </div>
            <div className="flex items-center justify-between px-8 py-4 border-t border-border bg-background/80 backdrop-blur-sm shrink-0">
              <span className="text-xs text-muted-foreground">
                {result?.frames} frames · {FORMATS.find(f => f.value === format)?.label} · seed {result?.seed_used}
              </span>
              <a href={videoDataUrl} download="image-to-video.mp4">
                <Button size="sm" className="gap-1.5 h-8 text-xs">
                  <Download className="h-3 w-3" />
                  Download
                </Button>
              </a>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center gap-5 p-8">
            {isLoading ? (
              <>
                <div className="relative w-20 h-20 flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full border-4 border-primary/20 animate-ping" />
                  <div className="absolute inset-2 rounded-full border-4 border-primary/30" />
                  <Loader2 className="h-8 w-8 text-primary animate-spin relative z-10" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-foreground">Generating your video…</p>
                  <p className="text-xs text-muted-foreground mt-1">{elapsed}s elapsed · this usually takes 60–100 seconds</p>
                </div>
              </>
            ) : (
              <>
                <div className="w-12 h-12 rounded-2xl bg-muted/60 border-2 border-dashed border-border flex items-center justify-center">
                  <ImageIcon className="h-5 w-5 text-muted-foreground/40" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-foreground">Your video will appear here</p>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                    Upload an image and click Generate Video to animate it.
                  </p>
                </div>
              </>
            )}
          </div>
        )}
      </div>

    </div>
  );
}
