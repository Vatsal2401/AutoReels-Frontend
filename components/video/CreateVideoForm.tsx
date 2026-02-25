'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useMutation, useQuery } from '@tanstack/react-query';
import { videosApi, CreateVideoDto, Video, VideoStatus } from '@/lib/api/videos';
import { useCredits } from '@/lib/hooks/useCredits';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { GenerationProgress } from './GenerationProgress';
import { CelebrationOverlay } from './CelebrationOverlay';
import { TopicIdeas } from './TopicIdeas';
import { VisualStyleSelector } from '../media-settings/VisualStyleSelector';
import { FormatSelector } from '../media-settings/FormatSelector';
import { NarrationSettings } from '../media-settings/NarrationSettings';
import { DurationSelector } from '../media-settings/DurationSelector';
import { CaptionSettings } from '../media-settings/CaptionSettings';
import { MusicSelector } from '../media-settings/MusicSelector';
import { MediaSettings } from '../media-settings/types';
import { getFullPrompt } from '../media-settings/styles';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertCircle,
  Sparkles,
  Zap,
  CreditCard,
  Info,
  Eye,
  CheckCircle2,
  Loader2,
  FileText,
} from 'lucide-react';
import { cn } from '@/lib/utils/format';
import { toast } from 'sonner';

function getApiErrorMessage(error: unknown): string {
  if (error && typeof error === 'object' && 'response' in error) {
    const res = (error as { response?: { data?: { message?: string | string[] } } }).response;
    const msg = res?.data?.message;
    if (Array.isArray(msg)) return msg[0];
    if (typeof msg === 'string') return msg;
  }
  if (error instanceof Error) return error.message;
  return 'Something went wrong. Please try again.';
}

const DURATION_MAPPING = {
  Short: '30-60',
  Medium: '60-90',
  Long: '90-120',
};

const getStepFromStatus = (status: string) => {
  switch (status) {
    case 'pending':
      return 'start';
    case 'script_generating':
      return 'script';
    case 'script_complete':
      return 'audio';
    case 'processing':
      return 'assets';
    case 'rendering':
      return 'render';
    case 'completed':
      return 'done';
    default:
      return 'start';
  }
};

const getProgressFromStatus = (status: string) => {
  switch (status) {
    case 'pending':
      return 5;
    case 'script_generating':
      return 25;
    case 'script_complete':
      return 45;
    case 'processing':
      return 70;
    case 'rendering':
      return 90;
    case 'completed':
      return 100;
    default:
      return 0;
  }
};

export function CreateVideoForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const retryVideoId = searchParams.get('videoId');
  const [topic, setTopic] = useState(searchParams.get('topic') || '');
  const [tone, setTone] = useState('motivational');
  const [hookType, setHookType] = useState('shocking_fact');
  const [cta, setCta] = useState('follow');
  const { credits, hasCredits, isLoading: creditsLoading } = useCredits();
  const [activeVideoId, setActiveVideoId] = useState<string | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const prevCompletedRef = useRef(false);

  const [settings, setSettings] = useState<MediaSettings>({
    visualStyleId: 'cinematic',
    aspectRatio: '9:16',
    voiceId: 'aMSt68OGf4xUZAnLpTU8', // Grounded And Professional (English)
    voiceLabel: 'Grounded And Professional',
    language: 'English (US)',
    duration: 'Short',
    imageProvider: 'gemini',
    advancedOptions: {
      styleStrength: 'medium',
      lighting: 'none',
      colorTone: 'none',
      cameraFraming: 'none',
    },
    captions: {
      enabled: true,
      preset: 'bold-stroke',
      position: 'bottom',
      timing: 'word',
    },
    music: {
      volume: 0.5,
    },
  });

  const { data: retryVideoData } = useQuery({
    queryKey: ['video', retryVideoId],
    queryFn: () => videosApi.getVideo(retryVideoId!),
    enabled: !!retryVideoId,
  });

  useEffect(() => {
    if (retryVideoData) {
      if (retryVideoData.topic) setTopic(retryVideoData.topic);

      const meta = retryVideoData.metadata;
      if (meta) {
        setSettings((prev) => ({
          ...prev,
          aspectRatio: (meta.imageAspectRatio as any) || prev.aspectRatio,
          language: meta.language || prev.language,
          duration:
            (Object.keys(DURATION_MAPPING).find(
              (key) => (DURATION_MAPPING as any)[key] === meta.duration,
            ) as any) || prev.duration,
        }));
      }

      // If the retry video is already processing, track it
      if (retryVideoData.status !== 'failed' && retryVideoData.status !== 'completed') {
        setActiveVideoId(retryVideoData.id);
      }
    }
  }, [retryVideoData]);

  const handleUpdate = useCallback((updates: Partial<MediaSettings>) => {
    setSettings((prev) => ({ ...prev, ...updates }));
  }, []);

  const createMutation = useMutation({
    mutationFn: videosApi.createVideo,
    onSuccess: (data) => {
      setActiveVideoId(data.video_id);
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error));
    },
  });

  const retryMutation = useMutation({
    mutationFn: async (payload: CreateVideoDto) => {
      if (!retryVideoId) return;
      // Update first, then retry
      await videosApi.updateVideo(retryVideoId, payload);
      return videosApi.retryVideo(retryVideoId);
    },
    onSuccess: (data) => {
      if (data) setActiveVideoId(data.video_id);
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error));
    },
  });

  const { data: videoStatus } = useQuery({
    queryKey: ['video-status', activeVideoId],
    queryFn: () => videosApi.getVideo(activeVideoId!),
    enabled: !!activeVideoId && activeVideoId !== '',
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      return status === 'completed' || status === 'failed' ? false : 2000;
    },
  });

  const wordCount = topic
    .trim()
    .split(/\s+/)
    .filter((word) => word.length > 0).length;
  const charCount = topic.length;
  const isValidTopic = wordCount >= 8 && charCount >= 45;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidTopic) return;
    if (!hasCredits) return;

    setActiveVideoId(null);
    setShowCelebration(false);
    prevCompletedRef.current = false;

    const payload: CreateVideoDto = {
      topic: topic.trim(),
      language: settings.language,
      duration: DURATION_MAPPING[settings.duration],
      imageStyle: getFullPrompt(settings.visualStyleId, settings.advancedOptions),
      imageAspectRatio: settings.aspectRatio,
      voiceId: settings.voiceId,
      voiceLabel: settings.voiceLabel,
      imageProvider: 'gemini',
      captions: settings.captions,
      music: settings.music,
      tone,
      hookType,
      cta,
    };

    if (retryVideoId) {
      retryMutation.mutate(payload);
    } else {
      createMutation.mutate(payload);
    }
  };

  const currentStatus = (videoStatus?.status ||
    (createMutation.isPending || retryMutation.isPending ? 'pending' : 'pending')) as VideoStatus;
  const isCompleted = currentStatus === 'completed';
  const isFailed = currentStatus === 'failed';
  const errorMessage = videoStatus?.error_message;

  // Show celebration overlay the first time a video transitions to completed
  useEffect(() => {
    if (isCompleted && !prevCompletedRef.current) {
      setShowCelebration(true);
    }
    prevCompletedRef.current = isCompleted;
  }, [isCompleted]);

  return (
    <div className="flex flex-col lg:h-full bg-background lg:rounded-xl lg:border lg:border-border lg:overflow-hidden lg:shadow-sm">
      {showCelebration && activeVideoId && (
        <CelebrationOverlay
          videoId={activeVideoId}
          topic={topic}
          onDismiss={() => setShowCelebration(false)}
        />
      )}
      <div className="flex flex-col lg:flex-row lg:flex-1 lg:h-full lg:overflow-hidden">
        {/* LEFT: Composition Studio */}
        <div className="w-full lg:flex-1 min-w-0 h-auto lg:h-full lg:overflow-y-auto scrollbar-saas bg-zinc-50/20 dark:bg-zinc-950/20">
          <div className="flex flex-col pt-6 pb-12 lg:py-12 px-4 lg:px-8 space-y-8 lg:space-y-16 w-full max-w-4xl mx-auto">
            <div className="w-full space-y-6 lg:space-y-8 text-center pb-8 lg:pb-12 border-b border-border/40">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full border border-primary/20 scale-90">
                <Sparkles className="w-3 h-3 text-primary" />
                <span className="text-[10px] font-bold text-primary uppercase tracking-tighter">
                  AI Synthesis Engine
                </span>
              </div>
              <h2 className="text-2xl lg:text-5xl font-black text-foreground tracking-tight max-w-[600px] mx-auto leading-tight italic px-2">
                Transform your <span className="text-primary italic">vision</span> into cinematic
                reality.
              </h2>
              <TopicIdeas onSelect={(t) => setTopic(t)} />

              <div className="group relative bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl lg:rounded-[32px] p-6 lg:p-8 transition-all duration-500 hover:border-primary/40 hover:shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] focus-within:ring-2 focus-within:ring-primary/10 focus-within:border-primary h-auto min-h-[180px] lg:min-h-[220px] flex flex-col">
                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60 mb-4 px-1 text-left">
                  Creative Intent
                </label>
                <Textarea
                  id="topic"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="Tell the AI what story you want to narrate..."
                  rows={3}
                  maxLength={500}
                  className="w-full resize-none text-base lg:text-xl font-medium leading-relaxed bg-transparent border-none p-0 placeholder:text-muted-foreground/40 focus-visible:ring-0 focus-visible:ring-offset-0 min-h-[80px] lg:min-h-[100px] text-foreground"
                  required
                  disabled={
                    createMutation.isPending || (!!activeVideoId && !isCompleted) || !hasCredits
                  }
                />
                <div className="flex items-center justify-between mt-auto pt-4 border-t border-border/50">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-bold uppercase tracking-wider group-focus-within:text-primary transition-colors">
                      <Sparkles className="w-3 h-3" />
                      <span>AI SCRIPT GENERATION ACTIVE</span>
                    </div>
                    {!isValidTopic && topic.length > 0 && (
                      <div className="flex items-center gap-1.5 text-[9px] font-bold text-amber-600 dark:text-amber-500 animate-in fade-in slide-in-from-left-1">
                        <AlertCircle className="w-2.5 h-2.5" />
                        <span>MIN 8 WORDS & 45 CHARS REQUIRED</span>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span
                      className={cn(
                        'text-[10px] font-mono transition-colors font-medium',
                        topic.length > 450
                          ? 'text-destructive'
                          : 'text-muted-foreground group-hover:text-foreground text-left',
                      )}
                    >
                      {topic.length}/500 chars
                    </span>
                    <span
                      className={cn(
                        'text-[10px] font-mono transition-colors font-medium',
                        wordCount < 8
                          ? 'text-amber-600'
                          : 'text-muted-foreground group-hover:text-foreground text-left',
                      )}
                    >
                      {wordCount} words
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Visual Style (Dominant) */}
            <div className="w-full space-y-8">
              <div className="flex items-center gap-3 px-1 border-b border-border/40 pb-3">
                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60">
                  Cinematic Universe
                </h3>
              </div>
              <VisualStyleSelector settings={settings} onUpdate={handleUpdate} />
            </div>

            {/* 3. Caption Style (New Dedicated Section) */}
            <div className="w-full pt-4">
              <CaptionSettings settings={settings} onUpdate={handleUpdate} />
            </div>

            {/* 3.1 Background Atmosphere */}
            <div className="w-full pt-4">
              <MusicSelector settings={settings} onUpdate={handleUpdate} />
            </div>

            {/* 4. Configuration Grid (Remaining) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12 pt-8 pb-12 lg:pb-12">
              <div className="space-y-6">
                <div className="flex items-center gap-3 pb-3 border-b border-border/40 px-1">
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60">
                    Format
                  </span>
                  <Info className="w-3 h-3 text-muted-foreground/30" />
                </div>
                <FormatSelector settings={settings} onUpdate={handleUpdate} />
              </div>

              <div className="space-y-6">
                <div className="flex items-center gap-3 pb-3 border-b border-border/40 px-1">
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60">
                    Voice Narration
                  </span>
                </div>
                <NarrationSettings settings={settings} onUpdate={handleUpdate} />
              </div>

              <div className="space-y-6">
                <div className="flex items-center gap-3 pb-3 border-b border-border/40 px-1">
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60">
                    Video Length
                  </span>
                </div>
                <DurationSelector settings={settings} onUpdate={handleUpdate} />
              </div>
            </div>

            {/* 5. Script Style */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12 pb-12 lg:pb-12">
              <div className="space-y-4">
                <div className="flex items-center gap-3 pb-3 border-b border-border/40 px-1">
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60">
                    Tone
                  </span>
                </div>
                <Select value={tone} onValueChange={setTone}>
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="motivational">Motivational</SelectItem>
                    <SelectItem value="educational">Educational</SelectItem>
                    <SelectItem value="storytelling">Storytelling</SelectItem>
                    <SelectItem value="humorous">Humorous</SelectItem>
                    <SelectItem value="controversial">Controversial</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3 pb-3 border-b border-border/40 px-1">
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60">
                    Hook Style
                  </span>
                </div>
                <Select value={hookType} onValueChange={setHookType}>
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="shocking_fact">Shocking Fact</SelectItem>
                    <SelectItem value="bold_question">Bold Question</SelectItem>
                    <SelectItem value="bold_claim">Bold Claim</SelectItem>
                    <SelectItem value="story">Personal Story</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3 pb-3 border-b border-border/40 px-1">
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60">
                    CTA
                  </span>
                </div>
                <Select value={cta} onValueChange={setCta}>
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="follow">Follow for more</SelectItem>
                    <SelectItem value="comment">Comment below</SelectItem>
                    <SelectItem value="link_in_bio">Link in bio</SelectItem>
                    <SelectItem value="none">None</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT: Live Preview / Status Panel */}
        <div className="w-full lg:w-[480px] shrink-0 border-t lg:border-t-0 lg:border-l border-border bg-secondary relative h-auto lg:h-full lg:overflow-hidden">
          <div className="relative h-auto lg:absolute lg:inset-0 lg:overflow-y-auto scrollbar-saas pb-40 lg:pb-48">
            <div className="p-4 lg:p-8">
              <GenerationProgress
                status={
                  activeVideoId
                    ? isFailed
                      ? 'error'
                      : isCompleted
                        ? 'completed'
                        : 'generating'
                    : 'idle'
                }
                progress={activeVideoId ? getProgressFromStatus(currentStatus) : 0}
                currentStep={activeVideoId ? getStepFromStatus(currentStatus) : 'start'}
                settings={settings}
              />

              {isFailed && errorMessage && (
                <div className="mt-4 p-4 rounded-lg bg-destructive/10 border border-destructive/20">
                  <p className="text-sm text-destructive font-medium">Generation Failed</p>
                  <p className="text-xs text-destructive/70 mt-1">{errorMessage}</p>
                </div>
              )}
            </div>
          </div>

          {/* Action Bar */}
          <div className="fixed lg:absolute bottom-0 left-0 right-0 p-6 lg:p-8 border-t border-border bg-card z-[60] lg:z-10 transition-all duration-300 shadow-[0_-5px_20px_rgba(0,0,0,0.05)]">
            <div className="space-y-5">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-muted-foreground font-medium">
                  <CreditCard className="w-3.5 h-3.5 text-primary" />
                  <span>
                    Available: <strong className="text-foreground">{credits ?? 0}</strong>
                  </span>
                </div>
                <div className="flex items-center gap-1.5 font-bold text-amber-600 dark:text-amber-500">
                  <Zap className="w-3 h-3 fill-current" />
                  <span>
                    {settings.duration === 'Long' ? 3 : settings.duration === 'Medium' ? 2 : 1}{' '}
                    Credit Cost
                  </span>
                </div>
              </div>

              <div className="flex gap-3">
                {isCompleted && (
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => router.push(`/videos/${activeVideoId}`)}
                    className="flex-1 h-14 text-base font-semibold shadow-sm border border-border"
                  >
                    <Eye className="mr-2 h-5 w-5" />
                    View Reel
                  </Button>
                )}

                <Button
                  onClick={handleSubmit}
                  className={cn(
                    'flex-1 h-14 text-base font-semibold shadow-md hover:shadow-lg transition-all',
                    isCompleted || isFailed ? 'flex-1' : 'w-full',
                  )}
                  size="lg"
                  isLoading={
                    createMutation.isPending ||
                    retryMutation.isPending ||
                    (!!activeVideoId && !isCompleted && !isFailed)
                  }
                  disabled={
                    !isValidTopic ||
                    createMutation.isPending ||
                    retryMutation.isPending ||
                    (!!activeVideoId && !isCompleted && !isFailed) ||
                    !hasCredits ||
                    creditsLoading
                  }
                >
                  {!(createMutation.isPending || retryMutation.isPending) &&
                    (!activeVideoId || isCompleted || isFailed) && (
                      <Sparkles className="mr-2 h-5 w-5" />
                    )}
                  {createMutation.isPending ||
                  retryMutation.isPending ||
                  (!!activeVideoId && !isCompleted && !isFailed)
                    ? 'Generating...'
                    : isFailed
                      ? 'Try Again'
                      : retryVideoId
                        ? 'Retry Generate Reel'
                        : 'Generate Reel'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
