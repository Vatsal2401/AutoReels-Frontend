'use client';

import { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { socialApi, type SocialPlatform } from '@/lib/api/social';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils/format';
import {
  AlertCircle,
  Calendar,
  Camera,
  CheckCircle2,
  ChevronDown,
  Loader2,
  Music2,
  Share2,
  Youtube,
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

const PLATFORMS: Array<{
  id: SocialPlatform;
  name: string;
  Icon: React.ComponentType<{ className?: string }>;
  activeClass: string;
  comingSoon?: boolean;
}> = [
  {
    id: 'youtube',
    name: 'YouTube',
    Icon: Youtube,
    activeClass: 'border-red-500 bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400',
  },
  {
    id: 'tiktok',
    name: 'TikTok',
    Icon: Music2,
    activeClass: 'border-primary bg-primary/5 text-primary',
    comingSoon: true,
  },
  {
    id: 'instagram',
    name: 'Instagram',
    Icon: Camera,
    activeClass: 'border-pink-500 bg-pink-50 dark:bg-pink-900/10 text-pink-600 dark:text-pink-400',
    comingSoon: true,
  },
];

// ── Default datetime: now + 15 minutes ───────────────────────────────────────

function defaultScheduledAt(): string {
  const d = new Date(Date.now() + 15 * 60 * 1000);
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
    (a) => a.platform === platform && a.isActive && !a.needsReauth,
  );

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    setAccountId(platformAccounts[0]?.id ?? '');
  }, [platform, accounts]);

  // If the effect hasn't run yet (cached query → same reference → no re-render),
  // fall back to the first available account so the button isn't stuck disabled.
  const effectiveAccountId = accountId || platformAccounts[0]?.id || '';

  const scheduleMutation = useMutation({
    mutationFn: () =>
      socialApi.schedulePost({
        platform,
        connectedAccountId: effectiveAccountId,
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

  const isFuture = scheduledAt ? new Date(scheduledAt) > new Date() : false;
  const titleRequired = platform === 'youtube' && !options.title?.trim();
  const canSubmit = !!effectiveAccountId && isFuture && !titleRequired && !scheduleMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      {/*
       * flex flex-col + max-h: establishes a proper flex height boundary for scroll.
       * overflow-hidden: clip the container; inner body handles scroll with overflow-y-auto.
       */}
      <DialogContent
        className="max-w-md p-0 gap-0 rounded-2xl !translate-x-[-50%] !translate-y-[-50%] !top-[50%] !left-[50%]"
        style={{
          /* Ensure the position is shifted back by 50% of its own dimensions */
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          position: 'fixed',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '90vh',
          overflow: 'hidden',
        }}
      >
        {success ? (
          <SuccessView onClose={onClose} platform={platform} />
        ) : (
          <>
            {/* Fixed header */}
            <DialogHeader className="px-6 pt-5 pb-4 border-b border-border shrink-0">
              <div className="flex items-center gap-2 mb-0.5">
                <Share2 className="h-4 w-4 text-primary shrink-0" />
                <DialogTitle className="text-sm font-bold">Schedule to Social</DialogTitle>
              </div>
              <p className="text-[11px] text-muted-foreground line-clamp-1 pl-6" title={videoTopic}>
                {videoTopic}
              </p>
            </DialogHeader>

            {/* Scrollable body — min-h-0 is required for flex children to shrink & scroll */}
            <div className="flex-1 min-h-0 overflow-y-auto px-6 py-5 space-y-5">
              {/* Platform selector — horizontal segmented control */}
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">
                  Platform
                </label>
                <div className="flex gap-2">
                  {PLATFORMS.map(({ id, name, Icon, activeClass, comingSoon }) => {
                    const isActive = platform === id;
                    return (
                      <div key={id} className="relative group flex-1">
                        <button
                          type="button"
                          onClick={() => !comingSoon && setPlatform(id)}
                          disabled={comingSoon}
                          className={cn(
                            'w-full flex items-center justify-center gap-1.5 h-10 rounded-xl border text-[11px] font-bold transition-all',
                            comingSoon
                              ? 'border-border text-muted-foreground/40 bg-muted/20 cursor-not-allowed'
                              : isActive
                              ? activeClass
                              : 'border-border text-muted-foreground hover:text-foreground hover:bg-muted/30',
                          )}
                        >
                          <Icon className="h-3.5 w-3.5 shrink-0" />
                          <span>{name}</span>
                        </button>
                        {comingSoon && (
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:flex items-center whitespace-nowrap bg-foreground text-background text-[11px] font-medium px-2.5 py-1.5 rounded-lg shadow-lg pointer-events-none z-10">
                            Coming soon
                            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-foreground" />
                          </div>
                        )}
                      </div>
                    );
                  })}
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
                      className={inputClass + ' appearance-none pr-9'}
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
                  className={inputClass}
                />
                {scheduledAt && !isFuture && (
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

            {/* Fixed footer */}
            <div className="px-6 py-4 border-t border-border flex items-center gap-3 shrink-0 bg-background">
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

  // Keep raw tags string in local state so commas aren't eaten by the
  // controlled-input round-trip (value derived from array → join → comma lost).
  const [tagsRaw, setTagsRaw] = useState(() => (options.tags ?? []).join(', '));

  if (platform === 'youtube') {
    return (
      <div className="space-y-3 pt-1 border-t border-border">
        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground pt-3">
          YouTube Options
        </p>
        <FieldRow label="Title *">
          <input
            type="text"
            value={options.title ?? ''}
            onChange={(e) => set('title', e.target.value)}
            maxLength={100}
            className={cn(inputClass, !options.title?.trim() && 'border-destructive/50 focus:border-destructive focus:ring-destructive/20')}
            placeholder="Enter a YouTube title (required)"
          />
          {!options.title?.trim() && (
            <p className="mt-1 text-[11px] text-destructive flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              Title is required
            </p>
          )}
        </FieldRow>
        <FieldRow label="Description">
          <textarea
            value={options.description ?? ''}
            onChange={(e) => set('description', e.target.value)}
            maxLength={5000}
            rows={2}
            className={cn(inputClass, 'h-auto py-2 resize-none')}
            placeholder="Optional description"
          />
        </FieldRow>
        <FieldRow label="Tags (comma-separated)">
          <input
            type="text"
            value={tagsRaw}
            onChange={(e) => {
              setTagsRaw(e.target.value);
              set(
                'tags',
                e.target.value
                  .split(',')
                  .map((t: string) => t.trim())
                  .filter(Boolean),
              );
            }}
            className={inputClass}
            placeholder="ai, shorts, viral"
          />
        </FieldRow>
        <FieldRow label="Privacy">
          <SelectField
            value={options.privacyStatus ?? 'public'}
            onChange={(v) => set('privacyStatus', v)}
          >
            <option value="public">Public</option>
            <option value="unlisted">Unlisted</option>
            <option value="private">Private</option>
          </SelectField>
        </FieldRow>
      </div>
    );
  }

  if (platform === 'tiktok') {
    return (
      <div className="space-y-3 pt-1 border-t border-border">
        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground pt-3">
          TikTok Options
        </p>
        <FieldRow label="Title">
          <input
            type="text"
            value={options.title ?? videoTopic}
            onChange={(e) => set('title', e.target.value)}
            maxLength={150}
            className={inputClass}
            placeholder="Video title"
          />
        </FieldRow>
        <FieldRow label="Privacy">
          <SelectField
            value={options.privacyLevel ?? 'PUBLIC_TO_EVERYONE'}
            onChange={(v) => set('privacyLevel', v)}
          >
            <option value="PUBLIC_TO_EVERYONE">Public</option>
            <option value="MUTUAL_FOLLOW_FRIENDS">Mutual Follow Friends</option>
            <option value="FOLLOWER_OF_CREATOR">Followers Only</option>
            <option value="SELF_ONLY">Private (Self Only)</option>
          </SelectField>
        </FieldRow>
      </div>
    );
  }

  if (platform === 'instagram') {
    return (
      <div className="space-y-3 pt-1 border-t border-border">
        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground pt-3">
          Instagram Options
        </p>
        <FieldRow label="Caption">
          <textarea
            value={options.caption ?? ''}
            onChange={(e) => set('caption', e.target.value)}
            maxLength={2200}
            rows={2}
            className={cn(inputClass, 'h-auto py-2 resize-none')}
            placeholder="Reel caption with #hashtags (optional)"
          />
        </FieldRow>
        <div className="flex items-center justify-between py-1">
          <div>
            <p className="text-xs font-medium text-foreground">Share to Feed</p>
            <p className="text-[10px] text-muted-foreground">Also appear in your profile grid</p>
          </div>
          <Toggle on={options.shareToFeed ?? true} onChange={(v) => set('shareToFeed', v)} />
        </div>
      </div>
    );
  }

  return null;
}

// ── Small reusable components ─────────────────────────────────────────────────

function FieldRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[10px] text-muted-foreground mb-1">{label}</label>
      {children}
    </div>
  );
}

function SelectField({
  value,
  onChange,
  children,
}: {
  value: string;
  onChange: (v: string) => void;
  children: React.ReactNode;
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={inputClass + ' appearance-none pr-9'}
      >
        {children}
      </select>
      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
    </div>
  );
}

function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!on)}
      className={cn(
        'relative w-10 h-6 rounded-full border-2 transition-colors shrink-0',
        on ? 'bg-primary border-primary' : 'bg-muted border-border',
      )}
      aria-checked={on}
      role="switch"
    >
      <span
        className={cn(
          'absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform',
          on ? 'translate-x-4' : 'translate-x-0.5',
        )}
      />
    </button>
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
  videoTopic: string,
): Record<string, any> {
  if (platform === 'youtube') {
    return {
      title: options.title || '',
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
