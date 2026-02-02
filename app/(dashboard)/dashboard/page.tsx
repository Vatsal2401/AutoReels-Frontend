'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/lib/hooks/useAuth';
import { useCredits } from '@/lib/hooks/useCredits';
import { videosApi } from '@/lib/api/videos';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { VideoCard } from '@/components/video/VideoCard';
import { CreditPurchase } from '@/components/credits/CreditPurchase';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import { Plus, Loader2, CreditCard, Video, Sparkles, TrendingUp } from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const [showPurchase, setShowPurchase] = useState(false);
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { credits, hasCredits, isLoading: creditsLoading } = useCredits();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      setShowPurchase(params.get('purchase') === 'credits');
    }
  }, []);

  const {
    data: videos = [],
    isLoading: videosLoading,
    error,
  } = useQuery({
    queryKey: ['videos'],
    queryFn: videosApi.getVideos,
    enabled: isAuthenticated,
  });

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

  const completedVideos = videos.filter((v) => v.status === 'completed').length;
  const processingVideos = videos.filter((v) =>
    ['pending', 'script_generating', 'script_complete', 'processing', 'rendering'].includes(
      v.status,
    ),
  ).length;

  return (
    <DashboardLayout>
      {showPurchase ? (
        <div className="max-w-4xl mx-auto">
          <div className="mb-6 flex items-center justify-between">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Purchase Credits
            </h1>
            <Button variant="outline" onClick={() => router.push('/dashboard')}>
              Back to Dashboard
            </Button>
          </div>
          <CreditPurchase />
        </div>
      ) : (
        <div className="space-y-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <StatsCard title="Total Reels" value={videos.length} icon={Video} />
            <StatsCard title="Completed" value={completedVideos} icon={Sparkles} />
            <StatsCard title="Processing" value={processingVideos} icon={TrendingUp} />
            <StatsCard title="Credits" value={credits ?? 0} icon={CreditCard} />
          </div>

          {/* Header Section */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <div className="space-y-1">
              <h1 className="text-3xl font-bold leading-tight bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                My Reels
              </h1>
              <p className="text-muted-foreground leading-relaxed">
                Manage and create your AI-generated reels
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/dashboard?purchase=credits">
                <Button variant="outline" size="lg">
                  <CreditCard className="mr-2 h-4 w-4" />
                  Buy Credits
                </Button>
              </Link>
              <Link href="/create">
                <Button size="lg" disabled={!hasCredits && !creditsLoading}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create New Reel
                </Button>
              </Link>
            </div>
          </div>

          {/* Content */}
          {videosLoading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="relative">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <div className="absolute inset-0 animate-ping">
                  <Loader2 className="h-12 w-12 text-primary/20" />
                </div>
              </div>
              <p className="mt-4 text-muted-foreground">Loading your reels...</p>
            </div>
          ) : error ? (
            <Card className="border-destructive/50 bg-destructive/10">
              <CardContent className="px-6 py-8">
                <div className="text-center">
                  <p className="text-destructive font-medium">
                    Failed to load videos. Please try again later.
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : videos.length === 0 ? (
            <Card className="glass-strong">
              <CardContent className="pt-12 pb-12">
                <div className="text-center space-y-6">
                  <div className="flex justify-center">
                    <div className="flex items-center justify-center w-20 h-20 rounded-full bg-gradient-ai">
                      <Video className="h-10 w-10 text-primary" />
                    </div>
                  </div>
                  <div>
                    <h2 className="text-2xl font-semibold mb-2">No reels yet</h2>
                    <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                      Create your first AI-generated reel to get started. It only takes a few
                      seconds!
                    </p>
                  </div>
                  <Link href="/create">
                    <Button size="lg">
                      <Plus className="mr-2 h-5 w-5" />
                      Create Your First Reel
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {videos.map((video) => (
                <VideoCard key={video.id} video={video} />
              ))}
            </div>
          )}
        </div>
      )}
    </DashboardLayout>
  );
}
