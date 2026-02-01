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
                <h1 className="text-3xl font-bold tracking-tight text-foreground">
                  Credits & Billing
                </h1>
                <p className="text-muted-foreground font-medium">Manage your generation credits and usage</p>
              </div>
              <Button variant="outline" onClick={() => router.push("/dashboard")} className="h-10 border-border text-muted-foreground hover:text-foreground">
                Back to Dashboard
              </Button>
            </div>
            <div className="bg-card/40 rounded-[32px] border border-border p-2 shadow-2xl">
              <CreditPurchase />
            </div>
          </div>
        </div>
      ) : (
        <div className="h-full overflow-y-auto custom-scrollbar bg-background">
          <div className="flex flex-col lg:flex-row min-h-full w-full max-w-[1700px] mx-auto">
            {/* MAIN CONTENT Area */}
            <div className="flex-1 p-6 sm:p-8 lg:p-14 space-y-12 lg:space-y-20 border-b lg:border-b-0 lg:border-r border-border min-w-0">
              
              {/* Emergency / Monetization Banner */}
              {showLowCreditWarning && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-6 p-4 sm:p-6 rounded-[24px] lg:rounded-[32px] bg-amber-500/[0.03] border border-amber-500/10 animate-in fade-in slide-in-from-top-4 duration-1000">
                   <div className="flex items-center gap-4 sm:gap-5 w-full sm:w-auto">
                      <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-amber-500/5 flex items-center justify-center border border-amber-500/10 shrink-0">
                        <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500/60" />
                      </div>
                      <div className="space-y-0.5 sm:space-y-1">
                        <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.25em] text-amber-500/50">Resource Depletion</p>
                        <p className="text-xs sm:text-sm text-muted-foreground font-medium tracking-tight">Critical fuel ({credits} units). Recharge to sustain.</p>
                      </div>
                   </div>
                   <Link href="/dashboard?purchase=credits" className="w-full sm:w-auto">
                      <Button size="sm" className="w-full sm:w-auto bg-amber-500/90 hover:bg-amber-600 text-black font-black uppercase tracking-wider h-10 sm:h-11 px-8 rounded-xl sm:rounded-2xl shadow-lg transition-all duration-300 hover:scale-[1.02]">
                        Top Up
                      </Button>
                   </Link>
                </div>
              )}

              {/* Hero Section - Utilitarian Workspace Header */}
              <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10">
                <div className="space-y-6 max-w-2xl">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2.5 text-muted-foreground/80 mb-1">
                       <span className="text-[11px] font-black uppercase tracking-[0.25em]">Workspace</span>
                       <div className="w-1 h-1 rounded-full bg-foreground/20" />
                       <span className="text-[11px] font-bold text-muted-foreground">Growth Plan</span>
                    </div>
                    <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-foreground">
                      Studio Dashboard
                    </h1>
                    <p className="text-muted-foreground max-w-md leading-relaxed text-[13px] font-medium tracking-tight">
                      Orchestrate your creative pipeline. {processingVideos > 0 ? (
                        <span className="text-primary/70">Currently producing {processingVideos} assets.</span>
                      ) : (
                        <span>Ready for your next production.</span>
                      )}
                    </p>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row items-center gap-3">
                    <Link href="/create" className="w-full sm:w-auto">
                      <Button size="lg" disabled={!hasCredits && !creditsLoading} className="w-full sm:w-auto h-12 lg:h-14 px-8 font-black uppercase tracking-widest bg-primary hover:bg-primary/90 text-primary-foreground shadow-xl transition-all duration-300 hover:scale-[1.02] active:scale-95 rounded-xl text-xs sm:text-base">
                        <Plus className="mr-2.5 h-4 w-4" />
                        Generate Reel
                      </Button>
                    </Link>
                    <Link href="/dashboard?purchase=credits" className="w-full sm:w-auto">
                      <Button variant="ghost" className="w-full sm:w-auto h-12 px-5 text-muted-foreground hover:text-foreground hover:bg-muted font-black text-[9px] uppercase tracking-[0.25em] rounded-xl">
                        Add Credits
                      </Button>
                    </Link>
                  </div>
                </div>

                {/* Right Side - Subtle Meta Info */}
                <div className="hidden lg:flex flex-col items-end gap-2.5 text-right pb-1">
                  <div className="px-3.5 py-1.5 rounded-xl bg-card border border-border flex items-center gap-2">
                    <div className="w-1 h-1 rounded-full bg-emerald-500/40 animate-pulse" />
                    <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Global Sync Active</span>
                  </div>
                  <p className="text-[8px] font-bold text-muted-foreground/50 uppercase tracking-[0.3em]">Build 3.1.2 // Production Ready</p>
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
                  className={processingVideos > 0 ? "border-primary/20 bg-primary/[0.02]" : "border-border/50"}
                />
                <StatsCard
                  title="Production Fuel"
                  value={credits ?? 0}
                  icon={CreditCard}
                  className={showLowCreditWarning ? "border-amber-500/20 bg-amber-500/[0.02]" : "border-border/50"}
                />
              </div>

              {/* Content Gallery */}
              <div className="space-y-10">
                <div className="flex items-center justify-between border-b border-border pb-6">
                  <h2 className="text-[11px] font-black uppercase tracking-[0.35em] text-muted-foreground">Master Pipeline</h2>
                  <div className="flex items-center gap-2.5 text-[9px] font-bold uppercase tracking-widest text-muted-foreground">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/40 animate-pulse" />
                    Live Sync
                  </div>
                </div>

                {videosLoading ? (
                  <div className="flex flex-col items-center justify-center py-40 space-y-6 opacity-30">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    <p className="text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground">Syncing studio...</p>
                  </div>
                ) : videos.length === 0 ? (
                  <div className="py-24 text-center border-2 border-dashed border-border rounded-[40px] bg-muted/20">
                    <div className="max-w-xs mx-auto space-y-8">
                      <div className="mx-auto w-16 h-16 rounded-[24px] bg-card flex items-center justify-center border border-border shadow-inner">
                        <Sparkles className="h-7 w-7 text-muted-foreground" />
                      </div>
                      <p className="text-muted-foreground text-sm font-medium italic tracking-tight leading-relaxed px-4">"The best way to predict the future is to create it."</p>
                      <Link href="/create">
                        <Button variant="outline" className="h-12 px-10 rounded-full border-border text-muted-foreground hover:text-foreground hover:border-foreground/20 transition-all font-bold">Start production</Button>
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 animate-in fade-in slide-in-from-bottom-6 duration-1000">
                    {videos.map((video) => (
                      <VideoCard key={video.id} video={video} />
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* STUDIO UTILITY PANEL (25%) */}
            <div className="w-full lg:w-[380px] p-8 lg:p-14 shrink-0 space-y-10 lg:space-y-14 bg-muted/20 border-t lg:border-t-0 lg:border-l border-border">
               
               {/* Pro Tips Section */}
               <div className="space-y-6 lg:space-y-8">
                 <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">Studio Insights</h3>
                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4 sm:gap-5">
                    <div className="p-5 rounded-3xl border border-border bg-card hover:border-foreground/20 transition-all duration-300 group cursor-default shadow-sm sm:h-auto">
                       <p className="text-[11px] font-black text-muted-foreground group-hover:text-foreground transition-colors uppercase tracking-wider">Lighting Matters</p>
                       <p className="text-xs text-muted-foreground/80 mt-2 leading-relaxed font-medium">Using 'Cinematic Blue' style tends to get 2x more engagement.</p>
                    </div>
                    <div className="p-5 rounded-3xl border border-border bg-card shadow-sm sm:h-auto">
                       <p className="text-[11px] font-black text-muted-foreground uppercase tracking-wider">Quick Growth</p>
                       <p className="text-xs text-muted-foreground/80 mt-2 leading-relaxed font-medium">Consistent posting (3x/week) is the fastest way to grow.</p>
                    </div>
                 </div>
               </div>

               {/* Resource Status */}
               <div className="p-6 sm:p-8 rounded-[32px] lg:rounded-[40px] bg-card border border-border space-y-6 lg:space-y-8 shadow-xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 blur-3xl rounded-full -mr-12 -mt-12 transition-all group-hover:bg-primary/10" />
                  <div className="flex items-center justify-between relative z-10">
                    <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Fuel Level</h4>
                    <span className="text-[9px] font-black text-primary/80 px-2 py-0.5 rounded-md bg-primary/10 uppercase tracking-widest">Early Adopter</span>
                  </div>
                  <div className="space-y-3 relative z-10">
                    <div className="flex justify-between text-[10px] font-black text-muted-foreground uppercase tracking-tighter">
                      <span>Monthly quota</span>
                      <span className="text-muted-foreground/60">{completedVideos} / ∞</span>
                    </div>
                    <div className="h-1 w-full bg-secondary rounded-full overflow-hidden">
                      <div className="h-full bg-primary/60 w-[15%] transition-all duration-1000" />
                    </div>
                  </div>
                  <Link href="/dashboard?purchase=credits" className="block relative z-10">
                    <Button className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground border border-white/5 font-black text-[10px] uppercase tracking-[0.2em] rounded-2xl transition-all shadow-inner">
                       Upgrade Access
                    </Button>
                  </Link>
               </div>

               <div className="pt-12 lg:pt-24 text-center space-y-3 flex flex-col items-center opacity-30">
                  <div className="w-8 h-px bg-border" />
                  <p className="text-[8px] font-black tracking-[0.4em] uppercase text-muted-foreground">Ecosystem v3.1</p>
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
