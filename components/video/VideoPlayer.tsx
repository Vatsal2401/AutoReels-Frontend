"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";

interface VideoPlayerProps {
  videoUrl: string;
  title?: string;
}

export function VideoPlayer({ videoUrl, title }: VideoPlayerProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  return (
    <div className="w-full">
      <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
        {isLoading && !hasError && (
          <div 
            className="absolute inset-0 flex items-center justify-center"
            role="status"
            aria-label="Loading video"
          >
            <Loader2 className="h-12 w-12 animate-spin text-white" />
          </div>
        )}
        {hasError ? (
          <div 
            className="absolute inset-0 flex items-center justify-center bg-destructive/10"
            role="alert"
            aria-label="Video failed to load"
          >
            <p className="text-destructive">Failed to load video. Please try again.</p>
          </div>
        ) : (
          <video
            src={videoUrl}
            controls
            className="w-full h-full"
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
      {title && (
        <p className="mt-2 text-sm text-muted-foreground" aria-label="Video title">
          {title}
        </p>
      )}
    </div>
  );
}
