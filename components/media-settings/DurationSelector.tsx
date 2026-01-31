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
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <h3 className="text-sm font-medium text-muted-foreground">Duration</h3>
        <div className="group relative">
            <Clock size={14} className="text-muted-foreground/50 cursor-help" />
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-popover text-popover-foreground text-xs rounded shadow-lg border border-border hidden group-hover:block transition-opacity">
                Estimated duration of the final generated video.
            </div>
        </div>
      </div>
      
      <div className="flex p-1 bg-secondary/50 rounded-lg">
        {DURATIONS.map((dur) => {
            const isSelected = settings.duration === dur.id;
            return (
                <button
                    key={dur.id}
                    type="button"
                    onClick={() => onUpdate({ duration: dur.id })}
                    className={cn(
                        "flex-1 py-2 text-sm font-medium rounded-md transition-all relative overflow-hidden",
                        isSelected 
                            ? "bg-primary text-primary-foreground shadow-sm" 
                            : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                    )}
                >
                    <span className="relative z-10">{dur.label}</span>
                    {/* {isSelected && <span className="text-[10px] opacity-80 ml-1">({dur.desc})</span>} */}
                </button>
            )
        })}
      </div>
      <p className="text-center text-xs text-muted-foreground">
        Target: {DURATIONS.find(d => d.id === settings.duration)?.desc}
      </p>
    </div>
  );
};
