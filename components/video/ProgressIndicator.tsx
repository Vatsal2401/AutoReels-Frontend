"use client";

import { Video, VideoStatus } from "@/lib/api/videos";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";

interface ProgressIndicatorProps {
  video: Video;
}

const statusMessages: Record<VideoStatus, string> = {
  pending: "Starting generation...",
  script_generating: "Generating script...",
  script_complete: "Creating audio...",
  processing: "Processing assets...",
  rendering: "Rendering video...",
  completed: "Your reel is ready!",
  failed: "Generation failed",
};

const statusSteps: VideoStatus[] = [
  "pending",
  "script_generating",
  "script_complete",
  "processing",
  "rendering",
  "completed",
];

export function ProgressIndicator({ video }: ProgressIndicatorProps) {
  const currentStepIndex = statusSteps.indexOf(video.status);
  const isProcessing = !["completed", "failed"].includes(video.status);
  const message = statusMessages[video.status];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-center gap-2">
        {isProcessing && <Loader2 className="h-5 w-5 animate-spin text-primary" />}
        <h3 className="text-lg font-semibold">{message}</h3>
      </div>

      <div className="space-y-2">
        {statusSteps.slice(0, -1).map((step, index) => {
          const stepIndex = statusSteps.indexOf(step);
          const isActive = stepIndex <= currentStepIndex;
          const isCurrent = stepIndex === currentStepIndex;

          return (
            <div key={step} className="flex items-center gap-3">
              <div
                className={`h-2 w-2 rounded-full ${
                  isActive ? "bg-primary" : "bg-muted"
                } ${isCurrent ? "animate-pulse" : ""}`}
              />
              <span
                className={`text-sm ${
                  isActive ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                {statusMessages[step]}
              </span>
            </div>
          );
        })}
      </div>

      <div className="flex justify-center">
        <Badge variant={video.status === "failed" ? "destructive" : "secondary"}>
          {video.status}
        </Badge>
      </div>

      {isProcessing && (
        <p className="text-center text-sm text-muted-foreground">
          This usually takes 30-60 seconds
        </p>
      )}
    </div>
  );
}
