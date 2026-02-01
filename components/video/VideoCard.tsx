"use client";

import Link from "next/link";
import { Video, VideoStatus } from "@/lib/api/videos";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatRelativeTime } from "@/lib/utils/format";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/format";
import { Download, Play, AlertCircle, Loader2, Sparkles, RotateCcw, Clock, Eye, Maximize2, Layers } from "lucide-react";
import { DownloadButton } from "@/components/video/DownloadButton";

interface VideoCardProps {
  video: Video;
}

const statusConfig: Record<
  VideoStatus,
  { label: string; variant: string; color: string; description: string }
> = {
  pending: { label: "In Queue", variant: "secondary", color: "text-muted-foreground", description: "Warming up engines..." },
  script_generating: { label: "Writing", variant: "secondary", color: "text-amber-500", description: "Crafting script..." },
  script_complete: { label: "Directing", variant: "secondary", color: "text-blue-500", description: "Sourcing assets..." },
  processing: { label: "Creating", variant: "secondary", color: "text-indigo-500", description: "Baking visuals..." },
  rendering: { label: "Finishing", variant: "secondary", color: "text-primary", description: "Polishing reel..." },
  completed: { label: "Live", variant: "success", color: "text-emerald-500", description: "Ready to post" },
  failed: { label: "Stopped", variant: "destructive", color: "text-red-500", description: "Technical hitch" },
};

export function VideoCard({ video }: VideoCardProps) {
  const config = statusConfig[video.status];
  const isProcessing = [
    "pending",
    "script_generating",
    "script_complete",
    "processing",
    "rendering",
  ].includes(video.status);
  const isCompleted = video.status === "completed";
  const isFailed = video.status === "failed";

  const getProgress = (status: VideoStatus) => {
    switch (status) {
      case "pending": return 15;
      case "script_generating": return 35;
      case "script_complete": return 55;
      case "processing": return 80;
      case "rendering": return 95;
      default: return 0;
    }
  };

  return (
    <Card
      className={cn(
        "group relative overflow-hidden transition-all duration-300 border-border/60 bg-card hover:border-border hover:shadow-lg",
        "flex flex-col h-full",
        isFailed && "border-destructive/20 bg-destructive/[0.02]"
      )}
    >
      {/* Visual Area - Locked 16:9 */}
      <div className="relative aspect-video overflow-hidden bg-secondary/20 border-b border-border/40">
        {!isCompleted && !isFailed && (
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(var(--primary-rgb),0.05)_0%,transparent_70%)]" />
        )}
        
        {/* Discrete Status Badge */}
        <div className="absolute top-3 left-3 z-20">
          <div className={cn(
            "px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider backdrop-blur-sm border border-transparent shadow-sm",
            isProcessing ? "bg-background/80 text-primary border-primary/20" : 
            isCompleted ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" :
            isFailed ? "bg-destructive/10 text-destructive border-destructive/20" :
            "bg-secondary/80 text-muted-foreground border-border"
          )}>
            {isFailed ? "Needs Attention" : config.label}
          </div>
        </div>

        {/* Thumbnail Content */}
        <div className="absolute inset-0 flex items-center justify-center p-6">
          {isProcessing ? (
            <div className="w-full max-w-[120px] space-y-3">
               <div className="flex items-center justify-center gap-2">
                 <Loader2 className="w-3 h-3 animate-spin text-primary" />
                 <span className="text-[9px] font-medium text-muted-foreground uppercase tracking-widest">{config.description}</span>
               </div>
               <div className="h-0.5 w-full bg-secondary rounded-full overflow-hidden">
                 <div 
                   className="h-full bg-primary transition-all duration-1000 ease-in-out"
                   style={{ width: `${getProgress(video.status)}%` }}
                 />
               </div>
            </div>
          ) : isCompleted ? (
            <div className="relative z-10 w-10 h-10 rounded-full bg-white/90 shadow-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 scale-90 group-hover:scale-100">
               <Play className="w-4 h-4 text-foreground ml-0.5" />
            </div>
          ) : isFailed ? (
            <div className="flex flex-col items-center justify-center opacity-40">
               <Layers className="w-8 h-8 text-muted-foreground mb-2" />
            </div>
          ) : null}
        </div>

        {/* Action Overlay */}
        {isCompleted && (
          <Link href={`/videos/${video.id}`} className="absolute inset-0 z-30 flex items-center justify-center bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        )}
      </div>

      {/* Info Content */}
      <div className="p-4 flex flex-col flex-1 gap-3">
        <div className="space-y-1.5 flex-1 min-h-0">
          <div className="flex items-start justify-between gap-4">
             <h3 className="text-sm font-semibold text-foreground leading-snug line-clamp-2 group-hover:text-primary transition-colors">
               {video.topic}
             </h3>
          </div>
          
          {/* Metadata Row */}
          <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-medium">
             <span>{video.metadata?.imageAspectRatio || "9:16"}</span>
             <span className="w-0.5 h-0.5 rounded-full bg-border" />
             <span>{video.metadata?.duration || "60s"}</span>
             <span className="w-0.5 h-0.5 rounded-full bg-border" />
             <span>{formatRelativeTime(video.created_at)}</span>
          </div>
        </div>

        {/* Error Message (Below Thumbnail) */}
        {isFailed && (video.error_message) && (
           <div className="px-3 py-2 bg-destructive/5 border border-destructive/10 rounded-md">
              <p className="text-[10px] text-destructive/80 leading-relaxed font-medium line-clamp-2">
                 {video.error_message}
              </p>
           </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-3 mt-auto border-t border-border/40">
           {isCompleted ? (
             <div className="flex w-full items-center justify-between gap-2">
               <DownloadButton 
                  videoId={video.id} 
                  topic={video.topic || 'video'}
                  variant="ghost" 
                  size="sm"
                  className="h-7 text-[10px] font-medium text-muted-foreground hover:text-foreground px-0 hover:bg-transparent"
               >
                 Download
               </DownloadButton>
               
               <Link href={`/videos/${video.id}`} className="flex-1 flex justify-end">
                  <span className="text-[10px] font-bold text-primary group-hover:underline underline-offset-4 decoration-primary/30">
                    View Details
                  </span>
               </Link>
             </div>
           ) : isFailed ? (
             <div className="flex w-full items-center justify-end">
               <Link href={`/create?videoId=${video.id}&topic=${encodeURIComponent(video.topic)}`}>
                 <Button variant="outline" size="sm" className="h-7 border-destructive/20 text-destructive/80 hover:text-destructive hover:bg-destructive/5 hover:border-destructive/30 text-[10px] font-bold shadow-none">
                   <RotateCcw className="w-3 h-3 mr-1.5" />
                   Retry
                 </Button>
               </Link>
             </div>
           ) : (
             <div className="w-full flex justify-end">
               <span className="text-[10px] font-medium text-muted-foreground/50 italic">
                 Processing...
               </span>
             </div>
           )}
        </div>
      </div>
    </Card>
  );
}
