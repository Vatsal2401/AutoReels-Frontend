"use client";

import { Video, VideoStatus } from "@/lib/api/videos";
import { Loader2, CheckCircle2, Circle } from "lucide-react";
import { cn } from "@/lib/utils/format";

interface ProgressIndicatorProps {
  video: Video;
}

const statusMessages: Record<VideoStatus, string> = {
  pending: "Starting generation",
  script_generating: "Generating script",
  script_complete: "Creating audio",
  processing: "Processing assets",
  rendering: "Rendering video",
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
  const totalSteps = statusSteps.length - 1; // Exclude completed
  const progressPercentage = (currentStepIndex / totalSteps) * 100;

  return (
    <div className="w-full">
      {/* Progress Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-foreground">
            Generating Your Reel
          </h3>
          <span className="text-sm font-medium text-primary">
            {Math.round(progressPercentage)}%
          </span>
        </div>
        
        {/* Progress Bar */}
        <div className="relative h-2.5 w-full bg-muted rounded-full overflow-hidden">
          <div
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-primary via-primary/90 to-primary rounded-full transition-all duration-700 ease-out shadow-sm shadow-primary/20"
            style={{ width: `${progressPercentage}%` }}
          >
            {isProcessing && (
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse" />
            )}
          </div>
        </div>
      </div>

      {/* Steps List */}
      <div className="space-y-6">
        {statusSteps.slice(0, -1).map((step, index) => {
          const stepIndex = statusSteps.indexOf(step);
          const isCompleted = stepIndex < currentStepIndex;
          const isCurrent = stepIndex === currentStepIndex;
          const isPending = stepIndex > currentStepIndex;

          return (
            <div key={step} className="relative">
              <div className="flex items-start gap-4">
                {/* Step Icon */}
                <div className="relative flex-shrink-0">
                  <div
                    className={cn(
                      "h-10 w-10 rounded-full flex items-center justify-center border-2 transition-all duration-300",
                      isCompleted &&
                        "bg-primary border-primary shadow-lg shadow-primary/20",
                      isCurrent &&
                        "bg-primary/10 border-primary shadow-md shadow-primary/10",
                      isPending && "bg-background border-muted-foreground/30"
                    )}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="h-5 w-5 text-primary-foreground" />
                    ) : isCurrent ? (
                      <Loader2 className="h-5 w-5 text-primary animate-spin" />
                    ) : (
                      <Circle className="h-5 w-5 text-muted-foreground fill-background" />
                    )}
                  </div>
                  
                  {/* Connecting Line */}
                  {index < statusSteps.length - 2 && (
                    <div
                      className={cn(
                        "absolute top-10 left-1/2 -translate-x-1/2 w-0.5 transition-all duration-500",
                        isCompleted
                          ? "bg-primary h-12"
                          : "bg-muted-foreground/20 h-12"
                      )}
                    />
                  )}
                </div>

                {/* Step Content */}
                <div className="flex-1 pt-1.5 min-w-0">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1">
                      <p
                        className={cn(
                          "text-base font-medium transition-colors duration-200",
                          isCompleted && "text-foreground",
                          isCurrent && "text-primary",
                          isPending && "text-muted-foreground"
                        )}
                      >
                        {statusMessages[step]}
                      </p>
                      {isCurrent && (
                        <p className="text-sm text-muted-foreground mt-1">
                          This step is in progress...
                        </p>
                      )}
                      {isCompleted && (
                        <p className="text-sm text-muted-foreground mt-1">
                          Completed
                        </p>
                      )}
                    </div>
                    
                    {/* Status Badge */}
                    {isCurrent && (
                      <div className="flex-shrink-0">
                        <div className="px-3 py-1 rounded-full bg-primary/10 border border-primary/20">
                          <span className="text-xs font-medium text-primary">
                            Active
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Info */}
      {isProcessing && (
        <div className="mt-8 pt-6 border-t border-border/50">
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Estimated completion: 30-60 seconds</span>
          </div>
        </div>
      )}
    </div>
  );
}
