'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { showcaseApi, type ShowcaseItem } from '@/lib/api/showcase';
import { ArrowRight, Play } from 'lucide-react';

function ShowcaseVideoCard({
  item,
  sectionVisible,
}: {
  item: ShowcaseItem;
  sectionVisible: boolean;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoError, setVideoError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const hasVideo = !!item.url && !videoError;

  // When section becomes visible, switch to preload="auto" and buffer the clip
  useEffect(() => {
    if (sectionVisible && videoRef.current && hasVideo) {
      videoRef.current.preload = 'auto';
      videoRef.current.load();
    }
  }, [sectionVisible, hasVideo]);

  const handleMouseEnter = () => {
    setIsHovered(true);
    const vid = videoRef.current;
    if (!vid || !hasVideo) return;
    vid.currentTime = 0;
    vid
      .play()
      .then(() => setIsPlaying(true))
      .catch(() => {});
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    const vid = videoRef.current;
    if (!vid) return;
    vid.pause();
    setIsPlaying(false);
  };

  return (
    <Link href="/signup" className="block flex-shrink-0 snap-start">
      <div
        className="relative w-[150px] sm:w-[170px] rounded-2xl overflow-hidden bg-muted border border-border/50 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/10 transition-all duration-300 cursor-pointer"
        style={{ aspectRatio: '9/16' }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {hasVideo ? (
          <video
            ref={videoRef}
            key={item.url!}
            src={item.url!}
            className="absolute inset-0 w-full h-full object-cover"
            muted
            loop
            playsInline
            preload="metadata"
            onError={() => setVideoError(true)}
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
            <Play className="h-8 w-8 text-primary/30" />
          </div>
        )}

        {/* Play hint — visible when not hovering and video ready */}
        {hasVideo && !isHovered && !isPlaying && (
          <div className="absolute inset-0 flex items-end justify-center pb-4 pointer-events-none">
            <div className="px-2 py-1 rounded-full bg-black/50 backdrop-blur-sm text-[9px] font-bold text-white/80 tracking-wide">
              Hover to play
            </div>
          </div>
        )}

        {/* Hover overlay */}
        <div
          className={`absolute inset-0 bg-black/25 flex items-center justify-center transition-opacity duration-200 ${
            isHovered ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/90 text-primary text-xs font-bold">
            Try Free
            <ArrowRight className="h-3 w-3" />
          </div>
        </div>

        {/* AutoReels badge */}
        <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-black/50 backdrop-blur-sm text-[9px] font-bold text-white/80 tracking-wide uppercase">
          AutoReels
        </div>
      </div>
    </Link>
  );
}

export function ShowcaseSection({ initialItems }: { initialItems?: ShowcaseItem[] }) {
  const [items, setItems] = useState<ShowcaseItem[]>(initialItems?.filter((i) => i.url) ?? []);
  const [isLoading, setIsLoading] = useState(!initialItems);
  const [sectionVisible, setSectionVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    // Skip fetch if data was passed server-side
    if (initialItems) return;
    showcaseApi
      .getShowcase()
      .then((res) => {
        setItems(res.items.filter((item) => item.url));
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [initialItems]);

  // Intersection observer — start buffering videos when section enters view
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setSectionVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 },
    );
    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  if (!isLoading && items.length === 0) return null;

  return (
    <section id="showcase" ref={sectionRef} className="py-20 px-4">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="text-center mb-10 space-y-3">
          <p className="text-xs font-bold tracking-widest text-primary uppercase">
            Real Output · Made with autoreels.in
          </p>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
            See What AutoReels Creates
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto text-sm leading-relaxed">
            Every video below was generated in under 60 seconds — AI script, voice, captions, and
            visuals. No editing. No camera.
          </p>
        </div>

        {/* Video scroll row */}
        {isLoading ? (
          <div className="flex gap-4 justify-center overflow-hidden">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="flex-shrink-0 w-[150px] sm:w-[170px] rounded-2xl bg-muted/50 border border-border/30 animate-pulse"
                style={{ aspectRatio: '9/16' }}
              />
            ))}
          </div>
        ) : (
          <div
            className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory -mx-4 px-4"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {items.map((item) => (
              <ShowcaseVideoCard key={item.id} item={item} sectionVisible={sectionVisible} />
            ))}
          </div>
        )}

        {/* Softer CTA */}
        <div className="text-center mt-8">
          <Link
            href="/signup"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline underline-offset-4 transition-all"
          >
            Create your own for free
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
          <p className="text-xs text-muted-foreground mt-1">No credit card · 10 free videos</p>
        </div>
      </div>
    </section>
  );
}
