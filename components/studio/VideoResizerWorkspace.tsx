"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { resizeVideo, resizeVideoWithPresignedUrl, type ResizeOptions } from "@/lib/api/video-tools";
import { projectsApi } from "@/lib/api/projects";
import { validateVideoFile, MAX_VIDEO_SIZE_MB } from "@/lib/studio/video-file-validation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Upload, AlertCircle, CheckCircle, Eye, Download, Maximize2, Film } from "lucide-react";
import { cn } from "@/lib/utils/format";

const ASPECT_PRESETS: { label: string; ratio: string; width: number; height: number }[] = [
  { label: "16:9 Landscape", ratio: "16:9", width: 1920, height: 1080 },
  { label: "9:16 Portrait", ratio: "9:16", width: 1080, height: 1920 },
  { label: "1:1 Square", ratio: "1:1", width: 1080, height: 1080 },
  { label: "4:5 Instagram", ratio: "4:5", width: 1080, height: 1350 },
  { label: "4:3 Classic", ratio: "4:3", width: 1440, height: 1080 },
  { label: "21:9 Ultrawide", ratio: "21:9", width: 2560, height: 1080 },
];

const RESOLUTION_PRESETS = [
  { label: "4K", w: 3840, h: 2160 },
  { label: "1080p", w: 1080, h: 1920 },
  { label: "720p", w: 720, h: 1280 },
  { label: "480p", w: 480, h: 854 },
  { label: "360p", w: 360, h: 640 },
];

const FIT_OPTIONS: { value: ResizeOptions["fit"]; label: string }[] = [
  { value: "fill", label: "Fill (Stretch)" },
  { value: "contain", label: "Contain (Fit within)" },
  { value: "cover", label: "Cover (Fill & crop)" },
];

function ResultView({
  projectId,
  outputFileName,
  onReset,
}: {
  projectId: string;
  outputFileName?: string;
  onReset: () => void;
}) {
  const { data: url, isLoading } = useQuery({
    queryKey: ["project-output-url", projectId],
    queryFn: () => projectsApi.getOutputUrl(projectId),
    enabled: !!projectId,
  });

  if (isLoading || !url) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-16">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <span className="text-sm text-muted-foreground">Preparing your video…</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl overflow-hidden border border-border/50 bg-black/5 flex items-center justify-center p-6 min-h-[320px]">
        <video src={url} controls className="max-w-full max-h-[60vh] rounded-lg shadow-lg" />
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <Link href={`/projects/${projectId}`}>
          <Button variant="secondary" size="lg" className="gap-2">
            <Eye className="h-4 w-4" />
            View project
          </Button>
        </Link>
        <a href={url} download={outputFileName || "resized.mp4"}>
          <Button size="lg" className="gap-2">
            <Download className="h-4 w-4" />
            Download
          </Button>
        </a>
        <Button variant="outline" size="lg" onClick={onReset}>
          Resize another
        </Button>
      </div>
    </div>
  );
}

export function VideoResizerWorkspace() {
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [aspectIndex, setAspectIndex] = useState(1);
  const [customWidth, setCustomWidth] = useState(1080);
  const [customHeight, setCustomHeight] = useState(1920);
  const [useCustom, setUseCustom] = useState(false);
  const [fit, setFit] = useState<ResizeOptions["fit"]>("contain");
  const [projectId, setProjectId] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const preset = ASPECT_PRESETS[aspectIndex];
  const width = useCustom ? customWidth : (preset?.width ?? customWidth);
  const height = useCustom ? customHeight : (preset?.height ?? customHeight);

  const { data: project, isLoading: polling } = useQuery({
    queryKey: ["project", projectId],
    queryFn: () => projectsApi.getProject(projectId!),
    enabled: !!projectId,
    refetchInterval: (q) => {
      const p = q.state.data as { status?: string } | undefined;
      if (p?.status === "completed" || p?.status === "failed") return false;
      return 2000;
    },
  });

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    setFile(f ?? null);
    setSubmitError(null);
    if (!f) {
      setFileError(null);
      return;
    }
    const v = validateVideoFile(f);
    setFileError(v.valid ? null : v.error ?? null);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files?.[0];
    if (!f || !f.type.startsWith("video/")) return;
    setFile(f);
    setSubmitError(null);
    const v = validateVideoFile(f);
    setFileError(v.valid ? null : v.error ?? null);
  };

  const handleSubmit = async () => {
    if (!file) return;
    const v = validateVideoFile(file);
    if (!v.valid) {
      setFileError(v.error ?? null);
      return;
    }
    setFileError(null);
    setSubmitError(null);
    setIsSubmitting(true);
    const options: ResizeOptions = { width, height, fit };
    const outputFileName = `${(file.name.replace(/\.[^.]+$/, "") || "video")}_resized_${width}x${height}.mp4`;
    try {
      let proj;
      try {
        proj = await resizeVideoWithPresignedUrl(file, options, outputFileName);
      } catch (presignedErr: any) {
        if (presignedErr?.message?.includes("Direct upload") || presignedErr?.response?.status === 500) {
          proj = await resizeVideo(file, options);
        } else {
          throw presignedErr;
        }
      }
      setProjectId(proj.id);
    } catch (err: any) {
      setSubmitError(err?.response?.data?.message || err?.message || "Upload failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isProcessing =
    project?.status === "pending" ||
    project?.status === "processing" ||
    project?.status === "rendering";
  const isCompleted = project?.status === "completed" && projectId;
  const isFailed = project?.status === "failed";
  const outputFileName = (project?.metadata as { outputFileName?: string })?.outputFileName;

  if (isCompleted && projectId) {
    return (
      <div className="flex flex-col h-full min-h-0 overflow-hidden">
        <div className="flex-1 overflow-y-auto p-6 sm:p-8">
          <div className="max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 rounded-full border border-emerald-500/20 mb-6">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
              <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">
                Ready
              </span>
            </div>
            <h2 className="text-2xl font-bold text-foreground tracking-tight mb-2">
              Your video has been resized
            </h2>
            <p className="text-muted-foreground text-sm mb-8">
              Download or open the project.
            </p>
            <ResultView
              projectId={projectId}
              outputFileName={outputFileName}
              onReset={() => setProjectId(null)}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full min-h-0 overflow-hidden bg-gradient-to-b from-muted/20 to-background">
      <div className="shrink-0 px-4 sm:px-8 pt-6 pb-5 border-b border-border/50 bg-background/80 backdrop-blur-sm">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-primary/80">
            Studio
          </span>
          <span className="text-muted-foreground">/</span>
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Video Resizer
          </span>
        </div>
        <h1 className="text-2xl font-bold text-foreground tracking-tight">
          Video Resizer
        </h1>
        <p className="text-sm text-muted-foreground mt-1 max-w-xl">
          Change resolution and aspect ratio. 100% free — processed on our servers. Results saved to Projects.
        </p>
      </div>
      <div className="flex-1 overflow-y-auto p-6 sm:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto items-start">
          {/* Left: Video upload + preview (same as Compressor) */}
          <Card className="bg-card/80 backdrop-blur border-border rounded-2xl shadow-sm overflow-hidden">
            <CardContent className="p-6 space-y-4">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block">
                Video
              </label>
              <input
                ref={inputRef}
                type="file"
                accept="video/*"
                className="hidden"
                onChange={onFileChange}
              />
              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={onDrop}
                onClick={() => inputRef.current?.click()}
                className={cn(
                  "rounded-xl border-2 border-dashed transition-colors cursor-pointer flex flex-col items-center justify-center gap-2 py-10 px-4 min-h-[140px]",
                  fileError
                    ? "border-destructive/50 bg-destructive/5 hover:bg-destructive/10"
                    : dragOver
                      ? "border-primary bg-primary/5"
                      : "border-border bg-muted/30 hover:border-primary/50 hover:bg-muted/50"
                )}
              >
                <Upload className="h-8 w-8 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground text-center">
                  {file ? file.name : "Click or drag a video here"}
                </span>
                {file && (
                  <span className="text-xs text-muted-foreground">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </span>
                )}
                <span className="text-[11px] text-muted-foreground/80">
                  Max {MAX_VIDEO_SIZE_MB}MB • MP4, MOV, WebM
                </span>
              </div>
              {fileError && (
                <div className="rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3 flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                  <p className="text-sm text-destructive font-medium">{fileError}</p>
                </div>
              )}
              {file && !fileError && (
                <div className="rounded-xl overflow-hidden border border-border bg-black/5 aspect-video flex items-center justify-center">
                  <video
                    src={URL.createObjectURL(file)}
                    controls
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Right: Settings + action (sticky like Compressor) */}
          <div className="space-y-6 lg:sticky lg:top-4">
            {isProcessing && (
              <Card className="bg-primary/5 border-primary/20 rounded-2xl shadow-sm">
                <CardContent className="px-8 py-12">
                  <div className="flex flex-col items-center gap-4 text-center">
                    <div className="relative">
                      <Loader2 className="h-14 w-14 animate-spin text-primary" />
                      <Film className="absolute inset-0 m-auto h-6 w-6 text-primary/50" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">Resizing your video…</p>
                      <p className="text-sm text-muted-foreground mt-1">This usually takes 1–3 minutes.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {isFailed && (
              <Card className="bg-destructive/5 border-destructive/20 rounded-2xl">
                <CardContent className="px-8 py-6">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-foreground">Processing failed</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {project?.error_message || "Something went wrong. Please try again."}
                      </p>
                      <Button variant="outline" size="sm" className="mt-3" onClick={() => setProjectId(null)}>
                        Try again
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card className="bg-card/80 backdrop-blur border-border rounded-2xl shadow-sm overflow-hidden">
              <CardContent className="p-6 space-y-6">
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/50 border border-border/50">
                  <span className="text-xs font-medium text-muted-foreground">Output size</span>
                  <span className="text-sm font-semibold text-foreground">{width} × {height}</span>
                </div>

                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-3">
                    Aspect ratio
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {ASPECT_PRESETS.map((p, i) => (
                      <Button
                        key={p.ratio}
                        type="button"
                        variant={aspectIndex === i && !useCustom ? "default" : "outline"}
                        size="sm"
                        className="rounded-lg font-medium"
                        onClick={() => {
                          setAspectIndex(i);
                          setUseCustom(false);
                          setCustomWidth(p.width);
                          setCustomHeight(p.height);
                        }}
                      >
                        {p.label}
                      </Button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-3">
                    Resolution
                  </label>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {RESOLUTION_PRESETS.map((r) => (
                      <Button
                        key={r.label}
                        type="button"
                        variant={
                          !useCustom && width === r.w && height === r.h ? "default" : "outline"
                        }
                        size="sm"
                        className="rounded-lg"
                        onClick={() => {
                          setUseCustom(false);
                          setCustomWidth(r.w);
                          setCustomHeight(r.h);
                          setAspectIndex(-1);
                        }}
                      >
                        {r.label}
                      </Button>
                    ))}
                    <Button
                      type="button"
                      variant={useCustom ? "default" : "outline"}
                      size="sm"
                      className="rounded-lg"
                      onClick={() => setUseCustom(true)}
                    >
                      Custom
                    </Button>
                  </div>
                  {useCustom && (
                    <div className="flex items-center gap-2 flex-wrap">
                      <input
                        type="number"
                        min={1}
                        max={4096}
                        value={customWidth}
                        onChange={(e) => setCustomWidth(Number(e.target.value) || 1080)}
                        className="h-9 w-24 rounded-lg border border-input bg-background px-3 text-sm font-medium"
                      />
                      <span className="text-muted-foreground font-medium">×</span>
                      <input
                        type="number"
                        min={1}
                        max={4096}
                        value={customHeight}
                        onChange={(e) => setCustomHeight(Number(e.target.value) || 1920)}
                        className="h-9 w-24 rounded-lg border border-input bg-background px-3 text-sm font-medium"
                      />
                    </div>
                  )}
                </div>

                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-3">
                    Fit mode
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {FIT_OPTIONS.map((o) => (
                      <Button
                        key={o.value}
                        type="button"
                        variant={fit === o.value ? "default" : "outline"}
                        size="sm"
                        className="rounded-lg"
                        onClick={() => setFit(o.value)}
                      >
                        {o.label}
                      </Button>
                    ))}
                  </div>
                </div>

                {submitError && (
                  <div className="rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3 flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                    <p className="text-sm text-destructive font-medium">{submitError}</p>
                  </div>
                )}

                <Button
                  size="lg"
                  className="w-full gap-2 rounded-xl h-12 text-base font-semibold"
                  disabled={!file || !!fileError || isSubmitting}
                  onClick={handleSubmit}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Uploading…
                    </>
                  ) : (
                    <>
                      <Maximize2 className="h-5 w-5" />
                      Resize Video
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
