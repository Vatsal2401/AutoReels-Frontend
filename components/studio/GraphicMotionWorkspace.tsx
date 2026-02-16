"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useMutation, useQuery } from "@tanstack/react-query";
import { projectsApi, type Project, type CreateProjectDto } from "@/lib/api/projects";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MusicSelector } from "@/components/media-settings/MusicSelector";
import type { MediaSettings } from "@/components/media-settings/types";
import { Loader2, Play, AlertCircle, Sparkles, FileText, Eye, CreditCard } from "lucide-react";
import { useCredits } from "@/lib/hooks/useCredits";
import { cn } from "@/lib/utils/format";

/** Minimal MediaSettings shape so MusicSelector (which only reads settings.music) works. */
function makeSettingsForMusic(music: MediaSettings["music"]): MediaSettings {
  return {
    visualStyleId: "cinematic",
    aspectRatio: "9:16",
    voiceId: "",
    language: "English (US)",
    duration: "Short",
    imageProvider: "gemini",
    captions: { enabled: true, preset: "bold-stroke", position: "bottom", timing: "word" },
    music,
    advancedOptions: { styleStrength: "medium", lighting: "none", colorTone: "none", cameraFraming: "none" },
  };
}

const FORMAT_OPTIONS = [
  { value: "reels", label: "Reels (9:16)" },
  { value: "tiktok", label: "TikTok (9:16)" },
  { value: "horizontal", label: "Horizontal (16:9)" },
  { value: "square", label: "Square (1:1)" },
];

const VIDEO_STYLE_OPTIONS = [
  { value: "", label: "Auto" },
  { value: "premium-saas", label: "Premium SaaS" },
  { value: "minimal", label: "Minimal" },
];

const TONE_OPTIONS = [
  { value: "", label: "Auto" },
  { value: "confident", label: "Confident" },
  { value: "urgent", label: "Urgent" },
  { value: "calm", label: "Calm" },
];

function GraphicMotionResultView({
  projectId,
  onReset,
}: {
  projectId: string;
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
      <div className="rounded-2xl overflow-hidden border border-border/50 bg-black/5 flex items-center justify-center p-6 min-h-[360px]">
        <div className="w-full max-w-sm aspect-[9/16] rounded-xl overflow-hidden shadow-xl bg-black">
          <video src={url} controls className="w-full h-full object-contain" />
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <Link href={`/projects/${projectId}`}>
          <Button variant="secondary" size="lg" className="gap-2">
            <Eye className="h-4 w-4" />
            View project
          </Button>
        </Link>
        <a href={url} download="graphic-motion.mp4">
          <Button size="lg" className="gap-2">
            Download
          </Button>
        </a>
        <Button variant="outline" size="lg" onClick={onReset}>
          Create another
        </Button>
      </div>
    </div>
  );
}

export function GraphicMotionWorkspace() {
  const [script, setScript] = useState("");
  const [format, setFormat] = useState<"reels" | "tiktok" | "horizontal" | "square">("reels");
  const [videoStyle, setVideoStyle] = useState("");
  const [globalTone, setGlobalTone] = useState("");
  const [fontFamily, setFontFamily] = useState("");
  const [highlightWords, setHighlightWords] = useState("");
  const [music, setMusic] = useState<MediaSettings["music"]>(undefined);
  const { credits, hasCredits, isLoading: creditsLoading } = useCredits();

  const [projectId, setProjectId] = useState<string | null>(null);

  const settingsForMusic = useMemo(() => makeSettingsForMusic(music), [music]);

  const createMutation = useMutation({
    mutationFn: (dto: CreateProjectDto) => projectsApi.createProject(dto),
    onSuccess: (project) => setProjectId(project.id),
  });

  const { data: project, isLoading: polling } = useQuery({
    queryKey: ["project", projectId],
    queryFn: () => projectsApi.getProject(projectId!),
    enabled: !!projectId,
    refetchInterval: (query) => {
      const p = query.state.data as Project | undefined;
      if (p?.status === "completed" || p?.status === "failed") return false;
      return 2000;
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!script.trim() || !hasCredits) return;
    const highlights = highlightWords
      .split(/[\s,]+/)
      .map((w) => w.trim())
      .filter(Boolean);
    const dto: CreateProjectDto = {
      tool_type: "kinetic-typography",
      script: script.trim(),
      credit_cost: 1,
      useGraphicMotionEngine: true,
      format,
      videoStyle: videoStyle || undefined,
      globalTone: globalTone || undefined,
      fontFamily: fontFamily || undefined,
      highlightWords: highlights.length > 0 ? highlights : undefined,
      music: music?.id ? { id: music.id, volume: music.volume ?? 0.5 } : undefined,
    };
    createMutation.mutate(dto);
    setProjectId(null);
  };

  const isProcessing =
    project?.status === "pending" ||
    project?.status === "rendering" ||
    project?.status === "processing";
  const isCompleted = project?.status === "completed" && project.output_url && projectId;
  const isFailed = project?.status === "failed";

  if (isCompleted && projectId) {
    return (
      <div className="flex flex-col h-full min-h-0 bg-background overflow-hidden">
        <div className="flex-1 min-h-0 overflow-y-auto p-6 lg:p-10">
          <div className="max-w-2xl mx-auto">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 rounded-full border border-emerald-500/20 mb-6">
                <Sparkles className="w-3 h-3 text-emerald-600" />
                <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-tighter">
                  Ready
                </span>
              </div>
              <h2 className="text-2xl lg:text-3xl font-bold text-foreground tracking-tight mb-2">
                Your graphic motion video is ready
              </h2>
              <p className="text-muted-foreground text-sm mb-8">
                Download or open the project to see details.
              </p>
              <GraphicMotionResultView
                projectId={projectId}
                onReset={() => setProjectId(null)}
              />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full min-h-0 bg-background overflow-hidden">
      <div className="flex flex-col flex-1 min-h-0">
        {/* Form: sticky header + scrollable body so all sections (music, font, highlights) are reachable */}
        <div className="flex-1 min-h-0 flex flex-col min-w-0 overflow-hidden bg-zinc-50/20 dark:bg-zinc-950/20">
          <div className="shrink-0 pt-6 pb-4 px-4 lg:px-8 border-b border-border/40">
            <div className="space-y-4 text-center max-w-4xl mx-auto">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full border border-primary/20">
                <Sparkles className="w-3 h-3 text-primary" />
                <span className="text-[10px] font-bold text-primary uppercase tracking-tighter">
                  Graphic Motion Engine
                </span>
              </div>
              <h2 className="text-2xl lg:text-3xl font-black text-foreground tracking-tight max-w-[520px] mx-auto leading-tight">
                Turn your script into <span className="text-primary">motion</span>.
              </h2>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                AI plans scenes, layout, and motion. Choose format and style below.
              </p>
            </div>
          </div>
          <form
            id="graphic-motion-form"
            onSubmit={handleSubmit}
            className="flex-1 min-h-0 flex flex-col min-w-0 overflow-hidden"
          >
            <div className="flex-1 min-h-0 overflow-y-auto scrollbar-saas px-4 lg:px-8 py-6 pb-4">
              <div className="flex flex-col space-y-8 max-w-4xl mx-auto">
              {isProcessing && (
              <Card className="bg-card border-border rounded-2xl overflow-hidden">
                <CardContent className="px-8 py-12">
                  <div className="flex flex-col items-center gap-4 text-center">
                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                    <div>
                      <p className="font-semibold text-foreground">
                        {project?.status === "rendering" || project?.status === "processing"
                          ? "Rendering your video…"
                          : "Queued…"}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        This may take a few minutes.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {isFailed && (
              <Card className="bg-destructive/5 border-destructive/20 rounded-2xl overflow-hidden">
                <CardContent className="px-8 py-6">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-foreground">Render failed</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {project?.error_message || "Something went wrong. Please try again."}
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-3"
                        onClick={() => setProjectId(null)}
                      >
                        Try again
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="space-y-8">
              <div className="group relative bg-white dark:bg-zinc-900 border border-border rounded-2xl p-6 lg:p-8 transition-all focus-within:ring-2 focus-within:ring-primary/10 focus-within:border-primary min-h-[200px]">
                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60 mb-4 px-1 block">
                  Script
                </label>
                <Textarea
                  value={script}
                  onChange={(e) => setScript(e.target.value)}
                  placeholder="Enter your text. Sentences become animated scenes with AI-driven layout and motion."
                  rows={5}
                  className="w-full resize-none text-base font-medium leading-relaxed bg-transparent border-none p-0 placeholder:text-muted-foreground/40 focus-visible:ring-0 min-h-[140px]"
                  required
                  disabled={createMutation.isPending || isProcessing}
                />
                <div className="flex justify-between mt-4 pt-4 border-t border-border/50 text-[10px] text-muted-foreground font-medium">
                  <span>{script.trim().split(/\s+/).filter(Boolean).length} words</span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3 pb-2 border-b border-border/40 px-1">
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60">
                    Format & style
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label htmlFor="format" className="text-xs font-medium text-foreground">
                      Format
                    </label>
                    <Select value={format} onValueChange={(v) => setFormat(v as typeof format)}>
                      <SelectTrigger
                        id="format"
                        className="h-10 rounded-xl border border-input bg-background px-3 text-sm font-medium focus:ring-2 focus:ring-primary/10 focus:border-primary hover:bg-muted/30 transition-colors"
                      >
                        <SelectValue placeholder="Select format" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border border-border bg-popover shadow-lg min-w-[var(--radix-select-trigger-width)]">
                        {FORMAT_OPTIONS.map((o) => (
                          <SelectItem
                            key={o.value}
                            value={o.value}
                            className="rounded-lg py-2.5 pr-8 text-sm cursor-pointer focus:bg-primary/5 focus:text-foreground data-[state=checked]:bg-primary/10 data-[state=checked]:text-primary"
                          >
                            {o.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="video-style" className="text-xs font-medium text-foreground">
                      Style (optional)
                    </label>
                    <Select value={videoStyle || "auto"} onValueChange={(v) => setVideoStyle(v === "auto" ? "" : v)}>
                      <SelectTrigger
                        id="video-style"
                        className="h-10 rounded-xl border border-input bg-background px-3 text-sm font-medium focus:ring-2 focus:ring-primary/10 focus:border-primary hover:bg-muted/30 transition-colors"
                      >
                        <SelectValue placeholder="Style" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border border-border bg-popover shadow-lg min-w-[var(--radix-select-trigger-width)]">
                        {VIDEO_STYLE_OPTIONS.map((o) => (
                          <SelectItem
                            key={o.value || "auto"}
                            value={o.value || "auto"}
                            className="rounded-lg py-2.5 pr-8 text-sm cursor-pointer focus:bg-primary/5 focus:text-foreground data-[state=checked]:bg-primary/10 data-[state=checked]:text-primary"
                          >
                            {o.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="tone" className="text-xs font-medium text-foreground">
                      Tone (optional)
                    </label>
                    <Select value={globalTone || "auto"} onValueChange={(v) => setGlobalTone(v === "auto" ? "" : v)}>
                      <SelectTrigger
                        id="tone"
                        className="h-10 rounded-xl border border-input bg-background px-3 text-sm font-medium focus:ring-2 focus:ring-primary/10 focus:border-primary hover:bg-muted/30 transition-colors"
                      >
                        <SelectValue placeholder="Tone" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border border-border bg-popover shadow-lg min-w-[var(--radix-select-trigger-width)]">
                        {TONE_OPTIONS.map((o) => (
                          <SelectItem
                            key={o.value || "auto"}
                            value={o.value || "auto"}
                            className="rounded-lg py-2.5 pr-8 text-sm cursor-pointer focus:bg-primary/5 focus:text-foreground data-[state=checked]:bg-primary/10 data-[state=checked]:text-primary"
                          >
                            {o.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3 pb-2 border-b border-border/40 px-1">
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60">
                    Background music
                  </span>
                </div>
                <MusicSelector
                  settings={settingsForMusic}
                  onUpdate={(u) => {
                    if ("music" in u) setMusic(u.music);
                  }}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="font" className="text-xs font-medium text-foreground">
                    Font (optional)
                  </label>
                  <Input
                    id="font"
                    value={fontFamily}
                    onChange={(e) => setFontFamily(e.target.value)}
                    placeholder="e.g. Inter, serif"
                    className="rounded-xl h-10"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="highlights" className="text-xs font-medium text-foreground">
                    Highlight words (optional, comma-separated)
                  </label>
                  <Input
                    id="highlights"
                    value={highlightWords}
                    onChange={(e) => setHighlightWords(e.target.value)}
                    placeholder="e.g. success, time, dream"
                    className="rounded-xl h-10"
                  />
                </div>
              </div>
              </div>
            </div>
            </div>

            {/* Sticky action bar: always visible so user can generate without scrolling */}
            <div className="shrink-0 border-t border-border/50 bg-background/95 backdrop-blur-sm px-4 lg:px-8 py-4">
              <div className="max-w-4xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <CreditCard className="w-3.5 h-3.5 text-primary" />
                  <span>
                    Credits: <strong className="text-foreground">{credits ?? 0}</strong>
                    <span className="ml-1">• 1 credit per video</span>
                  </span>
                </div>
                <Button
                  type="submit"
                  size="lg"
                  disabled={
                    createMutation.isPending ||
                    isProcessing ||
                    !script.trim() ||
                    !hasCredits ||
                    creditsLoading
                  }
                  className="w-full sm:w-auto min-w-[200px] gap-2"
                >
                  {createMutation.isPending || isProcessing ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {isProcessing ? "Rendering…" : "Creating…"}
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4" />
                      Generate video (1 credit)
                    </>
                  )}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
