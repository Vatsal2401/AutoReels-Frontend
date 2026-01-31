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
                "group relative flex flex-col items-center justify-between p-3 rounded-2xl border-2 transition-all duration-300 outline-none h-[110px]",
                isSelected
                  ? "bg-primary/10 border-primary shadow-[0_0_20px_-5px_rgba(255,255,255,0.15)] scale-[1.02]"
                  : "bg-background/40 border-border/50 hover:border-border hover:bg-zinc-800/20"
              )}
            >
              {/* Physical Representation of Aspect Ratio */}
              <div className="flex-1 flex items-center justify-center w-full">
                <div className={cn(
                  "border-2 rounded-md transition-all duration-500",
                  format.id === '9:16' ? "h-12 w-7" : 
                  format.id === '1:1' ? "h-10 w-10" : 
                  "h-7 w-12",
                  isSelected ? "border-primary bg-primary/20" : "border-zinc-500 group-hover:border-zinc-300"
                )}>
                  {/* Subtle screen indicator */}
                  <div className={cn(
                    "w-1.5 h-1.5 rounded-full mx-auto mt-1 opacity-20",
                    format.id === '16:9' ? "mt-auto mb-1" : "",
                    isSelected ? "bg-primary" : "bg-zinc-500"
                  )} />
                </div>
              </div>

              {/* Labels */}
              <div className="flex flex-col items-center mt-2">
                <span className={cn(
                  "text-[12px] font-bold transition-colors leading-none",
                  isSelected ? "text-foreground" : "text-zinc-400"
                )}>
                  {name}
                </span>
                <span className={cn(
                  "text-[10px] font-medium opacity-50 mt-1",
                  isSelected ? "text-primary/90" : "text-zinc-600"
                )}>
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
