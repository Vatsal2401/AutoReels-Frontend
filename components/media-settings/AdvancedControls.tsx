
import React, { useState } from 'react';
import { MediaSettingsProps } from './types';
import { cn } from '@/lib/utils/format';
import { ChevronDown, ChevronUp, Sliders, Sun, Palette, Video } from 'lucide-react';

export const AdvancedControls: React.FC<MediaSettingsProps> = ({ settings, onUpdate }) => {
  const [isOpen, setIsOpen] = useState(false);

  const updateAdvanced = (key: string, value: string) => {
    onUpdate({
      advancedOptions: {
        ...settings.advancedOptions,
        [key]: value
      }
    });
  };

  const options = [
    {
      id: 'styleStrength',
      label: 'Style Strength',
      icon: Sliders,
      values: ['low', 'medium', 'high']
    },
    {
      id: 'lighting',
      label: 'Lighting',
      icon: Sun,
      values: ['none', 'natural', 'studio', 'dramatic', 'neon', 'soft']
    },
    {
      id: 'colorTone',
      label: 'Color Tone',
      icon: Palette,
      values: ['none', 'warm', 'neutral', 'cool', 'bw', 'sepia']
    },
    {
      id: 'cameraFraming',
      label: 'Camera / Framing',
      icon: Video,
      values: ['none', 'wide', 'medium', 'close-up', 'birds-eye', 'macro']
    }
  ];

  return (
    <div className="space-y-4">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors group"
      >
        <div className="flex items-center justify-center w-6 h-6 rounded bg-primary/10 group-hover:bg-primary/20 transition-colors">
          <Sliders className="h-3.5 w-3.5 text-primary" />
        </div>
        Advanced Visual Controls
        {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </button>

      {isOpen && (
        <div className="grid grid-cols-1 gap-6 p-4 rounded-xl border border-border/50 bg-white/5 animate-in fade-in slide-in-from-top-2">
          {options.map((option) => (
            <div key={option.id} className="space-y-3">
              <div className="flex items-center gap-2">
                <option.icon className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs font-medium text-muted-foreground">{option.label}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {option.values.map((val) => {
                   const isSelected = (settings.advancedOptions as any)[option.id] === val;
                   return (
                    <button
                      key={val}
                      type="button"
                      onClick={() => updateAdvanced(option.id, val)}
                      className={cn(
                        "px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all capitalize border",
                        isSelected
                          ? "bg-primary/20 border-primary text-primary shadow-[0_0_10px_rgba(var(--primary),0.1)]"
                          : "bg-white/5 border-transparent text-muted-foreground hover:bg-white/10 hover:text-foreground"
                      )}
                    >
                      {val === 'none' ? 'Default' : val.replace('-', ' ')}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
