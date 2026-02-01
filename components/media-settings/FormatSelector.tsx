import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { MediaSettingsProps, AspectRatio } from './types';
import { Smartphone, Square, Monitor, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

const FORMATS: { id: AspectRatio; label: string; icon: React.ElementType }[] = [
  { id: '9:16', label: 'Vertical (9:16)', icon: Smartphone },
  { id: '1:1', label: 'Square (1:1)', icon: Square },
  { id: '16:9', label: 'Horizontal (16:9)', icon: Monitor },
];

export const FormatSelector: React.FC<MediaSettingsProps> = ({ settings, onUpdate }) => {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ top: 0, left: 0 });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleMouseEnter = (e: React.MouseEvent<HTMLButtonElement>, id: string) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setTooltipPos({
      top: rect.top - 12,
      left: rect.left + rect.width / 2
    });
    setHoveredId(id);
  };

  return (
    <div className="w-full">
      <div className="grid grid-cols-3 gap-2">
        {FORMATS.map((format) => {
          const isSelected = settings.aspectRatio === format.id;
          const [name, ratio] = format.label.split(' ');
          
          return (
            <button
              key={format.id}
              type="button"
              onMouseEnter={(e) => handleMouseEnter(e, format.id)}
              onMouseLeave={() => setHoveredId(null)}
              onClick={() => onUpdate({ aspectRatio: format.id })}
              className={cn(
                "group relative flex flex-col items-center justify-between p-2 rounded-xl border transition-all duration-300 outline-none h-[90px]",
                isSelected
                  ? "bg-primary/5 border-primary shadow-sm"
                  : "bg-background border-border hover:border-primary/20 hover:bg-secondary/30"
              )}
            >
              {/* Physical Representation of Aspect Ratio */}
              <div className="flex-1 flex items-center justify-center w-full relative pt-1.5">
                {format.id === '9:16' && (
                  <div className="absolute top-0 right-0 -translate-y-2 translate-x-1">
                    <div className="px-1 py-0.5 bg-primary/10 border border-primary/20 rounded-sm">
                      <span className="text-[6px] font-black text-primary uppercase tracking-tighter block leading-none">REC</span>
                    </div>
                  </div>
                )}
                <div className={cn(
                  "border rounded-sm transition-all duration-300 relative",
                  format.id === '9:16' ? "h-9 w-5" : 
                  format.id === '1:1' ? "h-7 w-7" : 
                  "h-5 w-9",
                  isSelected ? "border-primary bg-primary/10" : "border-zinc-400 group-hover:border-zinc-600"
                )}>
                  {/* Subtle screen indicator */}
                  <div className={cn(
                    "w-1 h-1 rounded-full mx-auto mt-0.5 opacity-30",
                    format.id === '16:9' ? "mt-auto mb-0.5" : "",
                    isSelected ? "bg-primary" : "bg-black"
                  )} />
                </div>
              </div>

              {/* Labels */}
              <div className="flex flex-col items-center mt-1 w-full relative">
                <span className={cn(
                  "text-xs font-bold transition-colors leading-none tracking-tight",
                  isSelected ? "text-foreground" : "text-foreground/80"
                )}>
                  {name}
                </span>
                <span className="text-[10px] font-medium text-muted-foreground/60 mt-1">
                  {ratio}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* High-Visibility Portal Tooltip */}
      {mounted && hoveredId && createPortal(
        <div 
          className="fixed z-[9999] pointer-events-none select-none animate-in fade-in zoom-in-95 duration-200"
          style={{
            top: `${tooltipPos.top}px`,
            left: `${tooltipPos.left}px`,
            transform: 'translate(-50%, -100%)'
          }}
        >
          <div className="px-3 py-1.5 bg-black border border-zinc-700 rounded-lg text-xs font-semibold text-white shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)] whitespace-nowrap">
            {FORMATS.find(f => f.id === hoveredId)?.label}
            {/* Arrow */}
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-black border-r border-b border-zinc-700 rotate-45" />
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};
