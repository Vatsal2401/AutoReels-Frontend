'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { cn } from '@/lib/utils/format';
import { Button } from '@/components/ui/button';
import { PipelineStatusBadge } from './PipelineStatusBadge';
import { campaignsApi, type CampaignPost, type CampaignPostType } from '@/lib/api/campaigns';

const POST_TYPE_META: Record<CampaignPostType, { icon: string; bgClass: string }> = {
  reel:           { icon: '🎬', bgClass: 'bg-pink-500/10' },
  carousel:       { icon: '🖼️', bgClass: 'bg-blue-500/10' },
  story:          { icon: '⏱️', bgClass: 'bg-amber-500/10' },
  ugc_video:      { icon: '🤳', bgClass: 'bg-emerald-500/10' },
  image:          { icon: '🖼️', bgClass: 'bg-primary/8' },
  graphic_motion: { icon: '✨', bgClass: 'bg-amber-500/10' },
};

const PLATFORM_TAGS: Record<string, { label: string; className: string }> = {
  instagram: { label: '📷 Instagram', className: 'bg-pink-500/10 text-pink-600 dark:text-pink-400' },
  tiktok:    { label: '🎵 TikTok',    className: 'bg-blue-500/10 text-blue-600 dark:text-blue-400' },
  youtube:   { label: '▶️ YouTube',   className: 'bg-red-500/10 text-red-600 dark:text-red-400' },
};

interface Props {
  post: CampaignPost;
  campaignId: string;
  onEdit?: (post: CampaignPost) => void;
}

export function CampaignPostCard({ post, campaignId, onEdit }: Props) {
  const queryClient = useQueryClient();
  const meta = POST_TYPE_META[post.post_type] ?? POST_TYPE_META.reel;
  const [showScheduler, setShowScheduler] = useState(false);
  const [scheduledAt, setScheduledAt] = useState('');

  const { mutate: deletePost, isPending: isDeleting } = useMutation({
    mutationFn: () => campaignsApi.deletePost(campaignId, post.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaign-posts', campaignId] });
      queryClient.invalidateQueries({ queryKey: ['campaign', campaignId] });
      toast.success('Post removed');
    },
    onError: () => toast.error('Failed to remove post'),
  });

  const { mutate: schedulePost, isPending: isScheduling } = useMutation({
    mutationFn: () => campaignsApi.schedulePost(campaignId, post.id, { scheduled_at: new Date(scheduledAt).toISOString() }),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['campaign-posts', campaignId] });
      setShowScheduler(false);
      if (result.blockedAccounts?.length) {
        toast.warning(`Scheduled but ${result.blockedAccounts.length} account(s) hit posting limits`);
      } else {
        toast.success('Post scheduled successfully');
      }
    },
    onError: () => toast.error('Failed to schedule post'),
  });

  const isGenerating = post.pipeline_status === 'generating';
  const isAwaitingSchedule = post.pipeline_status === 'awaiting_schedule';
  const isScheduled = post.pipeline_status === 'scheduled';
  const isPublished = post.pipeline_status === 'published';
  const isLocked = isGenerating;

  const typeName = post.post_type.replace('_', ' ');
  const titleText = post.title
    ? `${typeName.charAt(0).toUpperCase() + typeName.slice(1)} — "${post.title}"`
    : typeName.charAt(0).toUpperCase() + typeName.slice(1);

  const sourceLabel = post.content_source === 'new' ? 'New' : 'Existing';

  return (
    <div
      className={cn(
        'bg-card border rounded-xl overflow-hidden transition-all shadow-sm',
        isAwaitingSchedule && 'border-amber-400/40',
        isGenerating && 'border-primary/25',
      )}
    >
      {/* Head */}
      <div
        className={cn(
          'flex items-center gap-3 px-4 py-3 border-b',
          isAwaitingSchedule ? 'bg-amber-500/5' : 'bg-muted/30',
        )}
      >
        <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center text-lg flex-shrink-0', meta.bgClass)}>
          {meta.icon}
        </div>

        <div className="flex-1 min-w-0">
          <div className="text-[13.5px] font-semibold text-foreground truncate">{titleText}</div>
          <div className={cn('text-[11.5px] mt-0.5', isGenerating ? 'text-primary' : isAwaitingSchedule ? 'text-amber-700 dark:text-amber-400 font-semibold' : 'text-muted-foreground')}>
            {isGenerating
              ? '✦ AI is generating your content…'
              : isAwaitingSchedule
              ? '⚠️ Action required — set a publish time to continue'
              : isScheduled && post.scheduled_at
              ? `Publishes ${new Date(post.scheduled_at).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}`
              : isPublished && post.published_at
              ? `Published ${new Date(post.published_at).toLocaleDateString()}`
              : 'Content ready'}
          </div>
        </div>

        <div className="flex items-center gap-4 ml-auto">
          <PipelineStatusBadge status={post.pipeline_status} />
          {(['Views', 'Likes', 'Eng.'] as const).map((label) => (
            <div key={label} className="text-center hidden sm:block">
              <div className="text-[12.5px] font-bold text-muted-foreground font-mono">—</div>
              <div className="text-[10px] text-muted-foreground mt-0.5">{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Body */}
      <div className={cn('px-4 py-3 text-[12.5px] text-muted-foreground', isGenerating && 'bg-primary/5')}>
        {isGenerating ? (
          <div className="italic text-xs text-muted-foreground/70">
            Generating script, hook, and captions… usually takes under 30 seconds.
          </div>
        ) : (
          <>
            {post.hook && (
              <div className="mb-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60">Hook </span>
                <span className="font-semibold text-foreground">{post.hook}</span>
              </div>
            )}
            {post.caption && <div className="text-muted-foreground line-clamp-2">{post.caption}</div>}
            {!post.hook && !post.caption && (
              <span className="text-muted-foreground/60 italic">No content yet</span>
            )}
          </>
        )}

        <div className="flex items-center gap-2 mt-2.5 flex-wrap">
          <div className="flex gap-1.5 flex-wrap">
            {(post.target_platforms.length > 0 ? post.target_platforms : ['instagram']).map((p) => {
              const tag = PLATFORM_TAGS[p];
              if (!tag) return null;
              return (
                <span key={p} className={cn('text-[10.5px] font-semibold px-2 py-0.5 rounded-md', tag.className)}>
                  {tag.label}
                </span>
              );
            })}
          </div>
          <div className="ml-auto flex items-center gap-1.5 bg-muted/40 border rounded-md px-2 py-0.5 text-[11px] font-semibold text-muted-foreground">
            <span className="w-1.5 h-1.5 rounded-full bg-primary/60" />
            {post.source_entity_type ?? 'Reel Generator'} · {sourceLabel}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 py-2 border-t flex items-center gap-1">
        <button
          className={cn(
            'flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-md transition-colors',
            isLocked ? 'text-muted-foreground/50 cursor-not-allowed' : 'text-primary hover:bg-primary/8',
          )}
          disabled={isLocked}
        >
          ✦ AI Variant
        </button>
        <button
          onClick={() => onEdit?.(post)}
          className={cn(
            'flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-md transition-colors',
            isLocked ? 'text-muted-foreground/50 cursor-not-allowed' : 'text-muted-foreground hover:text-foreground hover:bg-muted/60',
          )}
          disabled={isLocked}
        >
          ✏️ Edit
        </button>

        {(post.pipeline_status === 'ready' || post.pipeline_status === 'awaiting_schedule') && (
          <button
            onClick={() => setShowScheduler((v) => !v)}
            className={cn(
              'flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-md transition-colors',
              isAwaitingSchedule
                ? 'text-amber-700 bg-amber-500/8 hover:bg-amber-500/15'
                : 'text-blue-600 dark:text-blue-400 hover:bg-blue-500/8',
            )}
          >
            {isAwaitingSchedule ? '⚠️ Set Schedule' : '📅 Schedule'}
          </button>
        )}

        {isScheduled && (
          <button
            onClick={() => setShowScheduler((v) => !v)}
            className="flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-md text-blue-600 dark:text-blue-400 hover:bg-blue-500/8 transition-colors"
          >
            📅 Reschedule
          </button>
        )}

        <button
          onClick={() => deletePost()}
          disabled={isDeleting || isLocked}
          className="ml-auto flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-md text-red-500 hover:bg-red-500/8 transition-colors disabled:opacity-40"
        >
          🗑 Remove
        </button>
      </div>

      {/* Inline schedule panel */}
      {showScheduler && (
        <div className="border-t bg-muted/30 px-4 py-3 flex items-center gap-3 flex-wrap">
          <label className="text-xs font-semibold text-muted-foreground whitespace-nowrap">
            📅 Publish at
          </label>
          <input
            type="datetime-local"
            value={scheduledAt}
            min={new Date().toISOString().slice(0, 16)}
            onChange={(e) => setScheduledAt(e.target.value)}
            className="text-xs bg-card border rounded-md px-2.5 py-1.5 outline-none focus:ring-1 focus:ring-primary font-mono"
          />
          <Button
            size="sm"
            className="h-7 text-xs"
            disabled={!scheduledAt || isScheduling}
            onClick={() => schedulePost()}
          >
            {isScheduling ? 'Scheduling…' : 'Confirm'}
          </Button>
          <button
            onClick={() => setShowScheduler(false)}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}
