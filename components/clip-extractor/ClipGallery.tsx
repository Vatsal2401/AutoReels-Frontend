"use client";

import { ClipCard } from "./ClipCard";
import type { ExtractedClip } from "@/lib/api/clip-extractor";
import { Loader2 } from "lucide-react";

interface ClipGalleryProps {
  clips: ExtractedClip[];
  jobId: string;
  isLoading?: boolean;
}

export function ClipGallery({ clips, jobId, isLoading }: ClipGalleryProps) {
  if (isLoading && clips.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-12 text-muted-foreground">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="text-sm">Extracting viral clips...</p>
      </div>
    );
  }

  if (clips.length === 0) {
    return null;
  }

  // Sort by viralScore descending (already sorted by API, but defensive)
  const sorted = [...clips].sort((a, b) => b.viralScore - a.viralScore);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">
          {sorted.length} Viral Clip{sorted.length !== 1 ? "s" : ""}
        </h2>
        <p className="text-xs text-muted-foreground">Sorted by virality score</p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {sorted.map((clip) => (
          <ClipCard key={clip.id} clip={clip} jobId={jobId} />
        ))}
      </div>
    </div>
  );
}
