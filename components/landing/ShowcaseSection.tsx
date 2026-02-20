'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { showcaseApi, type ShowcaseItem } from '@/lib/api/showcase';
import { Button } from '@/components/ui/button';
import { ArrowRight, Play } from 'lucide-react';

function ShowcaseVideoCard({ item }: { item: ShowcaseItem }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoError, setVideoError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const hasVideo = item.url && !videoError;

  const handleMouseEnter = () => {
    setIsHovered(true);
    if (videoRef.current && hasVideo) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {});
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    if (videoRef.current) videoRef.current.pause();
  };

  return (
    <Link href="/signup" className="block flex-shrink-0 snap-start">
      <div
        className="relative w-[160px] sm:w-[180px] rounded-2xl overflow-hidden bg-muted border border-border/50 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/10 transition-all duration-300 cursor-pointer group"
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
            <Play className="h-8 w-8 text-primary/40" />
          </div>
        )}

        {/* Hover overlay */}
        <div
          className={`absolute inset-0 bg-black/30 flex items-center justify-center transition-opacity duration-200 ${
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

export function ShowcaseSection() {
  const [items, setItems] = useState<ShowcaseItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    showcaseApi
      .getShowcase()
      .then((res) => {
        // Only show items that have a clip URL
        setItems(res.items.filter((item) => item.type === 'reel' && item.url));
      })
      .catch(() => {
        // Silently fail — section just won't render if API is down
      })
      .finally(() => setIsLoading(false));
  }, []);

  // Don't render the section if no items loaded
  if (!isLoading && items.length === 0) return null;

  return (
    <section className="py-20 px-4">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="text-center mb-10 space-y-3">
          <p className="text-xs font-bold tracking-widest text-primary uppercase">
            Real Output · Made with AutoReels
          </p>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
            See What AutoReels Creates
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto text-sm leading-relaxed">
            Every video below was generated in under 60 seconds — AI script, voice, captions, and visuals. No editing. No camera.
          </p>
        </div>

        {/* Video scroll row */}
        {isLoading ? (
          <div className="flex gap-4 justify-center overflow-hidden">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="flex-shrink-0 w-[160px] sm:w-[180px] rounded-2xl bg-muted/50 border border-border/30 animate-pulse"
                style={{ aspectRatio: '9/16' }}
              />
            ))}
          </div>
        ) : (
          <div
            ref={scrollRef}
            className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory no-scrollbar -mx-4 px-4"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {items.map((item) => (
              <ShowcaseVideoCard key={item.id} item={item} />
            ))}
          </div>
        )}

        {/* CTA below */}
        <div className="text-center mt-10 space-y-3">
          <Link href="/signup">
            <Button size="lg" className="h-12 px-8 rounded-xl font-bold shadow-lg shadow-primary/20">
              Create Your First Video Free
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          <p className="text-xs text-muted-foreground">No credit card · 10 free videos to start</p>
        </div>
      </div>
    </section>
  );
}
