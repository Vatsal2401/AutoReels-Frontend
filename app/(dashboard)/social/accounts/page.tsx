'use client';

import { useState, useEffect, Suspense } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { socialApi, type ConnectedAccount, type SocialPlatform } from '@/lib/api/social';
import { useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils/format';
import {
  AlertCircle,
  CheckCircle2,
  Link2Off,
  Loader2,
  Plus,
  RefreshCw,
  Share2,
  Trash2,
} from 'lucide-react';
import { formatRelativeTime } from '@/lib/utils/format';
import { toast } from 'sonner';

// ── Platform config ──────────────────────────────────────────────────────────

interface PlatformMeta {
  id: SocialPlatform;
  name: string;
  description: string;
  logo: string;
  color: string;
  bgClass: string;
  borderClass: string;
  badgeClass: string;
  comingSoon?: boolean;
}

const PLATFORM_META: PlatformMeta[] = [
  {
    id: 'youtube',
    name: 'YouTube',
    description: 'Auto-publish Shorts & long-form videos to your YouTube channel.',
    logo: '▶',
    color: 'text-red-600 dark:text-red-400',
    bgClass: 'bg-red-50 dark:bg-red-900/10',
    borderClass: 'border-red-200 dark:border-red-800/30',
    badgeClass: 'bg-red-500/10 text-red-600 dark:text-red-400',
  },
  {
    id: 'tiktok',
    name: 'TikTok',
    description: 'Schedule and publish short-form reels directly to TikTok.',
    logo: '♪',
    color: 'text-foreground',
    bgClass: 'bg-zinc-100 dark:bg-zinc-900/20',
    borderClass: 'border-zinc-200 dark:border-zinc-700/30',
    badgeClass: 'bg-zinc-500/10 text-zinc-700 dark:text-zinc-300',
    comingSoon: true,
  },
  {
    id: 'instagram',
    name: 'Instagram',
    description: 'Publish Reels to Instagram and optionally share to your feed.',
    logo: '◈',
    color: 'text-pink-600 dark:text-pink-400',
    bgClass: 'bg-pink-50 dark:bg-pink-900/10',
    borderClass: 'border-pink-200 dark:border-pink-800/30',
    badgeClass: 'bg-pink-500/10 text-pink-600 dark:text-pink-400',
    comingSoon: true,
  },
];

const META_MAP = Object.fromEntries(PLATFORM_META.map((p) => [p.id, p])) as Record<
  SocialPlatform,
  PlatformMeta
>;

// ── Connected flash banner ───────────────────────────────────────────────────

function ConnectedBanner({ onFlash }: { onFlash: (platform: string | null) => void }) {
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();

  useEffect(() => {
    const connected = searchParams?.get('connected');
    if (connected) {
      onFlash(connected);
      queryClient.invalidateQueries({ queryKey: ['social-accounts'] });
      const t = setTimeout(() => onFlash(null), 4000);
      return () => clearTimeout(t);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  return null;
}

// ── Platform Selector Modal ──────────────────────────────────────────────────

function PlatformSelectorModal({
  open,
  onClose,
  onSelect,
  connectingPlatform,
}: {
  open: boolean;
  onClose: () => void;
  onSelect: (platform: SocialPlatform) => void;
  connectingPlatform: SocialPlatform | null;
}) {
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-5 py-4 border-b">
          <DialogTitle className="text-sm font-bold flex items-center gap-2">
            <Share2 className="h-4 w-4 text-primary" />
            Connect a Social Account
          </DialogTitle>
          <p className="text-xs text-muted-foreground mt-0.5">
            Select the platform you want to connect
          </p>
        </DialogHeader>

        <div className="p-4 flex flex-col gap-3">
          {PLATFORM_META.map((platform) => {
            const isConnecting = connectingPlatform === platform.id;
            return (
              <button
                key={platform.id}
                type="button"
                disabled={!!platform.comingSoon || !!connectingPlatform}
                onClick={() => onSelect(platform.id)}
                className={cn(
                  'flex items-center gap-4 p-4 rounded-xl border text-left transition-all',
                  platform.comingSoon
                    ? 'opacity-50 cursor-not-allowed border-border bg-muted/30'
                    : 'border-border hover:border-primary/30 hover:bg-primary/5 cursor-pointer',
                )}
              >
                {/* Logo */}
                <div
                  className={cn(
                    'w-11 h-11 rounded-xl flex items-center justify-center text-xl font-bold shrink-0 border',
                    platform.bgClass,
                    platform.borderClass,
                  )}
                >
                  <span className={platform.color}>{platform.logo}</span>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-foreground">{platform.name}</span>
                    {platform.comingSoon && (
                      <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-muted border text-muted-foreground">
                        Coming Soon
                      </span>
                    )}
                  </div>
                  <p className="text-[11.5px] text-muted-foreground mt-0.5 leading-relaxed">
                    {platform.description}
                  </p>
                </div>

                {/* Arrow / spinner */}
                <div className="shrink-0 text-muted-foreground">
                  {isConnecting ? (
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  ) : !platform.comingSoon ? (
                    <span className="text-lg">→</span>
                  ) : null}
                </div>
              </button>
            );
          })}
        </div>

        <div className="px-5 py-3 border-t bg-muted/20">
          <p className="text-[10.5px] text-muted-foreground text-center leading-relaxed">
            Your access tokens are encrypted with AES-256-GCM and stored securely. We never store
            your platform passwords.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ── Account Row ──────────────────────────────────────────────────────────────

function AccountRow({
  account,
  onDisconnect,
  isDisconnecting,
}: {
  account: ConnectedAccount;
  onDisconnect: (id: string) => void;
  isDisconnecting: boolean;
}) {
  const meta = META_MAP[account.platform];

  const statusBadge = account.needsReauth ? (
    <Badge className="text-[10px] bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-900/10 dark:text-amber-400 dark:border-amber-800/30 gap-1">
      <AlertCircle className="h-2.5 w-2.5" />
      Needs Reauth
    </Badge>
  ) : (
    <Badge className="text-[10px] bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-900/10 dark:text-emerald-400 dark:border-emerald-800/30 gap-1">
      <CheckCircle2 className="h-2.5 w-2.5" />
      Active
    </Badge>
  );

  const expiryDisplay = (() => {
    if (!account.tokenExpiresAt) return <span className="text-muted-foreground/50">—</span>;
    const d = new Date(account.tokenExpiresAt);
    const daysLeft = Math.ceil((d.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    if (daysLeft <= 0) return <span className="text-red-500 font-medium text-xs">Expired</span>;
    if (daysLeft <= 14)
      return (
        <span className="text-amber-600 dark:text-amber-400 font-medium text-xs">
          {daysLeft}d left
        </span>
      );
    return (
      <span className="text-muted-foreground text-xs">
        {d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
      </span>
    );
  })();

  return (
    <tr className="border-b last:border-0 hover:bg-muted/20 transition-colors group">
      {/* Account */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              'w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold border shrink-0',
              meta.bgClass,
              meta.borderClass,
            )}
          >
            <span className={meta.color}>{meta.logo}</span>
          </div>
          <div className="min-w-0">
            <div className="text-[13px] font-semibold text-foreground truncate">
              {account.accountName || account.platformAccountId}
            </div>
            <div className="text-[11px] text-muted-foreground truncate">
              {account.platformAccountId}
            </div>
          </div>
        </div>
      </td>

      {/* Platform */}
      <td className="px-4 py-3">
        <span
          className={cn(
            'text-[11px] font-semibold px-2 py-0.5 rounded-md capitalize',
            meta.badgeClass,
          )}
        >
          {meta.name}
        </span>
      </td>

      {/* Status */}
      <td className="px-4 py-3">{statusBadge}</td>

      {/* Token Expiry */}
      <td className="px-4 py-3">{expiryDisplay}</td>

      {/* Connected */}
      <td className="px-4 py-3">
        <span className="text-xs text-muted-foreground">
          {formatRelativeTime(account.connectedAt)}
        </span>
      </td>

      {/* Actions */}
      <td className="px-4 py-3">
        <button
          onClick={() => onDisconnect(account.id)}
          disabled={isDisconnecting}
          className="opacity-0 group-hover:opacity-100 flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-md text-red-500 hover:bg-red-500/8 transition-all disabled:opacity-40"
        >
          {isDisconnecting ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <Trash2 className="h-3 w-3" />
          )}
          Disconnect
        </button>
      </td>
    </tr>
  );
}

// ── Main page ────────────────────────────────────────────────────────────────

export default function SocialAccountsPage() {
  const queryClient = useQueryClient();
  const [showPlatformModal, setShowPlatformModal] = useState(false);
  const [connectingPlatform, setConnectingPlatform] = useState<SocialPlatform | null>(null);
  const [flashPlatform, setFlashPlatform] = useState<string | null>(null);
  const [disconnectingId, setDisconnectingId] = useState<string | null>(null);

  const {
    data: accounts = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['social-accounts'],
    queryFn: socialApi.listAccounts,
  });

  const disconnectMutation = useMutation({
    mutationFn: (id: string) => socialApi.disconnectAccount(id),
    onMutate: (id) => setDisconnectingId(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['social-accounts'] });
      toast.success('Account disconnected');
    },
    onError: () => toast.error('Failed to disconnect'),
    onSettled: () => setDisconnectingId(null),
  });

  async function handleSelectPlatform(platform: SocialPlatform) {
    try {
      setConnectingPlatform(platform);
      const url = await socialApi.getConnectUrl(platform);
      window.location.href = url;
    } catch {
      setConnectingPlatform(null);
      toast.error('Failed to get connect URL');
    }
  }

  // Group counts per platform for the summary strip
  const platformCounts = accounts.reduce<Record<string, number>>((acc, a) => {
    acc[a.platform] = (acc[a.platform] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <DashboardLayout hideTopBar>
      <Suspense>
        <ConnectedBanner onFlash={setFlashPlatform} />
      </Suspense>

      <PlatformSelectorModal
        open={showPlatformModal}
        onClose={() => setShowPlatformModal(false)}
        onSelect={handleSelectPlatform}
        connectingPlatform={connectingPlatform}
      />

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 shrink-0">
            <Share2 className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-bold text-foreground">Social Accounts</h1>
            <p className="text-xs text-muted-foreground">
              Connect your accounts to auto-publish AI-generated videos
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => refetch()}
              className="text-xs text-muted-foreground gap-1.5 h-8"
            >
              <RefreshCw className="h-3 w-3" />
              Refresh
            </Button>
            <Button
              size="sm"
              className="text-xs gap-1.5 h-8"
              onClick={() => setShowPlatformModal(true)}
            >
              <Plus className="h-3.5 w-3.5" />
              Connect Account
            </Button>
          </div>
        </div>

        {/* Flash banner */}
        {flashPlatform && (
          <div className="mb-5 flex items-center gap-3 p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-800/30 text-emerald-700 dark:text-emerald-400">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span className="text-sm font-medium capitalize">
              {flashPlatform} connected successfully!
            </span>
          </div>
        )}

        {/* Platform summary strip */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {PLATFORM_META.map((p) => {
            const count = platformCounts[p.id] ?? 0;
            return (
              <div
                key={p.id}
                className="flex items-center gap-3 p-3.5 rounded-xl border bg-card shadow-sm"
              >
                <div
                  className={cn(
                    'w-9 h-9 rounded-lg flex items-center justify-center text-base font-bold border shrink-0',
                    p.bgClass,
                    p.borderClass,
                  )}
                >
                  <span className={p.color}>{p.logo}</span>
                </div>
                <div>
                  <div className="text-sm font-bold text-foreground">{p.name}</div>
                  <div className="text-[11px] text-muted-foreground">
                    {count === 0
                      ? 'No accounts'
                      : count === 1
                        ? '1 account'
                        : `${count} accounts`}
                  </div>
                </div>
                {p.comingSoon && (
                  <span className="ml-auto text-[9px] font-semibold px-1.5 py-0.5 rounded bg-muted border text-muted-foreground">
                    Soon
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Accounts table */}
        <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
          {/* Table header row */}
          <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/30">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Connected Accounts
              </span>
              <span className="text-[10px] font-semibold bg-muted border rounded-full px-2 py-0.5 text-muted-foreground">
                {accounts.length}
              </span>
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : accounts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-center px-4">
              <div className="w-12 h-12 rounded-xl bg-muted border flex items-center justify-center text-2xl">
                🔗
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">No accounts connected</p>
                <p className="text-xs text-muted-foreground mt-1 max-w-xs">
                  Connect your first social account to start auto-publishing AI-generated videos.
                </p>
              </div>
              <Button
                size="sm"
                className="text-xs gap-1.5 mt-1"
                onClick={() => setShowPlatformModal(true)}
              >
                <Plus className="h-3.5 w-3.5" />
                Connect Account
              </Button>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b text-left">
                  <th className="px-4 py-2.5 text-[10.5px] font-semibold text-muted-foreground uppercase tracking-wider">
                    Account
                  </th>
                  <th className="px-4 py-2.5 text-[10.5px] font-semibold text-muted-foreground uppercase tracking-wider">
                    Platform
                  </th>
                  <th className="px-4 py-2.5 text-[10.5px] font-semibold text-muted-foreground uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-2.5 text-[10.5px] font-semibold text-muted-foreground uppercase tracking-wider">
                    Token Expiry
                  </th>
                  <th className="px-4 py-2.5 text-[10.5px] font-semibold text-muted-foreground uppercase tracking-wider">
                    Connected
                  </th>
                  <th className="px-4 py-2.5 text-[10.5px] font-semibold text-muted-foreground uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {accounts.map((account) => (
                  <AccountRow
                    key={account.id}
                    account={account}
                    onDisconnect={(id) => disconnectMutation.mutate(id)}
                    isDisconnecting={disconnectingId === account.id && disconnectMutation.isPending}
                  />
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
