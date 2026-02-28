'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { socialApi, type ScheduledPost, type PostStatus } from '@/lib/api/social';
import Link from 'next/link';
import {
  Calendar,
  Clock,
  Loader2,
  RefreshCw,
  Share2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Upload,
  ListVideo,
} from 'lucide-react';
import { cn, formatRelativeTime } from '@/lib/utils/format';

// ── Status config ─────────────────────────────────────────────────────────────

const STATUS_TABS: Array<{ label: string; value: PostStatus | 'all' }> = [
  { label: 'All', value: 'all' },
  { label: 'Pending', value: 'pending' },
  { label: 'Uploading', value: 'uploading' },
  { label: 'Success', value: 'success' },
  { label: 'Failed', value: 'failed' },
  { label: 'Cancelled', value: 'cancelled' },
];

const PLATFORM_LABELS: Record<string, string> = {
  youtube: 'YouTube',
  tiktok: 'TikTok',
  instagram: 'Instagram',
};

const PLATFORM_COLORS: Record<string, string> = {
  youtube: 'text-red-600 bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800/30',
  tiktok: 'text-foreground bg-zinc-50 dark:bg-zinc-900/20 border-zinc-200 dark:border-zinc-700/30',
  instagram: 'text-pink-600 bg-pink-50 dark:bg-pink-900/10 border-pink-200 dark:border-pink-800/30',
};

function StatusBadge({ status }: { status: PostStatus }) {
  const config: Record<PostStatus, { label: string; className: string; icon: React.ReactNode }> = {
    pending: {
      label: 'Pending',
      className: 'bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-900/10 dark:text-amber-400 dark:border-amber-800/30',
      icon: <Clock className="h-3 w-3" />,
    },
    uploading: {
      label: 'Uploading',
      className: 'bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-900/10 dark:text-blue-400 dark:border-blue-800/30',
      icon: <Upload className="h-3 w-3 animate-bounce" />,
    },
    success: {
      label: 'Published',
      className: 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-900/10 dark:text-emerald-400 dark:border-emerald-800/30',
      icon: <CheckCircle2 className="h-3 w-3" />,
    },
    failed: {
      label: 'Failed',
      className: 'bg-red-50 text-red-600 border-red-200 dark:bg-red-900/10 dark:text-red-400 dark:border-red-800/30',
      icon: <AlertCircle className="h-3 w-3" />,
    },
    cancelled: {
      label: 'Cancelled',
      className: 'bg-muted text-muted-foreground border-border',
      icon: <XCircle className="h-3 w-3" />,
    },
  };

  const { label, className, icon } = config[status] ?? config.pending;

  return (
    <Badge variant="outline" className={cn('text-[10px] gap-1 font-semibold', className)}>
      {icon}
      {label}
    </Badge>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function ScheduledPostsPage() {
  const [activeTab, setActiveTab] = useState<PostStatus | 'all'>('all');
  const queryClient = useQueryClient();

  const { data: posts = [], isLoading, refetch } = useQuery({
    queryKey: ['social-posts', activeTab],
    queryFn: () => socialApi.listPosts(activeTab === 'all' ? undefined : activeTab),
  });

  const cancelMutation = useMutation({
    mutationFn: socialApi.cancelPost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['social-posts'] });
    },
  });

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-primary/10 border border-primary/20">
              <Calendar className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground">Scheduled Posts</h1>
              <p className="text-xs text-muted-foreground">
                Track and manage your video publishing queue
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => refetch()}
              className="text-xs text-muted-foreground gap-1.5"
            >
              <RefreshCw className="h-3 w-3" />
              Refresh
            </Button>
            <Link href="/social/accounts">
              <Button size="sm" className="text-xs gap-1.5">
                <Share2 className="h-3 w-3" />
                Accounts
              </Button>
            </Link>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 bg-muted/40 rounded-xl border border-border mb-6 overflow-x-auto">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={cn(
                'flex-shrink-0 px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all',
                activeTab === tab.value
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : posts.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="flex flex-col gap-3">
            {posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onCancel={() => cancelMutation.mutate(post.id)}
                isCancelling={cancelMutation.isPending && cancelMutation.variables === post.id}
              />
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

function PostCard({
  post,
  onCancel,
  isCancelling,
}: {
  post: ScheduledPost;
  onCancel: () => void;
  isCancelling: boolean;
}) {
  const canCancel = post.status === 'pending';
  const scheduledDate = new Date(post.scheduled_at);
  const isPast = scheduledDate < new Date();

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          {/* Platform badge */}
          <div
            className={cn(
              'flex items-center justify-center w-10 h-10 rounded-xl text-xs font-black shrink-0 border',
              PLATFORM_COLORS[post.platform] ?? 'bg-muted text-muted-foreground border-border'
            )}
          >
            {post.platform === 'youtube' && '▶'}
            {post.platform === 'tiktok' && '♪'}
            {post.platform === 'instagram' && '◈'}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                {PLATFORM_LABELS[post.platform] ?? post.platform}
              </span>
              <StatusBadge status={post.status} />
            </div>

            <p className="text-sm font-medium text-foreground truncate mb-2">
              {post.video_topic || 'Untitled video'}
            </p>

            <div className="flex items-center gap-4 text-[11px] text-muted-foreground">
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {isPast ? 'Was scheduled' : 'Scheduled'}{' '}
                {formatRelativeTime(post.scheduled_at)}
              </span>
              {post.upload_progress_pct > 0 && post.status === 'uploading' && (
                <span className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
                  <Upload className="h-3 w-3" />
                  {post.upload_progress_pct}%
                </span>
              )}
              {post.platform_post_id && (
                <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="h-3 w-3" />
                  Published
                </span>
              )}
            </div>

            {post.error_message && (
              <div className="mt-2 flex items-start gap-1.5 text-red-600 dark:text-red-400">
                <AlertCircle className="h-3 w-3 mt-0.5 shrink-0" />
                <span className="text-[11px] leading-relaxed">{post.error_message}</span>
              </div>
            )}

            {/* Upload progress bar */}
            {post.status === 'uploading' && post.upload_progress_pct > 0 && (
              <div className="mt-2 h-1.5 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full transition-all duration-300"
                  style={{ width: `${post.upload_progress_pct}%` }}
                />
              </div>
            )}
          </div>

          {/* Actions */}
          {canCancel && (
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-destructive hover:bg-destructive/5 hover:text-destructive gap-1.5 shrink-0"
              onClick={onCancel}
              disabled={isCancelling}
            >
              {isCancelling ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <Trash2 className="h-3 w-3" />
              )}
              Cancel
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-muted/50 border border-border mb-4">
        <ListVideo className="h-7 w-7 text-muted-foreground/50" />
      </div>
      <h3 className="text-sm font-bold text-foreground mb-1">No scheduled posts</h3>
      <p className="text-xs text-muted-foreground mb-6 max-w-xs leading-relaxed">
        Open any completed video and click "Schedule to Social" to publish it to your connected accounts.
      </p>
      <Link href="/dashboard">
        <Button size="sm" variant="outline" className="text-xs">
          Go to Dashboard
        </Button>
      </Link>
    </div>
  );
}
