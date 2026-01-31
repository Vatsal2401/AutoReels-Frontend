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
    <div className="flex flex-col h-full">
      <div className="grid grid-cols-1 gap-3 flex-1">
        {DURATIONS.map((dur) => {
            const isSelected = settings.duration === dur.id;
            return (
                <button
                    key={dur.id}
                    type="button"
                    onClick={() => onUpdate({ duration: dur.id })}
                    className={cn(
                        "relative flex items-center justify-between px-4 py-3 rounded-xl border transition-all duration-300 group outline-none",
                        isSelected 
                            ? "border-primary bg-primary/5 shadow-[0_0_15px_-3px_rgba(var(--primary-rgb),0.1)]" 
                            : "border-border/60 bg-card hover:border-primary/30 hover:bg-secondary/50"
                    )}
                >
                    <div className="flex flex-col items-start gap-1">
                        <span className={cn(
                            "text-[13px] font-bold transition-colors",
                            isSelected ? "text-primary" : "text-foreground"
                        )}>
                            {dur.label}
                        </span>
                        <span className={cn(
                            "text-[10px] font-medium transition-colors",
                            isSelected ? "text-primary/70" : "text-muted-foreground"
                        )}>
                            Target: {dur.desc}
                        </span>
                    </div>
                    
                    <div className={cn(
                        "h-4 w-4 rounded-full border flex items-center justify-center transition-all",
                        isSelected ? "border-primary bg-primary" : "border-zinc-300 group-hover:border-primary/50"
                    )}>
                        {isSelected && <div className="h-1.5 w-1.5 bg-white rounded-full" />}
                    </div>
                </button>
            )
        })}
      </div>
    </div>
  );
};
