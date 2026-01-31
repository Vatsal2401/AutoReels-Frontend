"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/hooks/useAuth";
import { useCredits } from "@/lib/hooks/useCredits";
import { videosApi } from "@/lib/api/videos";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { VideoCard } from "@/components/video/VideoCard";
import { CreditPurchase } from "@/components/credits/CreditPurchase";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import {
  Plus,
  Loader2,
  CreditCard,
  Video,
  Sparkles,
  TrendingUp,
  AlertCircle,
} from "lucide-react";
import { Suspense } from "react";

function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const showPurchase = searchParams?.get("purchase") === "credits";
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { credits, hasCredits, isLoading: creditsLoading } = useCredits();

  const {
    data: videos = [],
    isLoading: videosLoading,
    error,
  } = useQuery({
    queryKey: ["videos"],
    queryFn: videosApi.getVideos,
    enabled: isAuthenticated,
  });

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, authLoading, router]);

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const completedVideos = videos.filter((v) => v.status === "completed").length;
  const processingVideos = videos.filter((v) =>
    ["pending", "script_generating", "script_complete", "processing", "rendering"].includes(
      v.status
    )
  ).length;

  const showLowCreditWarning = credits !== null && credits <= 3;

  return (
    <DashboardLayout>
      {showPurchase ? (
        <div className="h-full overflow-y-auto custom-scrollbar p-8 lg:p-12">
          <div className="max-w-4xl mx-auto space-y-12">
            <div className="flex items-center justify-between">
              <div className="space-y-1.5">
                <h1 className="text-3xl font-bold tracking-tight text-zinc-200">
                  Credits & Billing
                </h1>
                <p className="text-zinc-500 font-medium">Manage your generation credits and usage</p>
              </div>
              <Button variant="outline" onClick={() => router.push("/dashboard")} className="h-10 border-white/5 text-zinc-400 hover:text-zinc-200">
                Back to Dashboard
              </Button>
            </div>
            <div className="bg-zinc-900/40 rounded-[32px] border border-white/5 p-2 shadow-2xl">
              <CreditPurchase />
            </div>
          </div>
        </div>
      ) : (
        <div className="h-full overflow-y-auto custom-scrollbar bg-background">
          <div className="flex flex-col lg:flex-row min-h-full w-full max-w-[1700px] mx-auto">
            {/* MAIN CONTENT Area */}
            <div className="flex-1 p-8 lg:p-14 space-y-20 border-r border-white/5 min-w-0">
              
              {/* Emergency / Monetization Banner */}
              {showLowCreditWarning && (
                <div className="flex items-center justify-between gap-6 p-6 rounded-[32px] bg-amber-500/[0.03] border border-amber-500/10 animate-in fade-in slide-in-from-top-4 duration-1000">
                   <div className="flex items-center gap-5">
                      <div className="w-11 h-11 rounded-2xl bg-amber-500/5 flex items-center justify-center border border-amber-500/10">
                        <AlertCircle className="w-5 h-5 text-amber-500/60" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] font-black uppercase tracking-[0.25em] text-amber-500/50">Resource Depletion</p>
                        <p className="text-sm text-zinc-400 font-medium tracking-tight">Critical fuel levels ({credits} units). Recharge to sustain production.</p>
                      </div>
                   </div>
                   <Link href="/dashboard?purchase=credits">
                      <Button size="sm" className="bg-amber-500/90 hover:bg-amber-600 text-black font-black uppercase tracking-wider h-11 px-8 rounded-2xl shadow-lg transition-all duration-300 hover:scale-[1.02]">
                        Top Up
                      </Button>
                   </Link>
                </div>
              )}

              {/* Hero Section - Utilitarian Workspace Header */}
              <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10">
                <div className="space-y-6 max-w-2xl">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2.5 text-zinc-500/80 mb-1">
                       <span className="text-[11px] font-black uppercase tracking-[0.25em]">Workspace</span>
                       <div className="w-1 h-1 rounded-full bg-zinc-800" />
                       <span className="text-[11px] font-bold text-zinc-600">Growth Plan</span>
                    </div>
                    <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-zinc-300">
                      Studio Dashboard
                    </h1>
                    <p className="text-zinc-500 max-w-md leading-relaxed text-[13px] font-medium tracking-tight">
                      Orchestrate your creative pipeline. {processingVideos > 0 ? (
                        <span className="text-primary/70">Currently producing {processingVideos} assets.</span>
                      ) : (
                        <span>Ready for your next production.</span>
                      )}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Link href="/create">
                      <Button size="lg" disabled={!hasCredits && !creditsLoading} className="h-12 px-8 font-black uppercase tracking-widest bg-zinc-200 hover:bg-white text-black shadow-xl transition-all duration-300 hover:scale-[1.02] active:scale-95 rounded-xl">
                        <Plus className="mr-2.5 h-4 w-4" />
                        Generate Reel
                      </Button>
                    </Link>
                    <Link href="/dashboard?purchase=credits">
                      <Button variant="ghost" className="h-12 px-5 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/20 font-black text-[9px] uppercase tracking-[0.25em] rounded-xl">
                        Add Credits
                      </Button>
                    </Link>
                  </div>
                </div>

                {/* Right Side - Subtle Meta Info */}
                <div className="hidden lg:flex flex-col items-end gap-2.5 text-right pb-1">
                  <div className="px-3.5 py-1.5 rounded-xl bg-zinc-900/30 border border-white/5 flex items-center gap-2">
                    <div className="w-1 h-1 rounded-full bg-emerald-500/40 animate-pulse" />
                    <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Global Sync Active</span>
                  </div>
                  <p className="text-[8px] font-bold text-zinc-800 uppercase tracking-[0.3em]">Build 3.1.2 // Production Ready</p>
                </div>
              </div>

              {/* Stats Section */}
              <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
                <StatsCard
                  title="Total Assets"
                  value={videos.length}
                  icon={Video}
                />
                <StatsCard
                  title="Active Leads"
                  value={processingVideos}
                  icon={TrendingUp}
                  className={processingVideos > 0 ? "border-primary/20 bg-primary/[0.02]" : "border-white/5"}
                />
                <StatsCard
                  title="Production Fuel"
                  value={credits ?? 0}
                  icon={CreditCard}
                  className={showLowCreditWarning ? "border-amber-500/20 bg-amber-500/[0.02]" : "border-white/5"}
                />
              </div>

              {/* Content Gallery */}
              <div className="space-y-10">
                <div className="flex items-center justify-between border-b border-white/5 pb-6">
                  <h2 className="text-[11px] font-black uppercase tracking-[0.35em] text-zinc-600">Master Pipeline</h2>
                  <div className="flex items-center gap-2.5 text-[9px] font-bold uppercase tracking-widest text-zinc-600">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/40 animate-pulse" />
                    Live Sync
                  </div>
                </div>

                {videosLoading ? (
                  <div className="flex flex-col items-center justify-center py-40 space-y-6 opacity-30">
                    <Loader2 className="h-8 w-8 animate-spin text-zinc-500" />
                    <p className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-600">Syncing studio...</p>
                  </div>
                ) : videos.length === 0 ? (
                  <div className="py-24 text-center border-2 border-dashed border-white/5 rounded-[40px] bg-zinc-950/20">
                    <div className="max-w-xs mx-auto space-y-8">
                      <div className="mx-auto w-16 h-16 rounded-[24px] bg-zinc-900 flex items-center justify-center border border-white/5 shadow-inner">
                        <Sparkles className="h-7 w-7 text-zinc-700" />
                      </div>
                      <p className="text-zinc-600 text-sm font-medium italic tracking-tight leading-relaxed px-4">"The best way to predict the future is to create it."</p>
                      <Link href="/create">
                        <Button variant="outline" className="h-12 px-10 rounded-full border-zinc-800 text-zinc-500 hover:text-zinc-300 hover:border-zinc-700 transition-all font-bold">Start production</Button>
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 animate-in fade-in slide-in-from-bottom-6 duration-1000">
                    {videos.map((video) => (
                      <VideoCard key={video.id} video={video} />
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* STUDIO UTILITY PANEL (25%) */}
            <div className="w-full lg:w-[380px] p-8 lg:p-14 shrink-0 space-y-14 bg-black/20">
               
               {/* Pro Tips Section */}
               <div className="space-y-8">
                 <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600">Studio Insights</h3>
                 <div className="space-y-5">
                    <div className="p-5 rounded-3xl border border-white/5 bg-zinc-900/20 hover:border-zinc-800 transition-all duration-300 group cursor-default">
                       <p className="text-[11px] font-black text-zinc-400 group-hover:text-zinc-200 transition-colors uppercase tracking-wider">Lighting Matters</p>
                       <p className="text-xs text-zinc-600 mt-2 leading-relaxed font-medium">Using 'Cinematic Blue' style tends to get 2x more engagement on Reels.</p>
                    </div>
                    <div className="p-5 rounded-3xl border border-white/5 bg-zinc-900/20">
                       <p className="text-[11px] font-black text-zinc-400 uppercase tracking-wider">Quick Growth</p>
                       <p className="text-xs text-zinc-600 mt-2 leading-relaxed font-medium">Consistent posting (3x/week) is the fastest way to grow your AI channel.</p>
                    </div>
                 </div>
               </div>

               {/* Resource Status */}
               <div className="p-8 rounded-[40px] bg-zinc-950/40 border border-white/5 space-y-8 shadow-2xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 blur-3xl rounded-full -mr-12 -mt-12 transition-all group-hover:bg-primary/10" />
                  <div className="flex items-center justify-between relative z-10">
                    <h4 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">Fuel Level</h4>
                    <span className="text-[9px] font-black text-primary/60 px-2 py-0.5 rounded-md bg-primary/5 uppercase tracking-widest">Early Adopter</span>
                  </div>
                  <div className="space-y-3 relative z-10">
                    <div className="flex justify-between text-[10px] font-black text-zinc-600 uppercase tracking-tighter">
                      <span>Monthly quota</span>
                      <span className="text-zinc-400">{completedVideos} / ∞</span>
                    </div>
                    <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-primary/40 w-[15%] transition-all duration-1000" />
                    </div>
                  </div>
                  <Link href="/dashboard?purchase=credits" className="block relative z-10">
                    <Button className="w-full h-12 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-white/5 font-black text-[10px] uppercase tracking-[0.2em] rounded-2xl transition-all shadow-inner">
                       Upgrade Access
                    </Button>
                  </Link>
               </div>

               <div className="pt-24 text-center space-y-3 flex flex-col items-center opacity-10">
                  <div className="w-8 h-px bg-zinc-800" />
                  <p className="text-[8px] font-black tracking-[0.4em] uppercase">Ecosystem v3.1</p>
               </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-zinc-800" />
      </div>
    }>
      <DashboardContent />
    </Suspense>
  );
}
