'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Sparkles, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils/format';
import { campaignsApi, type CampaignGoalType, type CreateCampaignDto } from '@/lib/api/campaigns';

const GOAL_OPTIONS: { value: CampaignGoalType; icon: string; label: string; sub: string }[] = [
  { value: 'grow_following',  icon: '📈', label: 'Grow Following',  sub: 'Build your audience' },
  { value: 'lead_generation', icon: '💼', label: 'Lead Generation', sub: 'Find potential clients' },
  { value: 'product_sales',   icon: '🛍️', label: 'Product Sales',   sub: 'Drive purchases' },
  { value: 'brand_awareness', icon: '🎯', label: 'Brand Awareness', sub: 'Get discovered' },
];

const VISUAL_STYLES = ['Cinematic', 'Film Noir', 'Anime', 'Cyberpunk', 'Minimalist', 'Documentary'];

const PLATFORMS = [
  { id: 'instagram', label: '📷 Instagram' },
  { id: 'tiktok',   label: '🎵 TikTok' },
  { id: 'youtube',  label: '▶️ YouTube Shorts' },
];

interface Props {
  open: boolean;
  onClose: () => void;
}

export function CreateCampaignModal({ open, onClose }: Props) {
  const [name, setName] = useState('');
  const [goalType, setGoalType] = useState<CampaignGoalType>('grow_following');
  const [visualStyle, setVisualStyle] = useState('Cinematic');
  const [platforms, setPlatforms] = useState<string[]>(['instagram', 'tiktok']);
  const [startDate, setStartDate] = useState('');

  const queryClient = useQueryClient();

  const { mutate: createCampaign, isPending } = useMutation({
    mutationFn: (dto: CreateCampaignDto) => campaignsApi.create(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      toast.success('Campaign created!');
      onClose();
      resetForm();
    },
    onError: () => toast.error('Failed to create campaign'),
  });

  function resetForm() {
    setName('');
    setGoalType('grow_following');
    setVisualStyle('Cinematic');
    setPlatforms(['instagram', 'tiktok']);
    setStartDate('');
  }

  function togglePlatform(id: string) {
    setPlatforms((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id],
    );
  }

  function handleSubmit() {
    if (!name.trim()) {
      toast.error('Campaign name is required');
      return;
    }
    createCampaign({
      name: name.trim(),
      goal_type: goalType,
      visual_style: visualStyle,
      target_platforms: platforms,
      start_date: startDate || undefined,
    });
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-[540px] p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-5 py-4 border-b">
          <DialogTitle className="flex items-center gap-2 text-base font-bold">
            <Sparkles className="h-4 w-4 text-primary" />
            Create New Campaign
          </DialogTitle>
        </DialogHeader>

        <div className="p-5 flex flex-col gap-4 overflow-y-auto max-h-[70vh]">
          {/* Name */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold">Campaign Name</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Motivation Growth Campaign"
            />
          </div>

          {/* Goal */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold">Goal</label>
            <div className="grid grid-cols-2 gap-2">
              {GOAL_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setGoalType(opt.value)}
                  className={cn(
                    'text-left p-3 rounded-lg border transition-all text-sm',
                    goalType === opt.value
                      ? 'border-primary bg-primary/5 shadow-sm'
                      : 'border-border bg-muted/40 hover:border-border/80',
                  )}
                >
                  <div className="text-xl mb-1.5">{opt.icon}</div>
                  <div className="font-bold text-xs text-foreground">{opt.label}</div>
                  <div className="text-[11px] text-muted-foreground mt-0.5">{opt.sub}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Visual Style */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold">Visual Style</label>
            <Select value={visualStyle} onValueChange={setVisualStyle}>
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

          {/* Platforms */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold">Target Platforms</label>
            <div className="flex flex-col gap-2">
              {PLATFORMS.map((p) => (
                <label
                  key={p.id}
                  className={cn(
                    'flex items-center gap-3 p-2.5 rounded-lg border cursor-pointer transition-all',
                    platforms.includes(p.id)
                      ? 'border-primary/30 bg-primary/5'
                      : 'border-border hover:border-border/80',
                  )}
                >
                  <input
                    type="checkbox"
                    checked={platforms.includes(p.id)}
                    onChange={() => togglePlatform(p.id)}
                    className="accent-primary"
                  />
                  <span className="text-sm font-medium">{p.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Start Date */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold">Start Date</label>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
        </div>

        <div className="px-5 py-3 border-t flex items-center justify-end gap-2">
          <Button variant="outline" onClick={onClose} disabled={isPending}>
            Cancel
          </Button>
          <Button
            variant="outline"
            className="gap-2 border-primary/30 text-primary hover:bg-primary/5"
            disabled={isPending}
          >
            <Sparkles className="h-3.5 w-3.5" />
            Generate With AI
          </Button>
          <Button onClick={handleSubmit} disabled={isPending || !name.trim()}>
            {isPending ? 'Creating…' : 'Create Campaign'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
