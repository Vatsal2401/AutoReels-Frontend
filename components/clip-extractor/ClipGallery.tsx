"use client";

import { ClipCard } from "./ClipCard";
import type { ExtractedClip } from "@/lib/api/clip-extractor";
import { Loader2, Flame } from "lucide-react";

interface ClipGalleryProps {
  clips: ExtractedClip[];
  jobId: string;
  isLoading?: boolean;
}

export function ClipGallery({ clips, jobId, isLoading }: ClipGalleryProps) {
  if (isLoading && clips.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-16 text-muted-foreground">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="text-sm">Extracting viral clips...</p>
      </div>
    );
  }

  if (clips.length === 0) return null;

  const sorted = [...clips].sort((a, b) => b.viralScore - a.viralScore);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Flame className="h-4 w-4 text-orange-500" />
        <h2 className="font-semibold">{sorted.length} Viral Clip{sorted.length !== 1 ? "s" : ""}</h2>
        <span className="text-xs text-muted-foreground">sorted by virality</span>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {sorted.map((clip) => (
          <ClipCard key={clip.id} clip={clip} jobId={jobId} />
        ))}
      </div>
    </div>
  );
}
