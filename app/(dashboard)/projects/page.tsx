'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useAuth } from '@/lib/hooks/useAuth';
import { projectsApi, Project, ProjectStatus } from '@/lib/api/projects';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Loader2,
  Video,
  Type,
  Image,
  FolderOpen,
  AlertCircle,
  CheckCircle,
  Clock,
  MoreHorizontal,
  Search,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { getToolById } from '@/lib/studio/tool-registry';
import { formatRelativeTime, formatDuration, formatDateForTable, cn } from '@/lib/utils/format';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const PAGE_SIZE_OPTIONS = [10, 20, 25, 50];
const DEFAULT_PAGE_SIZE = 20;
const STATUS_CONFIG: Record<
  ProjectStatus,
  { label: string; dotClass: string; textClass: string; icon: typeof Loader2; spin?: boolean }
> = {
  pending: {
    label: 'Queued',
    dotClass: 'bg-muted-foreground/60',
    textClass: 'text-muted-foreground',
    icon: Clock,
  },
  processing: {
    label: 'Creating',
    dotClass: 'bg-amber-500',
    textClass: 'text-amber-600',
    icon: Loader2,
    spin: true,
  },
  rendering: {
    label: 'Rendering',
    dotClass: 'bg-primary',
    textClass: 'text-primary',
    icon: Loader2,
    spin: true,
  },
  completed: {
    label: 'Done',
    dotClass: 'bg-emerald-500',
    textClass: 'text-emerald-600',
    icon: CheckCircle,
  },
  failed: { label: 'Failed', dotClass: 'bg-red-500', textClass: 'text-red-600', icon: AlertCircle },
};

const TOOL_ICONS: Record<string, typeof Video> = {
  reel: Video,
  'kinetic-typography': Type,
  'graphic-motion': Type,
  'video-resize': Video,
  'video-compress': Video,
  'text-to-image': Image,
};

type SortKey = 'created_at' | 'status' | 'tool_type' | 'duration' | 'credit_cost';

function getProjectDisplayName(project: Project): string {
  const topic = (project.metadata as { topic?: string })?.topic;
  const tool = getToolById(project.tool_type);
  return topic || tool?.name || project.tool_type;
}

function getDetailHref(project: Project): string {
  if (project.tool_type === 'reel' && (project as Project & { media_id?: string }).media_id) {
    return `/videos/${(project as Project & { media_id?: string }).media_id}`;
  }
  return `/projects/${project.id}`;
}

export default function ProjectsPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { data: allProjects = [], isLoading: projectsLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: projectsApi.getProjects,
    enabled: isAuthenticated,
  });

  const [search, setSearch] = useState('');
  const [toolFilter, setToolFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortKey, setSortKey] = useState<SortKey>('created_at');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const toolTypes = useMemo(() => {
    const set = new Set(allProjects.map((p) => p.tool_type));
    return Array.from(set).sort();
  }, [allProjects]);

  const filteredAndSorted = useMemo(() => {
    let list = allProjects.filter((p) => {
      const name = getProjectDisplayName(p).toLowerCase();
      if (search.trim() && !name.includes(search.trim().toLowerCase())) return false;
      if (toolFilter !== 'all' && p.tool_type !== toolFilter) return false;
      if (statusFilter !== 'all' && p.status !== statusFilter) return false;
      return true;
    });
    list = [...list].sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case 'created_at':
          cmp = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
          break;
        case 'status':
          cmp = a.status.localeCompare(b.status);
          break;
        case 'tool_type':
          cmp = a.tool_type.localeCompare(b.tool_type);
          break;
        case 'duration':
          cmp = (a.duration ?? 0) - (b.duration ?? 0);
          break;
        case 'credit_cost':
          cmp = a.credit_cost - b.credit_cost;
          break;
        default:
          cmp = 0;
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return list;
  }, [allProjects, search, toolFilter, statusFilter, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filteredAndSorted.length / pageSize));
  const paginated = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredAndSorted.slice(start, start + pageSize);
  }, [filteredAndSorted, page, pageSize]);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.push('/login');
  }, [isAuthenticated, authLoading, router]);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === paginated.length) setSelectedIds(new Set());
    else setSelectedIds(new Set(paginated.map((p) => p.id)));
  };

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  if (!isAuthenticated) return null;

  return (
    <DashboardLayout>
      <div className="h-full flex flex-col bg-background">
        <div className="w-full max-w-[1800px] mx-auto flex flex-col flex-1 min-h-0 px-3 sm:px-4 lg:px-5 pb-5">
          {/* Sticky: control bar — single row on desktop, wraps on mobile */}
          <div className="shrink-0 pt-5 sm:pt-6 lg:pt-8 pb-4">
            <div className="flex flex-wrap items-center gap-2.5 rounded-xl border border-border/60 bg-muted/30 px-3 py-2.5 sm:gap-3 sm:px-4 sm:py-3">
              <div className="relative flex-1 min-w-[180px] max-w-[240px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                  placeholder="Search projects..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  className="h-9 w-full pl-9 pr-3 text-sm bg-background border-border/80 focus-visible:ring-2 focus-visible:ring-primary/20"
                />
              </div>
              <div className="h-px w-px bg-border/80 self-stretch sm:hidden" aria-hidden />
              <Select
                value={toolFilter}
                onValueChange={(v) => {
                  setToolFilter(v);
                  setPage(1);
                }}
              >
                <SelectTrigger className="h-9 w-auto min-w-[7.5rem] gap-3 rounded-lg border-border/80 bg-background pl-3 pr-3 text-sm text-foreground shadow-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 [&>span]:line-clamp-1">
                  <SelectValue placeholder="All tools" />
                </SelectTrigger>
                <SelectContent
                  align="start"
                  className="rounded-lg border-border/80 bg-popover text-popover-foreground shadow-md min-w-[var(--radix-select-trigger-width)]"
                >
                  <SelectItem
                    value="all"
                    className="rounded-md py-2 pl-8 pr-3 text-sm cursor-pointer focus:bg-muted/80"
                  >
                    All tools
                  </SelectItem>
                  {toolTypes.map((t) => (
                    <SelectItem
                      key={t}
                      value={t}
                      className="rounded-md py-2 pl-8 pr-3 text-sm cursor-pointer focus:bg-muted/80"
                    >
                      {getToolById(t)?.name ?? t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={statusFilter}
                onValueChange={(v) => {
                  setStatusFilter(v);
                  setPage(1);
                }}
              >
                <SelectTrigger className="h-9 w-auto min-w-[7.5rem] gap-3 rounded-lg border-border/80 bg-background pl-3 pr-3 text-sm text-foreground shadow-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 [&>span]:line-clamp-1">
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent
                  align="start"
                  className="rounded-lg border-border/80 bg-popover text-popover-foreground shadow-md min-w-[var(--radix-select-trigger-width)]"
                >
                  <SelectItem
                    value="all"
                    className="rounded-md py-2 pl-8 pr-3 text-sm cursor-pointer focus:bg-muted/80"
                  >
                    All statuses
                  </SelectItem>
                  {(['pending', 'processing', 'rendering', 'completed', 'failed'] as const).map(
                    (s) => (
                      <SelectItem
                        key={s}
                        value={s}
                        className="rounded-md py-2 pl-8 pr-3 text-sm cursor-pointer focus:bg-muted/80"
                      >
                        {STATUS_CONFIG[s].label}
                      </SelectItem>
                    ),
                  )}
                </SelectContent>
              </Select>
              <Select
                value={`${sortKey}-${sortDir}`}
                onValueChange={(v) => {
                  const [k, d] = v.split('-') as [SortKey, 'asc' | 'desc'];
                  setSortKey(k);
                  setSortDir(d);
                  setPage(1);
                }}
              >
                <SelectTrigger className="h-9 w-auto min-w-[8.5rem] gap-3 rounded-lg border-border/80 bg-background pl-3 pr-3 text-sm text-foreground shadow-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 [&>span]:line-clamp-1">
                  <SelectValue placeholder="Sort" />
                </SelectTrigger>
                <SelectContent
                  align="start"
                  className="rounded-lg border-border/80 bg-popover text-popover-foreground shadow-md min-w-[var(--radix-select-trigger-width)]"
                >
                  <SelectItem
                    value="created_at-desc"
                    className="rounded-md py-2 pl-8 pr-3 text-sm cursor-pointer focus:bg-muted/80"
                  >
                    Newest first
                  </SelectItem>
                  <SelectItem
                    value="created_at-asc"
                    className="rounded-md py-2 pl-8 pr-3 text-sm cursor-pointer focus:bg-muted/80"
                  >
                    Oldest first
                  </SelectItem>
                  <SelectItem
                    value="status-asc"
                    className="rounded-md py-2 pl-8 pr-3 text-sm cursor-pointer focus:bg-muted/80"
                  >
                    Status A–Z
                  </SelectItem>
                  <SelectItem
                    value="tool_type-asc"
                    className="rounded-md py-2 pl-8 pr-3 text-sm cursor-pointer focus:bg-muted/80"
                  >
                    Tool A–Z
                  </SelectItem>
                  <SelectItem
                    value="duration-desc"
                    className="rounded-md py-2 pl-8 pr-3 text-sm cursor-pointer focus:bg-muted/80"
                  >
                    Duration (high)
                  </SelectItem>
                  <SelectItem
                    value="credit_cost-desc"
                    className="rounded-md py-2 pl-8 pr-3 text-sm cursor-pointer focus:bg-muted/80"
                  >
                    Credits (high)
                  </SelectItem>
                </SelectContent>
              </Select>
              {selectedIds.size > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 shrink-0 border-border/80 text-muted-foreground hover:text-foreground hover:bg-background/80"
                  onClick={() => setSelectedIds(new Set())}
                >
                  Clear ({selectedIds.size})
                </Button>
              )}
            </div>
          </div>

          {projectsLoading ? (
            <div className="flex flex-1 flex-col items-center justify-center py-20 gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Loading projects...</p>
            </div>
          ) : filteredAndSorted.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center py-16 text-center border border-dashed border-border/70 rounded-xl bg-muted/20">
              <FolderOpen className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground text-sm font-medium mb-3">
                {allProjects.length === 0
                  ? 'No projects yet. Create something from the Studio.'
                  : 'No projects match your filters.'}
              </p>
              {allProjects.length === 0 ? (
                <Link href="/studio">
                  <Button variant="outline" size="sm" className="rounded-lg">
                    Open Studio
                  </Button>
                </Link>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-lg"
                  onClick={() => {
                    setSearch('');
                    setToolFilter('all');
                    setStatusFilter('all');
                    setPage(1);
                  }}
                >
                  Clear filters
                </Button>
              )}
            </div>
          ) : (
            <>
              {/* Mobile: card list (no horizontal overflow) */}
              <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar md:hidden space-y-3 pb-2">
                {paginated.map((project) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    isSelected={selectedIds.has(project.id)}
                    onToggleSelect={toggleSelect}
                    onSelectRow={() => router.push(getDetailHref(project))}
                  />
                ))}
              </div>

              {/* Desktop: table with horizontal scroll when needed */}
              <div className="flex-1 min-h-0 flex flex-col rounded-lg border border-border/60 bg-card shadow-[0_1px_2px_rgba(0,0,0,0.04)] overflow-hidden hidden md:flex">
                <div className="flex-1 min-h-0 overflow-auto custom-scrollbar">
                  <table className="w-full text-sm table-fixed min-w-[640px]">
                    <colgroup>
                      <col style={{ width: '2.5%' }} />
                      <col style={{ width: '32%' }} />
                      <col style={{ width: '14%' }} />
                      <col style={{ width: '14%' }} />
                      <col style={{ width: '10%' }} />
                      <col style={{ width: '8%' }} />
                      <col style={{ width: '14%' }} />
                      <col style={{ width: '5.5%' }} />
                    </colgroup>
                    <thead className="sticky top-0 z-10 bg-muted/80 border-b border-border/70">
                      <tr>
                        <th className="w-10 py-3 pl-4 pr-2 text-left">
                          <input
                            type="checkbox"
                            checked={paginated.length > 0 && selectedIds.size === paginated.length}
                            onChange={toggleSelectAll}
                            className="rounded border-border"
                          />
                        </th>
                        <th className="py-3 px-3 text-left font-semibold text-foreground">
                          Project
                        </th>
                        <th className="py-3 px-3 text-left font-semibold text-foreground">Tool</th>
                        <th className="py-3 px-3 text-left font-semibold text-foreground">
                          Status
                        </th>
                        <th className="py-3 px-3 text-right font-semibold text-foreground w-24">
                          Duration
                        </th>
                        <th className="py-3 px-3 text-right font-semibold text-foreground w-24">
                          Credits
                        </th>
                        <th className="py-3 px-3 text-right font-semibold text-foreground w-28">
                          Created
                        </th>
                        <th className="w-12 py-3 pr-4 pl-2" aria-label="Actions" />
                      </tr>
                    </thead>
                    <tbody>
                      {paginated.map((project) => (
                        <ProjectRow
                          key={project.id}
                          project={project}
                          isSelected={selectedIds.has(project.id)}
                          onToggleSelect={toggleSelect}
                          onSelectRow={() => router.push(getDetailHref(project))}
                        />
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Pagination — fixed at bottom, contained bar */}
              <div className="shrink-0 mt-4">
                <div className="rounded-xl border border-border/60 bg-muted/20 px-3 py-3 sm:px-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                    {/* Left: count + page size */}
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm text-muted-foreground">
                        Showing {(page - 1) * pageSize + 1}–
                        {Math.min(page * pageSize, filteredAndSorted.length)} of{' '}
                        {filteredAndSorted.length}
                      </span>
                      <span className="text-muted-foreground/60 hidden sm:inline">·</span>
                      <Select
                        value={String(pageSize)}
                        onValueChange={(v) => {
                          setPageSize(Number(v));
                          setPage(1);
                        }}
                      >
                        <SelectTrigger className="h-8 w-[72px] rounded-lg border-border/80 bg-background text-sm shadow-none focus:ring-2 focus:ring-primary/20">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent
                          align="start"
                          className="min-w-[var(--radix-select-trigger-width)]"
                        >
                          {PAGE_SIZE_OPTIONS.map((n) => (
                            <SelectItem key={n} value={String(n)} className="text-sm">
                              {n}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    {/* Right: page nav + go to */}
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground sm:inline">Page</span>
                        <Input
                          type="number"
                          min={1}
                          max={totalPages}
                          value={page}
                          onChange={(e) => {
                            const v = parseInt(e.target.value, 10);
                            if (Number.isNaN(v) || v < 1) return;
                            setPage(Math.min(totalPages, v));
                          }}
                          className="w-11 h-8 px-2 text-center text-sm rounded-lg border-border/80"
                        />
                        <span className="text-sm text-muted-foreground">of {totalPages}</span>
                      </div>
                      <div className="flex items-center gap-0.5">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 rounded-lg"
                          onClick={() => setPage((p) => Math.max(1, p - 1))}
                          disabled={page === 1}
                          aria-label="Previous page"
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                          let p: number;
                          if (totalPages <= 5) p = i + 1;
                          else if (page <= 3) p = i + 1;
                          else if (page >= totalPages - 2) p = totalPages - 4 + i;
                          else p = page - 2 + i;
                          return (
                            <Button
                              key={p}
                              variant={page === p ? 'secondary' : 'ghost'}
                              size="sm"
                              className="h-8 min-w-[2rem] px-2 text-xs rounded-lg"
                              onClick={() => setPage(p)}
                            >
                              {p}
                            </Button>
                          );
                        })}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 rounded-lg"
                          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                          disabled={page === totalPages}
                          aria-label="Next page"
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

function ProjectRow({
  project,
  isSelected,
  onToggleSelect,
  onSelectRow,
}: {
  project: Project;
  isSelected: boolean;
  onToggleSelect: (id: string) => void;
  onSelectRow: () => void;
}) {
  const router = useRouter();
  const config = STATUS_CONFIG[project.status];
  const Icon = TOOL_ICONS[project.tool_type] ?? FolderOpen;
  const tool = getToolById(project.tool_type);
  const name = getProjectDisplayName(project);
  const detailHref = getDetailHref(project);

  return (
    <tr
      className={cn(
        'border-b border-border/50 last:border-b-0 transition-colors',
        'hover:bg-muted/40 cursor-pointer',
        isSelected && 'bg-primary/5',
      )}
      onClick={(e) => {
        if (
          (e.target as HTMLElement).closest('input[type="checkbox"]') ||
          (e.target as HTMLElement).closest('[data-dropdown-menu]')
        )
          return;
        onSelectRow();
      }}
    >
      <td className="py-2.5 pl-4 pr-2" onClick={(e) => e.stopPropagation()}>
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onToggleSelect(project.id)}
          className="rounded border-border"
        />
      </td>
      <td className="py-2.5 px-3 min-w-0">
        <div className="flex items-center gap-2 min-w-0 overflow-hidden">
          <div className="w-8 h-8 rounded-lg bg-muted/60 border border-border/60 flex items-center justify-center shrink-0">
            <Icon className="h-4 w-4 text-primary" />
          </div>
          <span
            className="font-medium text-foreground min-w-0 overflow-x-auto overflow-y-hidden whitespace-nowrap block custom-scrollbar"
            title={name}
          >
            {name}
          </span>
        </div>
      </td>
      <td className="py-2.5 px-3">
        <span className="inline-flex items-center rounded-md bg-muted/70 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
          {tool?.name ?? project.tool_type}
        </span>
      </td>
      <td className="py-2.5 px-3">
        <div className="flex items-center gap-1.5">
          {config.spin ? (
            <config.icon className={cn('h-3.5 w-3.5 shrink-0 animate-spin', config.textClass)} />
          ) : (
            <span className={cn('h-2 w-2 rounded-full shrink-0', config.dotClass)} />
          )}
          <span className={cn('text-xs font-medium', config.textClass)}>{config.label}</span>
        </div>
      </td>
      <td className="py-2.5 px-3 text-right tabular-nums text-muted-foreground">
        {formatDuration(project.duration)}
      </td>
      <td className="py-2.5 px-3 text-right tabular-nums text-muted-foreground">
        {project.credit_cost}
      </td>
      <td className="py-2.5 px-3 text-right text-muted-foreground whitespace-nowrap">
        {formatDateForTable(project.created_at)}
      </td>
      <td className="py-2.5 pr-4 pl-2" onClick={(e) => e.stopPropagation()}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="p-1.5 rounded-md hover:bg-muted/80 text-muted-foreground hover:text-foreground"
              aria-label="Actions"
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-[120px]">
            <DropdownMenuItem onClick={() => router.push(detailHref)}>View</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <a
                href={detailHref}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full"
              >
                Open in new tab
              </a>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </td>
    </tr>
  );
}

function ProjectCard({
  project,
  isSelected,
  onToggleSelect,
  onSelectRow,
}: {
  project: Project;
  isSelected: boolean;
  onToggleSelect: (id: string) => void;
  onSelectRow: () => void;
}) {
  const router = useRouter();
  const config = STATUS_CONFIG[project.status];
  const Icon = TOOL_ICONS[project.tool_type] ?? FolderOpen;
  const tool = getToolById(project.tool_type);
  const name = getProjectDisplayName(project);
  const detailHref = getDetailHref(project);

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={(e) => {
        if (
          (e.target as HTMLElement).closest('input[type="checkbox"]') ||
          (e.target as HTMLElement).closest('[data-dropdown-menu]')
        )
          return;
        onSelectRow();
      }}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onSelectRow()}
      className={cn(
        'rounded-xl border border-border/60 bg-card p-3 shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-colors',
        'hover:border-border hover:bg-muted/30 cursor-pointer',
        isSelected && 'bg-primary/5 border-primary/20',
      )}
    >
      <div className="flex items-start gap-3">
        <div className="pt-0.5 shrink-0" onClick={(e) => e.stopPropagation()}>
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => onToggleSelect(project.id)}
            className="rounded border-border"
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-9 h-9 rounded-lg bg-muted/60 border border-border/60 flex items-center justify-center shrink-0">
              <Icon className="h-4 w-4 text-primary" />
            </div>
            <span className="font-medium text-foreground truncate" title={name}>
              {name}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-2 text-xs text-muted-foreground">
            <span className="inline-flex items-center rounded-md bg-muted/70 px-2 py-0.5 font-medium uppercase tracking-wider text-muted-foreground">
              {tool?.name ?? project.tool_type}
            </span>
            <span className="flex items-center gap-1.5">
              {config.spin ? (
                <config.icon
                  className={cn('h-3.5 w-3.5 shrink-0 animate-spin', config.textClass)}
                />
              ) : (
                <span className={cn('h-2 w-2 rounded-full shrink-0', config.dotClass)} />
              )}
              <span className={cn('font-medium', config.textClass)}>{config.label}</span>
            </span>
            <span className="tabular-nums">{formatDuration(project.duration)}</span>
            <span className="tabular-nums">{project.credit_cost} credits</span>
            <span>{formatDateForTable(project.created_at)}</span>
          </div>
        </div>
        <div className="shrink-0" onClick={(e) => e.stopPropagation()}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="p-1.5 rounded-md hover:bg-muted/80 text-muted-foreground hover:text-foreground"
                aria-label="Actions"
              >
                <MoreHorizontal className="h-4 w-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-[120px]">
              <DropdownMenuItem onClick={() => router.push(detailHref)}>View</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <a
                  href={detailHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full"
                >
                  Open in new tab
                </a>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}
