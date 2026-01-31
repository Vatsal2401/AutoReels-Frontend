"use client";

import Link from "next/link";
import { Video, VideoStatus } from "@/lib/api/videos";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatRelativeTime } from "@/lib/utils/format";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/format";
import { Download, Play, AlertCircle, Loader2, Sparkles, RotateCcw, Clock, Eye, Maximize2, Layers } from "lucide-react";

interface VideoCardProps {
  video: Video;
}

const statusConfig: Record<
  VideoStatus,
  { label: string; variant: string; color: string; description: string }
> = {
  pending: { label: "In Queue", variant: "secondary", color: "text-zinc-500", description: "Warming up engines..." },
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
        "group relative overflow-hidden transition-all duration-500 border-white/5 bg-zinc-900/10 backdrop-blur-xl hover:border-white/10",
        "flex flex-col h-full hover:shadow-2xl",
        isFailed && "border-red-500/10 bg-red-500/[0.01]"
      )}
    >
      {/* Visual Area - Locked 16:9 */}
      <div className="relative aspect-video overflow-hidden bg-black/60">
        {!isCompleted && !isFailed && (
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(124,58,237,0.03)_0%,transparent_80%)]" />
        )}
        
        {/* Discrete Status Badge */}
        <div className="absolute top-4 left-4 z-20">
          <div className={cn(
            "px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-[0.25em] shadow-lg",
            isProcessing ? "bg-primary/90 text-white" : 
            isCompleted ? "bg-emerald-500/80 text-black" :
            "bg-zinc-800 text-zinc-500"
          )}>
            {config.label}
          </div>
        </div>

        {/* Content Display */}
        <div className="absolute inset-0 flex items-center justify-center p-6">
          {isProcessing ? (
            <div className="w-full max-w-[140px] space-y-3">
              <div className="flex items-center justify-between gap-3">
                 <p className="text-[8px] font-black text-zinc-600 uppercase tracking-[0.2em] truncate">{config.description}</p>
                 <Loader2 className="w-2.5 h-2.5 animate-spin text-primary/40" />
              </div>
              <div className="h-[1px] w-full bg-white/5 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary/40 transition-all duration-700 ease-in-out"
                  style={{ width: `${getProgress(video.status)}%` }}
                />
              </div>
            </div>
          ) : isCompleted ? (
            <div className="relative z-10 w-11 h-11 rounded-full bg-zinc-200 text-black flex items-center justify-center shadow-2xl opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-2 group-hover:translate-y-0">
               <Play className="w-4 h-4 fill-black ml-0.5" />
            </div>
          ) : isFailed ? (
            <div className="flex flex-col items-center gap-2 px-6 text-center">
               <AlertCircle className="w-5 h-5 text-red-500" />
               <p className="text-[10px] font-semibold text-red-400 line-clamp-2 tracking-tight leading-relaxed">
                  {video.error_message || "Generation timeout"}
               </p>
            </div>
          ) : null}
        </div>

        {/* Action Overlay */}
        {isCompleted && (
          <Link href={`/videos/${video.id}`} className="absolute inset-0 z-30 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-all duration-300">
             <div className="bg-zinc-900/80 backdrop-blur-md px-4 py-2 rounded-xl border border-white/5 text-[9px] font-black text-zinc-300 uppercase tracking-[0.3em] mb-[-40px] group-hover:mb-0 transition-all duration-500 delay-75 shadow-2xl">
                Enter Studio
             </div>
          </Link>
        )}
      </div>

      {/* Info Cluster - Dense Alignment */}
      <div className="p-4 flex flex-col flex-1 gap-4">
        <div className="space-y-2.5">
          <h3 className="text-[13px] font-bold text-zinc-300 line-clamp-1 group-hover:text-zinc-100 transition-colors tracking-tight">
            {video.topic}
          </h3>
          
          <div className="flex items-center gap-2 flex-wrap">
             <div className="inline-flex items-center px-1.5 py-0.5 rounded-md bg-zinc-800/20 text-[8px] font-black text-zinc-600 uppercase tracking-widest border border-white/5">
                {video.metadata?.imageAspectRatio || "9:16"}
             </div>
             <div className="inline-flex items-center px-1.5 py-0.5 rounded-md bg-zinc-800/20 text-[8px] font-black text-zinc-600 uppercase tracking-widest border border-white/5">
                {video.metadata?.duration || "60s"}
             </div>
             <div className="h-3 w-px bg-white/5 mx-0.5" />
             <span className="text-[9px] font-medium text-zinc-600 uppercase tracking-widest">
               {formatRelativeTime(video.created_at)}
             </span>
          </div>
        </div>

        <div className="flex items-center justify-between gap-2 border-t border-white/5 pt-4">
           <div className="flex gap-1.5">
              {isCompleted && (
                <Button 
                   variant="ghost" 
                   className="h-8 w-8 p-0 rounded-lg hover:bg-zinc-800/40 text-zinc-600 hover:text-zinc-300 transition-all"
                   onClick={(e) => {
                     e.preventDefault();
                     if (video.final_video_url) window.open(video.final_video_url, "_blank");
                   }}
                >
                   <Download className="w-4 h-4" />
                </Button>
              )}
           </div>
           
           <div className="min-w-0">
             {isFailed ? (
               <Link href={`/create?topic=${encodeURIComponent(video.topic)}`}>
                 <Button variant="ghost" size="sm" className="h-8 text-red-500/60 hover:text-red-500 hover:bg-red-500/5 text-[9px] font-black uppercase tracking-[0.2em] gap-2 px-3 rounded-lg">
                   <RotateCcw className="w-3 h-3" />
                   Rescue
                 </Button>
               </Link>
             ) : isProcessing ? (
               <div className="text-[8px] font-black text-primary/30 uppercase tracking-[0.3em] pr-2">Processing...</div>
             ) : (
                <Link href={`/videos/${video.id}`}>
                  <Button variant="ghost" size="sm" className="h-8 hover:bg-zinc-800/40 text-zinc-500 hover:text-zinc-200 text-[9px] font-black uppercase tracking-[0.2em] px-3 rounded-lg group/btn transition-all">
                    Details
                    <Maximize2 className="w-3 h-3 ml-2 opacity-0 group-hover/btn:opacity-40 transition-all translate-x-1 group-hover:translate-x-0" />
                  </Button>
                </Link>
             )}
           </div>
        </div>
      </div>
    </Card>
  );
}
