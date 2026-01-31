"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";
import { videosApi, CreateVideoDto } from "@/lib/api/videos";
import { useCredits } from "@/lib/hooks/useCredits";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { GenerationProgress } from "./GenerationProgress";
import { VisualStyleSelector } from "../media-settings/VisualStyleSelector";
// import { AdvancedControls } from "../media-settings/AdvancedControls";
import { FormatSelector } from "../media-settings/FormatSelector";
import { NarrationSettings } from "../media-settings/NarrationSettings";
import { DurationSelector } from "../media-settings/DurationSelector";
import { MediaSettings } from "../media-settings/types";
import { getFullPrompt } from "../media-settings/styles";
import Link from "next/link";
import { AlertCircle, Sparkles, Zap, CreditCard, Info, Eye } from "lucide-react";
import { cn } from "@/lib/utils/format";

const DURATION_MAPPING = {
  'Short': '30-60',
  'Medium': '60-90',
  'Long': '90-120'
};

// Helper to map backend status to frontend visualization steps
const getStepFromStatus = (status: string) => {
  switch (status) {
    case 'pending': return 'start';
    case 'script_generating': return 'script';
    case 'script_complete': return 'audio';
    case 'processing': return 'assets';
    case 'rendering': return 'render';
    case 'completed': return 'done';
    default: return 'start';
  }
};

const getProgressFromStatus = (status: string) => {
  switch (status) {
    case 'pending': return 5;
    case 'script_generating': return 25;
    case 'script_complete': return 45;
    case 'processing': return 70;
    case 'rendering': return 90;
    case 'completed': return 100;
    default: return 0;
  }
};

export function CreateVideoForm() {
  const router = useRouter();
  const [topic, setTopic] = useState("");
  const { credits, hasCredits, isLoading: creditsLoading } = useCredits();
  const [activeVideoId, setActiveVideoId] = useState<string | null>(null);

  const [settings, setSettings] = useState<MediaSettings>({
      visualStyleId: 'cinematic',
      aspectRatio: '9:16',
      voiceId: '21m00Tcm4TlvDq8ikWAM', // Rachel
      language: 'English (US)',
      duration: 'Short',
      imageProvider: 'gemini',
      advancedOptions: {
        styleStrength: 'medium',
        lighting: 'none',
        colorTone: 'none',
        cameraFraming: 'none'
      }
  });

  const handleUpdate = (updates: Partial<MediaSettings>) => {
      setSettings(prev => ({ ...prev, ...updates }));
  };

  const createMutation = useMutation({
    mutationFn: videosApi.createVideo,
    onSuccess: (data) => {
      // Don't redirect, just start tracking
      setActiveVideoId(data.video_id);
    },
  });

  // Poll for status if we have an active video
  const { data: videoStatus } = useQuery({
    queryKey: ['video-status', activeVideoId],
    queryFn: () => videosApi.getVideo(activeVideoId!),
    enabled: !!activeVideoId && activeVideoId !== '',
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      return status === 'completed' || status === 'failed' ? false : 2000;
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;
    if (!hasCredits) {
      return;
    }

    setActiveVideoId(null); // Reset for new generation

    const payload: CreateVideoDto = {
      topic: topic.trim(),
      language: settings.language,
      duration: DURATION_MAPPING[settings.duration],
      imageStyle: getFullPrompt(settings.visualStyleId, settings.advancedOptions),
      imageAspectRatio: settings.aspectRatio,
      voiceId: settings.voiceId,
      imageProvider: 'gemini'
    };

    createMutation.mutate(payload);
  };

  const currentStatus = videoStatus?.status || (createMutation.isPending ? 'pending' : 'idle');
  const isCompleted = currentStatus === 'completed';
  const isFailed = currentStatus === 'failed';
  const errorMessage = videoStatus?.error_message;

  return (
    <div className="flex flex-col h-full bg-background rounded-xl border border-border overflow-hidden shadow-sm">
      {/* Form Area - Split Pane */}
      <div className="flex flex-1 h-full overflow-hidden">
          
          {/* LEFT: Composition Studio (Scrollable Input Area) */}
           <div className="flex-1 min-w-0 h-full overflow-y-auto scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent bg-background">
              <div className="flex flex-col items-center justify-center min-h-full py-12 px-6 space-y-8 w-full max-w-3xl mx-auto">
                  
                  {/* 1. Prompt Input */}
                  <div className="w-full space-y-2">
                     <div className="group relative bg-card border border-border rounded-xl p-4 transition-all duration-300 hover:border-primary/50 hover:shadow-md focus-within:ring-1 focus-within:ring-primary focus-within:border-primary focus-within:bg-card">
                       <Textarea
                         id="topic"
                         value={topic}
                         onChange={(e) => setTopic(e.target.value)}
                         placeholder="What story do you want to tell today?"
                         rows={2}
                         maxLength={500}
                         className="w-full resize-none text-lg font-medium leading-relaxed bg-transparent border-none p-0 placeholder:text-muted-foreground focus-visible:ring-0 focus-visible:ring-offset-0 min-h-[60px] text-foreground"
                         required
                         disabled={createMutation.isPending || (!!activeVideoId && !isCompleted) || !hasCredits}
                       />
                       
                       <div className="flex items-center justify-between mt-2 pt-2 border-t border-border">
                         <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-bold uppercase tracking-wider group-focus-within:text-primary transition-colors">
                            <Sparkles className="w-3 h-3" />
                            <span>AI Script</span>
                         </div>
                         <span className={cn("text-[10px] font-mono transition-colors font-medium", topic.length > 450 ? "text-destructive" : "text-muted-foreground group-hover:text-foreground")}>
                           {topic.length}/500
                         </span>
                       </div>
                     </div>
                  </div>
 
                  <div className="h-px w-full max-w-xl bg-gradient-to-r from-transparent via-border to-transparent" />

                 {/* 2. Visual Style (Dominant) */}
                 <div className="space-y-4">
                    <VisualStyleSelector settings={settings} onUpdate={handleUpdate} />
                 </div>

                 {/* 3. Configuration Grid (Spacious Layout) */}
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-10 pt-6">
                    {/* Column 1: Format */}
                    <div className="space-y-4">
                       <div className="flex items-center gap-2 pb-1 border-b border-border/50">
                          <span className="text-[11px] font-bold uppercase tracking-widest text-foreground">Format</span>
                          <Info className="w-3 h-3 text-muted-foreground/50" />
                       </div>
                       <FormatSelector settings={settings} onUpdate={handleUpdate} />
                    </div>

                    {/* Column 2: Audio */}
                    <div className="space-y-4">
                       <div className="flex items-center gap-2 pb-1 border-b border-border/50">
                          <span className="text-[11px] font-bold uppercase tracking-widest text-foreground">Audio</span>
                       </div>
                       <NarrationSettings settings={settings} onUpdate={handleUpdate} />
                    </div>
                       
                    {/* Column 3: Duration */}
                    <div className="space-y-4">
                       <div className="flex items-center gap-2 pb-1 border-b border-border/50">
                          <span className="text-[11px] font-bold uppercase tracking-widest text-foreground">Duration</span>
                       </div>
                       <DurationSelector settings={settings} onUpdate={handleUpdate} />
                    </div>
                 </div>
             </div>
          </div>

          {/* RIGHT: Live Preview / Status Panel (Fixed Side) */}
          <div className="w-[480px] shrink-0 border-l border-border bg-secondary relative h-full overflow-hidden">
             <div className="absolute inset-0 overflow-y-auto scrollbar-none pb-48">
               <div className="p-8">
                 <GenerationProgress 
                    status={activeVideoId ? (isFailed ? 'error' : isCompleted ? 'completed' : 'generating') : 'idle'} 
                    progress={activeVideoId ? getProgressFromStatus(currentStatus) : 0}
                    currentStep={activeVideoId ? getStepFromStatus(currentStatus) : 'start'}
                 />
                 
                 {isFailed && errorMessage && (
                   <div className="mt-4 p-4 rounded-lg bg-destructive/10 border border-destructive/20">
                     <p className="text-sm text-destructive font-medium">Generation Failed</p>
                     <p className="text-xs text-destructive/70 mt-1">{errorMessage}</p>
                   </div>
                 )}
             </div>

             </div>
 
             {/* Action Bar within Right Panel or Sticky Bottom */}
             <div className="absolute bottom-0 left-0 right-0 p-8 border-t border-border bg-card z-10 transition-all duration-300 shadow-[0_-5px_20px_rgba(0,0,0,0.05)]">
                <div className="space-y-5">
                    
                    <div className="flex items-center justify-between text-xs">
                       <div className="flex items-center gap-2 text-muted-foreground font-medium">
                           <CreditCard className="w-3.5 h-3.5 text-primary" />
                           <span>Available: <strong className="text-foreground">{credits ?? 0}</strong></span>
                       </div>

                       <div className="flex items-center gap-1.5 font-bold text-amber-600 dark:text-amber-500">
                          <Zap className="w-3 h-3 fill-current" />
                          <span>1 Credit Cost</span>
                       </div>
                    </div>

                    <div className="flex gap-3">
                      {isCompleted && (
                        <Button
                          type="button"
                          variant="secondary"
                          onClick={() => router.push(`/videos/${activeVideoId}`)}
                          className="flex-1 h-14 text-base font-semibold shadow-sm border border-border"
                        >
                          <Eye className="mr-2 h-5 w-5" />
                          View Reel
                        </Button>
                      )}

                      <Button
                        onClick={handleSubmit}
                        className={cn("flex-1 h-14 text-base font-semibold shadow-md hover:shadow-lg transition-all", (isCompleted || isFailed) ? "flex-1" : "w-full")}
                        size="lg"
                        isLoading={createMutation.isPending || (!!activeVideoId && !isCompleted && !isFailed)}
                        disabled={!topic.trim() || createMutation.isPending || (!!activeVideoId && !isCompleted && !isFailed) || !hasCredits || creditsLoading}
                      >
                        {!createMutation.isPending && (!activeVideoId || isCompleted || isFailed) && <Sparkles className="mr-2 h-5 w-5" />}
                        {createMutation.isPending || (!!activeVideoId && !isCompleted && !isFailed) ? "Generating..." : isFailed ? "Try Again" : "Generate Reel"}
                      </Button>
                    </div>
                </div>
             </div>
          </div>
          
      </div>
    </div>
  );
}
