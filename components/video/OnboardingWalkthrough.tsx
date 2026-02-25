'use client';

import { useState, useEffect, useRef, RefObject } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils/format';

interface SectionRefs {
  creativeIntent: RefObject<HTMLDivElement>;
  visualStyle: RefObject<HTMLDivElement>;
  captionSettings: RefObject<HTMLDivElement>;
  musicSelector: RefObject<HTMLDivElement>;
}

interface Props {
  sectionRefs: SectionRefs;
  onComplete: () => void;
  onExampleSelect: (text: string) => void;
}

const EXAMPLE_PROMPTS = [
  'Dark motivational speech about conquering discipline and mental toughness',
  'Cyberpunk story about AI takeover changing human civilization forever',
  'Finance reel explaining how SIP builds long-term wealth step by step',
];

interface Step {
  title: string;
  subtitle?: string;
  refKey: keyof SectionRefs | null;
  content: React.ReactNode;
}

export function OnboardingWalkthrough({ sectionRefs, onComplete, onExampleSelect }: Props) {
  const [step, setStep] = useState(1);
  const [highlightRect, setHighlightRect] = useState<DOMRect | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const totalSteps = 6;

  const steps: Step[] = [
    {
      title: '🎬 Welcome to AI Reels Studio',
      refKey: null,
      content: (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground leading-relaxed">
            Create AI-powered cinematic reels in 60 seconds. Let us walk you through the key
            settings so you get the best possible result on your very first reel.
          </p>
          <button
            onClick={() => setStep(2)}
            className="w-full h-10 rounded-xl bg-primary text-primary-foreground text-sm font-bold hover:bg-primary/90 transition-colors"
          >
            Start Creating →
          </button>
        </div>
      ),
    },
    {
      title: 'Creative Intent',
      subtitle: 'Tell the AI exactly what story to tell',
      refKey: 'creativeIntent',
      content: (
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground">
            The stronger your prompt, the better your reel. Try one of these to get started:
          </p>
          <div className="space-y-2">
            {EXAMPLE_PROMPTS.map((ex) => (
              <button
                key={ex}
                onClick={() => {
                  onExampleSelect(ex);
                  setStep(3);
                }}
                className="w-full text-left px-3 py-2.5 rounded-lg border border-border bg-muted/50 hover:bg-primary/5 hover:border-primary/30 text-xs text-foreground transition-all leading-snug"
              >
                "{ex}"
              </button>
            ))}
          </div>
          <button
            onClick={() => setStep(3)}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors underline-offset-2 hover:underline"
          >
            I'll write my own →
          </button>
        </div>
      ),
    },
    {
      title: 'Visual Aesthetic',
      subtitle: 'Pick the cinematic style for your images',
      refKey: 'visualStyle',
      content: (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2 text-xs">
            {[
              { name: 'Cinematic', desc: 'Epic film-grade visuals with dramatic lighting' },
              { name: 'Film Noir', desc: 'High-contrast black & white moody aesthetic' },
              { name: 'Cyberpunk', desc: 'Neon-drenched futuristic dystopian look' },
              { name: 'Minimalist', desc: 'Clean, simple, distraction-free composition' },
            ].map(({ name, desc }) => (
              <div key={name} className="p-2 rounded-lg border border-border bg-muted/30">
                <p className="font-semibold text-foreground">{name}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5 leading-snug">{desc}</p>
              </div>
            ))}
          </div>
          <button
            onClick={() => setStep(4)}
            className="w-full h-9 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 transition-colors"
          >
            Got it →
          </button>
        </div>
      ),
    },
    {
      title: 'Typography & Position',
      subtitle: 'How captions appear on your reel',
      refKey: 'captionSettings',
      content: (
        <div className="space-y-3">
          <div className="space-y-2 text-xs">
            {[
              { name: 'Bold Stroke', desc: 'High-contrast outlined text — easy to read on any background' },
              { name: 'Karaoke', desc: 'Words highlight one-by-one in sync with narration' },
              { name: 'Sleek', desc: 'Clean sans-serif for a modern, polished look' },
            ].map(({ name, desc }) => (
              <div key={name} className="flex gap-2 p-2 rounded-lg border border-border bg-muted/30">
                <p className="font-semibold text-foreground shrink-0">{name}:</p>
                <p className="text-muted-foreground leading-snug">{desc}</p>
              </div>
            ))}
          </div>
          <button
            onClick={() => setStep(5)}
            className="w-full h-9 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 transition-colors"
          >
            Got it →
          </button>
        </div>
      ),
    },
    {
      title: 'Background Atmosphere',
      subtitle: 'Add music to set the mood',
      refKey: 'musicSelector',
      content: (
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground leading-relaxed">
            Background music amplifies emotional impact. Toggle it on and use the volume slider to
            find the right balance — music too loud will compete with the narration voice.
          </p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            A volume of{' '}
            <span className="font-semibold text-foreground">30–50%</span> usually works best
            alongside a voiceover.
          </p>
          <button
            onClick={() => setStep(6)}
            className="w-full h-9 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 transition-colors"
          >
            Got it →
          </button>
        </div>
      ),
    },
    {
      title: "You're all set! 🚀",
      refKey: null,
      content: (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground leading-relaxed">
            You now know the key controls. The other settings — Format, Voice, Duration, Tone, Hook,
            and CTA — have sensible defaults and you can tweak them anytime.
          </p>
          <button
            onClick={onComplete}
            className="w-full h-10 rounded-xl bg-primary text-primary-foreground text-sm font-bold hover:bg-primary/90 transition-colors"
          >
            Generate My First Reel ✨
          </button>
        </div>
      ),
    },
  ];

  const currentStep = steps[step - 1];

  // Compute spotlight rect whenever step changes
  useEffect(() => {
    if (!currentStep.refKey) {
      setHighlightRect(null);
      return;
    }

    const ref = sectionRefs[currentStep.refKey];
    if (!ref?.current) {
      // ref not mounted (e.g. hidden in Beginner mode) — just advance
      setHighlightRect(null);
      return;
    }

    ref.current.scrollIntoView({ behavior: 'smooth', block: 'center' });

    // Wait for smooth scroll to fully settle before measuring
    const tid = setTimeout(() => {
      if (ref.current) {
        setHighlightRect(ref.current.getBoundingClientRect());
      }
    }, 550);

    return () => clearTimeout(tid);
  }, [step]); // eslint-disable-line react-hooks/exhaustive-deps

  // Recompute on resize / scroll
  useEffect(() => {
    if (!currentStep.refKey) return;
    const ref = sectionRefs[currentStep.refKey];
    if (!ref?.current) return;

    const update = () => {
      if (ref.current) setHighlightRect(ref.current.getBoundingClientRect());
    };
    window.addEventListener('resize', update);
    window.addEventListener('scroll', update, true);
    return () => {
      window.removeEventListener('resize', update);
      window.removeEventListener('scroll', update, true);
    };
  }, [step]); // eslint-disable-line react-hooks/exhaustive-deps

  const isCentered = !currentStep.refKey || !highlightRect;

  // Position the floating card below or above the highlight
  const cardStyle: React.CSSProperties = {};
  if (!isCentered && highlightRect && cardRef.current) {
    const cardHeight = cardRef.current.offsetHeight || 320;
    const viewportH = window.innerHeight;
    const spaceBelow = viewportH - highlightRect.bottom;
    const spaceAbove = highlightRect.top;

    const GAP = 12;
    let rawTop: number;
    if (spaceBelow >= cardHeight + GAP || spaceBelow >= spaceAbove) {
      // Prefer below
      rawTop = highlightRect.bottom + GAP;
    } else {
      // Place above
      rawTop = highlightRect.top - cardHeight - GAP;
    }
    // Clamp so the card never overflows the viewport top or bottom
    cardStyle.top = Math.max(8, Math.min(rawTop, viewportH - cardHeight - 8));
    cardStyle.maxHeight = viewportH - 16;
    cardStyle.overflowY = 'auto';

    // Centre horizontally on the highlight element, clamped to viewport
    const centreX = highlightRect.left + highlightRect.width / 2;
    const cardW = 320;
    cardStyle.left = Math.max(8, Math.min(centreX - cardW / 2, window.innerWidth - cardW - 8));
  }

  return (
    <>
      {/* Dark overlay */}
      <div className="fixed inset-0 z-[200] pointer-events-none bg-black/60 backdrop-blur-[2px]" />

      {/* Spotlight highlight box */}
      {highlightRect && (
        <div
          className="fixed z-[201] pointer-events-none ring-2 ring-primary/80 ring-offset-2 rounded-2xl"
          style={{
            top: highlightRect.top - 6,
            left: highlightRect.left - 6,
            width: highlightRect.width + 12,
            height: highlightRect.height + 12,
          }}
        />
      )}

      {/* Floating card */}
      {isCentered ? (
        // Centered modal for step 1 and 6
        <div className="fixed inset-0 z-[202] flex items-center justify-center pointer-events-none px-4">
          <div
            ref={cardRef}
            className="pointer-events-auto w-full max-w-sm bg-card border border-border rounded-2xl shadow-2xl p-6 space-y-4"
          >
            <CardHeader
              step={step}
              totalSteps={totalSteps}
              title={currentStep.title}
              subtitle={currentStep.subtitle}
              onSkip={onComplete}
            />
            {currentStep.content}
          </div>
        </div>
      ) : (
        // Positioned card next to spotlight
        <div
          ref={cardRef}
          className="fixed z-[202] pointer-events-auto w-80 bg-card border border-border rounded-2xl shadow-2xl p-6 space-y-4 scrollbar-thin"
          style={cardStyle}
        >
          <CardHeader
            step={step}
            totalSteps={totalSteps}
            title={currentStep.title}
            subtitle={currentStep.subtitle}
            onSkip={onComplete}
          />
          {currentStep.content}
        </div>
      )}
    </>
  );
}

function CardHeader({
  step,
  totalSteps,
  title,
  subtitle,
  onSkip,
}: {
  step: number;
  totalSteps: number;
  title: string;
  subtitle?: string;
  onSkip: () => void;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60">
          Step {step} of {totalSteps}
        </span>
        <button
          onClick={onSkip}
          className="text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Skip walkthrough"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Progress dots */}
      <div className="flex gap-1">
        {Array.from({ length: totalSteps }).map((_, i) => (
          <div
            key={i}
            className={cn(
              'h-1 rounded-full transition-all duration-300',
              i < step ? 'bg-primary' : 'bg-border',
              i === step - 1 ? 'flex-[2]' : 'flex-1',
            )}
          />
        ))}
      </div>

      <h3 className="text-base font-black text-foreground">{title}</h3>
      {subtitle && <p className="text-[11px] text-muted-foreground">{subtitle}</p>}
    </div>
  );
}
