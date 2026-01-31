"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils/format";

interface VideoPlayerProps {
  videoUrl: string;
  title?: string;
  className?: string;
}

export function VideoPlayer({ videoUrl, title, className }: VideoPlayerProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  return (
    <div className={cn("w-full h-full flex flex-col items-center justify-center", className)}>
      <div className="relative w-full h-full bg-black overflow-hidden flex items-center justify-center">
        {isLoading && !hasError && (
          <div 
            className="absolute inset-0 flex items-center justify-center z-10"
            role="status"
            aria-label="Loading video"
          >
            <Loader2 className="h-10 w-10 animate-spin text-white/20" />
          </div>
        )}
        {hasError ? (
          <div 
            className="absolute inset-0 flex items-center justify-center bg-destructive/10"
            role="alert"
            aria-label="Video failed to load"
          >
            <p className="text-destructive text-xs">Playback Error</p>
          </div>
        ) : (
          <video
            src={videoUrl}
            controls
            className="max-h-full max-w-full object-contain"
            onLoadedData={() => setIsLoading(false)}
            onError={() => {
              setIsLoading(false);
              setHasError(true);
            }}
            aria-label={title || "Video player"}
          >
            Your browser does not support the video tag.
          </video>
        )}
      </div>
    </div>
  );
}
