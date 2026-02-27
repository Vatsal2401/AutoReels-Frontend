"use client";

import Link from "next/link";
import { Sparkles, Phone, ArrowRight, Film } from "lucide-react";
import { Button } from "@/components/ui/button";
import { VideoPlayer } from "@/components/video/VideoPlayer";
import { SharedProject } from "@/lib/api/projects";
import { cn } from "@/lib/utils/format";

// ─── Update this number to Niraj's WhatsApp ─────────────────────────────────
const NIRAJ_WHATSAPP = "https://wa.me/918866114821?text=Hi%20Niraj%2C%20I%20saw%20an%20AutoReels%20video%20and%20want%20to%20know%20more!";
// ────────────────────────────────────────────────────────────────────────────

function getTitle(project: SharedProject): string {
  const meta = project.metadata as { topic?: string; script?: string } | null;
  if (meta?.topic) return meta.topic;
  if (meta?.script && typeof meta.script === "string") {
    return meta.script.slice(0, 72) + (meta.script.length > 72 ? "…" : "");
  }
  return "AI-Generated Reel";
}

function getAspectClass(project: SharedProject): string {
  const meta = project.metadata as { format?: string; aspectRatio?: string } | null;
  if (project.tool_type === "text-to-image") {
    if (meta?.aspectRatio === "16:9") return "aspect-video";
    if (meta?.aspectRatio === "1:1") return "aspect-square";
    return "aspect-[9/16]";
  }
  if (meta?.format === "horizontal") return "aspect-video";
  if (meta?.format === "square") return "aspect-square";
  return "aspect-[9/16]";
}

interface Props {
  project: SharedProject;
}

export function SharedVideoView({ project }: Props) {
  const title = getTitle(project);
  const aspectClass = getAspectClass(project);
  const isImage = project.tool_type === "text-to-image";

  return (
    <div className="min-h-screen bg-background flex flex-col">

      {/* ── Top nav ─────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary/70">
              <Sparkles className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-sm font-bold tracking-tight text-foreground">AutoReels</span>
          </Link>
          <Link href="/signup">
            <Button size="sm" className="gap-1.5 text-xs h-8">
              Try for free
              <ArrowRight className="h-3 w-3" />
            </Button>
          </Link>
        </div>
      </header>

      {/* ── Main content ─────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col items-center gap-0">

        {/* Video section — full-width dark strip */}
        <div className="w-full bg-zinc-950 py-8 px-4 flex flex-col items-center">
          <div
            className={cn(
              "w-full max-w-sm rounded-2xl overflow-hidden shadow-2xl bg-black",
              aspectClass
            )}
          >
            {project.videoUrl ? (
              isImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={project.videoUrl}
                  alt={title}
                  className="w-full h-full object-contain"
                />
              ) : (
                <VideoPlayer videoUrl={project.videoUrl} title={title} />
              )
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center gap-3 text-white/30">
                <Film className="h-10 w-10" />
                <p className="text-sm">Video unavailable</p>
              </div>
            )}
          </div>
          {title && (
            <p className="mt-4 text-white/60 text-xs text-center max-w-sm line-clamp-2">
              {title}
            </p>
          )}
        </div>

        {/* CTA section */}
        <div className="w-full max-w-lg mx-auto px-6 py-10 flex flex-col items-center gap-8 text-center">

          {/* Headline */}
          <div className="flex flex-col gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground leading-tight">
              Make reels like this —{" "}
              <span className="text-primary">in minutes</span>
            </h1>
            <p className="text-muted-foreground text-sm leading-relaxed">
              AI writes the script, picks the music, and renders your reel.
              No editing skills. No camera. Just results.
            </p>
          </div>

          {/* Primary CTA */}
          <div className="flex flex-col items-center gap-3 w-full">
            <Link href="/signup" className="w-full max-w-xs">
              <Button size="lg" className="w-full h-12 text-sm font-semibold gap-2 shadow-lg">
                <Sparkles className="h-4 w-4" />
                Generate More Reels Like This
              </Button>
            </Link>
            <p className="text-[11px] text-muted-foreground/60">
              Free to start · No credit card required
            </p>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 w-full">
            <div className="flex-1 h-px bg-border" />
            <span className="text-[11px] text-muted-foreground/50 uppercase tracking-wider font-semibold">
              Want more?
            </span>
            <div className="flex-1 h-px bg-border" />
          </div>

          {/* Growth hack CTA — Niraj */}
          <div className="flex flex-col items-center gap-3 w-full">
            <div className="flex flex-col gap-1 text-center">
              <p className="text-sm font-semibold text-foreground">Scale your content with Niraj</p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Get a custom reel strategy, bulk generation, and dedicated support.
              </p>
            </div>
            <a href={NIRAJ_WHATSAPP} target="_blank" rel="noopener noreferrer" className="w-full max-w-xs">
              <Button
                variant="outline"
                size="lg"
                className="w-full h-11 text-sm font-semibold gap-2 border-emerald-500/40 text-emerald-700 hover:bg-emerald-500/5 hover:border-emerald-500"
              >
                <Phone className="h-4 w-4" />
                Call Niraj for more info
              </Button>
            </a>
          </div>

        </div>
      </main>

      {/* ── Footer ──────────────────────────────────────────────── */}
      <footer className="border-t border-border py-5 text-center">
        <p className="text-[11px] text-muted-foreground/50">
          Made with{" "}
          <Link href="/" className="underline underline-offset-2 hover:text-muted-foreground">
            AutoReels
          </Link>{" "}
          · AI-powered video generation
        </p>
      </footer>

    </div>
  );
}
