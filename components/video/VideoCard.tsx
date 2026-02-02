'use client';

import Link from 'next/link';
import { Video, VideoStatus } from '@/lib/api/videos';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatRelativeTime } from '@/lib/utils/format';
import { Download, Play, AlertCircle, Loader2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils/format';

interface VideoCardProps {
  video: Video;
}

const statusConfig: Record<
  VideoStatus,
  { label: string; variant: 'default' | 'secondary' | 'destructive' | 'success' }
> = {
  pending: { label: 'Pending', variant: 'secondary' },
  script_generating: { label: 'Generating...', variant: 'secondary' },
  script_complete: { label: 'Processing', variant: 'secondary' },
  processing: { label: 'Processing', variant: 'secondary' },
  rendering: { label: 'Rendering', variant: 'secondary' },
  completed: { label: 'Completed', variant: 'success' },
  failed: { label: 'Failed', variant: 'destructive' },
};

export function VideoCard({ video }: VideoCardProps) {
  const config = statusConfig[video.status];
  const isProcessing = [
    'pending',
    'script_generating',
    'script_complete',
    'processing',
    'rendering',
  ].includes(video.status);
  const isCompleted = video.status === 'completed';
  const isFailed = video.status === 'failed';

  return (
    <Card
      className={cn(
        'overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-glow group',
      )}
    >
      <CardContent className="p-0">
        <Link href={`/videos/${video.id}`} aria-label={`View video: ${video.topic}`}>
          <div className="relative aspect-video bg-gradient-ai flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-accent/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            {isProcessing ? (
              <div className="flex flex-col items-center gap-3 relative z-10">
                <div className="relative">
                  <Loader2 className="h-10 w-10 animate-spin text-primary" />
                  <div className="absolute inset-0 animate-ping">
                    <Loader2 className="h-10 w-10 text-primary/30" />
                  </div>
                </div>
                <span className="text-sm text-muted-foreground font-medium">Almost ready...</span>
              </div>
            ) : isCompleted ? (
              <div className="flex flex-col items-center gap-3 relative z-10">
                <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary/20 backdrop-blur-sm border border-primary/30">
                  <Play className="h-8 w-8 text-primary" />
                </div>
                <span className="text-sm text-muted-foreground font-medium">Click to view</span>
              </div>
            ) : isFailed ? (
              <div className="flex flex-col items-center gap-3 relative z-10">
                <div className="flex items-center justify-center w-16 h-16 rounded-full bg-destructive/20 backdrop-blur-sm border border-destructive/30">
                  <AlertCircle className="h-8 w-8 text-destructive" />
                </div>
                <span className="text-sm text-muted-foreground font-medium">Generation failed</span>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <Play className="h-8 w-8 text-muted-foreground" />
              </div>
            )}
          </div>
        </Link>
        <div className="px-5 py-6 space-y-3">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold line-clamp-2 flex-1 text-sm group-hover:text-primary transition-colors">
              {video.topic}
            </h3>
            <Badge
              variant={config.variant}
              className={cn('shrink-0', isProcessing && 'animate-pulse')}
            >
              {config.label}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">{formatRelativeTime(video.created_at)}</p>
          <div className="flex items-center gap-2">
            <Link href={`/videos/${video.id}`} className="flex-1">
              <Button variant="outline" size="sm" className="w-full">
                View
              </Button>
            </Link>
            {isCompleted && video.final_video_url && (
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  window.open(video.final_video_url!, '_blank');
                }}
                aria-label={`Download video: ${video.topic}`}
              >
                <Download className="h-4 w-4" />
                <span className="sr-only">Download</span>
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
