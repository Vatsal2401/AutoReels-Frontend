'use client';

import { useState } from 'react';
import { TOPIC_IDEAS, Niche } from '@/lib/data/topic-ideas';
import { cn } from '@/lib/utils/format';

interface TopicIdeasProps {
  onSelect: (topic: string) => void;
}

export function TopicIdeas({ onSelect }: TopicIdeasProps) {
  const [activeNiche, setActiveNiche] = useState<Niche | null>(null);

  const handleNicheClick = (niche: Niche) => {
    setActiveNiche((prev) => (prev?.label === niche.label ? null : niche));
  };

  const handleTopicClick = (topic: string) => {
    onSelect(topic);
    setActiveNiche(null);
  };

  return (
    <div className="w-full">
      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60 mb-2">
        Need ideas? Pick a niche
      </p>
      <div className="flex flex-wrap gap-2 mb-3">
        {TOPIC_IDEAS.map((niche) => (
          <button
            key={niche.label}
            type="button"
            onClick={() => handleNicheClick(niche)}
            className={cn(
              'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all duration-200',
              activeNiche?.label === niche.label
                ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                : 'bg-background border-border text-muted-foreground hover:border-primary/50 hover:text-foreground hover:bg-primary/5',
            )}
          >
            <span>{niche.emoji}</span>
            <span>{niche.label}</span>
          </button>
        ))}
      </div>

      {activeNiche && (
        <div className="grid grid-cols-1 gap-1.5 mb-4 animate-in fade-in slide-in-from-top-1 duration-200">
          {activeNiche.topics.map((topic) => (
            <button
              key={topic}
              type="button"
              onClick={() => handleTopicClick(topic)}
              className="text-left text-sm px-3 py-2 rounded-lg border border-border bg-background hover:bg-primary/5 hover:border-primary/40 text-foreground/80 hover:text-foreground transition-all duration-150"
            >
              {topic}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
