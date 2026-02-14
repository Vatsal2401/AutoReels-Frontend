"use client";

import React from "react";
import { cn } from "@/lib/utils/format";
import type { Project } from "@/lib/editor/types";
import { useSrtCaptions } from "@/lib/hooks/useSrtCaptions";
import { FileText, Lock, Loader2 } from "lucide-react";

function formatSeconds(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

interface AudioAndCaptionsTrackProps {
  project: Project;
}

export function AudioAndCaptionsTrack({ project }: AudioAndCaptionsTrackProps) {
  const hasAudio = !!project.audio?.url;
  const captionUrl = project.captionUrl ?? null;
  const { cues, isLoading: captionsLoading } = useSrtCaptions(captionUrl);
  const hasAnyTrack = hasAudio || !!captionUrl;

  return (
    <div className="flex flex-col h-full min-h-0 overflow-hidden">
      <div className="shrink-0 px-3 py-2 border-b border-[#e5e7eb] bg-[#fafbfc]">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          Timeline
        </span>
      </div>
      <div className="flex-1 min-h-0 overflow-auto p-3 space-y-4">
        {!hasAnyTrack ? (
          <p className="text-[12px] text-muted-foreground py-2">No audio or captions yet.</p>
        ) : (
          <>
        {/* Audio track */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <Lock className="h-3 w-3 text-muted-foreground shrink-0" />
            <span className="text-[12px] font-medium text-foreground">Audio</span>
          </div>
          {hasAudio ? (
            <div className="rounded-lg bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-2">
              <p className="text-[11px] font-medium text-emerald-800 truncate">
                Voiceover loaded
              </p>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                From project
              </p>
            </div>
          ) : (
            <p className="text-[11px] text-muted-foreground">No audio</p>
          )}
        </div>

        {/* Text/Captions track (from SRT) */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <FileText className="h-3 w-3 text-muted-foreground shrink-0" />
            <span className="text-[12px] font-medium text-foreground">
              Text / Captions
            </span>
          </div>
          {!captionUrl ? (
            <p className="text-[11px] text-muted-foreground">No SRT file</p>
          ) : captionsLoading ? (
            <div className="flex items-center gap-2 py-2 text-muted-foreground">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              <span className="text-[11px]">Loading captions…</span>
            </div>
          ) : cues.length === 0 ? (
            <p className="text-[11px] text-muted-foreground">No cues in SRT</p>
          ) : (
            <div className="space-y-1.5">
              {cues.map((cue) => (
                <div
                  key={cue.index}
                  className={cn(
                    "rounded-lg border px-2.5 py-2 min-h-[44px]",
                    "bg-primary/8 border-primary/30"
                  )}
                >
                  <p className="text-[10px] text-muted-foreground tabular-nums">
                    {formatSeconds(cue.startSeconds)} – {formatSeconds(cue.endSeconds)}
                  </p>
                  <p className="text-[12px] text-foreground mt-0.5 line-clamp-2">
                    {cue.text}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
          </>
        )}
      </div>
    </div>
  );
}
