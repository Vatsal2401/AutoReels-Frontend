'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { Plus, Search, Sparkles, Filter, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils/format';
import { campaignsApi, type Campaign, type CampaignStatus } from '@/lib/api/campaigns';
import { CreateCampaignModal } from '@/components/campaigns/CreateCampaignModal';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

// ─── Status badge ─────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<CampaignStatus, { label: string; className: string; dotClass: string }> = {
  draft:    { label: 'Draft',    className: 'bg-muted text-muted-foreground',                                    dotClass: 'bg-muted-foreground/60' },
  active:   { label: 'Active',   className: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',          dotClass: 'bg-emerald-500' },
  paused:   { label: 'Paused',   className: 'bg-amber-500/10 text-amber-700 dark:text-amber-400',                dotClass: 'bg-amber-500' },
  archived: { label: 'Archived', className: 'bg-muted/60 text-muted-foreground',                                 dotClass: 'bg-muted-foreground/40' },
};

function StatusBadge({ status }: { status: CampaignStatus }) {
  const cfg = STATUS_CONFIG[status];
  return (
    <span className={cn('inline-flex items-center gap-1.5 text-[10.5px] font-semibold px-2 py-0.5 rounded-md', cfg.className)}>
      <span className={cn('w-1.5 h-1.5 rounded-full flex-shrink-0', cfg.dotClass)} />
      {cfg.label}
    </span>
  );
}

// ─── Progress ring ─────────────────────────────────────────────────────────────

function ProgressRing({ pct }: { pct: number }) {
  const r = 14;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  return (
    <div className="relative w-9 h-9 flex-shrink-0">
      <svg className="-rotate-90" width="36" height="36">
        <circle cx="18" cy="18" r={r} fill="none" stroke="currentColor" strokeWidth="3" className="text-border" />
        <circle
          cx="18" cy="18" r={r} fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"
          className="text-primary"
          strokeDasharray={circ}
          strokeDashoffset={offset}
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-[9px] font-bold text-muted-foreground">
        {pct}%
      </span>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function CampaignsPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<CampaignStatus | 'all'>('all');
  const [createOpen, setCreateOpen] = useState(false);

  const { data: campaigns = [], isLoading } = useQuery({
    queryKey: ['campaigns'],
    queryFn: campaignsApi.list,
  });

  const filtered = campaigns.filter((c) => {
    const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  function getProgress(c: Campaign) {
    if (c.cached_total_posts === 0) return 0;
    return Math.round((c.cached_published_posts / c.cached_total_posts) * 100);
  }

  function getScoreClass(score: number | null) {
    if (!score) return 'bg-muted text-muted-foreground border-border';
    if (score >= 80) return 'bg-emerald-500/10 text-emerald-700 border-emerald-300/50 dark:text-emerald-400';
    return 'bg-blue-500/10 text-blue-700 border-blue-300/50 dark:text-blue-400';
  }

  const statusOptions: Array<{ value: CampaignStatus | 'all'; label: string }> = [
    { value: 'all',      label: 'All Status' },
    { value: 'active',   label: 'Active' },
    { value: 'draft',    label: 'Draft' },
    { value: 'paused',   label: 'Paused' },
    { value: 'archived', label: 'Archived' },
  ];

  return (
    <DashboardLayout hideTopBar>
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center gap-2.5 px-6 pt-5 pb-4 flex-wrap">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search campaigns…"
            className="pl-9 w-[220px] text-xs h-9"
          />
        </div>

        <div className="flex items-center gap-1.5 bg-card border rounded-lg p-1">
          {statusOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setStatusFilter(opt.value)}
              className={cn(
                'px-3 py-1 text-xs font-medium rounded-md transition-colors',
                statusFilter === opt.value
                  ? 'bg-primary/8 text-primary border border-primary/20'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <div className="ml-auto flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 text-primary border-primary/25 hover:bg-primary/5"
            onClick={() => setCreateOpen(true)}
          >
            <Sparkles className="h-3.5 w-3.5" />
            Write With AI
          </Button>
          <Button size="sm" className="gap-1.5" onClick={() => setCreateOpen(true)}>
            <Plus className="h-3.5 w-3.5" />
            Create Campaign
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="px-6 pb-6 flex-1 overflow-y-auto">
        <div className="bg-card border rounded-xl overflow-hidden shadow-sm">
          {isLoading ? (
            <div className="py-16 text-center text-muted-foreground text-sm">Loading campaigns…</div>
          ) : filtered.length === 0 ? (
            <div className="py-20 text-center">
              <div className="text-4xl mb-4 opacity-20">📋</div>
              <div className="text-sm font-semibold text-foreground mb-1.5">No campaigns yet</div>
              <div className="text-xs text-muted-foreground mb-4">Create your first campaign to start publishing content</div>
              <Button size="sm" onClick={() => setCreateOpen(true)}>
                <Plus className="h-3.5 w-3.5 mr-1.5" />
                Create Campaign
              </Button>
            </div>
          ) : (
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b bg-muted/30">
                  <th className="w-9 px-3 py-2.5">
                    <input type="checkbox" className="accent-primary" />
                  </th>
                  <th className="w-12 px-3 py-2.5" />
                  <th className="px-4 py-2.5 text-left text-[10.5px] font-semibold text-muted-foreground uppercase tracking-wider">
                    Campaign Name
                  </th>
                  <th className="px-4 py-2.5 text-left text-[10.5px] font-semibold text-muted-foreground uppercase tracking-wider">
                    Progress
                  </th>
                  <th className="px-4 py-2.5 text-left text-[10.5px] font-semibold text-muted-foreground uppercase tracking-wider">
                    Score
                  </th>
                  <th className="px-4 py-2.5 text-left text-[10.5px] font-semibold text-muted-foreground uppercase tracking-wider">
                    Posts
                  </th>
                  <th className="px-4 py-2.5 text-left text-[10.5px] font-semibold text-muted-foreground uppercase tracking-wider">
                    Published
                  </th>
                  <th className="px-4 py-2.5 text-left text-[10.5px] font-semibold text-muted-foreground uppercase tracking-wider">
                    Views
                  </th>
                  <th className="px-4 py-2.5 text-left text-[10.5px] font-semibold text-muted-foreground uppercase tracking-wider">
                    Engagement
                  </th>
                  <th className="w-10 px-3 py-2.5" />
                </tr>
              </thead>
              <tbody>
                {filtered.map((campaign) => {
                  const pct = getProgress(campaign);
                  const views = parseInt(campaign.cached_total_views ?? '0', 10);
                  return (
                    <tr
                      key={campaign.id}
                      className="border-b last:border-b-0 hover:bg-muted/20 transition-colors cursor-pointer"
                    >
                      <td className="px-3 py-3.5" onClick={(e) => e.stopPropagation()}>
                        <input type="checkbox" className="accent-primary" />
                      </td>
                      <td className="px-3 py-3.5" onClick={(e) => e.stopPropagation()}>
                        <button
                          className={cn(
                            'relative w-[30px] h-[17px] rounded-full transition-colors',
                            campaign.status === 'active' ? 'bg-emerald-500' : 'bg-border',
                          )}
                        >
                          <span
                            className={cn(
                              'absolute top-[3px] w-[11px] h-[11px] bg-white rounded-full shadow transition-all',
                              campaign.status === 'active' ? 'left-[16px]' : 'left-[3px]',
                            )}
                          />
                        </button>
                      </td>
                      <td className="px-4 py-3.5">
                        <Link href={`/campaigns/${campaign.id}`} className="block">
                          <div className="text-[13.5px] font-semibold text-foreground">{campaign.name}</div>
                          <div className="mt-0.5">
                            <StatusBadge status={campaign.status} />
                          </div>
                        </Link>
                      </td>
                      <td className="px-4 py-3.5">
                        <Link href={`/campaigns/${campaign.id}`} className="flex items-center gap-2">
                          <ProgressRing pct={pct} />
                          <span className="text-xs text-muted-foreground font-mono">
                            {campaign.cached_published_posts}/{campaign.cached_total_posts}
                          </span>
                        </Link>
                      </td>
                      <td className="px-4 py-3.5">
                        {campaign.quality_score != null ? (
                          <span className={cn('inline-flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold border', getScoreClass(campaign.quality_score))}>
                            {campaign.quality_score}
                          </span>
                        ) : (
                          <span className="text-muted-foreground/50 text-sm">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-sm font-semibold text-muted-foreground">
                        {campaign.cached_total_posts > 0 ? campaign.cached_total_posts : <span className="text-muted-foreground/50">—</span>}
                      </td>
                      <td className="px-4 py-3.5 text-sm text-muted-foreground">
                        {campaign.cached_published_posts > 0 ? (
                          <span className="font-semibold">{campaign.cached_published_posts}</span>
                        ) : (
                          <span className="text-muted-foreground/50">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-sm text-muted-foreground">
                        {views > 0 ? (
                          views >= 1000 ? `${(views / 1000).toFixed(1)}k` : views.toString()
                        ) : (
                          <span className="text-muted-foreground/50">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-sm text-muted-foreground">
                        {campaign.cached_avg_engagement ? (
                          <span className="font-semibold text-emerald-600">{campaign.cached_avg_engagement}%</span>
                        ) : (
                          <span className="text-muted-foreground/50">—</span>
                        )}
                      </td>
                      <td className="px-3 py-3.5" onClick={(e) => e.stopPropagation()}>
                        <button className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-muted/60 text-muted-foreground transition-colors">
                          <MoreHorizontal className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <CreateCampaignModal open={createOpen} onClose={() => setCreateOpen(false)} />
    </div>
    </DashboardLayout>
  );
}
