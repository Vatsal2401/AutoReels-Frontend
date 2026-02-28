'use client';

import { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { socialApi, type SocialPlatform, type ConnectedAccount } from '@/lib/api/social';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils/format';
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  ChevronDown,
  Loader2,
  Share2,
  X,
} from 'lucide-react';
import Link from 'next/link';

// ── Types ─────────────────────────────────────────────────────────────────────

interface SchedulePostModalProps {
  open: boolean;
  onClose: () => void;
  videoId: string;
  videoS3Key: string;
  videoTopic: string;
}

// ── Platform config ──────────────────────────────────────────────────────────

const PLATFORMS: Array<{ id: SocialPlatform; name: string; logo: string; color: string }> = [
  { id: 'youtube', name: 'YouTube', logo: '▶', color: 'text-red-600' },
  { id: 'tiktok', name: 'TikTok', logo: '♪', color: 'text-foreground' },
  { id: 'instagram', name: 'Instagram', logo: '◈', color: 'text-pink-600' },
];

// ── Default datetime: now + 15 minutes ───────────────────────────────────────

function defaultScheduledAt(): string {
  const d = new Date(Date.now() + 15 * 60 * 1000);
  // Format as YYYY-MM-DDTHH:MM for datetime-local input
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

// ── Main modal ────────────────────────────────────────────────────────────────

export function SchedulePostModal({
  open,
  onClose,
  videoId: _videoId,
  videoS3Key,
  videoTopic,
}: SchedulePostModalProps) {
  const queryClient = useQueryClient();

  const [platform, setPlatform] = useState<SocialPlatform>('youtube');
  const [accountId, setAccountId] = useState<string>('');
  const [scheduledAt, setScheduledAt] = useState(defaultScheduledAt());
  const [options, setOptions] = useState<Record<string, any>>({});
  const [success, setSuccess] = useState(false);

  // Reset state when modal opens
  useEffect(() => {
    if (open) {
      setPlatform('youtube');
      setAccountId('');
      setScheduledAt(defaultScheduledAt());
      setOptions({});
      setSuccess(false);
    }
  }, [open]);

  const { data: accounts = [], isLoading: accountsLoading } = useQuery({
    queryKey: ['social-accounts'],
    queryFn: socialApi.listAccounts,
    enabled: open,
  });

  const platformAccounts = accounts.filter(
    (a) => a.platform === platform && a.isActive && !a.needsReauth
  );

  // Auto-select first account when platform or accounts list changes
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    setAccountId(platformAccounts[0]?.id ?? '');
  }, [platform, accounts]); // platformAccounts is derived from accounts — no need to add it

  const scheduleMutation = useMutation({
    mutationFn: () =>
      socialApi.schedulePost({
        platform,
        connectedAccountId: accountId,
        videoS3Key,
        videoTopic,
        scheduledAt: new Date(scheduledAt).toISOString(),
        publishOptions: buildPublishOptions(platform, options, videoTopic),
      }),
    onSuccess: () => {
      setSuccess(true);
      queryClient.invalidateQueries({ queryKey: ['social-posts'] });
    },
  });

  const canSubmit =
    !!accountId &&
    !!scheduledAt &&
    new Date(scheduledAt) > new Date() &&
    !scheduleMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md p-0 gap-0 overflow-hidden rounded-2xl">
        {success ? (
          <SuccessView onClose={onClose} platform={platform} />
        ) : (
          <>
            <DialogHeader className="px-6 pt-6 pb-4 border-b border-border">
              <div className="flex items-center gap-2">
                <Share2 className="h-4 w-4 text-primary" />
                <DialogTitle className="text-sm font-bold">Schedule to Social Media</DialogTitle>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5 truncate">
                {videoTopic}
              </p>
            </DialogHeader>

            <div className="px-6 py-5 space-y-5">
              {/* Platform selector */}
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">
                  Platform
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {PLATFORMS.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setPlatform(p.id)}
                      className={cn(
                        'flex flex-col items-center gap-1 py-3 rounded-xl border text-xs font-bold transition-all',
                        platform === p.id
                          ? 'border-primary bg-primary/5 text-primary'
                          : 'border-border text-muted-foreground hover:border-border hover:text-foreground hover:bg-muted/30'
                      )}
                    >
                      <span className={cn('text-lg', platform === p.id ? 'text-primary' : p.color)}>
                        {p.logo}
                      </span>
                      <span>{p.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Account selector */}
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">
                  Account
                </label>
                {accountsLoading ? (
                  <div className="flex items-center gap-2 h-10 text-xs text-muted-foreground">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Loading accounts…
                  </div>
                ) : platformAccounts.length === 0 ? (
                  <NoAccountWarning platform={platform} />
                ) : (
                  <div className="relative">
                    <select
                      value={accountId}
                      onChange={(e) => setAccountId(e.target.value)}
                      className="w-full h-10 pl-3 pr-9 rounded-xl border border-border bg-background text-sm font-medium text-foreground appearance-none focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                    >
                      {platformAccounts.map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.accountName || a.platformAccountId}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  </div>
                )}
              </div>

              {/* Schedule time */}
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">
                  Publish Time
                </label>
                <input
                  type="datetime-local"
                  value={scheduledAt}
                  onChange={(e) => setScheduledAt(e.target.value)}
                  min={defaultScheduledAt()}
                  className="w-full h-10 px-3 rounded-xl border border-border bg-background text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                />
                {scheduledAt && new Date(scheduledAt) <= new Date() && (
                  <p className="mt-1 text-[11px] text-destructive flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    Must be in the future
                  </p>
                )}
              </div>

              {/* Platform-specific options */}
              <PlatformOptions
                platform={platform}
                options={options}
                onChange={setOptions}
                videoTopic={videoTopic}
              />

              {/* Error */}
              {scheduleMutation.isError && (
                <div className="flex items-start gap-2 p-3 rounded-xl bg-destructive/5 border border-destructive/20 text-destructive text-xs">
                  <AlertCircle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                  <span>
                    {(scheduleMutation.error as any)?.response?.data?.message ||
                      'Failed to schedule. Please try again.'}
                  </span>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 pb-6 flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                className="flex-1 text-xs font-bold"
                onClick={onClose}
                disabled={scheduleMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                className="flex-1 text-xs font-bold gap-1.5"
                onClick={() => scheduleMutation.mutate()}
                disabled={!canSubmit || platformAccounts.length === 0}
              >
                {scheduleMutation.isPending ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <Calendar className="h-3 w-3" />
                )}
                Schedule
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

// ── Platform-specific options ────────────────────────────────────────────────

function PlatformOptions({
  platform,
  options,
  onChange,
  videoTopic,
}: {
  platform: SocialPlatform;
  options: Record<string, any>;
  onChange: (opts: Record<string, any>) => void;
  videoTopic: string;
}) {
  const set = (key: string, value: any) => onChange({ ...options, [key]: value });

  if (platform === 'youtube') {
    return (
      <div className="space-y-3">
        <OptionLabel>YouTube Options</OptionLabel>
        <div>
          <label className="block text-[10px] text-muted-foreground mb-1">Title</label>
          <input
            type="text"
            value={options.title ?? videoTopic}
            onChange={(e) => set('title', e.target.value)}
            maxLength={100}
            className={inputClass}
            placeholder="Video title"
          />
        </div>
        <div>
          <label className="block text-[10px] text-muted-foreground mb-1">Description</label>
          <textarea
            value={options.description ?? ''}
            onChange={(e) => set('description', e.target.value)}
            maxLength={5000}
            rows={3}
            className={cn(inputClass, 'h-auto py-2 resize-none')}
            placeholder="Video description (optional)"
          />
        </div>
        <div>
          <label className="block text-[10px] text-muted-foreground mb-1">
            Tags <span className="opacity-50">(comma-separated)</span>
          </label>
          <input
            type="text"
            value={(options.tags ?? []).join(', ')}
            onChange={(e) =>
              set(
                'tags',
                e.target.value
                  .split(',')
                  .map((t: string) => t.trim())
                  .filter(Boolean)
              )
            }
            className={inputClass}
            placeholder="ai, shorts, viral"
          />
        </div>
        <div>
          <label className="block text-[10px] text-muted-foreground mb-1">Privacy</label>
          <div className="relative">
            <select
              value={options.privacyStatus ?? 'public'}
              onChange={(e) => set('privacyStatus', e.target.value)}
              className={cn(inputClass, 'appearance-none pr-9')}
            >
              <option value="public">Public</option>
              <option value="unlisted">Unlisted</option>
              <option value="private">Private</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          </div>
        </div>
      </div>
    );
  }

  if (platform === 'tiktok') {
    return (
      <div className="space-y-3">
        <OptionLabel>TikTok Options</OptionLabel>
        <div>
          <label className="block text-[10px] text-muted-foreground mb-1">Title</label>
          <input
            type="text"
            value={options.title ?? videoTopic}
            onChange={(e) => set('title', e.target.value)}
            maxLength={150}
            className={inputClass}
            placeholder="Video title"
          />
        </div>
        <div>
          <label className="block text-[10px] text-muted-foreground mb-1">Privacy</label>
          <div className="relative">
            <select
              value={options.privacyLevel ?? 'PUBLIC_TO_EVERYONE'}
              onChange={(e) => set('privacyLevel', e.target.value)}
              className={cn(inputClass, 'appearance-none pr-9')}
            >
              <option value="PUBLIC_TO_EVERYONE">Public</option>
              <option value="MUTUAL_FOLLOW_FRIENDS">Mutual Follow Friends</option>
              <option value="FOLLOWER_OF_CREATOR">Followers Only</option>
              <option value="SELF_ONLY">Private (Self Only)</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          </div>
        </div>
      </div>
    );
  }

  if (platform === 'instagram') {
    return (
      <div className="space-y-3">
        <OptionLabel>Instagram Options</OptionLabel>
        <div>
          <label className="block text-[10px] text-muted-foreground mb-1">Caption</label>
          <textarea
            value={options.caption ?? ''}
            onChange={(e) => set('caption', e.target.value)}
            maxLength={2200}
            rows={3}
            className={cn(inputClass, 'h-auto py-2 resize-none')}
            placeholder="Reel caption with #hashtags (optional)"
          />
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-foreground">Share to Feed</p>
            <p className="text-[10px] text-muted-foreground">Also appear in your profile grid</p>
          </div>
          <button
            type="button"
            onClick={() => set('shareToFeed', !(options.shareToFeed ?? true))}
            className={cn(
              'relative w-10 h-5.5 rounded-full border transition-colors',
              (options.shareToFeed ?? true)
                ? 'bg-primary border-primary'
                : 'bg-muted border-border'
            )}
          >
            <span
              className={cn(
                'absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform',
                (options.shareToFeed ?? true) ? 'translate-x-5' : 'translate-x-0.5'
              )}
            />
          </button>
        </div>
      </div>
    );
  }

  return null;
}

// ── Helper components ─────────────────────────────────────────────────────────

function OptionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground border-t border-border pt-3">
      {children}
    </p>
  );
}

function NoAccountWarning({ platform }: { platform: SocialPlatform }) {
  const name = PLATFORMS.find((p) => p.id === platform)?.name ?? platform;
  return (
    <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/30 text-amber-700 dark:text-amber-400">
      <AlertCircle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
      <div>
        <p className="text-xs font-medium">No {name} account connected</p>
        <p className="text-[11px] mt-0.5">
          <Link href="/social/accounts" className="underline underline-offset-2">
            Connect your {name} account
          </Link>{' '}
          to schedule posts.
        </p>
      </div>
    </div>
  );
}

function SuccessView({ onClose, platform }: { onClose: () => void; platform: SocialPlatform }) {
  const name = PLATFORMS.find((p) => p.id === platform)?.name ?? platform;
  return (
    <div className="flex flex-col items-center justify-center py-12 px-8 text-center">
      <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-800/30 mb-4">
        <CheckCircle2 className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
      </div>
      <h3 className="text-sm font-bold text-foreground mb-1">Scheduled!</h3>
      <p className="text-xs text-muted-foreground mb-6">
        Your video has been queued for publishing to {name}.
      </p>
      <div className="flex gap-3">
        <Link href="/social/posts">
          <Button size="sm" variant="outline" className="text-xs" onClick={onClose}>
            View Posts
          </Button>
        </Link>
        <Button size="sm" className="text-xs" onClick={onClose}>
          Done
        </Button>
      </div>
    </div>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const inputClass =
  'w-full h-10 px-3 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors';

function buildPublishOptions(
  platform: SocialPlatform,
  options: Record<string, any>,
  videoTopic: string
): Record<string, any> {
  if (platform === 'youtube') {
    return {
      title: options.title || videoTopic,
      description: options.description || '',
      tags: options.tags || [],
      privacyStatus: options.privacyStatus || 'public',
    };
  }
  if (platform === 'tiktok') {
    return {
      title: options.title || videoTopic,
      privacyLevel: options.privacyLevel || 'PUBLIC_TO_EVERYONE',
    };
  }
  if (platform === 'instagram') {
    return {
      caption: options.caption || '',
      shareToFeed: options.shareToFeed ?? true,
    };
  }
  return options;
}
