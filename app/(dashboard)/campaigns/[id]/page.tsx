'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { toast } from 'sonner';
import {
  ChevronRight,
  Plus,
  ChevronDown,
  Settings2,
  Sparkles,
  BarChart3,
  Users,
  FileText,
  MoreHorizontal,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils/format';
import {
  campaignsApi,
  type CampaignPost,
  type CampaignPostType,
  type CampaignStatus,
  type UpdateCampaignDto,
} from '@/lib/api/campaigns';
import { PipelineStatusBadge } from '@/components/campaigns/PipelineStatusBadge';
import { CampaignPostCard } from '@/components/campaigns/CampaignPostCard';
import { AddPostModal } from '@/components/campaigns/AddPostModal';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { socialApi, type ConnectedAccount } from '@/lib/api/social';

// ─── Types ────────────────────────────────────────────────────────────────────

type Tab = 'posts' | 'accounts' | 'analytics' | 'settings';

const TABS: Array<{ id: Tab; label: string; icon: React.ComponentType<{ className?: string }> }> = [
  { id: 'posts',     label: 'Posts',     icon: FileText },
  { id: 'accounts',  label: 'Accounts',  icon: Users },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'settings',  label: 'Settings',  icon: Settings2 },
];

const ADD_POST_ITEMS: Array<{
  section: string;
  items: Array<{ type: CampaignPostType; icon: string; label: string; sub: string; source: 'new' | 'existing' }>;
}> = [
  {
    section: 'Create New',
    items: [
      { type: 'reel',     icon: '🎬', label: 'Reel',      sub: 'Short-form video',  source: 'new' },
      { type: 'carousel', icon: '🖼️', label: 'Carousel',  sub: 'Multi-image post',  source: 'new' },
      { type: 'story',    icon: '⏱️', label: 'Story',     sub: '24-hour content',   source: 'new' },
      { type: 'ugc_video',icon: '🤳', label: 'UGC Video', sub: 'User-gen style',    source: 'new' },
    ],
  },
  {
    section: 'Add from Projects',
    items: [
      { type: 'reel',          icon: '🎬', label: 'Existing Reel', sub: 'From Reel Generator', source: 'existing' },
      { type: 'image',         icon: '🖼️', label: 'Image / Graphic', sub: 'From Text to Image', source: 'existing' },
      { type: 'ugc_video',     icon: '🤳', label: 'UGC Video',     sub: 'From Projects',       source: 'existing' },
      { type: 'graphic_motion',icon: '✨', label: 'Graphic Motion', sub: 'From Studio',         source: 'existing' },
    ],
  },
];

const VISUAL_STYLES = ['Cinematic', 'Film Noir', 'Anime', 'Cyberpunk', 'Minimalist', 'Documentary'];

const PIPELINE_FILTER_OPTIONS = [
  { value: 'all',              label: 'All' },
  { value: 'generating',       label: 'Generating' },
  { value: 'ready',            label: 'Ready' },
  { value: 'awaiting_schedule',label: 'Awaiting Schedule' },
  { value: 'scheduled',        label: 'Scheduled' },
  { value: 'publishing',       label: 'Publishing' },
  { value: 'published',        label: 'Published' },
  { value: 'failed',           label: 'Failed' },
];

// ─── Pipeline Table with expandable account rows ──────────────────────────────

const SCHEDULED_POST_STATUS_STYLES: Record<string, string> = {
  success:   'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  pending:   'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  uploading: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  failed:    'bg-red-500/10 text-red-600 dark:text-red-400',
  cancelled: 'bg-zinc-500/10 text-zinc-500',
};

const PLATFORM_ICON: Record<string, string> = {
  youtube: '▶',
  tiktok: '♪',
  instagram: '◈',
};

function PipelineTable({ rows }: { rows: any[] }) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  function toggle(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  return (
    <table className="w-full">
      <thead>
        <tr className="border-b bg-muted/20">
          {['', 'Post', 'Type', 'Platform', 'Pipeline Status', 'Scheduled', 'Views', 'Likes', 'Eng. Rate'].map((h) => (
            <th key={h} className="px-4 py-2.5 text-left text-[10.5px] font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap first:w-8 first:px-3">
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row: any) => {
          const hasChildren = row.scheduled_posts?.length > 0;
          const isExpanded = expanded.has(row.id);

          return (
            <>
              {/* Parent row */}
              <tr
                key={row.id}
                className={cn('border-b hover:bg-muted/20 transition-colors', isExpanded && 'bg-muted/10')}
              >
                <td className="px-3 py-3 w-8">
                  {hasChildren && (
                    <button
                      onClick={() => toggle(row.id)}
                      className="p-0.5 rounded hover:bg-muted transition-colors text-muted-foreground"
                    >
                      <ChevronRight className={cn('h-3.5 w-3.5 transition-transform', isExpanded && 'rotate-90')} />
                    </button>
                  )}
                </td>
                <td className="px-4 py-3">
                  <span className="font-mono text-[11.5px] font-semibold">Day {row.day_number}</span>
                  {row.title && <div className="text-[11px] text-muted-foreground mt-0.5">{row.title}</div>}
                </td>
                <td className="px-4 py-3 text-xs text-muted-foreground capitalize">{row.post_type}</td>
                <td className="px-4 py-3 text-xs text-muted-foreground">{row.target_platforms?.join(', ') || '—'}</td>
                <td className="px-4 py-3"><PipelineStatusBadge status={row.pipeline_status} /></td>
                <td className="px-4 py-3 text-xs text-muted-foreground">
                  {row.scheduled_at ? new Date(row.scheduled_at).toLocaleDateString() : '—'}
                </td>
                <td className="px-4 py-3 text-sm text-muted-foreground">—</td>
                <td className="px-4 py-3 text-sm text-muted-foreground">—</td>
                <td className="px-4 py-3 text-sm text-muted-foreground">—</td>
              </tr>

              {/* Child rows — one per scheduled_post / account */}
              {isExpanded && hasChildren && row.scheduled_posts.map((sp: any) => (
                <tr key={sp.id} className="border-b last:border-b-0 bg-muted/5 hover:bg-muted/15 transition-colors">
                  {/* Indent indicator */}
                  <td className="px-3 py-2">
                    <div className="flex items-center justify-center">
                      <div className="w-px h-4 bg-border" />
                    </div>
                  </td>
                  {/* Account */}
                  <td className="px-4 py-2" colSpan={2}>
                    <div className="flex items-center gap-2 pl-3">
                      <div className="w-5 h-5 rounded flex items-center justify-center text-[11px] bg-muted border shrink-0">
                        {PLATFORM_ICON[sp.platform] ?? '?'}
                      </div>
                      <div className="min-w-0">
                        <div className="text-[11.5px] font-semibold text-foreground truncate">
                          {sp.account_name ?? sp.platform_account_id ?? sp.platform}
                        </div>
                        {sp.platform_post_id && (
                          <div className="text-[10px] text-muted-foreground font-mono truncate">
                            ID: {sp.platform_post_id}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  {/* Platform */}
                  <td className="px-4 py-2 text-[11px] text-muted-foreground capitalize">{sp.platform}</td>
                  {/* Status */}
                  <td className="px-4 py-2">
                    <span className={cn(
                      'text-[10px] font-semibold px-2 py-0.5 rounded-md capitalize',
                      SCHEDULED_POST_STATUS_STYLES[sp.status] ?? 'bg-muted text-muted-foreground',
                    )}>
                      {sp.status === 'success' ? 'Published' : sp.status}
                    </span>
                  </td>
                  {/* Scheduled at */}
                  <td className="px-4 py-2 text-[11px] text-muted-foreground">
                    {sp.scheduled_at ? new Date(sp.scheduled_at).toLocaleString('en-US', { dateStyle: 'short', timeStyle: 'short' }) : '—'}
                  </td>
                  <td className="px-4 py-2 text-xs text-muted-foreground">—</td>
                  <td className="px-4 py-2 text-xs text-muted-foreground">—</td>
                  <td className="px-4 py-2 text-xs text-muted-foreground">—</td>
                </tr>
              ))}
            </>
          );
        })}
      </tbody>
    </table>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CampaignDetailPage() {
  const { id: campaignId } = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<Tab>('posts');
  const [showAddDropdown, setShowAddDropdown] = useState(false);
  const [addPostModal, setAddPostModal] = useState<{ type: CampaignPostType; source: 'new' | 'existing' } | null>(null);
  const [editPost, setEditPost] = useState<CampaignPost | null>(null);
  const [showAddAccountPicker, setShowAddAccountPicker] = useState(false);
  const [pipelineFilter, setPipelineFilter] = useState('all');
  const [analyticsRange, setAnalyticsRange] = useState<'7D' | '30D' | 'all'>('7D');

  // ── Queries ──────────────────────────────────────────────────────────────
  const { data: campaign, isLoading: campaignLoading } = useQuery({
    queryKey: ['campaign', campaignId],
    queryFn: () => campaignsApi.get(campaignId),
    enabled: !!campaignId,
  });

  const { data: posts = [] } = useQuery({
    queryKey: ['campaign-posts', campaignId],
    queryFn: () => campaignsApi.listPosts(campaignId),
    enabled: !!campaignId && activeTab === 'posts',
  });

  const { data: accounts = [] } = useQuery({
    queryKey: ['campaign-accounts', campaignId],
    queryFn: () => campaignsApi.listAccounts(campaignId),
    enabled: !!campaignId && activeTab === 'accounts',
  });

  const { data: analyticsSummary } = useQuery({
    queryKey: ['campaign-analytics', campaignId, 'summary'],
    queryFn: () => campaignsApi.getAnalyticsSummary(campaignId),
    enabled: !!campaignId && activeTab === 'analytics',
  });

  const { data: postsTable = [] } = useQuery({
    queryKey: ['campaign-analytics', campaignId, 'posts'],
    queryFn: () => campaignsApi.getPostsTable(campaignId),
    enabled: !!campaignId && activeTab === 'analytics',
  });

  const { data: platformBreakdown } = useQuery({
    queryKey: ['campaign-analytics', campaignId, 'platforms'],
    queryFn: () => campaignsApi.getPlatformBreakdown(campaignId),
    enabled: !!campaignId && activeTab === 'analytics',
  });

  // Fetch user's global connected accounts (for the add-account picker)
  const { data: connectedAccounts = [] } = useQuery({
    queryKey: ['social-accounts'],
    queryFn: () => socialApi.listAccounts(),
    enabled: !!campaignId && activeTab === 'accounts',
  });

  const { mutate: addAccount, isPending: isAddingAccount } = useMutation({
    mutationFn: (connectedAccountId: string) =>
      campaignsApi.addAccount(campaignId, { connected_account_id: connectedAccountId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaign-accounts', campaignId] });
      toast.success('Account added to campaign');
      setShowAddAccountPicker(false);
    },
    onError: () => toast.error('Failed to add account'),
  });

  const { mutate: removeAccount } = useMutation({
    mutationFn: (accountId: string) => campaignsApi.removeAccount(campaignId, accountId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaign-accounts', campaignId] });
      toast.success('Account removed');
    },
    onError: () => toast.error('Failed to remove account'),
  });

  // Compute from/to for daily breakdown based on selected range
  const dailyFrom = analyticsRange !== 'all'
    ? new Date(Date.now() - (analyticsRange === '7D' ? 7 : 30) * 86400000).toISOString().slice(0, 10)
    : undefined;

  useQuery({
    queryKey: ['campaign-analytics', campaignId, 'daily', analyticsRange],
    queryFn: () => campaignsApi.getDailyBreakdown(campaignId, dailyFrom),
    enabled: !!campaignId && activeTab === 'analytics',
  });

  // ── Mutations ─────────────────────────────────────────────────────────────
  const { mutate: updateCampaign, isPending: isSavingSettings } = useMutation({
    mutationFn: (dto: UpdateCampaignDto) => campaignsApi.update(campaignId, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaign', campaignId] });
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      toast.success('Campaign updated');
    },
    onError: () => toast.error('Failed to update campaign'),
  });

  // ── Settings form state ───────────────────────────────────────────────────
  const [settingsName, setSettingsName] = useState('');
  const [settingsStartDate, setSettingsStartDate] = useState('');
  const [settingsVisualStyle, setSettingsVisualStyle] = useState('Cinematic');
  const [settingsGoalDesc, setSettingsGoalDesc] = useState('');

  function initSettings() {
    if (!campaign) return;
    setSettingsName(campaign.name);
    setSettingsStartDate(campaign.start_date ?? '');
    setSettingsVisualStyle(campaign.visual_style ?? 'Cinematic');
    setSettingsGoalDesc(campaign.goal_description ?? '');
  }

  // Init settings when tab becomes active
  function handleTabSwitch(tab: Tab) {
    setActiveTab(tab);
    if (tab === 'settings' && campaign) initSettings();
  }

  // ── Helpers ───────────────────────────────────────────────────────────────
  function toggleStatus() {
    if (!campaign) return;
    const nextStatus: CampaignStatus = campaign.status === 'active' ? 'paused' : 'active';
    updateCampaign({ status: nextStatus });
  }

  const isActive = campaign?.status === 'active';

  // Group posts by day_number
  const postsByDay = posts
    .filter((p) => pipelineFilter === 'all' || p.pipeline_status === pipelineFilter)
    .reduce<Record<number, typeof posts>>((acc, post) => {
      if (!acc[post.day_number]) acc[post.day_number] = [];
      acc[post.day_number].push(post);
      return acc;
    }, {});

  const sortedDays = Object.keys(postsByDay)
    .map(Number)
    .sort((a, b) => a - b);

  if (campaignLoading) {
    return <DashboardLayout hideTopBar><div className="flex items-center justify-center h-full text-sm text-muted-foreground">Loading…</div></DashboardLayout>;
  }
  if (!campaign) {
    return <DashboardLayout hideTopBar><div className="flex items-center justify-center h-full text-sm text-red-500">Campaign not found</div></DashboardLayout>;
  }

  const scoreClass = (campaign.quality_score ?? 0) >= 80
    ? 'bg-emerald-500/10 text-emerald-700 border-emerald-300/50 dark:text-emerald-400'
    : 'bg-blue-500/10 text-blue-700 border-blue-300/50 dark:text-blue-400';

  return (
    <DashboardLayout hideTopBar>
    <div className="flex flex-col h-full overflow-hidden">
      {/* Top bar */}
      <div className="flex items-center gap-3 px-6 h-[54px] border-b bg-card flex-shrink-0">
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Link href="/campaigns" className="hover:text-primary transition-colors cursor-pointer text-xs">
            Campaigns
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="text-foreground font-semibold text-xs">{campaign.name}</span>
        </div>

        {/* Status toggle */}
        <button
          onClick={toggleStatus}
          className="flex items-center gap-2 ml-2 bg-muted/40 border rounded-full px-3 py-1.5 text-xs font-medium hover:bg-muted/60 transition-colors"
        >
          <span
            className={cn(
              'relative w-[28px] h-[15px] rounded-full transition-colors flex-shrink-0',
              isActive ? 'bg-emerald-500' : 'bg-muted-foreground/30',
            )}
          >
            <span
              className={cn(
                'absolute top-[2px] w-[11px] h-[11px] bg-white rounded-full shadow transition-all',
                isActive ? 'left-[15px]' : 'left-[2px]',
              )}
            />
          </span>
          <span className="text-muted-foreground">{isActive ? 'Active' : 'Inactive'}</span>
        </button>
      </div>

      {/* Tab bar */}
      <div className="flex items-center border-b bg-card px-4 flex-shrink-0">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabSwitch(tab.id)}
            className={cn(
              'flex items-center gap-1.5 px-4 py-3.5 text-xs font-medium border-b-2 -mb-px transition-colors whitespace-nowrap',
              activeTab === tab.id
                ? 'border-primary text-primary font-semibold'
                : 'border-transparent text-muted-foreground hover:text-foreground',
            )}
          >
            <tab.icon className="h-3.5 w-3.5" />
            {tab.label}
            {tab.id === 'posts' && (
              <span className={cn(
                'text-[10px] font-semibold px-1.5 py-0.5 rounded-md border ml-0.5',
                activeTab === 'posts'
                  ? 'bg-primary/8 border-primary/20 text-primary'
                  : 'bg-muted border-border text-muted-foreground',
              )}>
                {posts.length}
              </span>
            )}
            {tab.id === 'accounts' && (
              <span className={cn(
                'text-[10px] font-semibold px-1.5 py-0.5 rounded-md border ml-0.5',
                activeTab === 'accounts'
                  ? 'bg-primary/8 border-primary/20 text-primary'
                  : 'bg-muted border-border text-muted-foreground',
              )}>
                {accounts.length}
              </span>
            )}
          </button>
        ))}

        <div className="ml-auto flex items-center gap-2 py-2">
          {campaign.quality_score != null && (
            <div className={cn('flex items-center gap-2 border rounded-full px-3 py-1 text-xs font-semibold', scoreClass)}>
              <span className="w-6 h-6 rounded-full border flex items-center justify-center font-bold text-[10px] border-current">
                {campaign.quality_score}
              </span>
              Campaign Score
            </div>
          )}

          {/* Add Post dropdown — only visible on the Posts tab */}
          {activeTab === 'posts' && <div className="relative">
            <Button
              size="sm"
              className="text-xs h-8 gap-1.5"
              onClick={() => setShowAddDropdown((v) => !v)}
            >
              <Plus className="h-3.5 w-3.5" />
              Add Post
              <ChevronDown className="h-3 w-3" />
            </Button>
            {showAddDropdown && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowAddDropdown(false)} />
                <div className="absolute right-0 top-full mt-1.5 z-20 bg-card border rounded-xl shadow-xl w-[230px] overflow-hidden py-1">
                  {ADD_POST_ITEMS.map((group) => (
                    <div key={group.section}>
                      <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground bg-muted/40">
                        {group.section}
                      </div>
                      {group.items.map((item) => (
                        <button
                          key={`${item.type}-${item.source}`}
                          onClick={() => {
                            setAddPostModal({ type: item.type, source: item.source });
                            setShowAddDropdown(false);
                          }}
                          className="flex items-center gap-2.5 w-full px-3 py-2.5 text-left hover:bg-muted/40 transition-colors"
                        >
                          <div className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center text-sm flex-shrink-0">
                            {item.icon}
                          </div>
                          <div>
                            <div className="text-xs font-semibold text-foreground">{item.label}</div>
                            <div className="text-[11px] text-muted-foreground">{item.sub}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>}
        </div>
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto">

        {/* ── POSTS TAB ────────────────────────────────────────────────── */}
        {activeTab === 'posts' && (
          <div className="p-6">
            {posts.length === 0 ? (
              <div className="text-center py-20">
                <div className="text-4xl mb-4 opacity-20">📅</div>
                <div className="text-sm font-semibold text-foreground mb-1.5">No posts yet</div>
                <div className="text-xs text-muted-foreground mb-4">Use the &quot;Add Post&quot; button to start building your campaign content</div>
              </div>
            ) : sortedDays.length === 0 ? (
              <div className="text-center py-12 text-sm text-muted-foreground">
                No posts match the selected filter.
              </div>
            ) : (
              sortedDays.map((day) => (
                <div key={day}>
                  <div className="inline-block bg-card border rounded-lg px-3 py-1 text-[11.5px] font-semibold text-muted-foreground mb-3">
                    📅 Day {day}
                  </div>
                  <div className="flex flex-col gap-3 mb-6">
                    {postsByDay[day].map((post) => (
                      <CampaignPostCard
                        key={post.id}
                        post={post}
                        campaignId={campaignId}
                        onEdit={(p) => setEditPost(p)}
                      />
                    ))}
                  </div>
                </div>
              ))
            )}

            {/* AI tip */}
            {posts.length > 0 && (
              <div className="flex items-center gap-2.5 bg-primary/5 border border-primary/15 rounded-lg px-4 py-2.5 mt-4 text-xs text-primary font-medium">
                <Sparkles className="h-3.5 w-3.5 flex-shrink-0" />
                Add a follow-up post to increase your campaign&apos;s engagement rate by <strong>40%</strong>.
              </div>
            )}
          </div>
        )}

        {/* ── ACCOUNTS TAB ─────────────────────────────────────────────── */}
        {activeTab === 'accounts' && (
          <div className="p-6">
            {/* Header row */}
            <div className="flex items-center justify-between mb-4">
              <div className="text-xs text-muted-foreground">
                Accounts added here will receive scheduled posts from this campaign.
              </div>
              <Button size="sm" className="gap-1.5" onClick={() => setShowAddAccountPicker(true)}>
                <Plus className="h-3.5 w-3.5" />
                Add Account
              </Button>
            </div>

            {/* Add-account picker */}
            {showAddAccountPicker && (
              <div className="mb-4 bg-card border rounded-xl overflow-hidden shadow-sm">
                <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/30">
                  <span className="text-xs font-semibold">Select a connected account to add</span>
                  <button
                    onClick={() => setShowAddAccountPicker(false)}
                    className="text-muted-foreground hover:text-foreground text-lg leading-none"
                  >
                    ×
                  </button>
                </div>
                {connectedAccounts.length === 0 ? (
                  <div className="py-8 text-center">
                    <div className="text-sm text-muted-foreground mb-3">No social accounts connected yet</div>
                    <Link href="/social/accounts">
                      <Button size="sm" variant="outline">Go to Social Accounts</Button>
                    </Link>
                  </div>
                ) : (
                  <div className="divide-y">
                    {connectedAccounts.map((ca: ConnectedAccount) => {
                      const alreadyAdded = accounts.some((a) => a.connected_account_id === ca.id);
                      const platformIcon = ca.platform === 'youtube' ? '▶️' : ca.platform === 'tiktok' ? '🎵' : '📷';
                      return (
                        <div key={ca.id} className="flex items-center gap-3 px-4 py-3 hover:bg-muted/20 transition-colors">
                          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-base flex-shrink-0">
                            {platformIcon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-semibold truncate">{ca.accountName ?? ca.platform}</div>
                            <div className="text-[11px] text-muted-foreground capitalize">{ca.platform}</div>
                          </div>
                          {alreadyAdded ? (
                            <span className="text-[10.5px] font-semibold px-2 py-0.5 rounded-md bg-muted text-muted-foreground">
                              Already added
                            </span>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-xs h-7"
                              disabled={isAddingAccount || !ca.isActive}
                              onClick={() => addAccount(ca.id)}
                            >
                              {ca.isActive ? 'Add' : 'Needs reauth'}
                            </Button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Campaign accounts table */}
            {accounts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="text-4xl mb-4 opacity-20">👥</div>
                <div className="text-sm font-semibold text-foreground mb-1.5">No accounts added yet</div>
                <div className="text-xs text-muted-foreground">Click &quot;Add Account&quot; above to attach a social account</div>
              </div>
            ) : (
              <div className="bg-card border rounded-xl overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-muted/30">
                      <th className="px-4 py-2.5 text-left text-[10.5px] font-semibold text-muted-foreground uppercase tracking-wider">Account</th>
                      <th className="px-4 py-2.5 text-left text-[10.5px] font-semibold text-muted-foreground uppercase tracking-wider">Platform</th>
                      <th className="px-4 py-2.5 text-left text-[10.5px] font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                      <th className="px-4 py-2.5 text-left text-[10.5px] font-semibold text-muted-foreground uppercase tracking-wider">Priority</th>
                      <th className="w-10" />
                    </tr>
                  </thead>
                  <tbody>
                    {accounts.map((ca) => (
                      <tr key={ca.id} className="border-b last:border-b-0">
                        <td className="px-4 py-3 text-sm font-medium">
                          {ca.connected_account?.account_name ?? ca.connected_account_id.slice(0, 8)}
                        </td>
                        <td className="px-4 py-3 text-sm text-muted-foreground capitalize">
                          {ca.connected_account?.platform}
                        </td>
                        <td className="px-4 py-3">
                          <span className={cn('text-[10.5px] font-semibold px-2 py-0.5 rounded-md', ca.is_active ? 'bg-emerald-500/10 text-emerald-700' : 'bg-muted text-muted-foreground')}>
                            {ca.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">{ca.priority}</td>
                        <td className="px-3 py-3">
                          <button
                            onClick={() => removeAccount(ca.id)}
                            className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-red-500/10 text-muted-foreground hover:text-red-500 transition-colors"
                            title="Remove from campaign"
                          >
                            ×
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── ANALYTICS TAB ────────────────────────────────────────────── */}
        {activeTab === 'analytics' && (
          <div className="p-6">
            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
              {[
                { label: 'Total Posts',    value: analyticsSummary?.totalPosts ?? campaign.cached_total_posts,   change: null },
                { label: 'Total Views',    value: analyticsSummary ? formatViews(analyticsSummary.totalViews) : '—', change: null },
                { label: 'Avg Engagement', value: analyticsSummary?.avgEngagementRate != null ? `${analyticsSummary.avgEngagementRate.toFixed(1)}%` : '—', change: null },
                { label: 'New Followers',  value: analyticsSummary?.followersGained ?? '—', change: null },
              ].map((stat) => (
                <div key={stat.label} className="bg-card border rounded-xl p-4 shadow-sm">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">{stat.label}</div>
                  <div className="text-2xl font-extrabold text-foreground">{stat.value}</div>
                </div>
              ))}
            </div>

            {/* Chart placeholder + platform breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 mb-5">
              <div className="lg:col-span-2 bg-card border rounded-xl p-4 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-sm font-bold text-foreground">Views Over Time</div>
                  <div className="flex gap-1">
                    {(['7D', '30D', 'all'] as const).map((r) => (
                      <button
                        key={r}
                        onClick={() => setAnalyticsRange(r)}
                        className={cn(
                          'px-2.5 py-1 rounded-md text-[11px] font-semibold border transition-all',
                          analyticsRange === r
                            ? 'bg-primary/8 border-primary/20 text-primary'
                            : 'text-muted-foreground border-border hover:border-border/80',
                        )}
                      >
                        {r === 'all' ? 'All' : r}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="h-32 flex items-center justify-center text-muted-foreground/50 text-sm border-2 border-dashed rounded-lg">
                  Chart will render once posts are published
                </div>
              </div>

              <div className="bg-card border rounded-xl p-4 shadow-sm">
                <div className="text-sm font-bold text-foreground mb-4">Platform Breakdown</div>
                {(() => {
                  const platforms = [
                    { key: 'instagram', label: '📷 Instagram', color: 'bg-pink-500' },
                    { key: 'tiktok',    label: '🎵 TikTok',    color: 'bg-blue-500' },
                    { key: 'youtube',   label: '▶️ YouTube',   color: 'bg-red-500' },
                  ];
                  const totalViews = platforms.reduce((sum, p) => sum + (platformBreakdown?.[p.key]?.views ?? 0), 0);
                  return platforms.map((p) => {
                    const views = platformBreakdown?.[p.key]?.views ?? 0;
                    const pct = totalViews > 0 ? Math.round((views / totalViews) * 100) : 0;
                    return (
                      <div key={p.key} className="mb-3">
                        <div className="flex justify-between text-xs font-semibold mb-1.5">
                          <span>{p.label}</span>
                          <span className="text-muted-foreground">{pct}%</span>
                        </div>
                        <div className="h-1.5 bg-border rounded-full overflow-hidden">
                          <div className={cn('h-full rounded-full', p.color)} style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>
            </div>

            {/* Pipeline table */}
            <div className="bg-card border rounded-xl overflow-hidden shadow-sm">
              <div className="flex items-center justify-between px-4 py-3 border-b">
                <div className="text-sm font-bold text-foreground">Post Pipeline Status</div>
              </div>
              {postsTable.length === 0 ? (
                <div className="py-10 text-center text-sm text-muted-foreground">No post data yet</div>
              ) : (
                <PipelineTable rows={postsTable} />
              )}
            </div>
          </div>
        )}

        {/* ── SETTINGS TAB ─────────────────────────────────────────────── */}
        {activeTab === 'settings' && (
          <div className="p-6">
            <div className="max-w-[490px] flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold">Campaign Name</label>
                <Input value={settingsName} onChange={(e) => setSettingsName(e.target.value)} />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold">Start Date</label>
                <Input type="date" value={settingsStartDate} onChange={(e) => setSettingsStartDate(e.target.value)} />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold">Visual Style</label>
                <Select value={settingsVisualStyle} onValueChange={setSettingsVisualStyle}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {VISUAL_STYLES.map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold">Campaign Goal</label>
                <Textarea
                  value={settingsGoalDesc}
                  onChange={(e) => setSettingsGoalDesc(e.target.value)}
                  placeholder="Describe your goal…"
                  className="min-h-[80px]"
                />
              </div>
              <Button
                className="self-start"
                disabled={isSavingSettings}
                onClick={() => updateCampaign({
                  name: settingsName,
                  visual_style: settingsVisualStyle,
                  goal_description: settingsGoalDesc,
                  start_date: settingsStartDate || undefined,
                })}
              >
                {isSavingSettings ? 'Saving…' : 'Save Changes'}
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Add Post Modal */}
      {addPostModal && (
        <AddPostModal
          open
          onClose={() => setAddPostModal(null)}
          campaignId={campaignId}
          postType={addPostModal.type}
          initialSource={addPostModal.source}
        />
      )}

      {/* Edit Post Modal */}
      {editPost && (
        <AddPostModal
          open
          onClose={() => setEditPost(null)}
          campaignId={campaignId}
          postType={editPost.post_type}
          editPost={editPost}
        />
      )}
    </div>
    </DashboardLayout>
  );
}

function formatViews(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return String(n);
}
