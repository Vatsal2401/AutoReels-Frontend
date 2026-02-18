"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { textToImageApi } from "@/lib/api/text-to-image";
import { Loader2, ImageIcon, Download, Sparkles, Zap, Star, RefreshCw, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils/format";

type AspectRatio = "9:16" | "16:9" | "1:1";
type Model = "standard" | "fast";

const ASPECT_RATIOS: { value: AspectRatio; label: string; sub: string; w: number; h: number }[] = [
  { value: "9:16", label: "9:16", sub: "Portrait", w: 9, h: 16 },
  { value: "16:9", label: "16:9", sub: "Landscape", w: 16, h: 9 },
  { value: "1:1",  label: "1:1",  sub: "Square",    w: 1,  h: 1  },
];

const MODELS: { value: Model; label: string; sub: string; badge: string; icon: typeof Sparkles }[] = [
  { value: "standard", label: "Imagen 4",      sub: "Best quality",  badge: "Quality", icon: Star },
  { value: "fast",     label: "Imagen 4 Fast", sub: "2× faster",     badge: "Speed",   icon: Zap  },
];

function AspectPreview({ w, h, active }: { w: number; h: number; active: boolean }) {
  const MAX = 28;
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

export function TextToImageWorkspace() {
  const [prompt, setPrompt] = useState("");
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>("9:16");
  const [model, setModel] = useState<Model>("standard");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{ projectId: string; imageUrl: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const promptRef = useRef<HTMLTextAreaElement>(null);

  async function handleGenerate() {
    if (!prompt.trim()) { setError("Please enter a prompt."); return; }
    setIsLoading(true);
    setError(null);
    setResult(null);
    try {
      const data = await textToImageApi.generate({ prompt, aspectRatio, model });
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
    setTimeout(() => promptRef.current?.focus(), 50);
  }

  const charCount = prompt.length;

  return (
    <div className="flex h-full min-h-0 w-full gap-0">

      {/* ── Left panel: Form ─────────────────────────────────────── */}
      <div className="flex flex-col w-full max-w-[460px] flex-shrink-0 border-r border-border bg-background overflow-y-auto">
        <div className="flex flex-col gap-7 p-6 lg:p-8">

          {/* Header */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10">
                <ImageIcon className="h-4 w-4 text-primary" />
              </div>
              <h1 className="text-base font-semibold text-foreground tracking-tight">AI Image Generator</h1>
            </div>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed pl-10">
              Describe an image and generate it instantly with Google Imagen 4.
            </p>
          </div>

          {/* Prompt */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Prompt
              </label>
              <span className={cn("text-xs tabular-nums", charCount > 800 ? "text-destructive" : "text-muted-foreground/50")}>
                {charCount}/1000
              </span>
            </div>
            <Textarea
              ref={promptRef}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="A cinematic photo of a futuristic city at night, neon lights reflecting on rain-soaked streets, 8K, hyper-realistic..."
              className="min-h-[140px] resize-none text-sm leading-relaxed bg-muted/30 border-border/60 focus:border-primary/60 rounded-xl"
              disabled={isLoading}
              maxLength={1000}
            />
          </div>

          {/* Model */}
          <div className="flex flex-col gap-3">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Model
            </label>
            <div className="grid grid-cols-2 gap-2">
              {MODELS.map((m) => {
                const Icon = m.icon;
                const active = model === m.value;
                return (
                  <button
                    key={m.value}
                    onClick={() => setModel(m.value)}
                    disabled={isLoading}
                    className={cn(
                      "relative flex flex-col items-start gap-1.5 rounded-xl border p-4 text-left transition-all duration-150",
                      active
                        ? "border-primary bg-primary/5 shadow-sm"
                        : "border-border bg-background hover:border-primary/40 hover:bg-muted/30"
                    )}
                  >
                    <div className="flex items-center gap-2 w-full">
                      <Icon className={cn("h-4 w-4", active ? "text-primary" : "text-muted-foreground")} />
                      <span className={cn("text-sm font-semibold", active ? "text-foreground" : "text-muted-foreground")}>
                        {m.label}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground">{m.sub}</span>
                    {active && (
                      <div className="absolute top-2.5 right-2.5 w-1.5 h-1.5 rounded-full bg-primary" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Aspect Ratio */}
          <div className="flex flex-col gap-3">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Aspect Ratio
            </label>
            <div className="grid grid-cols-3 gap-2">
              {ASPECT_RATIOS.map((ar) => {
                const active = aspectRatio === ar.value;
                return (
                  <button
                    key={ar.value}
                    onClick={() => setAspectRatio(ar.value)}
                    disabled={isLoading}
                    className={cn(
                      "flex flex-col items-center gap-2.5 rounded-xl border p-4 transition-all duration-150",
                      active
                        ? "border-primary bg-primary/5 shadow-sm"
                        : "border-border bg-background hover:border-primary/40 hover:bg-muted/30"
                    )}
                  >
                    <AspectPreview w={ar.w} h={ar.h} active={active} />
                    <div className="flex flex-col items-center gap-0.5">
                      <span className={cn("text-sm font-semibold leading-none", active ? "text-foreground" : "text-muted-foreground")}>
                        {ar.label}
                      </span>
                      <span className="text-[10px] text-muted-foreground/70">{ar.sub}</span>
                    </div>
                  </button>
                );
              })}
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
              disabled={isLoading || !prompt.trim()}
              className="w-full h-11 text-sm font-semibold gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generating…
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Generate Image
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
        {result ? (
          <div className="flex flex-col h-full min-h-0">
            {/* Image area */}
            <div className="flex-1 flex items-center justify-center p-8 min-h-0 overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={result.imageUrl}
                alt="Generated image"
                className="max-h-full max-w-full rounded-2xl shadow-2xl object-contain"
              />
            </div>
            {/* Toolbar */}
            <div className="flex items-center justify-between px-8 py-4 border-t border-border bg-background/80 backdrop-blur-sm shrink-0">
              <span className="text-xs text-muted-foreground">
                {MODELS.find(m => m.value === model)?.label} · {aspectRatio}
              </span>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={handleReset} className="gap-1.5 h-8 text-xs">
                  <RefreshCw className="h-3 w-3" />
                  Regenerate
                </Button>
                <a href={result.imageUrl} download="generated-image.jpg" target="_blank" rel="noopener noreferrer">
                  <Button size="sm" className="gap-1.5 h-8 text-xs">
                    <Download className="h-3 w-3" />
                    Download
                  </Button>
                </a>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center gap-5 p-8">
            {isLoading ? (
              <div className="flex flex-col items-center gap-5">
                <div className="relative w-20 h-20 flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full border-4 border-primary/20 animate-ping" />
                  <div className="absolute inset-2 rounded-full border-4 border-primary/30" />
                  <Loader2 className="h-8 w-8 text-primary animate-spin relative z-10" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-foreground">Generating your image…</p>
                  <p className="text-xs text-muted-foreground mt-1">This usually takes 10–20 seconds</p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-4 text-center max-w-xs">
                <div className="w-20 h-20 rounded-2xl bg-muted/60 border-2 border-dashed border-border flex items-center justify-center">
                  <ImageIcon className="h-8 w-8 text-muted-foreground/40" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Your image will appear here</p>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                    Enter a prompt on the left and click <span className="font-medium text-foreground">Generate Image</span> to get started.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

    </div>
  );
}
