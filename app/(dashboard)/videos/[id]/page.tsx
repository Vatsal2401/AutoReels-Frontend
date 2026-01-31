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
      <div className="relative h-full overflow-hidden">
        {/* Standard SaaS Background */}
        <div className="absolute inset-0 bg-background pointer-events-none" />


        <div className="max-w-[1700px] mx-auto space-y-3 relative z-10 pb-2 px-12 pt-3 h-full flex flex-col">

          {/* Integrated Header Row */}
          <div className="flex items-center justify-between border-b border-white/5 pb-6">
            <div className="flex items-center gap-8">
              <Link href="/dashboard">
                <Button variant="outline" size="sm" className="h-8 px-2 text-[10px] font-bold bg-secondary/10 hover:bg-secondary/20 border-white/5 text-zinc-400">
                  <ArrowLeft className="mr-1.5 h-3 w-3" />
                  EXIT STUDIO
                </Button>
              </Link>
              <div className="h-4 w-px bg-white/10 mx-2" />
              <div className="flex flex-col pl-8">
                <h1 className="text-lg font-bold tracking-tight text-white leading-none">
                  {isProcessing ? "Synthesizing..." : video.topic}
                </h1>
                <span className="text-[10px] text-zinc-500 font-medium mt-1">
                  Neural Pipeline V3 • {formatRelativeTime(video.completed_at || video.created_at)}
                </span>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-zinc-950 rounded-full border border-white/5">
                <span className="text-[9px] uppercase tracking-widest text-zinc-600 font-black">SessionID:</span>
                <span className="text-[9px] font-mono text-zinc-500">{video.id.substring(0, 8)}</span>
              </div>
              {isCompleted && (
                   <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 px-2 py-0.5 text-[10px] font-bold">
                      <CheckCircle2 size={10} className="mr-1" />
                      READY
                   </Badge>
              )}
            </div>
          </div>

          {/* Main Stage - Cinematic Theater */}
          <div className="relative group">
            {/* Halo Effect */}
            <div className="absolute inset-0 bg-primary/5 rounded-3xl blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
            
            {isProcessing && (
              <div className="animate-fade-in py-12">
                  <div className="max-w-2xl mx-auto">
                    <Card className="glass-strong border-white/5 shadow-2xl overflow-hidden relative rounded-[32px]">
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.02] via-transparent to-accent/[0.02] pointer-events-none" />
                      <CardContent className="px-10 py-16 relative z-10">
                        <ProgressIndicator video={video} />
                      </CardContent>
                    </Card>
                  </div>
              </div>
            )}

            {isFailed && (
              <div className="animate-fade-in py-12">
                  <div className="max-w-2xl mx-auto">
                    <Card className="glass-strong border-destructive/10 bg-destructive/[0.02] rounded-[32px]">
                      <CardContent className="pt-16 pb-16">
                        <div className="text-center space-y-8">
                          <div className="flex justify-center">
                            <div className="flex items-center justify-center w-24 h-24 rounded-3xl bg-destructive/5 border border-destructive/10">
                              <AlertCircle className="h-12 w-12 text-destructive/60" />
                            </div>
                          </div>
                          <div className="space-y-3">
                            <h2 className="text-2xl font-bold text-zinc-300">Synthesis Interrupted</h2>
                            <p className="text-zinc-500 text-sm max-w-xs mx-auto leading-relaxed">
                              {video.error_message || "An unexpected error occurred in the neural pipeline."}
                            </p>
                          </div>
                          <div className="flex gap-4 justify-center pt-4">
                            <Link href="/create">
                              <Button className="h-12 px-8 rounded-xl font-bold shadow-xl shadow-primary/10">
                                <Plus className="mr-2 h-4 w-4" />
                                Retry Selection
                              </Button>
                            </Link>
                            <Link href="/dashboard">
                              <Button variant="ghost" className="h-12 px-8 rounded-xl text-zinc-500 font-bold uppercase text-[10px] tracking-widest">Abort</Button>
                            </Link>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
              </div>
            )}

            {isCompleted && video.final_video_url && (
              <div className="animate-fade-in relative z-20 flex-1 overflow-hidden">
                {/* Studio Canvas Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch h-full overflow-hidden">
                  
                  {/* Primary Monitor: The Video (8 Columns) */}
                  <div className="lg:col-span-8 flex flex-col gap-4 h-full">
                    <div className="bg-zinc-950 border border-white/5 rounded-[32px] overflow-hidden shadow-[0_48px_96px_-32px_rgba(0,0,0,0.7)] relative h-[65vh] min-h-[380px] w-full flex items-center justify-center bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.01)_0%,transparent_100%)] p-6">
                       <div className="h-full max-h-full aspect-[9/16] flex items-center justify-center relative group">
                         <div className="absolute inset-0 bg-primary/5 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                         <div className="relative w-full h-full rounded-2xl overflow-hidden ring-1 ring-white/10 shadow-2xl">
                           <VideoPlayer videoUrl={video.final_video_url} title={video.topic} />
                         </div>
                       </div>
                    </div>

                    {/* Primary Monitor Controls */}
                    <div className="flex items-center justify-between p-6 bg-zinc-900/40 border border-white/5 rounded-2xl">
                      <div className="flex items-center gap-6">
                        <div className="flex flex-col gap-1">
                          <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Native Resolution</span>
                          <span className="text-xs font-bold text-zinc-300">Portrait 1080x1920 (9:16)</span>
                        </div>
                        <div className="w-px h-8 bg-white/5" />
                        <div className="flex flex-col gap-1">
                          <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Generated Fidelity</span>
                          <span className="text-xs font-bold text-emerald-500/80">Premium Studio V3</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                         <Button
                          size="lg"
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
                          className="h-12 px-8 font-black bg-white text-black hover:bg-zinc-200 rounded-xl text-xs"
                        >
                          <Download className="mr-2 h-4 w-4" />
                          DOWNLOAD 4K
                        </Button>
                        <Link href="/create">
                          <Button variant="secondary" className="h-12 px-6 font-bold border-white/5 rounded-xl text-xs">
                            <Plus className="mr-2 h-4 w-4" />
                            NEW
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>

                  {/* Sidebar Monitor: Metadata & Judgement (4 Columns) */}
                  <div className="lg:col-span-4 h-full flex flex-col">
                    <div className="bg-zinc-900/40 border border-white/5 rounded-2xl p-6 space-y-6 shadow-2xl backdrop-blur-sm h-full flex flex-col">
                      
                      {/* Section: Seed Metadata */}
                      <div className="space-y-4">
                        <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                           <FileText size={16} className="text-primary/60" />
                           <h4 className="text-[11px] font-black uppercase tracking-widest text-zinc-200">Creative Input</h4>
                        </div>
                        <div className="p-8 bg-black/40 rounded-xl border border-white/5">
                          <p className="text-sm text-zinc-400 italic font-medium leading-relaxed tracking-wide">"{video.topic}"</p>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                           <div className="p-4 bg-black/20 border border-white/5 rounded-lg">
                              <span className="block text-[9px] font-black uppercase text-zinc-600 mb-1">Visual Kernel</span>
                              <span className="text-xs font-bold text-zinc-300">Cinematic V2</span>
                           </div>
                           <div className="p-4 bg-black/20 border border-white/5 rounded-lg text-right">
                              <span className="block text-[9px] font-black uppercase text-zinc-600 mb-1">Aural Pipeline</span>
                              <span className="text-xs font-bold text-zinc-300">Stereo Studio</span>
                           </div>
                        </div>
                      </div>

                      {/* Section: Semantic script */}
                      {video.script && (
                        <div className="space-y-3 flex-1 flex flex-col min-h-0">
                           <div className="flex items-center gap-3 border-b border-white/5 pb-2">
                             <CheckCircle2 size={14} className="text-emerald-500/40" />
                             <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Narrative Analysis</h4>
                           </div>
                           <div className="p-8 bg-black/60 rounded-xl border border-white/5 flex-1 overflow-y-auto custom-scrollbar">
                              <p className="text-xs text-zinc-400 leading-relaxed font-normal whitespace-pre-wrap">
                                {video.script}
                              </p>
                           </div>
                           <div className="flex justify-between items-center px-1">
                              <span className="text-[9px] font-medium text-zinc-600">{video.script?.split(' ').length || 0} Words</span>
                              <Badge variant="outline" className="text-[8px] font-black bg-emerald-500/5 text-emerald-500/40 border-emerald-500/10">VERIFIED</Badge>
                           </div>
                        </div>
                      )}

                      {/* Utility: Upgrade Promo */}
                      <div className="pt-4 border-t border-white/5">
                        <div className="p-4 bg-primary/5 border border-primary/20 rounded-xl flex items-center justify-between gap-3">
                           <div>
                             <h5 className="text-[10px] font-black uppercase tracking-wider text-zinc-300">Pro Studio</h5>
                             <p className="text-[9px] text-zinc-600 mt-0.5">4K exports & priority.</p>
                           </div>
                           <Button variant="outline" size="sm" className="h-7 border-primary/30 text-[9px] font-black hover:bg-primary/20 text-primary">
                             PRO
                           </Button>
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
