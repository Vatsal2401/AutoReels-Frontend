'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import confetti from 'canvas-confetti';
import { Button } from '@/components/ui/button';
import { Sparkles, X } from 'lucide-react';

interface CelebrationOverlayProps {
  videoId: string;
  topic: string;
  onDismiss: () => void;
}

function playFanfare() {
  try {
    const ctx = new AudioContext();
    const notes = [523, 659, 784, 1047]; // C5 E5 G5 C6
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = freq;
      osc.type = 'sine';
      gain.gain.setValueAtTime(0, ctx.currentTime + i * 0.12);
      gain.gain.linearRampToValueAtTime(0.25, ctx.currentTime + i * 0.12 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.12 + 0.4);
      osc.start(ctx.currentTime + i * 0.12);
      osc.stop(ctx.currentTime + i * 0.12 + 0.45);
    });
  } catch {
    // AudioContext may be blocked in some environments — silent fail
  }
}

const AUTO_DISMISS_MS = 10000;

export function CelebrationOverlay({ videoId, topic, onDismiss }: CelebrationOverlayProps) {
  const router = useRouter();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [remaining, setRemaining] = useState(AUTO_DISMISS_MS);
  const startRef = useRef(Date.now());

  const dismiss = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (timerRef.current) clearTimeout(timerRef.current);
    onDismiss();
  }, [onDismiss]);

  useEffect(() => {
    // Fire confetti bursts
    const burst = () => {
      confetti({ particleCount: 60, spread: 80, origin: { x: 0.2, y: 0.6 }, zIndex: 9999 });
      confetti({ particleCount: 60, spread: 80, origin: { x: 0.8, y: 0.6 }, zIndex: 9999 });
    };
    burst();
    const confettiInterval = setInterval(burst, 400);
    setTimeout(() => clearInterval(confettiInterval), 3000);

    // Fanfare
    playFanfare();

    // Auto-dismiss countdown
    startRef.current = Date.now();
    timerRef.current = setTimeout(dismiss, AUTO_DISMISS_MS);
    intervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startRef.current;
      setRemaining(Math.max(0, AUTO_DISMISS_MS - elapsed));
    }, 100);

    // Escape key
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') dismiss();
    };
    window.addEventListener('keydown', onKey);

    return () => {
      clearInterval(confettiInterval);
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (timerRef.current) clearTimeout(timerRef.current);
      window.removeEventListener('keydown', onKey);
    };
  }, [dismiss]);

  const progressPct = (remaining / AUTO_DISMISS_MS) * 100;
  const shortTopic = topic.length > 80 ? topic.slice(0, 77) + '...' : topic;

  return (
    <div className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-md mx-4 bg-card rounded-2xl border border-border shadow-2xl overflow-hidden">
        {/* Auto-dismiss progress bar */}
        <div className="absolute top-0 left-0 h-0.5 bg-primary/30 w-full">
          <div
            className="h-full bg-primary transition-all duration-100 ease-linear"
            style={{ width: `${progressPct}%` }}
          />
        </div>

        {/* Close button */}
        <button
          onClick={dismiss}
          className="absolute top-3 right-3 text-muted-foreground hover:text-foreground transition-colors z-10"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex flex-col items-center text-center p-8 pt-10">
          {/* Emoji */}
          <div className="text-6xl mb-4 animate-bounce" role="img" aria-label="celebration">
            🎉
          </div>

          <h2 className="text-2xl font-black text-foreground mb-2">Your Reel is Ready!</h2>

          <p className="text-sm text-muted-foreground mb-8 max-w-xs leading-relaxed">{shortTopic}</p>

          <div className="flex gap-3 w-full">
            <Button
              variant="secondary"
              className="flex-1"
              onClick={dismiss}
            >
              Create Another
            </Button>
            <Button
              className="flex-1"
              onClick={() => {
                dismiss();
                router.push(`/videos/${videoId}`);
              }}
            >
              <Sparkles className="mr-1.5 h-4 w-4" />
              View Reel
            </Button>
          </div>

          <p className="text-[10px] text-muted-foreground/50 mt-4">
            Auto-closing in {Math.ceil(remaining / 1000)}s · Press Esc to dismiss
          </p>
        </div>
      </div>
    </div>
  );
}
