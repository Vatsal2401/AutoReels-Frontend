'use client';

import { useState, useEffect, Suspense } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { socialApi, type ConnectedAccount, type SocialPlatform } from '@/lib/api/social';
import { useSearchParams } from 'next/navigation';
import {
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  Link2Off,
  Loader2,
  RefreshCw,
  Share2,
} from 'lucide-react';
import { formatRelativeTime } from '@/lib/utils/format';

// ── Platform config ──────────────────────────────────────────────────────────

const PLATFORMS: Array<{
  id: SocialPlatform;
  name: string;
  description: string;
  color: string;
  bgColor: string;
  borderColor: string;
  logo: string;
}> = [
  {
    id: 'youtube',
    name: 'YouTube',
    description: 'Auto-publish Shorts & long-form videos to your YouTube channel.',
    color: 'text-red-600',
    bgColor: 'bg-red-50 dark:bg-red-900/10',
    borderColor: 'border-red-200 dark:border-red-800/30',
    logo: '▶',
  },
  {
    id: 'tiktok',
    name: 'TikTok',
    description: 'Schedule and publish short-form reels directly to TikTok.',
    color: 'text-foreground',
    bgColor: 'bg-zinc-50 dark:bg-zinc-900/20',
    borderColor: 'border-zinc-200 dark:border-zinc-700/30',
    logo: '♪',
  },
  {
    id: 'instagram',
    name: 'Instagram',
    description: 'Publish Reels to Instagram and optionally share to your feed.',
    color: 'text-pink-600',
    bgColor: 'bg-pink-50 dark:bg-pink-900/10',
    borderColor: 'border-pink-200 dark:border-pink-800/30',
    logo: '◈',
  },
];

// ── Connected flash banner (reads searchParams — must be inside Suspense) ────

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

// ── Main page ────────────────────────────────────────────────────────────────

export default function SocialAccountsPage() {
  const queryClient = useQueryClient();
  const [connectingPlatform, setConnectingPlatform] = useState<SocialPlatform | null>(null);
  const [flashPlatform, setFlashPlatform] = useState<string | null>(null);

  const { data: accounts = [], isLoading, refetch } = useQuery({
    queryKey: ['social-accounts'],
    queryFn: socialApi.listAccounts,
  });

  const disconnectMutation = useMutation({
    mutationFn: socialApi.disconnectAccount,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['social-accounts'] }),
  });

  async function handleConnect(platform: SocialPlatform) {
    try {
      setConnectingPlatform(platform);
      const url = await socialApi.getConnectUrl(platform);
      window.location.href = url;
    } catch {
      setConnectingPlatform(null);
    }
  }

  function getAccountForPlatform(platform: SocialPlatform): ConnectedAccount | undefined {
    return accounts.find((a) => a.platform === platform);
  }

  return (
    <DashboardLayout>
      {/* ConnectedBanner reads useSearchParams and must be inside Suspense */}
      <Suspense>
        <ConnectedBanner onFlash={setFlashPlatform} />
      </Suspense>

      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-2">
          <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-primary/10 border border-primary/20">
            <Share2 className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-foreground">Social Accounts</h1>
            <p className="text-xs text-muted-foreground">
              Connect your accounts to auto-publish AI-generated videos
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => refetch()}
            className="text-xs text-muted-foreground gap-1.5"
          >
            <RefreshCw className="h-3 w-3" />
            Refresh
          </Button>
        </div>

        {/* Flash banner */}
        {flashPlatform && (
          <div className="mb-6 flex items-center gap-3 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-800/30 text-emerald-700 dark:text-emerald-400">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span className="text-sm font-medium capitalize">
              {flashPlatform} connected successfully!
            </span>
          </div>
        )}

        {/* Platform cards */}
        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {PLATFORMS.map((platform) => {
              const account = getAccountForPlatform(platform.id);
              const isConnecting = connectingPlatform === platform.id;
              const isDisconnecting = disconnectMutation.isPending;

              return (
                <Card key={platform.id} className="overflow-hidden">
                  <CardContent className="p-0">
                    <div className="flex items-center gap-4 p-5">
                      {/* Logo */}
                      <div
                        className={`flex items-center justify-center w-12 h-12 rounded-xl text-xl font-bold shrink-0 ${platform.bgColor} ${platform.borderColor} border`}
                      >
                        <span className={platform.color}>{platform.logo}</span>
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <h3 className="text-sm font-bold text-foreground">{platform.name}</h3>
                          {account && (
                            <Badge
                              variant="outline"
                              className={
                                account.needsReauth
                                  ? 'text-[10px] bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-900/10 dark:text-amber-400 dark:border-amber-800/30'
                                  : 'text-[10px] bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-900/10 dark:text-emerald-400 dark:border-emerald-800/30'
                              }
                            >
                              {account.needsReauth ? 'Needs Reauth' : 'Connected'}
                            </Badge>
                          )}
                        </div>
                        {account ? (
                          <p className="text-xs text-muted-foreground truncate">
                            {account.accountName || account.platformAccountId}
                            <span className="ml-2 opacity-60">
                              · connected {formatRelativeTime(account.connectedAt)}
                            </span>
                          </p>
                        ) : (
                          <p className="text-xs text-muted-foreground">{platform.description}</p>
                        )}
                        {account?.needsReauth && (
                          <div className="flex items-center gap-1 mt-1 text-amber-600 dark:text-amber-400">
                            <AlertCircle className="h-3 w-3" />
                            <span className="text-[10px] font-medium">Token expired — reconnect to resume posting</span>
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 shrink-0">
                        {account && !account.needsReauth ? (
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs text-destructive border-destructive/30 hover:bg-destructive/5 hover:text-destructive gap-1.5"
                            onClick={() => disconnectMutation.mutate(account.id)}
                            disabled={isDisconnecting}
                          >
                            {isDisconnecting ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <Link2Off className="h-3 w-3" />
                            )}
                            Disconnect
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            className="text-xs gap-1.5"
                            onClick={() => handleConnect(platform.id)}
                            disabled={isConnecting}
                          >
                            {isConnecting ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <ExternalLink className="h-3 w-3" />
                            )}
                            {account?.needsReauth ? 'Reconnect' : 'Connect'}
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Token expiry bar for connected accounts */}
                    {account && !account.needsReauth && account.tokenExpiresAt && (
                      <div className="px-5 pb-4 pt-0">
                        <TokenExpiryInfo expiresAt={account.tokenExpiresAt} />
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Info footer */}
        <p className="mt-8 text-center text-[11px] text-muted-foreground/60 leading-relaxed max-w-sm mx-auto">
          Your access tokens are encrypted with AES-256-GCM and stored securely.
          We never store your platform passwords.
        </p>
      </div>
    </DashboardLayout>
  );
}

function TokenExpiryInfo({ expiresAt }: { expiresAt: string }) {
  const expiryDate = new Date(expiresAt);
  const now = new Date();
  const daysLeft = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  if (daysLeft > 14) return null;

  return (
    <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
      <AlertCircle className="h-3 w-3" />
      <span className="text-[10px]">
        Token expires in {daysLeft} day{daysLeft !== 1 ? 's' : ''} — will auto-refresh
      </span>
    </div>
  );
}
