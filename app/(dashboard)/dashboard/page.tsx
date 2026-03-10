'use client';

import { useEffect, useState, Suspense, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/lib/hooks/useAuth';
import { useCredits } from '@/lib/hooks/useCredits';
import { useUserSettings } from '@/lib/hooks/useUserSettings';
import { projectsApi } from '@/lib/api/projects';
import { showcaseApi, type ShowcaseItem as ShowcaseItemType } from '@/lib/api/showcase';
import { mediaApi } from '@/lib/api/media';
import { STORY_GENRES } from '@/lib/api/story';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { CreditPurchase } from '@/components/credits/CreditPurchase';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import {
  Loader2,
  CreditCard,
  Video,
  Image as ImageIcon,
  Palette,
  TrendingUp,
  AlertCircle,
  Heart,
  BookOpen,
  Download,
} from 'lucide-react';

/** Redirect href for showcase item type (click opens that engine). */
function getShowcaseItemHref(type: ShowcaseItemType['type']): string {
  if (type === 'reel') return '/studio/reel';
  if (type === 'graphic_motion') return '/studio/graphic-motion';
  return '/studio';
}

/**
 * Slot width: graphic_motion = 2 spaces (double), reel/text_to_image = 1 (single).
 * We always show the actual item count: 2 video + 1 GM = 3 cards (GM is double width); 4 video = 4 cards; 2 video + 2 image = 4 cards.
 */
function getShowcaseItemSlots(type: ShowcaseItemType['type']): 1 | 2 {
  return type === 'graphic_motion' ? 2 : 1;
}

/** Media-only showcase card: video or image, no label. Click redirects to the engine. Graphic motion uses 2 slots (double width). */
function ShowcaseItemCard({ item, slots }: { item: ShowcaseItemType; slots: 1 | 2 }) {
  const [videoError, setVideoError] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const href = getShowcaseItemHref(item.type);
  const isVideo = item.type === 'reel' || item.type === 'graphic_motion';
  const showVideo = isVideo && item.url && !videoError;

  const handleMouseEnter = () => {
    if (videoRef.current && showVideo) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {});
    }
  };
  const handleMouseLeave = () => videoRef.current?.pause();

  const widthClass =
    slots === 2 ? 'flex-[0_0_calc((100%-3rem)/2+1rem)]' : 'flex-[0_0_calc((100%-3rem)/4)]';

  return (
    <div
      className={`flex-shrink-0 min-h-[260px] h-full rounded-2xl border border-border bg-card overflow-hidden cursor-pointer transition-all hover:border-primary/30 hover:shadow-lg flex flex-col snap-start ${widthClass}`}
      onClick={() => (window.location.href = href)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (window.location.href = href)}
    >
      <div className="flex-1 min-h-0 flex items-center justify-center overflow-hidden bg-muted/50">
        {showVideo && item.url ? (
          <video
            ref={videoRef}
            key={item.url}
            src={item.url}
            className="w-full h-full object-cover"
            muted
            loop
            playsInline
            preload="metadata"
            onError={() => setVideoError(true)}
          />
        ) : !isVideo && item.url ? (
          // Only use img for non-video types (e.g. text_to_image); video URLs must not be used as img src
          // eslint-disable-next-line @next/next/no-img-element
          <img src={item.url} alt="" className="w-full h-full object-cover" />
        ) : (
          <span className="opacity-50">
            {item.type === 'text_to_image' ? (
              <ImageIcon className="h-10 w-10" />
            ) : (
              <Video className="h-10 w-10" />
            )}
          </span>
        )}
      </div>
    </div>
  );
}

function StoryReelCard({ reel }: { reel: { id: string; final_url?: string; input_config: Record<string, any> | null } }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoError, setVideoError] = useState(false);
  const prompt = reel.input_config?.prompt ?? '';
  const genre = reel.input_config?.genre ?? '';
  const genreEntry = STORY_GENRES.find((g) => g.value === genre);

  return (
    <div
      className="flex-shrink-0 w-[140px] rounded-xl border border-border bg-card overflow-hidden"
      onMouseEnter={() => videoRef.current?.play().catch(() => {})}
      onMouseLeave={() => videoRef.current?.pause()}
    >
      <div className="aspect-[9/16] bg-muted relative overflow-hidden">
        {reel.final_url && !videoError ? (
          <video
            ref={videoRef}
            src={reel.final_url}
            className="w-full h-full object-cover"
            muted
            loop
            playsInline
            preload="metadata"
            onError={() => setVideoError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <BookOpen className="h-8 w-8 text-muted-foreground/40" />
          </div>
        )}
        {genreEntry && (
          <div className="absolute top-2 left-2 text-xs bg-black/60 text-white px-1.5 py-0.5 rounded-md font-medium">
            {genreEntry.emoji}
          </div>
        )}
      </div>
      <div className="p-2 space-y-1.5">
        <p className="text-[10px] text-muted-foreground line-clamp-2 leading-relaxed">
          {prompt.slice(0, 60)}{prompt.length > 60 ? '...' : ''}
        </p>
        {reel.final_url && (
          <a href={reel.final_url} download onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="flex items-center gap-1 text-[9px] text-muted-foreground hover:text-foreground transition-colors"
            >
              <Download className="h-3 w-3" />
              Download
            </button>
          </a>
        )}
      </div>
    </div>
  );
}

function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const showPurchase = searchParams?.get('purchase') === 'credits';
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { credits, hasCredits, isLoading: creditsLoading } = useCredits();

  const { data: projects = [] } = useQuery({
    queryKey: ['projects'],
    queryFn: projectsApi.getProjects,
    enabled: isAuthenticated,
  });

  const { data: showcase } = useQuery({
    queryKey: ['showcase'],
    queryFn: showcaseApi.getShowcase,
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000, // 5 min — showcase changes rarely; instant from cache on tab return
  });

  const { storyReelEnabled } = useUserSettings();

  const { data: allMedia } = useQuery({
    queryKey: ['my-media'],
    queryFn: mediaApi.getAllMedia,
    enabled: isAuthenticated && storyReelEnabled,
    staleTime: 60_000,
  });

  const storyReels = (allMedia ?? [])
    .filter((m) => m.flow_key === 'storyReel' && m.status === 'completed' && m.final_url)
    .slice(0, 6);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
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

  const activeCount = projects.filter((p) =>
    ['pending', 'processing', 'rendering'].includes(p.status),
  ).length;
  const completedCount = projects.filter((p) => p.status === 'completed').length;
  const engagementValue = completedCount > 0 ? `${completedCount} delivered` : '—';

  const showLowCreditWarning = credits !== null && credits <= 3;

  return (
    <DashboardLayout>
      {showPurchase ? (
        <div className="h-full overflow-y-auto custom-scrollbar p-2 lg:p-4 bg-background/50">
          <div className="max-w-6xl mx-auto space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-4">
              <div className="space-y-1 text-center sm:text-left">
                <h1 className="text-xl lg:text-2xl font-black tracking-tight text-foreground uppercase italic leading-none">
                  Credits & <span className="text-primary italic">Billing</span>
                </h1>
                <p className="text-muted-foreground font-bold text-[8px] uppercase tracking-[0.2em] leading-none mt-1.5">
                  Manage production fuel
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => router.push('/dashboard')}
                className="h-8 border-border/50 text-muted-foreground hover:text-foreground bg-card/10 backdrop-blur-sm rounded-lg px-4 font-bold uppercase text-[8px] tracking-[0.1em]"
              >
                Exit
              </Button>
            </div>
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-700">
              <CreditPurchase />
            </div>
          </div>
        </div>
      ) : (
        <div className="h-full overflow-hidden flex flex-col bg-background w-full">
          <div className="flex flex-col lg:flex-row flex-1 min-h-0 w-full">
            {/* MAIN: uses full width, sticky single viewport */}
            <div className="flex-1 min-w-0 p-3 sm:p-6 lg:p-8 flex flex-col min-h-0 border-b lg:border-b-0 lg:border-r border-border">
              {showLowCreditWarning && (
                <div className="flex items-center justify-between gap-4 p-3 rounded-xl bg-amber-500/[0.06] border border-amber-500/20 flex-shrink-0 mb-4">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="h-4 w-4 text-amber-500 shrink-0" />
                    <p className="text-xs text-muted-foreground">Low credits ({credits}).</p>
                  </div>
                  <Link href="/dashboard?purchase=credits">
                    <Button
                      size="sm"
                      className="bg-amber-500 hover:bg-amber-600 text-black font-semibold rounded-lg"
                    >
                      Top Up
                    </Button>
                  </Link>
                </div>
              )}

              {/* Top row: subtitle + primary CTA + engagement (title is in TopBar) */}
              <div className="flex flex-wrap items-center justify-between gap-2 sm:gap-4 flex-shrink-0">
                <p className="text-muted-foreground text-xs sm:text-sm">
                  {activeCount > 0
                    ? `${activeCount} project${activeCount === 1 ? '' : 's'} in progress`
                    : 'Choose a tool and start creating.'}
                </p>
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl bg-card border border-border">
                    <Heart className="h-4 w-4 text-primary" />
                    <span className="text-sm font-semibold">{engagementValue}</span>
                  </div>
                  <Link href="/studio">
                    <Button className="h-8 sm:h-10 px-3 sm:px-5 text-xs sm:text-sm font-semibold bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl shadow-sm">
                      <Palette className="mr-1.5 h-3.5 w-3.5 sm:mr-2 sm:h-4 sm:w-4" />
                      Open Studio
                    </Button>
                  </Link>
                  <Link href="/dashboard?purchase=credits" className="hidden xs:block sm:block">
                    <Button variant="outline" size="sm" className="h-8 sm:h-10 rounded-xl text-xs sm:text-sm">
                      Add Credits
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Stats: full-width row */}
              <div className="grid grid-cols-3 gap-2 sm:gap-4 lg:gap-6 flex-shrink-0 mt-4 sm:mt-6">
                <StatsCard title="Total Projects" value={projects.length} icon={Video} />
                <StatsCard
                  title="Active"
                  value={activeCount}
                  icon={TrendingUp}
                  className={
                    activeCount > 0 ? 'border-primary/20 bg-primary/[0.02]' : 'border-border/50'
                  }
                />
                <StatsCard
                  title="Production Fuel"
                  value={credits ?? 0}
                  icon={CreditCard}
                  className={
                    showLowCreditWarning
                      ? 'border-amber-500/20 bg-amber-500/[0.02]'
                      : 'border-border/50'
                  }
                />
              </div>

              {/* Showcase: uses full space, horizontal scroll like Typography & Visuals */}
              <div className="flex-1 min-h-0 flex flex-col mt-6">
                <div className="flex items-center justify-between flex-shrink-0 mb-3">
                  <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    What you can create
                  </h2>
                  <Link href="/studio">
                    <Button variant="outline" size="sm" className="rounded-xl text-xs font-medium">
                      Open Studio to create
                    </Button>
                  </Link>
                </div>
                <div
                  className="flex-1 min-h-0 overflow-x-auto overflow-y-hidden -mx-1 px-1 no-scrollbar"
                  style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                  {(() => {
                    const items = showcase?.items ?? [];
                    return (
                      <div className="flex items-stretch gap-4 pb-4 pt-2 flex-nowrap h-full min-h-[280px] snap-x snap-mandatory w-full">
                        {items.map((item) => (
                          <ShowcaseItemCard
                            key={item.id}
                            item={item}
                            slots={getShowcaseItemSlots(item.type)}
                          />
                        ))}
                      </div>
                    );
                  })()}
                </div>
              </div>
            </div>

            {/* Story Reels gallery — only when flag is enabled */}
            {storyReelEnabled && (
              <div className="mt-6 flex-shrink-0">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-muted-foreground" />
                    <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Your Story Reels
                    </h2>
                  </div>
                  <Link href="/studio/story">
                    <Button variant="outline" size="sm" className="rounded-xl text-xs font-medium">
                      Create Story
                    </Button>
                  </Link>
                </div>
                {storyReels.length === 0 ? (
                  <Link href="/studio/story">
                    <div className="flex items-center gap-4 p-4 rounded-xl border border-dashed border-border bg-card/50 hover:border-primary/40 transition-colors cursor-pointer">
                      <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                        <BookOpen className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">Create your first Story Reel</p>
                        <p className="text-xs text-muted-foreground">AI-generated cinematic story with narration →</p>
                      </div>
                    </div>
                  </Link>
                ) : (
                  <div
                    className="flex gap-3 overflow-x-auto pb-2 no-scrollbar"
                    style={{ scrollbarWidth: 'none' }}
                  >
                    {storyReels.map((reel) => (
                      <StoryReelCard key={reel.id} reel={reel} />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Right panel: fills height, uses remaining width */}
            <div className="w-full lg:w-[320px] xl:w-[360px] flex-shrink-0 p-4 lg:p-6 flex flex-col gap-6 bg-muted/20 border-t lg:border-t-0 lg:border-l border-border overflow-hidden min-h-0">
              <div>
                <h3 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-3">
                  Studio Insights
                </h3>
                <div className="space-y-3">
                  <div className="p-4 rounded-xl border border-border bg-card">
                    <p className="text-xs font-semibold text-foreground">Lighting Matters</p>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                      Cinematic Blue style tends to get 2x more engagement.
                    </p>
                  </div>
                  <div className="p-4 rounded-xl border border-border bg-card">
                    <p className="text-xs font-semibold text-foreground">Quick Growth</p>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                      Consistent posting (3x/week) is the fastest way to grow.
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-card border border-border space-y-4 flex-shrink-0">
                <div className="flex items-center justify-between">
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Fuel Level
                  </h4>
                  <span className="text-[9px] font-semibold text-primary/80 px-2 py-0.5 rounded-md bg-primary/10">
                    Early Adopter
                  </span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-medium text-muted-foreground">
                    <span>Monthly quota</span>
                    <span>{completedCount} / ∞</span>
                  </div>
                  <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary/60 rounded-full transition-all"
                      style={{ width: `${Math.min((completedCount / 100) * 100, 100)}%` }}
                    />
                  </div>
                </div>
                <Link href="/dashboard?purchase=credits" className="block">
                  <Button className="w-full h-10 font-semibold rounded-xl">Upgrade Access</Button>
                </Link>
              </div>
              <div className="mt-auto pt-4 text-center opacity-40">
                <p className="text-[9px] font-medium uppercase tracking-wider text-muted-foreground">
                  Ecosystem v3.1
                </p>
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
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-background">
          <Loader2 className="h-6 w-6 animate-spin text-zinc-800" />
        </div>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}
