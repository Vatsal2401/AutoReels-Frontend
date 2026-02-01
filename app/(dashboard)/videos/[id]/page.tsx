"use client";

import { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/lib/hooks/useAuth";
import { useVideoProgress } from "@/lib/hooks/useVideoProgress";
import { videosApi } from "@/lib/api/videos";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ProgressIndicator } from "@/components/video/ProgressIndicator";
import { VideoPlayer } from "@/components/video/VideoPlayer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import {
  ArrowLeft,
  Download,
  Plus,
  AlertCircle,
  Loader2,
  ChevronDown,
  ChevronUp,
  FileText,
  Calendar,
  CheckCircle2,
} from "lucide-react";
import { useState } from "react";
import { formatRelativeTime } from "@/lib/utils/format";
import { cn } from "@/lib/utils/format";

export default function VideoDetailPage() {
  const router = useRouter();
  const params = useParams();
  const videoId = params.id as string;
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { video, isLoading, error } = useVideoProgress(videoId);
  const [showScript, setShowScript] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, authLoading, router]);

  if (authLoading || isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-20">
          <div className="relative">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <div className="absolute inset-0 animate-ping">
              <Loader2 className="h-12 w-12 text-primary/20" />
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (error || !video) {
    return (
      <DashboardLayout>
        <div className="max-w-2xl mx-auto">
          <Card className="glass-strong">
            <CardContent className="pt-12 pb-12">
              <div className="text-center space-y-6">
                <div className="flex justify-center">
                  <div className="flex items-center justify-center w-20 h-20 rounded-full bg-destructive/20 border border-destructive/30">
                    <AlertCircle className="h-10 w-10 text-destructive" />
                  </div>
                </div>
                <div>
                  <h2 className="text-2xl font-semibold mb-2">Video not found</h2>
                  <p className="text-muted-foreground mb-6">
                    The video you're looking for doesn't exist or has been deleted.
                  </p>
                </div>
                <Link href="/dashboard">
                  <Button>Back to Dashboard</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  const isProcessing = !["completed", "failed"].includes(video.status);
  const isCompleted = video.status === "completed";
  const isFailed = video.status === "failed";

  return (
    <DashboardLayout>
      <div className="relative h-full flex flex-col">
        {/* Background Layer */}
        <div className="absolute inset-0 bg-background pointer-events-none" />

        <div className="max-w-[1700px] mx-auto w-full relative z-10 flex flex-col h-full px-6 lg:px-12 py-6">
          
          {/* Studio Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6 mb-6">
            <div className="flex items-center gap-4 lg:gap-8">
              <Link href="/dashboard">
                <Button variant="outline" size="sm" className="h-9 px-3 text-[10px] font-bold tracking-wider hover:bg-accent border-border text-muted-foreground transition-all">
                  <ArrowLeft className="mr-2 h-3 w-3" />
                  EXIT STUDIO
                </Button>
              </Link>
              <div className="h-6 w-px bg-border hidden sm:block" />
              <div className="flex flex-col">
                <h1 className="text-base lg:text-lg font-bold tracking-tight text-foreground leading-tight max-w-[300px] lg:max-w-[500px] truncate">
                  {isProcessing ? "Synthesizing Neural Flow..." : video.topic}
                </h1>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">
                    Neural Pipeline V3
                  </span>
                  <span className="text-[10px] text-muted-foreground/40">•</span>
                  <span className="text-[10px] text-muted-foreground/70 font-medium">
                    {formatRelativeTime(video.completed_at || video.created_at)}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-muted/50 border border-border rounded-lg shadow-sm">
                <span className="text-[9px] uppercase tracking-widest text-muted-foreground/60 font-black">ID:</span>
                <span className="text-[9px] font-mono text-foreground font-bold">{video.id.substring(0, 8)}</span>
              </div>
              {isCompleted && (
                   <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 px-3 py-1 text-[10px] font-bold">
                      <CheckCircle2 size={10} className="mr-1.5" />
                      READY FOR EXPORT
                   </Badge>
              )}
              {isProcessing && (
                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 px-3 py-1 text-[10px] font-bold animate-pulse">
                  <Loader2 size={10} className="mr-1.5 animate-spin" />
                  PROCESSING
                </Badge>
              )}
            </div>
          </div>

          <div className="flex-1 min-h-0">
            {isProcessing && (
              <div className="animate-fade-in py-12">
                  <div className="max-w-3xl mx-auto">
                    <Card className="bg-card border-border shadow-2xl overflow-hidden relative rounded-[32px]">
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.03] via-transparent to-accent/[0.03] pointer-events-none" />
                      <CardContent className="px-10 py-20 relative z-10">
                        <ProgressIndicator video={video} />
                      </CardContent>
                    </Card>
                  </div>
              </div>
            )}

            {isFailed && (
              <div className="animate-fade-in py-12">
                  <div className="max-w-2xl mx-auto">
                    <Card className="bg-card border-destructive/20 bg-destructive/[0.01] rounded-[32px] shadow-2xl shadow-destructive/5">
                      <CardContent className="pt-20 pb-20">
                        <div className="text-center space-y-8">
                          <div className="flex justify-center">
                            <div className="flex items-center justify-center w-24 h-24 rounded-3xl bg-destructive/10 border border-destructive/20 shadow-inner">
                              <AlertCircle className="h-12 w-12 text-destructive" />
                            </div>
                          </div>
                          <div className="space-y-4">
                            <h2 className="text-2xl font-bold text-foreground tracking-tight">Synthesis Interrupted</h2>
                            <p className="text-muted-foreground text-sm max-w-sm mx-auto leading-relaxed">
                              {video.error_message || "An unexpected error occurred in the neural pipeline. Please try again or contact support."}
                            </p>
                          </div>
                          <div className="flex gap-4 justify-center pt-6">
                            <Link href="/create">
                              <Button className="h-12 px-8 rounded-xl font-bold transition-all shadow-lg hover:shadow-primary/20">
                                <Plus className="mr-2 h-4 w-4" />
                                NEW GENERATION
                              </Button>
                            </Link>
                            <Link href="/dashboard">
                              <Button variant="outline" className="h-12 px-8 rounded-xl font-bold text-muted-foreground border-border hover:bg-muted transition-all uppercase text-[10px] tracking-widest">
                                ABORT STUDIO
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
              </div>
            )}

            {isCompleted && video.final_video_url && (
              <div className="animate-fade-in grid grid-cols-1 lg:grid-cols-12 gap-8 h-full min-h-0">
                
                {/* Stage Canvas: Video Player (8 Columns) */}
                <div className="lg:col-span-8 flex flex-col gap-6 h-full min-h-0">
                  <div className="flex-1 bg-muted/10 border border-border/50 rounded-[32px] overflow-hidden relative flex items-center justify-center p-6 lg:p-12">
                    <div className="h-full w-full max-h-full aspect-[9/16] flex items-center justify-center relative z-10">
                      <div className="w-full h-full rounded-2xl overflow-hidden shadow-sm ring-1 ring-border/40">
                        <VideoPlayer videoUrl={video.final_video_url} title={video.topic} />
                      </div>
                    </div>
                  </div>

                  {/* Playback Controls & Info */}
                  <div className="flex flex-wrap items-center justify-between p-5 bg-zinc-50/50 dark:bg-zinc-900/50 border border-border/60 rounded-2xl shadow-sm gap-6">
                    <div className="flex items-center gap-8">
                      <div className="flex flex-col gap-1">
                        <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60">Canvas Resolution</span>
                        <span className="text-xs font-bold text-foreground">Vertical 1080x1920</span>
                      </div>
                      <div className="w-px h-8 bg-border" />
                      <div className="flex flex-col gap-1">
                        <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60">Studio Version</span>
                        <span className="text-xs font-bold text-primary">Neural V3.2</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                       <Button
                        size="lg"
                        variant="secondary"
                        onClick={async () => {
                          try {
                            const response = await videosApi.getDownloadUrl(video.id);
                            if (response?.url) {
                              window.location.href = response.url;
                            }
                          } catch (error) {
                            console.error("Failed to get download URL", error);
                          }
                        }}
                        className="h-11 px-6 font-bold border border-border rounded-xl text-xs hover:bg-muted transition-colors"
                      >
                        <Download className="mr-2 h-4 w-4" />
                        DOWNLOAD 4K
                      </Button>
                      <Link href="/create">
                        <Button className="h-11 px-6 font-bold shadow-lg shadow-primary/10 rounded-xl text-xs">
                          <Plus className="mr-2 h-4 w-4" />
                          CREATE NEW
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Studio Sidebar: Metadata & Logic (4 Columns) */}
                <div className="lg:col-span-4 flex flex-col gap-6 h-full min-h-0 pb-6 lg:pb-0">
                  <div className="flex-1 bg-zinc-50/50 dark:bg-zinc-900/50 border border-border/60 rounded-2xl p-6 flex flex-col gap-6 shadow-sm overflow-hidden">
                    
                    {/* Creative Input Section */}
                    <div className="flex flex-col gap-3 min-h-0">
                      <div className="flex items-center gap-2.5 px-1">
                         <FileText size={14} className="text-primary" />
                         <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Original Prompt</h4>
                      </div>
                      <div className="p-4 bg-muted/30 rounded-xl border border-border/50 max-h-[120px] overflow-y-auto custom-scrollbar">
                        <p className="text-xs text-foreground/90 italic font-medium leading-relaxed">
                          {video.topic}
                        </p>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3">
                         <div className="p-3.5 bg-secondary/30 border border-border/40 rounded-xl">
                            <span className="block text-[8px] font-black uppercase text-muted-foreground/70 mb-1">Visual Kernel</span>
                            <span className="text-xs font-bold text-foreground">{video.metadata?.imageStyle || "Cinematic V2"}</span>
                         </div>
                         <div className="p-3.5 bg-secondary/30 border border-border/40 rounded-xl">
                            <span className="block text-[8px] font-black uppercase text-muted-foreground/70 mb-1">Aural Pipeline</span>
                            <span className="text-xs font-bold text-foreground">Stereo Studio</span>
                         </div>
                      </div>
                    </div>

                    {/* Narrative Stream (Script) */}
                    <div className="flex-1 flex flex-col gap-3 min-h-0 border-t border-border pt-6">
                       <div className="flex items-center justify-between px-1">
                         <div className="flex items-center gap-2.5">
                           <FileText size={14} className="text-emerald-500" />
                           <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Generated Narrative</h4>
                         </div>
                         <Badge variant="outline" className="text-[8px] font-bold bg-emerald-500/5 text-emerald-600 border-emerald-500/10">SYNTAX OK</Badge>
                       </div>
                       
                       <div className="flex-1 bg-muted/10 rounded-xl border border-border/40 p-5 overflow-y-auto custom-scrollbar">
                          {video.script ? (
                            <p className="text-xs text-foreground/80 leading-relaxed font-medium whitespace-pre-wrap">
                              {video.script}
                            </p>
                          ) : (
                            <div className="h-full flex flex-col items-center justify-center text-center opacity-30 select-none">
                              <Loader2 size={24} className="animate-spin mb-3" />
                              <span className="text-[10px] uppercase font-black">Streaming logic...</span>
                            </div>
                          )}
                       </div>
                       
                       {video.script && (
                         <div className="flex items-center justify-between px-2 pt-1">
                            <span className="text-[9px] font-bold text-muted-foreground/60 uppercase">
                              {video.script.split(' ').length} Words Detected
                            </span>
                            <span className="text-[9px] font-bold text-muted-foreground/60 uppercase">
                              RT: {video.metadata?.duration || "45s"}
                            </span>
                         </div>
                       )}
                    </div>

                    {/* Pro Utility Footer */}
                    <div className="pt-4 border-t border-border">
                      <div className="p-4 bg-primary/[0.02] dark:bg-primary/[0.05] border border-primary/20 rounded-2xl flex items-center justify-between gap-4">
                         <div className="flex flex-col gap-0.5">
                           <h5 className="text-[10px] font-black uppercase tracking-wider text-foreground">Premium Engine</h5>
                           <p className="text-[9px] text-muted-foreground font-medium">Unlocked for this generation.</p>
                         </div>
                         <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <CheckCircle2 size={12} className="text-primary" />
                         </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
