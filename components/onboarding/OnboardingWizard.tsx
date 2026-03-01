'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles } from 'lucide-react';
import { track } from '@/lib/analytics';
import {
  isOnboardingCompleted,
  markOnboardingCompleted,
} from '@/lib/hooks/useOnboardingRedirect';
import { useUserSettings } from '@/lib/hooks/useUserSettings';
import { useAuth } from '@/lib/hooks/useAuth';

type Step = 0 | 1 | 2;

const MAD_SCIENTIST_VOICE_ID = 'yjJ45q8TVCrtMhEKurxY';
const MAD_SCIENTIST_VOICE_LABEL = 'Mad Scientist - Energetic';

const WIZARD_NICHES = [
  {
    id: 'motivation',
    label: 'Motivation',
    emoji: '💪',
    topic:
      'The mindset shift that separates winners from quitters in every area of life',
  },
  {
    id: 'tech',
    label: 'Tech & AI',
    emoji: '⚡',
    topic:
      'The AI breakthrough quietly reshaping every industry in 2026 and beyond',
  },
  {
    id: 'finance',
    label: 'Finance',
    emoji: '💰',
    topic:
      'Five money mistakes people make in their 20s that haunt them for decades',
  },
  {
    id: 'fitness',
    label: 'Fitness',
    emoji: '🏃',
    topic:
      'The one sleep habit silently destroying your metabolism every single night',
  },
  {
    id: 'education',
    label: 'Education',
    emoji: '📚',
    topic:
      'The ancient memory technique that lets you remember absolutely anything forever',
  },
  {
    id: 'business',
    label: 'Business',
    emoji: '📈',
    topic:
      'The pricing trick that makes customers always choose the premium option',
  },
  {
    id: 'travel',
    label: 'Travel',
    emoji: '✈️',
    topic:
      'Five hidden destinations around the world that tourists almost never discover',
  },
  {
    id: 'crypto',
    label: 'Crypto',
    emoji: '🪙',
    topic:
      'What actually caused the biggest crypto crash and what experts predict comes next',
  },
  {
    id: 'lifestyle',
    label: 'Lifestyle',
    emoji: '🌿',
    topic:
      'The minimalist daily routine that the most productive people quietly follow',
  },
] as const;

const WIZARD_STYLES = [
  {
    id: 'cinematic',
    label: 'Cinematic',
    badge: 'Most Popular',
    description: 'Epic film-grade visuals, dramatic lighting',
    gradient: 'from-amber-900/60 to-orange-950/80',
    accent: 'border-amber-500',
  },
  {
    id: 'cyberpunk',
    label: 'Cyberpunk',
    badge: null,
    description: 'Neon-drenched, futuristic cityscapes',
    gradient: 'from-violet-900/60 to-cyan-950/80',
    accent: 'border-cyan-400',
  },
  {
    id: 'minimalist',
    label: 'Minimal',
    badge: null,
    description: 'Clean, distraction-free composition',
    gradient: 'from-slate-800/60 to-zinc-900/80',
    accent: 'border-slate-300',
  },
] as const;

function ProgressDots({ step, total }: { step: number; total: number }) {
  return (
    <div className="flex items-center justify-center gap-2">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={`transition-all duration-300 rounded-full ${
            i === step
              ? 'w-6 h-2 bg-violet-500'
              : i < step
              ? 'w-2 h-2 bg-violet-500/60'
              : 'w-2 h-2 bg-white/20'
          }`}
        />
      ))}
    </div>
  );
}

function SkipLink({ onSkip }: { onSkip: () => void }) {
  return (
    <div className="flex justify-center mt-6">
      <button
        onClick={onSkip}
        className="text-sm text-white/30 hover:text-white/60 transition-colors underline underline-offset-4"
      >
        I&apos;ll explore myself
      </button>
    </div>
  );
}

export function OnboardingWizard() {
  const router = useRouter();
  const { user } = useAuth();
  const { hasCompletedOnboarding, isLoading } = useUserSettings();

  const [step, setStep] = useState<Step>(0);
  const [selectedNicheId, setSelectedNicheId] = useState<string | null>(null);
  const [topic, setTopic] = useState('');
  const [styleId, setStyleId] = useState('cinematic');

  // Session persistence — survives accidental refresh
  useEffect(() => {
    const saved = sessionStorage.getItem('wizard_draft');
    if (saved) {
      try {
        const { step: s, topic: t, styleId: st, nicheId: n } = JSON.parse(saved);
        if (s > 0) {
          setStep(s);
          setTopic(t);
          setStyleId(st);
          setSelectedNicheId(n);
        }
      } catch {
        // ignore parse errors
      }
    }
  }, []);

  useEffect(() => {
    if (step > 0) {
      sessionStorage.setItem(
        'wizard_draft',
        JSON.stringify({ step, topic, styleId, nicheId: selectedNicheId }),
      );
    }
  }, [step, topic, styleId, selectedNicheId]);

  // Guard — DB is source of truth
  useEffect(() => {
    if (isLoading) return;
    if (hasCompletedOnboarding || isOnboardingCompleted()) {
      if (hasCompletedOnboarding) markOnboardingCompleted(); // re-seed localStorage
      router.replace('/dashboard');
    }
  }, [isLoading, hasCompletedOnboarding, router]);

  // Track step views
  useEffect(() => {
    track('onboarding_step_viewed', { step });
  }, [step]);

  const selectedNiche = WIZARD_NICHES.find((n) => n.id === selectedNicheId) ?? null;
  const credits = (user as any)?.credits ?? null;
  const hasCredits = credits === null || credits > 0; // null = unknown, assume ok

  const handleNicheSelect = (nicheId: string) => {
    const niche = WIZARD_NICHES.find((n) => n.id === nicheId)!;
    setSelectedNicheId(nicheId);
    setTopic(niche.topic);
    track('onboarding_niche_selected', { niche: nicheId });
    setStep(2);
  };

  const handleGenerate = () => {
    track('onboarding_generate_clicked', {
      niche: selectedNiche?.id,
      style: styleId,
      topicEdited: topic !== selectedNiche?.topic,
    });
    markOnboardingCompleted();
    sessionStorage.removeItem('wizard_draft');
    const params = new URLSearchParams({
      topic: topic.trim(),
      style: styleId,
      voiceId: MAD_SCIENTIST_VOICE_ID,
      voiceLabel: MAD_SCIENTIST_VOICE_LABEL,
      autoGenerate: 'true',
    });
    router.push(`/studio/reel?${params.toString()}`);
  };

  const handleSkip = () => {
    track('onboarding_skipped', { step });
    markOnboardingCompleted();
    sessionStorage.removeItem('wizard_draft');
    router.push('/dashboard');
  };

  // Don't render while checking auth/onboarding status
  if (isLoading) {
    return (
      <div className="fixed inset-0 z-[300] bg-[#0a0a0f] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-violet-500/40 border-t-violet-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[300] bg-[#0a0a0f] flex items-center justify-center overflow-hidden">
      {/* Background glows */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-violet-600/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-indigo-600/8 blur-[120px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-3xl mx-auto px-4 py-8">
        <ProgressDots step={step} total={3} />

        <div key={step} className="animate-in fade-in slide-in-from-bottom-4 duration-500 mt-8">
          {/* Step 0 — Welcome */}
          {step === 0 && (
            <div className="text-center space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-violet-500/10 border border-violet-500/20 rounded-full">
                <Sparkles className="w-4 h-4 text-violet-400" />
                <span className="text-sm font-semibold text-violet-300">AutoReels AI Studio</span>
              </div>

              <div className="space-y-4">
                <h1 className="text-4xl md:text-5xl font-black text-white leading-tight tracking-tight">
                  You&apos;re 60 seconds from<br />
                  <span className="text-violet-400">your first reel.</span>
                </h1>
                <p className="text-lg text-white/50 max-w-md mx-auto leading-relaxed">
                  Tell us what you create —<br />
                  we&apos;ll handle the script, voice, visuals, and music.
                </p>
              </div>

              <div className="flex items-center justify-center gap-6 text-xs text-white/30 font-medium">
                <span>3 free credits included</span>
                <span>·</span>
                <span>No experience needed</span>
                <span>·</span>
                <span>No camera</span>
              </div>

              <button
                onClick={() => setStep(1)}
                className="inline-flex items-center gap-2 px-8 py-4 bg-violet-600 hover:bg-violet-500 text-white font-bold text-lg rounded-2xl transition-all shadow-lg shadow-violet-900/40 hover:shadow-violet-900/60 hover:scale-[1.02]"
              >
                Let&apos;s build it
                <span className="text-xl">→</span>
              </button>
            </div>
          )}

          {/* Step 1 — Niche */}
          {step === 1 && (
            <div className="space-y-8">
              <div className="text-center space-y-2">
                <h2 className="text-3xl md:text-4xl font-black text-white">
                  What do you create content about?
                </h2>
                <p className="text-white/40 text-base">
                  Pick your niche — we&apos;ll write your first script instantly.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {WIZARD_NICHES.map((niche) => (
                  <button
                    key={niche.id}
                    onClick={() => handleNicheSelect(niche.id)}
                    className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-violet-500/10 hover:border-violet-500/40 transition-all hover:scale-[1.03] group"
                  >
                    <span className="text-3xl group-hover:scale-110 transition-transform">
                      {niche.emoji}
                    </span>
                    <span className="text-sm font-semibold text-white/70 group-hover:text-white transition-colors">
                      {niche.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2 — Topic + Style */}
          {step === 2 && (
            <div className="space-y-8">
              <div className="space-y-1">
                <p className="text-violet-400 text-sm font-bold tracking-wide uppercase">
                  You&apos;re a {selectedNiche?.label ?? 'content'} creator. 🔥
                </p>
                <h2 className="text-2xl md:text-3xl font-black text-white">
                  Here&apos;s your first script topic:
                </h2>
              </div>

              {/* Topic textarea */}
              <div className="relative">
                <textarea
                  value={topic}
                  onChange={(e) => {
                    setTopic(e.target.value);
                    track('onboarding_topic_edited', { niche: selectedNiche?.id });
                  }}
                  rows={3}
                  maxLength={500}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white text-base leading-relaxed resize-none focus:outline-none focus:border-violet-500/50 focus:bg-white/8 transition-all placeholder:text-white/20"
                  placeholder="Describe your topic..."
                />
                {topic !== selectedNiche?.topic && topic.length > 0 && (
                  <p className="mt-2 text-xs text-white/30">
                    Add detail for better results
                  </p>
                )}
              </div>

              {/* Style selector */}
              <div className="space-y-3">
                <p className="text-sm font-semibold text-white/50 uppercase tracking-wider">
                  Pick your visual style:
                </p>
                <div className="grid grid-cols-3 gap-3">
                  {WIZARD_STYLES.map((style) => (
                    <button
                      key={style.id}
                      onClick={() => {
                        setStyleId(style.id);
                        track('onboarding_style_selected', { style: style.id });
                      }}
                      className={`relative flex flex-col gap-2 p-4 rounded-2xl bg-gradient-to-br ${style.gradient} border-2 transition-all ${
                        styleId === style.id
                          ? `${style.accent} shadow-lg scale-[1.03]`
                          : 'border-white/10 hover:border-white/30'
                      }`}
                    >
                      {style.badge && (
                        <span className="absolute -top-2 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-amber-500 text-[10px] font-bold text-black rounded-full whitespace-nowrap">
                          {style.badge}
                        </span>
                      )}
                      <span className="text-sm font-bold text-white">{style.label}</span>
                      <span className="text-[11px] text-white/50 leading-snug">
                        {style.description}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Credit info */}
              <p className="text-xs text-white/25 text-center">
                Uses 1 credit · You have {credits !== null ? credits : 3} free credits
              </p>

              {/* CTA */}
              {hasCredits ? (
                <button
                  onClick={handleGenerate}
                  disabled={!topic.trim()}
                  className="w-full flex items-center justify-center gap-2 px-8 py-4 bg-violet-600 hover:bg-violet-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-lg rounded-2xl transition-all shadow-lg shadow-violet-900/40 hover:shadow-violet-900/60 hover:scale-[1.01]"
                >
                  <Sparkles className="w-5 h-5" />
                  Generate Now →
                </button>
              ) : (
                <button
                  onClick={() => router.push('/dashboard?purchase=credits')}
                  className="w-full flex items-center justify-center gap-2 px-8 py-4 bg-amber-600 hover:bg-amber-500 text-white font-bold text-lg rounded-2xl transition-all shadow-lg"
                >
                  Add Credits to Continue →
                </button>
              )}
            </div>
          )}
        </div>

        {step > 0 && <SkipLink onSkip={handleSkip} />}
      </div>
    </div>
  );
}
