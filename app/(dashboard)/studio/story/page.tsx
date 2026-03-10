'use client';

import { useState, useRef, useCallback } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { useUserSettings } from '@/lib/hooks/useUserSettings';
import { useVideoProgress } from '@/lib/hooks/useVideoProgress';
import { storyApi, STORY_GENRES, STORY_IMAGE_STYLES, type StoryGenre, type StoryImageStyle } from '@/lib/api/story';
import { NarrationSettings } from '@/components/media-settings/NarrationSettings';
import { MusicSelector } from '@/components/media-settings/MusicSelector';
import { CelebrationOverlay } from '@/components/video/CelebrationOverlay';
import { cn } from '@/lib/utils/format';
import { Lock, ChevronLeft, ChevronRight, Download, RotateCcw, Loader2, CheckCircle2, XCircle, BookOpen } from 'lucide-react';
import type { MediaSettings } from '@/components/media-settings/types';
import { toast } from 'sonner';

// ─── Types ────────────────────────────────────────────────────────────────────

type WizardStep = 1 | 2 | 3;

interface StoryFormState {
  prompt: string;
  genre: StoryGenre;
  sceneCount: 3 | 5 | 7 | 10;
  imageStyle: StoryImageStyle;
  voiceId: string;
  voiceLabel: string;
  language: string;
  musicId: string;
  musicUrl: string;
  musicName: string;
}

// ─── Progress step config ──────────────────────────────────────────────────────

const PROGRESS_STEPS = [
  { label: 'Writing Script', statuses: ['pending'] },
  { label: 'Generating Scene Images', statuses: ['processing'] },
  { label: 'Composing Video', statuses: ['rendering'] },
  { label: 'Done', statuses: ['completed'] },
] as const;

type ProgressStatus = 'pending' | 'processing' | 'rendering' | 'completed' | 'failed';

function getActiveStep(status: ProgressStatus): number {
  if (status === 'completed') return 3;
  if (status === 'rendering') return 2;
  if (status === 'processing') return 1;
  return 0;
}

// ─── Locked state ────────────────────────────────────────────────────────────

function LockedState() {
  return (
    <DashboardLayout>
      <div className="h-full flex items-center justify-center p-8">
        <div className="flex flex-col items-center gap-4 text-center max-w-sm">
          <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center">
            <Lock className="h-8 w-8 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-bold">Story Reel is not enabled</h2>
          <p className="text-sm text-muted-foreground">
            Contact support to enable Story Reel for your account.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}

// ─── Main page ─────────────────────────────────────────────────────────────────

export default function StoryStudioPage() {
  const { storyReelEnabled, isLoading: settingsLoading } = useUserSettings();

  if (settingsLoading) {
    return (
      <DashboardLayout>
        <div className="h-full flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  if (!storyReelEnabled) return <LockedState />;

  return <StoryWizard />;
}

// ─── Wizard ───────────────────────────────────────────────────────────────────

function StoryWizard() {
  const [step, setStep] = useState<WizardStep>(1);
  const [mediaId, setMediaId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const prevCompletedRef = useRef(false);

  const [form, setForm] = useState<StoryFormState>({
    prompt: '',
    genre: 'horror',
    sceneCount: 5,
    imageStyle: 'cinematic',
    voiceId: '',
    voiceLabel: '',
    language: 'English (US)',
    musicId: '',
    musicUrl: '',
    musicName: '',
  });

  // Build a MediaSettings-compatible object for NarrationSettings + MusicSelector
  const mediaSettings: MediaSettings = {
    visualStyleId: '',
    aspectRatio: '9:16',
    voiceId: form.voiceId,
    voiceLabel: form.voiceLabel,
    language: form.language,
    duration: 'Medium',
    imageProvider: 'gemini',
    captions: { enabled: false, preset: 'bold-stroke', position: 'bottom', timing: 'word' },
    music: form.musicId ? { id: form.musicId, url: form.musicUrl, name: form.musicName } : undefined,
    advancedOptions: { styleStrength: 'medium', lighting: 'none', colorTone: 'none', cameraFraming: 'none' },
  };

  const handleMediaSettingsUpdate = useCallback((updates: Partial<MediaSettings>) => {
    setForm((prev) => ({
      ...prev,
      ...(updates.voiceId !== undefined ? { voiceId: updates.voiceId } : {}),
      ...(updates.voiceLabel !== undefined ? { voiceLabel: updates.voiceLabel } : {}),
      ...(updates.language !== undefined ? { language: updates.language } : {}),
      ...(updates.music !== undefined
        ? {
            musicId: updates.music?.id ?? '',
            musicUrl: updates.music?.url ?? '',
            musicName: updates.music?.name ?? '',
          }
        : {}),
    }));
  }, []);

  const { video } = useVideoProgress(step === 3 ? mediaId : null);

  const videoStatus = (video?.status ?? 'pending') as ProgressStatus;
  const isCompleted = videoStatus === 'completed';
  const isFailed = videoStatus === 'failed';

  // Trigger celebration once on first completion
  if (isCompleted && !prevCompletedRef.current) {
    prevCompletedRef.current = true;
    setShowCelebration(true);
  }

  const handleSubmit = async () => {
    if (form.prompt.trim().length < 10) {
      toast.error('Prompt must be at least 10 characters');
      return;
    }
    setIsSubmitting(true);
    try {
      const result = await storyApi.createStory({
        prompt: form.prompt,
        genre: form.genre,
        sceneCount: form.sceneCount,
        imageStyle: form.imageStyle,
        voiceId: form.voiceId || undefined,
        voiceLabel: form.voiceLabel || undefined,
        musicId: form.musicId || undefined,
      });
      setMediaId(result.media_id);
      setStep(3);
    } catch {
      toast.error('Failed to start story generation. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    prevCompletedRef.current = false;
    setMediaId(null);
    setShowCelebration(false);
    setStep(1);
  };

  return (
    <DashboardLayout>
      <div className="h-full overflow-y-auto bg-background">
        <div className="max-w-4xl mx-auto px-4 py-6 lg:py-8">
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
              <BookOpen className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground">Story Reel</h1>
              <p className="text-xs text-muted-foreground">AI-generated cinematic short-form story with narration</p>
            </div>
          </div>

          {/* Step indicator */}
          {step < 3 && (
            <div className="flex items-center gap-2 mb-6">
              {([1, 2] as const).map((s) => (
                <div key={s} className="flex items-center gap-2">
                  <div
                    className={cn(
                      'w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border transition-colors',
                      step === s
                        ? 'bg-primary text-primary-foreground border-primary'
                        : step > s
                        ? 'bg-primary/20 text-primary border-primary/30'
                        : 'bg-muted text-muted-foreground border-border',
                    )}
                  >
                    {s}
                  </div>
                  <span className={cn('text-xs font-medium', step === s ? 'text-foreground' : 'text-muted-foreground')}>
                    {s === 1 ? 'Story Concept' : 'Voice & Music'}
                  </span>
                  {s < 2 && <div className="w-6 h-px bg-border mx-1" />}
                </div>
              ))}
            </div>
          )}

          <div className="lg:grid lg:grid-cols-[1fr_340px] lg:gap-6">
            {/* Left: form / status */}
            <div>
              {step === 1 && (
                <Step1
                  form={form}
                  onChange={(updates) => setForm((prev) => ({ ...prev, ...updates }))}
                  onNext={() => setStep(2)}
                />
              )}

              {step === 2 && (
                <Step2
                  mediaSettings={mediaSettings}
                  onUpdate={handleMediaSettingsUpdate}
                  onBack={() => setStep(1)}
                  onSubmit={handleSubmit}
                  isSubmitting={isSubmitting}
                  form={form}
                />
              )}

              {step === 3 && (
                <Step3
                  videoStatus={videoStatus}
                  video={video}
                  onReset={handleReset}
                />
              )}
            </div>

            {/* Right: summary / result */}
            <div className="mt-6 lg:mt-0">
              {step < 3 ? (
                <StorySummaryCard form={form} />
              ) : isCompleted && video?.final_video_url ? (
                <VideoResultCard
                  url={video.final_video_url}
                  onReset={handleReset}
                />
              ) : null}
            </div>
          </div>
        </div>
      </div>

      {showCelebration && (
        <CelebrationOverlay
          videoId={mediaId ?? ''}
          topic={form.prompt}
          onDismiss={() => setShowCelebration(false)}
        />
      )}
    </DashboardLayout>
  );
}

// ─── Step 1: Story Concept ────────────────────────────────────────────────────

function Step1({
  form,
  onChange,
  onNext,
}: {
  form: StoryFormState;
  onChange: (updates: Partial<StoryFormState>) => void;
  onNext: () => void;
}) {
  const canProceed = form.prompt.trim().length >= 10;

  return (
    <div className="space-y-6">
      {/* Prompt */}
      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-wider text-foreground">
          Story Prompt
        </label>
        <textarea
          value={form.prompt}
          onChange={(e) => onChange({ prompt: e.target.value })}
          placeholder="e.g. A lone astronaut discovers a mysterious signal from a dying star..."
          rows={4}
          className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
        />
        <p className={cn('text-[10px]', form.prompt.trim().length < 10 ? 'text-muted-foreground' : 'text-primary')}>
          {form.prompt.trim().length} / 10 min characters
        </p>
      </div>

      {/* Genre */}
      <div className="space-y-3">
        <label className="text-xs font-bold uppercase tracking-wider text-foreground">Genre</label>
        <div className="flex flex-wrap gap-2">
          {STORY_GENRES.map((g) => (
            <button
              key={g.value}
              type="button"
              onClick={() => onChange({ genre: g.value })}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors',
                form.genre === g.value
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-card text-muted-foreground border-border hover:border-primary/40 hover:text-foreground',
              )}
            >
              <span>{g.emoji}</span>
              <span>{g.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Scene count */}
      <div className="space-y-3">
        <label className="text-xs font-bold uppercase tracking-wider text-foreground">Scene Count</label>
        <div className="flex gap-2">
          {([3, 5, 7, 10] as const).map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => onChange({ sceneCount: n })}
              className={cn(
                'flex-1 flex flex-col items-center py-2.5 rounded-xl border text-xs font-medium transition-colors',
                form.sceneCount === n
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-card text-muted-foreground border-border hover:border-primary/40 hover:text-foreground',
              )}
            >
              <span className="font-bold text-sm">{n}</span>
              <span className="text-[9px] opacity-70">~{n * 8}s</span>
            </button>
          ))}
        </div>
      </div>

      {/* Image style */}
      <div className="space-y-3">
        <label className="text-xs font-bold uppercase tracking-wider text-foreground">Image Style</label>
        <div className="grid grid-cols-2 gap-2">
          {STORY_IMAGE_STYLES.map((s) => (
            <button
              key={s.value}
              type="button"
              onClick={() => onChange({ imageStyle: s.value })}
              className={cn(
                'flex items-center gap-2.5 px-3 py-2.5 rounded-xl border text-left transition-colors',
                form.imageStyle === s.value
                  ? 'bg-primary/10 text-primary border-primary'
                  : 'bg-card text-muted-foreground border-border hover:border-primary/40 hover:text-foreground',
              )}
            >
              <span className="text-lg">{s.emoji}</span>
              <span className="text-xs font-medium">{s.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Next */}
      <Button
        className="w-full h-11 font-semibold"
        onClick={onNext}
        disabled={!canProceed}
      >
        Continue to Voice & Music
        <ChevronRight className="ml-1.5 h-4 w-4" />
      </Button>
    </div>
  );
}

// ─── Step 2: Voice + Music ────────────────────────────────────────────────────

function Step2({
  mediaSettings,
  onUpdate,
  onBack,
  onSubmit,
  isSubmitting,
  form,
}: {
  mediaSettings: MediaSettings;
  onUpdate: (updates: Partial<MediaSettings>) => void;
  onBack: () => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  form: StoryFormState;
}) {
  return (
    <div className="space-y-6">
      <NarrationSettings settings={mediaSettings} onUpdate={onUpdate} />
      <MusicSelector settings={mediaSettings} onUpdate={onUpdate} />

      {/* Summary */}
      <div className="p-4 rounded-xl border border-border bg-card/50 space-y-2">
        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Summary</p>
        <div className="flex flex-wrap gap-2">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-[11px] font-medium">
            {STORY_GENRES.find((g) => g.value === form.genre)?.emoji}{' '}
            {STORY_GENRES.find((g) => g.value === form.genre)?.label}
          </span>
          <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-muted text-muted-foreground text-[11px] font-medium">
            {form.sceneCount} scenes · ~{form.sceneCount * 8}s
          </span>
          <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-muted text-muted-foreground text-[11px] font-medium">
            {STORY_IMAGE_STYLES.find((s) => s.value === form.imageStyle)?.emoji}{' '}
            {STORY_IMAGE_STYLES.find((s) => s.value === form.imageStyle)?.label}
          </span>
          <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-600 text-[11px] font-medium">
            2 credits
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <Button variant="outline" onClick={onBack} className="flex-shrink-0">
          <ChevronLeft className="mr-1 h-4 w-4" />
          Back
        </Button>
        <Button
          className="flex-1 h-11 font-semibold"
          onClick={onSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Starting...
            </>
          ) : (
            'Generate Story'
          )}
        </Button>
      </div>
    </div>
  );
}

// ─── Step 3: Generating ───────────────────────────────────────────────────────

function Step3({
  videoStatus,
  video,
  onReset,
}: {
  videoStatus: ProgressStatus;
  video: { final_video_url?: string; error_message?: string } | null;
  onReset: () => void;
}) {
  const isFailed = videoStatus === 'failed';
  const isCompleted = videoStatus === 'completed';
  const activeStep = getActiveStep(videoStatus);

  return (
    <div className="space-y-6">
      <div className="p-6 rounded-2xl border border-border bg-card">
        {isFailed ? (
          <div className="flex flex-col items-center gap-4 text-center py-4">
            <XCircle className="h-12 w-12 text-destructive" />
            <div>
              <p className="font-semibold text-foreground">Generation Failed</p>
              {video?.error_message && (
                <p className="text-xs text-muted-foreground mt-1 max-w-xs">{video.error_message}</p>
              )}
            </div>
            <Button variant="outline" onClick={onReset}>
              <RotateCcw className="mr-1.5 h-4 w-4" />
              Try Again
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4">
              {isCompleted ? 'Your story is ready!' : 'Generating your story...'}
            </p>
            {PROGRESS_STEPS.map((ps, idx) => {
              const isDone = idx < activeStep || (isCompleted && idx === activeStep);
              const isActive = !isCompleted && idx === activeStep;
              return (
                <div key={ps.label} className="flex items-center gap-3">
                  <div
                    className={cn(
                      'w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-colors',
                      isDone
                        ? 'bg-primary text-primary-foreground'
                        : isActive
                        ? 'bg-primary/20 border-2 border-primary'
                        : 'bg-muted border border-border',
                    )}
                  >
                    {isDone ? (
                      <CheckCircle2 className="h-4 w-4" />
                    ) : isActive ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
                    ) : (
                      <span className="text-[10px] font-bold text-muted-foreground">{idx + 1}</span>
                    )}
                  </div>
                  <span
                    className={cn(
                      'text-sm font-medium',
                      isDone || isActive ? 'text-foreground' : 'text-muted-foreground',
                    )}
                  >
                    {ps.label}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {isCompleted && (
        <Button variant="outline" onClick={onReset} className="w-full">
          <RotateCcw className="mr-1.5 h-4 w-4" />
          Create Another Story
        </Button>
      )}
    </div>
  );
}

// ─── Story summary card (step 1 & 2 right panel) ────────────────────────────

function StorySummaryCard({ form }: { form: StoryFormState }) {
  const genre = STORY_GENRES.find((g) => g.value === form.genre);
  const style = STORY_IMAGE_STYLES.find((s) => s.value === form.imageStyle);
  return (
    <div className="rounded-2xl border border-border bg-card p-4 space-y-4">
      <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Preview</p>

      <div className="aspect-[9/16] rounded-xl bg-muted/60 border border-border flex items-center justify-center overflow-hidden">
        <div className="flex flex-col items-center gap-2 text-center p-4">
          <span className="text-4xl">{genre?.emoji ?? '📖'}</span>
          <p className="text-xs font-bold text-foreground">{genre?.label} Story</p>
          <p className="text-[10px] text-muted-foreground">{form.sceneCount} scenes · {style?.label}</p>
          {form.prompt.trim() && (
            <p className="text-[11px] text-muted-foreground/70 mt-2 line-clamp-3">
              {form.prompt.slice(0, 100)}{form.prompt.length > 100 ? '...' : ''}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-1.5 text-xs">
        <div className="flex justify-between text-muted-foreground">
          <span>Duration</span>
          <span className="font-medium text-foreground">~{form.sceneCount * 8}s</span>
        </div>
        <div className="flex justify-between text-muted-foreground">
          <span>Format</span>
          <span className="font-medium text-foreground">9:16 Vertical</span>
        </div>
        <div className="flex justify-between text-muted-foreground">
          <span>Cost</span>
          <span className="font-medium text-amber-500">2 credits</span>
        </div>
      </div>
    </div>
  );
}

// ─── Video result card (step 3 right panel) ───────────────────────────────────

function VideoResultCard({ url, onReset }: { url: string; onReset: () => void }) {
  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden">
      <video
        src={url}
        controls
        playsInline
        className="w-full aspect-[9/16] object-cover bg-black"
      />
      <div className="p-3 flex gap-2">
        <a
          href={url}
          download
          className="flex-1"
        >
          <Button variant="outline" size="sm" className="w-full">
            <Download className="mr-1.5 h-3.5 w-3.5" />
            Download
          </Button>
        </a>
        <Button variant="outline" size="sm" onClick={onReset}>
          <RotateCcw className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}
