'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Sparkles, Check } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils/format';
import {
  campaignsApi,
  type CampaignPost,
  type CampaignPostType,
  type ContentSource,
  type CreateCampaignPostDto,
  type UpdateCampaignPostDto,
} from '@/lib/api/campaigns';
import { projectsApi, type Project } from '@/lib/api/projects';

const POST_TYPE_META: Record<CampaignPostType, { icon: string; label: string }> = {
  reel:           { icon: '🎬', label: 'Reel' },
  carousel:       { icon: '🖼️', label: 'Carousel' },
  story:          { icon: '⏱️', label: 'Story' },
  ugc_video:      { icon: '🤳', label: 'UGC Video' },
  image:          { icon: '🖼️', label: 'Image' },
  graphic_motion: { icon: '✨', label: 'Graphic Motion' },
};

const PLATFORMS = [
  { id: 'instagram', label: '📷 Instagram', sub: 'Reels, Stories, Carousels' },
  { id: 'tiktok',   label: '🎵 TikTok',    sub: 'Short-form videos' },
  { id: 'youtube',  label: '▶️ YouTube Shorts', sub: 'Vertical video' },
];

const BEST_PRACTICES = [
  { icon: '⏱', text: 'Hook in first 3 seconds' },
  { icon: '📐', text: 'Vertical 9:16 ratio' },
  { icon: '🔇', text: 'Add captions for silent viewers' },
  { icon: '🎵', text: 'Use trending audio' },
  { icon: '#️⃣', text: '5–10 targeted hashtags' },
];

interface Props {
  open: boolean;
  onClose: () => void;
  campaignId: string;
  postType: CampaignPostType;
  initialSource?: ContentSource;
  dayNumber?: number;
  /** When provided, the modal operates in edit mode */
  editPost?: CampaignPost;
}

export function AddPostModal({
  open,
  onClose,
  campaignId,
  postType,
  initialSource = 'new',
  dayNumber = 1,
  editPost,
}: Props) {
  const isEdit = !!editPost;

  const [source, setSource] = useState<ContentSource>(editPost?.content_source ?? initialSource);
  const [title, setTitle] = useState(editPost?.title ?? '');
  const [hook, setHook] = useState(editPost?.hook ?? '');
  const [caption, setCaption] = useState(editPost?.caption ?? '');
  const [script, setScript] = useState(editPost?.script ?? '');
  const [hashtags, setHashtags] = useState(editPost?.hashtags ?? '');
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(
    editPost?.target_platforms.length ? editPost.target_platforms : ['instagram', 'tiktok'],
  );
  const [day, setDay] = useState(editPost?.day_number ?? dayNumber);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const { data: projects = [], isLoading: projectsLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: projectsApi.getProjects,
    enabled: source === 'existing',
  });

  const queryClient = useQueryClient();
  const meta = POST_TYPE_META[postType];

  const { mutate: createPost, isPending: isCreating } = useMutation({
    mutationFn: (dto: CreateCampaignPostDto) => campaignsApi.createPost(campaignId, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaign-posts', campaignId] });
      queryClient.invalidateQueries({ queryKey: ['campaign', campaignId] });
      toast.success('Post added to campaign');
      onClose();
    },
    onError: () => toast.error('Failed to add post'),
  });

  const { mutate: updatePost, isPending: isUpdating } = useMutation({
    mutationFn: (dto: UpdateCampaignPostDto) =>
      campaignsApi.updatePost(campaignId, editPost!.id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaign-posts', campaignId] });
      toast.success('Post updated');
      onClose();
    },
    onError: () => toast.error('Failed to update post'),
  });

  const isPending = isCreating || isUpdating;

  function togglePlatform(id: string) {
    setSelectedPlatforms((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id],
    );
  }

  function handleSave() {
    if (source === 'existing' && !selectedProject) {
      toast.error('Please select a project');
      return;
    }

    const payload = {
      day_number: day,
      content_source: source,
      title: title || undefined,
      hook: hook || undefined,
      caption: caption || undefined,
      script: script || undefined,
      hashtags: hashtags || undefined,
      target_platforms: selectedPlatforms,
      ...(source === 'existing' && selectedProject
        ? { source_entity_type: selectedProject.tool_type, source_entity_id: selectedProject.id }
        : {}),
    };

    if (isEdit) {
      updatePost(payload);
    } else {
      createPost({ ...payload, post_type: postType });
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-[900px] p-0 gap-0 overflow-hidden h-[88vh]">
        <DialogHeader className="px-5 py-3.5 border-b flex-row items-center gap-3 space-y-0">
          <span className="text-xs font-mono font-semibold bg-muted border rounded px-2 py-0.5 text-muted-foreground">
            Day {day}
          </span>
          <DialogTitle className="flex items-center gap-2 text-sm font-bold">
            <span>{meta.icon}</span>
            <span>{isEdit ? `Edit ${meta.label}` : meta.label}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-1 overflow-hidden">
          {/* Left — editor */}
          <div className="flex-1 flex flex-col gap-4 p-5 border-r overflow-y-auto">
            {/* Source switcher */}
            <div>
              <label className="text-xs font-semibold mb-2 block">Content Source</label>
              <div className="flex gap-1.5">
                {(['new', 'existing'] as const).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSource(s)}
                    className={cn(
                      'px-3.5 py-1.5 rounded-lg text-xs font-semibold border transition-all',
                      source === s
                        ? 'bg-primary/8 border-primary/30 text-primary'
                        : 'bg-muted/40 border-border text-muted-foreground hover:border-border/80',
                    )}
                  >
                    {s === 'new' ? '✦ Create New' : '📁 Add from Projects'}
                  </button>
                ))}
              </div>
            </div>

            {/* Title — shared between new and existing */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold flex items-center gap-2">
                Title
                <span className="text-[10px] text-red-500 font-semibold">required for YouTube</span>
              </label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., 5 Morning Habits That Changed My Life"
                maxLength={100}
              />
              <p className="text-[10.5px] text-muted-foreground">
                Used as the video title on YouTube. Max 100 characters.
              </p>
            </div>

            {source === 'new' ? (
              <>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold flex items-center gap-2">
                    Hook
                    <span className="bg-primary/8 border border-primary/20 text-primary text-[10px] font-semibold px-1.5 py-0.5 rounded">
                      ✦ AI
                    </span>
                  </label>
                  <Input
                    value={hook}
                    onChange={(e) => setHook(e.target.value)}
                    placeholder="e.g., Only 1% of creators know this..."
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold">Caption</label>
                  <Input
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    placeholder="Catchy caption for your post"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold flex items-center gap-2">
                    Script
                    <span className="bg-primary/8 border border-primary/20 text-primary text-[10px] font-semibold px-1.5 py-0.5 rounded">
                      ✦ AI
                    </span>
                  </label>
                  <Textarea
                    value={script}
                    onChange={(e) => setScript(e.target.value)}
                    placeholder="Write your video script here..."
                    className="min-h-[100px] resize-y"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold">Hashtags</label>
                  <Input
                    value={hashtags}
                    onChange={(e) => setHashtags(e.target.value)}
                    placeholder="#motivation #success #mindset"
                  />
                </div>
              </>
            ) : (
              <div className="flex flex-col gap-3">
                <label className="text-xs font-semibold">Select from Projects</label>

                {projectsLoading ? (
                  <div className="py-8 text-center text-sm text-muted-foreground">Loading projects…</div>
                ) : projects.filter((p) => p.status === 'completed').length === 0 ? (
                  <div className="p-8 text-center border-2 border-dashed rounded-lg text-muted-foreground">
                    <div className="text-3xl mb-2 opacity-30">📁</div>
                    <div className="text-sm font-medium">No completed projects yet</div>
                    <div className="text-xs mt-1">Create a reel or video first, then come back to add it here</div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2 max-h-[280px] overflow-y-auto pr-1">
                    {projects
                      .filter((p) => p.status === 'completed')
                      .map((project) => {
                        const isSelected = selectedProject?.id === project.id;
                        const label = (project.metadata as any)?.topic
                          ?? (project.metadata as any)?.script?.slice(0, 60)
                          ?? project.tool_type;
                        const typeLabel = project.tool_type
                          .replace(/_/g, ' ')
                          .replace(/\b\w/g, (c) => c.toUpperCase());
                        return (
                          <button
                            key={project.id}
                            type="button"
                            onClick={() => setSelectedProject(isSelected ? null : project)}
                            className={cn(
                              'flex items-center gap-3 p-3 rounded-lg border text-left transition-all',
                              isSelected
                                ? 'border-primary/40 bg-primary/5'
                                : 'border-border hover:border-border/80 hover:bg-muted/30',
                            )}
                          >
                            {/* Thumbnail */}
                            <div className="w-14 h-10 rounded-md bg-muted border flex-shrink-0 overflow-hidden">
                              {project.thumbnail_url ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={project.thumbnail_url}
                                  alt=""
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-lg">🎬</div>
                              )}
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="text-xs font-semibold text-foreground truncate">{label}</div>
                              <div className="text-[11px] text-muted-foreground mt-0.5">{typeLabel}</div>
                            </div>

                            {isSelected && (
                              <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                                <Check className="h-3 w-3 text-primary-foreground" />
                              </div>
                            )}
                          </button>
                        );
                      })}
                  </div>
                )}
              </div>
            )}

            {/* Platforms */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold">Platforms</label>
              <div className="flex flex-col gap-2">
                {PLATFORMS.map((p) => (
                  <label
                    key={p.id}
                    className={cn(
                      'flex items-center gap-3 p-2.5 rounded-lg border cursor-pointer transition-all',
                      selectedPlatforms.includes(p.id)
                        ? 'border-primary/30 bg-primary/5'
                        : 'border-border hover:border-border/80',
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={selectedPlatforms.includes(p.id)}
                      onChange={() => togglePlatform(p.id)}
                      className="accent-primary"
                    />
                    <div>
                      <div className="text-sm font-semibold">{p.label}</div>
                      <div className="text-[11px] text-muted-foreground">{p.sub}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Right — preview panel */}
          <div className="w-[240px] flex-shrink-0 bg-muted/20 p-4 flex flex-col gap-3 overflow-y-auto">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Best Practices
            </p>
            <div className="bg-card border rounded-lg p-3 flex flex-col gap-2">
              {BEST_PRACTICES.map((tip) => (
                <div key={tip.text} className="flex items-start gap-2 text-[11.5px] text-muted-foreground">
                  <span>{tip.icon}</span>
                  <span>{tip.text}</span>
                </div>
              ))}
            </div>

            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mt-1">
              Pipeline States
            </p>
            <div className="bg-card border rounded-lg p-3 flex flex-col gap-1.5">
              {(['draft', 'generating', 'ready', 'awaiting_schedule', 'scheduled', 'publishing', 'published', 'failed'] as const).map((s) => (
                <div key={s} className="flex items-center gap-2 text-[11px] text-muted-foreground">
                  <span className="capitalize">{s.replace('_', ' ')}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="px-5 py-3 border-t flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
            Publish on Day
            <input
              type="number"
              value={day}
              min={1}
              onChange={(e) => setDay(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-14 text-center bg-muted border rounded-md px-2 py-1 font-mono text-sm outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <div className="ml-auto flex gap-2">
            <Button variant="outline" onClick={onClose} disabled={isPending}>Cancel</Button>
            {!isEdit && (
              <Button variant="outline" disabled={isPending}>
                <Sparkles className="h-3.5 w-3.5 mr-1.5" />
                Send Test
              </Button>
            )}
            <Button onClick={handleSave} disabled={isPending}>
              {isPending ? (isEdit ? 'Saving…' : 'Adding…') : isEdit ? 'Save Changes' : 'Save Post'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
