"use client";

import { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/lib/hooks/useAuth";
import { useVideoProgress } from "@/lib/hooks/useVideoProgress";
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
      <div className="max-w-5xl mx-auto space-y-6">
        <Link href="/dashboard">
          <Button variant="ghost" className="mb-2">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </Link>

        <div className="mb-8 space-y-3">
          <h1 className="text-3xl font-bold leading-tight bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            {video.topic}
          </h1>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4 shrink-0" />
              <span className="leading-tight">Created {formatRelativeTime(video.created_at)}</span>
            </div>
            {video.completed_at && (
              <>
                <span className="leading-tight">•</span>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                  <span className="leading-tight">Completed {formatRelativeTime(video.completed_at)}</span>
                </div>
              </>
            )}
          </div>
        </div>

        {isProcessing && (
          <Card className="glass-strong">
            <CardContent className="px-6 py-8">
              <ProgressIndicator video={video} />
            </CardContent>
          </Card>
        )}

        {isFailed && (
          <Card className="glass-strong border-destructive/30">
            <CardContent className="pt-12 pb-12">
              <div className="text-center space-y-6">
                <div className="flex justify-center">
                  <div className="flex items-center justify-center w-20 h-20 rounded-full bg-destructive/20 border border-destructive/30">
                    <AlertCircle className="h-10 w-10 text-destructive" />
                  </div>
                </div>
                <div>
                  <h2 className="text-2xl font-semibold mb-2">Generation Failed</h2>
                  <p className="text-muted-foreground mb-6">
                    {video.error_message || "Something went wrong. Let's try again."}
                  </p>
                </div>
                <div className="flex gap-4 justify-center">
                  <Link href="/create">
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Try Again
                    </Button>
                  </Link>
                  <Link href="/dashboard">
                    <Button variant="outline">Back to Dashboard</Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {isCompleted && video.final_video_url && (
          <>
            <Card className="glass-strong overflow-hidden">
              <CardContent className="p-0">
                <div className="bg-gradient-ai p-1">
                  <div className="bg-card rounded-lg">
                    <VideoPlayer videoUrl={video.final_video_url} title={video.topic} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-6 md:grid-cols-2">
              <Card className="glass-strong">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    Video Info
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm font-medium mb-1 text-muted-foreground">Topic</p>
                    <p className="text-sm">{video.topic}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-1 text-muted-foreground">Status</p>
                    <Badge variant="success">
                      Completed
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-1 text-muted-foreground">Created</p>
                    <p className="text-sm">{formatRelativeTime(video.created_at)}</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-strong">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    Script
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {video.script ? (
                    <>
                      <button
                        onClick={() => setShowScript(!showScript)}
                        className="flex items-center gap-2 text-sm font-medium mb-3 hover:text-primary transition-colors"
                      >
                        {showScript ? (
                          <>
                            <ChevronUp className="h-4 w-4" />
                            Hide Script
                          </>
                        ) : (
                          <>
                            <ChevronDown className="h-4 w-4" />
                            Show Script
                          </>
                        )}
                      </button>
                      {showScript && (
                        <div className="glass rounded-lg p-4">
                          <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
                            {video.script}
                          </p>
                        </div>
                      )}
                    </>
                  ) : (
                    <p className="text-sm text-muted-foreground">No script available</p>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                size="lg"
                onClick={() => {
                  const link = document.createElement("a");
                  link.href = video.final_video_url!;
                  link.download = `${video.topic.replace(/\s+/g, "-")}.mp4`;
                  link.click();
                }}
                className="flex-1"
              >
                <Download className="mr-2 h-4 w-4" />
                Download Video
              </Button>
              <Link href="/create" className="flex-1">
                <Button variant="outline" size="lg" className="w-full">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Another
                </Button>
              </Link>
            </div>

            {/* Watermark notice for free tier */}
            <Card className="glass-strong border-primary/30 bg-primary/5">
              <CardContent className="pt-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <p className="font-medium mb-1">Free videos include watermark</p>
                    <p className="text-sm text-muted-foreground">
                      Upgrade to remove watermark and get unlimited videos
                    </p>
                  </div>
                  <Button variant="outline">
                    Upgrade
                  </Button>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
