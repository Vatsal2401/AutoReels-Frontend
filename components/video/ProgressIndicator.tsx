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
  const isFailed = video.status === "failed";
  const totalSteps = statusSteps.length - 1; // Exclude completed
  // Use a slightly weighted progress for better UX (more movement in early steps)
  const progressPercentage = currentStepIndex === -1 ? 0 : (currentStepIndex / totalSteps) * 100;

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Progress Header */}
      <div className="mb-8 text-center px-4">
        <div className={cn(
          "inline-flex items-center gap-2 px-3 py-1 rounded-full border mb-4 animate-fade-in",
          isFailed ? "bg-destructive/10 border-destructive/20" : "bg-primary/10 border-primary/20"
        )}>
             <div className={cn(
               "h-1.5 w-1.5 rounded-full",
               isFailed ? "bg-destructive" : "bg-primary animate-pulse"
             )} />
             <span className={cn(
               "text-xs font-bold uppercase tracking-wider",
               isFailed ? "text-destructive" : "text-primary"
             )}>
               {isFailed ? "Error Detected" : "AI Engine Active"}
             </span>
        </div>
        <h3 className="text-3xl font-extrabold text-foreground tracking-tight mb-2">
            {isFailed ? "Generation Failed" : isProcessing ? "Cinematic Synthesis" : statusMessages[video.status]}
        </h3>
        <p className={cn(
          "text-sm max-w-sm mx-auto",
          isFailed ? "text-destructive/80" : "text-muted-foreground"
        )}>
            {isFailed 
              ? (video.error_message || "An unexpected error occurred during generation. Please try again.")
              : "Our neural engine is orchestrating your visual story with high-fidelity assets."
            }
        </p>
      </div>

      <div className="relative mb-8">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-semibold text-muted-foreground">Overall Progress</span>
          <span className="text-sm font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">
            {Math.round(progressPercentage)}%
          </span>
        </div>
        
        {/* Progress Bar with Scanner Effect */}
        <div className="relative h-3 w-full bg-secondary/50 rounded-full overflow-hidden border border-border ring-1 ring-border">
          <div
            className={cn(
              "absolute top-0 left-0 h-full rounded-full transition-all duration-1000 ease-in-out",
              isFailed 
                ? "bg-gradient-to-r from-destructive via-red-500 to-destructive"
                : "bg-gradient-to-r from-primary via-blue-400 to-primary"
            )}
            style={{ width: `${progressPercentage}%` }}
          >
            {/* Gloss Effect */}
            <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent" />
          </div>
          
          {/* Scanner Overlay */}
          {isProcessing && (
            <div className="absolute inset-0 pointer-events-none">
                <div className="h-full w-24 bg-gradient-to-r from-transparent via-primary/30 to-transparent animate-scanner" />
            </div>
          )}
        </div>
        
        {/* Status Label */}
        <div className="mt-2 text-center h-5">
             <p className="text-xs text-primary font-medium italic animate-pulse">
                {isProcessing && `Current Node: ${statusMessages[video.status]}...`}
             </p>
        </div>
      </div>

      {/* Steps List (Staggered-like using logical grouping) */}
      <div className="relative">
        {/* Vertical Track Overlay */}
        <div className="absolute left-[19px] top-4 bottom-4 w-px bg-gradient-to-b from-primary/50 via-primary/20 to-transparent" />

        <div className="space-y-6">
            {statusSteps.slice(0, -1).map((step, index) => {
            const stepIndex = statusSteps.indexOf(step);
            const isCompleted = stepIndex < currentStepIndex;
            const isCurrent = stepIndex === currentStepIndex;
            const isPending = stepIndex > currentStepIndex;

            return (
                <div 
                    key={step} 
                    className={cn(
                        "relative flex items-center gap-6 transition-all duration-500",
                        isPending ? "opacity-50 grayscale" : "opacity-100"
                    )}
                >
                    {/* Ring Indicator */}
                    <div className="relative z-10 flex-shrink-0">
                        <div
                            className={cn(
                            "h-10 w-10 rounded-full flex items-center justify-center transition-all duration-500",
                            "border-2",
                            isCompleted && "bg-primary border-primary shadow-glow ring-4 ring-primary/20",
                            isCurrent && "bg-background border-primary shadow-pulse-glow animate-pulse-glow",
                            isPending && "bg-secondary border-border"
                            )}
                        >
                            {isCompleted ? (
                                <CheckCircle2 className="h-5 w-5 text-primary-foreground" />
                            ) : isCurrent ? (
                                <div className="h-2 w-2 rounded-full bg-primary animate-ping" />
                            ) : (
                                <div className="h-2 w-2 rounded-full bg-muted-foreground/30" />
                            )}
                        </div>
                    </div>

                    {/* Step Info */}
                    <div className="flex-1">
                        <div className="flex items-center justify-between">
                            <div>
                                <h4 className={cn(
                                    "text-sm font-bold uppercase tracking-widest transition-colors",
                                    isCurrent ? "text-primary" : "text-muted-foreground"
                                )}>
                                    {statusMessages[step]}
                                </h4>
                                <p className={cn(
                                    "text-xs mt-0.5",
                                    isCurrent ? "text-primary/70" : "text-muted-foreground/60"
                                )}>
                                    {isCompleted ? "Verification Successful" : isCurrent ? "Optimizing parameters..." : "Queueing resource..."}
                                </p>
                            </div>
                            
                            {isCurrent && (
                                <div className="flex items-center gap-2">
                                    <Loader2 size={12} className="text-primary animate-spin" />
                                    <span className="text-[10px] font-bold text-primary/80 uppercase">Processing</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            );
            })}
        </div>
      </div>

      {/* Footer Meta */}
      {isProcessing && (
        <div className="mt-8 p-6 rounded-2xl border border-border bg-card ring-1 ring-border/50 backdrop-blur-md flex flex-col sm:flex-row items-center justify-between gap-4">
           <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-secondary flex items-center justify-center border border-border">
                    <Loader2 size={14} className="text-muted-foreground animate-spin" />
                </div>
                <div>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase">Estimated Wait</p>
                    <p className="text-[11px] font-medium text-foreground">30-60 Seconds</p>
                </div>
           </div>
           <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter italic">
                Powered by Multi-Modal AI
           </p>
        </div>
      )}
    </div>
  );
}
