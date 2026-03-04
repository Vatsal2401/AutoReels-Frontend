"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { lipSync } from "@/lib/api/lipsync";
import { useUserSettings } from "@/lib/hooks/useUserSettings";
import {
  Mic2,
  Upload,
  Loader2,
  Download,
  AlertCircle,
  Lock,
  RefreshCw,
  ImageIcon,
  Music,
  Video,
} from "lucide-react";
import { cn } from "@/lib/utils/format";

const ACCEPTED_AUDIO = "audio/wav,audio/mpeg,audio/mp4,audio/m4a,audio/aac,audio/ogg,audio/flac";
const ACCEPTED_FACE = "image/png,image/jpeg,image/webp,video/mp4,video/quicktime,video/webm";

export function LipSyncWorkspace() {
  const { lipSyncEnabled, isLoading: settingsLoading } = useUserSettings();

  const [faceFile, setFaceFile] = useState<File | null>(null);
  const [facePreviewUrl, setFacePreviewUrl] = useState<string | null>(null);
  const [faceIsVideo, setFaceIsVideo] = useState(false);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [bboxShift, setBboxShift] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [result, setResult] = useState<{ video_base64: string; duration: number; fps: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const faceInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);
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

  const handleFaceFile = useCallback((f: File) => {
    const isImg = f.type.startsWith("image/");
    const isVid = f.type.startsWith("video/");
    if (!isImg && !isVid) {
      setError("Please upload an image (PNG/JPEG) or short reference video (MP4/MOV).");
      return;
    }
    setFaceFile(f);
    setFaceIsVideo(isVid);
    setFacePreviewUrl(URL.createObjectURL(f));
    setResult(null);
    setError(null);
  }, []);

  const handleFaceDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f) handleFaceFile(f);
  }, [handleFaceFile]);

  const handleAudioFile = useCallback((f: File) => {
    setAudioFile(f);
    setResult(null);
    setError(null);
  }, []);

  const handleAudioDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f) handleAudioFile(f);
  }, [handleAudioFile]);

  async function handleGenerate() {
    if (!faceFile) { setError("Please upload a face image or reference video."); return; }
    if (!audioFile) { setError("Please upload an audio file."); return; }

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const data = await lipSync(faceFile, audioFile, { bbox_shift: bboxShift, fps: 25, batch_size: 8 });
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
    setFaceFile(null);
    setFacePreviewUrl(null);
    setFaceIsVideo(false);
    setAudioFile(null);
  }

  if (settingsLoading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[60vh]">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!lipSyncEnabled) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[60vh] gap-6 p-8">
        <div className="w-16 h-16 rounded-2xl bg-muted border border-border flex items-center justify-center">
          <Lock className="h-7 w-7 text-muted-foreground" />
        </div>
        <div className="text-center space-y-2 max-w-sm">
          <h2 className="text-lg font-semibold text-foreground">Lip Sync is Locked</h2>
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
                <Mic2 className="h-4 w-4 text-primary" />
              </div>
              <h1 className="text-base font-semibold text-foreground tracking-tight">Lip Sync</h1>
            </div>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed pl-10">
              Animate a face to speak any audio using AI-driven lip sync.
            </p>
          </div>

          {/* Face image / video upload */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Face Reference
              </label>
              <span className="text-[10px] text-muted-foreground/60 bg-muted px-1.5 py-0.5 rounded">
                Image or Video
              </span>
            </div>
            <div
              onDrop={handleFaceDrop}
              onDragOver={(e) => e.preventDefault()}
              onClick={() => !isLoading && faceInputRef.current?.click()}
              className={cn(
                "relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed transition-all duration-150 cursor-pointer",
                "min-h-[140px]",
                isLoading ? "opacity-50 cursor-not-allowed" : "hover:border-primary/60 hover:bg-muted/20",
                facePreviewUrl ? "border-primary/40 bg-primary/5" : "border-border bg-muted/20"
              )}
            >
              <input
                ref={faceInputRef}
                type="file"
                accept={ACCEPTED_FACE}
                className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFaceFile(f); }}
                disabled={isLoading}
              />
              {facePreviewUrl ? (
                faceIsVideo ? (
                  /* eslint-disable-next-line jsx-a11y/media-has-caption */
                  <video
                    src={facePreviewUrl}
                    muted
                    loop
                    autoPlay
                    playsInline
                    className="max-h-[180px] w-auto rounded-lg object-contain p-2"
                  />
                ) : (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={facePreviewUrl}
                    alt="Face preview"
                    className="max-h-[180px] w-auto rounded-lg object-contain p-2"
                  />
                )
              ) : (
                <div className="flex flex-col items-center gap-3 py-6 px-4 text-center">
                  <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                    <Video className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Drop face image or video</p>
                    <p className="text-xs text-muted-foreground mt-0.5">PNG/JPEG for static · MP4/MOV for head motion</p>
                  </div>
                </div>
              )}
            </div>
            {facePreviewUrl && !isLoading && (
              <button
                onClick={() => { setFaceFile(null); setFacePreviewUrl(null); setFaceIsVideo(false); setResult(null); }}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors self-end"
              >
                Remove {faceIsVideo ? "video" : "image"}
              </button>
            )}
            {!facePreviewUrl && (
              <p className="text-[10px] text-muted-foreground/70 leading-relaxed">
                Tip: Upload a short looping video (5–15s) of a person talking for natural head movement.
              </p>
            )}
          </div>

          {/* Audio upload */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Audio
            </label>
            <div
              onDrop={handleAudioDrop}
              onDragOver={(e) => e.preventDefault()}
              onClick={() => !isLoading && audioInputRef.current?.click()}
              className={cn(
                "relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed transition-all duration-150 cursor-pointer",
                "min-h-[100px]",
                isLoading ? "opacity-50 cursor-not-allowed" : "hover:border-primary/60 hover:bg-muted/20",
                audioFile ? "border-primary/40 bg-primary/5" : "border-border bg-muted/20"
              )}
            >
              <input
                ref={audioInputRef}
                type="file"
                accept={ACCEPTED_AUDIO}
                className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) handleAudioFile(f); }}
                disabled={isLoading}
              />
              {audioFile ? (
                <div className="flex items-center gap-3 px-4 py-4 w-full">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Music className="h-4 w-4 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{audioFile.name}</p>
                    <p className="text-xs text-muted-foreground">{(audioFile.size / 1024).toFixed(0)} KB</p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3 py-5 px-4 text-center">
                  <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                    <Upload className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Drop audio here</p>
                    <p className="text-xs text-muted-foreground mt-0.5">WAV, MP3, M4A, AAC</p>
                  </div>
                </div>
              )}
            </div>
            {audioFile && !isLoading && (
              <button
                onClick={() => { setAudioFile(null); setResult(null); }}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors self-end"
              >
                Remove audio
              </button>
            )}
          </div>

          {/* Mouth adjustment */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Mouth Adjustment
              </label>
              <span className="text-xs tabular-nums text-muted-foreground">{bboxShift > 0 ? `+${bboxShift}` : bboxShift}</span>
            </div>
            <input
              type="range"
              value={bboxShift}
              onChange={(e) => setBboxShift(Number(e.target.value))}
              min={-10}
              max={10}
              step={1}
              disabled={isLoading}
              className="w-full accent-primary h-2 rounded-full cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
            />
            <div className="flex justify-between text-[10px] text-muted-foreground/60">
              <span>More closed</span>
              <span>More open</span>
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
              disabled={isLoading || !faceFile || !audioFile}
              className="w-full h-11 text-sm font-semibold gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generating… {elapsed}s
                </>
              ) : (
                <>
                  <Mic2 className="h-4 w-4" />
                  Generate Lip Sync
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
                {result?.duration?.toFixed(1)}s · {result?.fps} fps
              </span>
              <a href={videoDataUrl} download="lipsync.mp4">
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
                  <p className="text-sm font-medium text-foreground">Generating lip sync…</p>
                  <p className="text-xs text-muted-foreground mt-1">{elapsed}s elapsed · processing audio + animating face</p>
                </div>
              </>
            ) : (
              <>
                <div className="w-12 h-12 rounded-2xl bg-muted/60 border-2 border-dashed border-border flex items-center justify-center">
                  <Mic2 className="h-5 w-5 text-muted-foreground/40" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-foreground">Your video will appear here</p>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                    Upload a face image or reference video + audio, then click Generate.
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
