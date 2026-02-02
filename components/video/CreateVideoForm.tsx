'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { videosApi } from '@/lib/api/videos';
import { useCredits } from '@/lib/hooks/useCredits';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { SelectEnhanced } from '@/components/ui/select-enhanced';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { AlertCircle, Sparkles, Zap, Loader2, Globe, Film, CreditCard, Info } from 'lucide-react';
import { cn } from '@/lib/utils/format';

const LANGUAGE_OPTIONS = [
  { value: 'english', label: 'English' },
  { value: 'spanish', label: 'Spanish' },
  { value: 'french', label: 'French' },
  { value: 'german', label: 'German' },
  { value: 'italian', label: 'Italian' },
  { value: 'portuguese', label: 'Portuguese' },
  { value: 'hindi', label: 'Hindi' },
  { value: 'japanese', label: 'Japanese' },
];

const STYLE_OPTIONS = [
  { value: 'modern', label: 'Modern' },
  { value: 'minimalist', label: 'Minimalist' },
  { value: 'energetic', label: 'Energetic' },
  { value: 'professional', label: 'Professional' },
  { value: 'cinematic', label: 'Cinematic' },
  { value: 'playful', label: 'Playful' },
];

export function CreateVideoForm() {
  const router = useRouter();
  const [topic, setTopic] = useState('');
  const [language, setLanguage] = useState('english');
  const [style, setStyle] = useState('modern');
  const { credits, hasCredits, isLoading: creditsLoading } = useCredits();

  const createMutation = useMutation({
    mutationFn: videosApi.createVideo,
    onSuccess: (data) => {
      router.push(`/videos/${data.video_id}`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;
    if (!hasCredits) {
      return;
    }
    createMutation.mutate({ topic: topic.trim() });
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Header Section */}
      <div className="space-y-2">
        <h1 className="text-4xl font-bold tracking-tight leading-tight">Create New Reel</h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          Generate viral faceless reels in 60 seconds with AI
        </p>
      </div>

      {/* Credits Card */}
      {!creditsLoading && (
        <div className="relative overflow-hidden rounded-lg border border-border/50 bg-gradient-to-br from-card/50 to-card/30 backdrop-blur-sm">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-50" />
          <div className="relative flex items-center justify-between p-6">
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br from-primary/20 via-primary/15 to-primary/10 border border-primary/30 shadow-lg shrink-0">
                <CreditCard className="h-7 w-7 text-primary" />
              </div>
              <div className="flex flex-col justify-center gap-1">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Available Credits
                </p>
                <div className="flex items-baseline gap-2.5">
                  <span className="text-3xl font-bold text-foreground leading-none tracking-tight">
                    {credits ?? 0}
                  </span>
                  <span className="text-sm font-medium text-muted-foreground leading-tight">
                    {hasCredits ? 'credits remaining' : 'insufficient credits'}
                  </span>
                </div>
              </div>
            </div>
            {!hasCredits && (
              <Link href="/dashboard?purchase=credits">
                <Button variant="outline" size="sm" className="shrink-0">
                  <CreditCard className="mr-2 h-4 w-4" />
                  Purchase Credits
                </Button>
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Main Form Card */}
      <Card className="glass-strong border-border/50 shadow-xl">
        <CardContent className="p-8">
          {!creditsLoading && !hasCredits && (
            <div className="mb-6 rounded-lg border border-destructive/50 bg-destructive/10 p-4 flex items-start gap-3 animate-fade-in">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-destructive/20 border border-destructive/30 shrink-0">
                <AlertCircle className="h-4 w-4 text-destructive" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-destructive mb-1">Insufficient Credits</p>
                <p className="text-sm text-destructive/80 leading-relaxed">
                  You need at least 1 credit to create a video. Purchase credits to continue.
                </p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8 pt-6">
            {/* Topic Input Section */}
            <div className="space-y-3">
              <label
                htmlFor="topic"
                className="flex items-baseline gap-2.5 text-base font-semibold text-foreground mb-1.5"
              >
                <Zap className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <span className="leading-tight">Video Topic</span>
                <span className="text-destructive text-base font-bold leading-none ml-0.5">*</span>
              </label>
              <Textarea
                id="topic"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Describe what your reel should be about...

Examples:
  • How to start a successful startup
  • Top 5 productivity tips for remote workers
  • Why meditation changes your life
  • The future of artificial intelligence"
                rows={6}
                maxLength={500}
                className="resize-none text-base leading-relaxed placeholder:leading-relaxed placeholder:tracking-normal"
                required
                disabled={createMutation.isPending || !hasCredits}
              />
              <div className="flex justify-between items-center pt-1">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Info className="h-3.5 w-3.5 shrink-0" />
                  <span className="leading-tight">Be specific and detailed for better results</span>
                </div>
                <p
                  className={cn(
                    'text-xs font-medium leading-tight',
                    topic.length > 450 ? 'text-destructive' : 'text-muted-foreground',
                  )}
                >
                  {topic.length}/500
                </p>
              </div>
            </div>

            {/* Settings Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2.5 border-b border-border/50">
                <Film className="h-4 w-4 text-muted-foreground shrink-0" />
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide leading-tight">
                  Video Settings
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Language Select */}
                <div className="space-y-3">
                  <label
                    htmlFor="language"
                    className="flex items-center gap-2 text-sm font-semibold text-foreground mb-1"
                  >
                    <Globe className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span className="leading-tight">Language</span>
                  </label>
                  <SelectEnhanced
                    id="language"
                    value={language}
                    onChange={setLanguage}
                    options={LANGUAGE_OPTIONS}
                    placeholder="Select language"
                    disabled={createMutation.isPending || !hasCredits}
                  />
                </div>

                {/* Style Select */}
                <div className="space-y-3">
                  <label
                    htmlFor="style"
                    className="flex items-center gap-2 text-sm font-semibold text-foreground mb-1"
                  >
                    <Film className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span className="leading-tight">Video Style</span>
                  </label>
                  <SelectEnhanced
                    id="style"
                    value={style}
                    onChange={setStyle}
                    options={STYLE_OPTIONS}
                    placeholder="Select style"
                    disabled={createMutation.isPending || !hasCredits}
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="space-y-4 pt-4">
              <Button
                type="submit"
                className="w-full h-12 text-base font-semibold"
                size="lg"
                isLoading={createMutation.isPending}
                disabled={
                  !topic.trim() || createMutation.isPending || !hasCredits || creditsLoading
                }
              >
                {!createMutation.isPending && <Sparkles className="mr-2 h-5 w-5" />}
                {createMutation.isPending ? 'Generating your reel...' : 'Generate Reel'}
              </Button>

              <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                <Info className="h-3.5 w-3.5 shrink-0" />
                <span className="leading-tight text-center">
                  Generation typically takes 30-60 seconds. You'll be redirected to see progress.
                </span>
              </div>
            </div>

            {/* Error Message */}
            {createMutation.isError && (
              <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 flex items-start gap-3 animate-fade-in">
                <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-destructive mb-1">Generation Failed</p>
                  <p className="text-sm text-destructive/80">
                    {createMutation.error instanceof Error
                      ? createMutation.error.message
                      : 'Something went wrong. Please try again.'}
                  </p>
                </div>
              </div>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
