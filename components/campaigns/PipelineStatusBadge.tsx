'use client';

import { cn } from '@/lib/utils/format';
import type { CampaignPostPipelineStatus } from '@/lib/api/campaigns';

const STATUS_CONFIG: Record<
  CampaignPostPipelineStatus,
  { label: string; className: string; dotClassName: string; animate?: boolean }
> = {
  draft: {
    label: 'Draft',
    className: 'bg-muted text-muted-foreground border-border',
    dotClassName: 'bg-muted-foreground/60',
  },
  generating: {
    label: 'Generating',
    className: 'bg-primary/8 text-primary border-primary/20',
    dotClassName: 'bg-primary animate-pulse',
    animate: true,
  },
  ready: {
    label: 'Ready',
    className: 'bg-violet-500/10 text-violet-700 border-violet-300 dark:text-violet-400 dark:border-violet-700',
    dotClassName: 'bg-violet-500',
  },
  awaiting_schedule: {
    label: 'Awaiting Schedule',
    className: 'bg-amber-500/10 text-amber-700 border-amber-300/50 dark:text-amber-400',
    dotClassName: 'bg-amber-500 animate-pulse',
    animate: true,
  },
  scheduled: {
    label: 'Scheduled',
    className: 'bg-blue-500/10 text-blue-700 border-blue-300/50 dark:text-blue-400',
    dotClassName: 'bg-blue-500',
  },
  publishing: {
    label: 'Publishing',
    className: 'bg-blue-500/15 text-blue-700 border-blue-400/30 dark:text-blue-400',
    dotClassName: 'bg-blue-500 animate-pulse',
    animate: true,
  },
  published: {
    label: 'Published',
    className: 'bg-emerald-500/10 text-emerald-700 border-emerald-300/50 dark:text-emerald-400',
    dotClassName: 'bg-emerald-500',
  },
  failed: {
    label: 'Failed',
    className: 'bg-red-500/8 text-red-700 border-red-300/30 dark:text-red-400',
    dotClassName: 'bg-red-500',
  },
};

interface Props {
  status: CampaignPostPipelineStatus;
  className?: string;
}

export function PipelineStatusBadge({ status, className }: Props) {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.draft;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-md border whitespace-nowrap',
        config.className,
        className,
      )}
    >
      <span className={cn('w-1.5 h-1.5 rounded-full flex-shrink-0', config.dotClassName)} />
      {config.label}
    </span>
  );
}
