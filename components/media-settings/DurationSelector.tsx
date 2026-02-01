import React from 'react';
import { MediaSettingsProps, Duration } from './types';
import { cn } from '@/lib/utils';
import { Clock } from 'lucide-react';

const DURATIONS: { id: Duration; label: string; desc: string }[] = [
  { id: 'Short', label: 'Short', desc: '30-60s' },
  { id: 'Medium', label: 'Medium', desc: '60-90s' },
  { id: 'Long', label: 'Long', desc: '90-120s' },
];

export const DurationSelector: React.FC<MediaSettingsProps> = ({ settings, onUpdate }) => {
  return (
    <div className="flex flex-col gap-2">
      {DURATIONS.map((dur) => {
        const isSelected = settings.duration === dur.id;
        return (
          <button
            key={dur.id}
            type="button"
            onClick={() => onUpdate({ duration: dur.id })}
            className={cn(
              "relative flex items-center justify-between p-4 rounded-xl border transition-all duration-200 group outline-none",
              isSelected 
                ? "border-primary/40 bg-primary/[0.03] shadow-sm" 
                : "border-border bg-card hover:border-border-hover hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50"
            )}
          >
            <div className="flex flex-col items-start gap-1">
              <div className="flex items-center gap-2">
                <span className={cn(
                  "text-xs font-bold tracking-tight transition-colors",
                  isSelected ? "text-foreground" : "text-foreground/90"
                )}>
                  {dur.label}
                </span>
                {dur.id === 'Short' && (
                  <span className="px-1.5 py-0.5 bg-primary/10 border border-primary/20 rounded-md text-[8px] font-bold text-primary uppercase tracking-wider leading-none">
                    REC
                  </span>
                )}
              </div>
              <span className="text-[10px] font-medium text-muted-foreground/60">
                Target: {dur.desc}
              </span>
            </div>
            
            <div className={cn(
              "h-5 w-5 rounded-full border-2 flex items-center justify-center transition-all duration-200",
              isSelected 
                ? "border-primary bg-primary shadow-[0_0_10px_-2px_rgba(37,99,235,0.3)]" 
                : "border-border bg-transparent group-hover:border-muted-foreground/30"
            )}>
              {isSelected && <div className="h-1.5 w-1.5 bg-white rounded-full" />}
            </div>
          </button>
        );
      })}
    </div>
  );
};
