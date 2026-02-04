import React from 'react';
import { Layout, Timer, CheckCircle2, XCircle, Check } from 'lucide-react';
import { cn } from '@/lib/utils/format';
import { MediaSettingsProps } from './types';

interface StyleOption {
  id: 'bold-stroke' | 'red-highlight' | 'sleek' | 'karaoke-card' | 'majestic' | 'beast' | 'elegant';
  label: string;
  previewClass: string;
  previewText?: string;
}

export const CaptionSettings: React.FC<MediaSettingsProps> = ({ settings, onUpdate }) => {
  const { captions } = settings;

  const STYLES: StyleOption[] = [
    {
      id: 'bold-stroke',
      label: 'Bold Stroke',
      previewClass: 'text-white font-black stroke-black',
      previewText: 'AND',
    },
    {
      id: 'red-highlight',
      label: 'Red Highlight',
      previewClass: 'text-red-600 font-black shadow-[0_0_8px_rgba(255,0,0,0.8)]',
      previewText: 'AND FINALLY',
    },
    {
      id: 'sleek',
      label: 'Sleek',
      previewClass: 'text-white font-bold shadow-[0_0_10px_rgba(255,255,255,0.8)]',
      previewText: 'AND FINALLY',
    },
    {
      id: 'karaoke-card',
      label: 'Karaoke',
      previewClass: 'text-white font-bold',
      previewText: 'KARAOKE',
    },
    {
      id: 'majestic',
      label: 'Majestic',
      previewClass: 'text-white font-black [text-shadow:2px_2px_0_#000,4px_4px_0_rgba(0,0,0,0.5)]',
      previewText: 'AND FINALLY',
    },
    {
      id: 'beast',
      label: 'Beast',
      previewClass:
        'text-white font-black italic [text-shadow:2px_2px_0_#000,-1px_-1px_0_#000,1px_-1px_0_#000,-1px_1px_0_#000,1px_1px_0_#000]',
      previewText: 'AND',
    },
    {
      id: 'elegant',
      label: 'Elegant',
      previewClass: 'text-white font-serif text-[10px]',
      previewText: 'AND',
    },
  ];

  const POSITIONS = [
    { value: 'bottom', label: 'Bottom' },
    { value: 'center', label: 'Center' },
    { value: 'top', label: 'Top' },
  ];

  const TIMING_MODES = [
    { value: 'word', label: 'Word (Karaoke)' },
    { value: 'sentence', label: 'Sentence' },
  ];

  const handleToggle = (enabled: boolean) => {
    onUpdate({
      captions: {
        ...captions,
        enabled,
      },
    });
  };

  const updateConfig = (updates: Partial<typeof captions>) => {
    onUpdate({
      captions: {
        ...captions,
        ...updates,
      },
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-border/40 pb-3 px-1">
        <div className="flex items-center gap-3">
          <div className="w-1.5 h-1.5 rounded-full bg-[#7c3aed]" />
          <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60">
            Typography & Visuals
          </h3>
        </div>
        <button
          onClick={() => handleToggle(!captions.enabled)}
          className={cn(
            'flex items-center gap-2 rounded-full px-5 py-2 text-[11px] font-bold transition-all border',
            captions.enabled
              ? 'bg-[#f5f3ff] text-[#7c3aed] border-[#ddd6fe] shadow-sm'
              : 'bg-muted text-muted-foreground border-border',
          )}
        >
          {captions.enabled ? (
            <>
              <CheckCircle2 size={14} fill="currentColor" className="text-white" />
              <span className="text-[#7c3aed]">Enabled</span>
            </>
          ) : (
            <>
              <XCircle size={14} />
              Disabled
            </>
          )}
        </button>
      </div>

      {captions.enabled && (
        <div className="space-y-10 animate-in fade-in slide-in-from-top-4 duration-500">
          {/* Horizontal Slider Area */}
          <div className="relative group/slider">
            <div
              className="flex items-center gap-5 overflow-x-auto pb-4 pt-2 px-1 snap-x mandatory no-scrollbar -mx-1"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {STYLES.map((style) => (
                <button
                  key={style.id}
                  onClick={() => updateConfig({ preset: style.id as any })}
                  className={cn(
                    'group relative shrink-0 w-40 h-32 rounded-2xl overflow-hidden transition-all duration-300 snap-start border',
                    captions.preset === style.id
                      ? 'border-[#7c3aed] ring-4 ring-[#7c3aed]/10 shadow-xl scale-[1.05] z-10'
                      : 'border-border/40 opacity-70 hover:opacity-100 hover:scale-[1.02] grayscale-[0.2] hover:grayscale-0',
                  )}
                >
                  {/* Preview Content Area */}
                  <div className="absolute inset-0 bg-[#121214] flex flex-col items-center justify-center p-4">
                    {style.id === 'karaoke-card' ? (
                      <div className="flex flex-col items-center gap-1 mb-2">
                        <span className="bg-[#7c3aed] px-2 py-0.5 rounded-md text-[10px] font-black text-white shadow-lg shadow-[#7c3aed]/40">
                          AND
                        </span>
                        <span className="text-white font-black text-[11px] uppercase tracking-tight">
                          FINALLY
                        </span>
                      </div>
                    ) : (
                      <div
                        className={cn(
                          'text-center transition-transform group-hover:scale-110 duration-700 uppercase tracking-widest mb-2',
                          style.previewClass,
                          style.id === 'bold-stroke' ? 'text-lg' : 'text-[10px]',
                        )}
                      >
                        {style.id === 'red-highlight' ? (
                          <div className="flex flex-col items-center">
                            <span className="text-[#ef4444] font-black [text-shadow:0_0_10px_rgba(239,68,68,1)]">
                              AND
                            </span>
                            <span className="text-white font-black">FINALLY</span>
                          </div>
                        ) : (
                          style.previewText
                        )}
                      </div>
                    )}
                  </div>

                  {/* Gradient Overlay & Label */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-100" />

                  <div className="absolute bottom-0 left-0 right-0 p-3 flex items-center justify-between">
                    <span
                      className={cn(
                        'text-[10px] font-black uppercase tracking-[0.15em] transition-all',
                        captions.preset === style.id ? 'text-white' : 'text-white/60',
                      )}
                    >
                      {style.label}
                    </span>

                    {captions.preset === style.id && (
                      <div className="bg-[#7c3aed] text-white rounded-full p-0.5 shadow-lg border border-white/20 animate-in zoom-in-50 duration-300">
                        <Check size={8} strokeWidth={5} />
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-border/40">
            {/* Position */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Layout size={14} className="text-primary" />
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  Text Position
                </label>
              </div>
              <div className="flex bg-zinc-100 dark:bg-zinc-900 rounded-xl p-1 border border-border shadow-inner">
                {POSITIONS.map((pos) => (
                  <button
                    key={pos.value}
                    onClick={() => updateConfig({ position: pos.value as any })}
                    className={cn(
                      'flex-1 py-2 text-xs font-bold rounded-lg transition-all',
                      captions.position === pos.value
                        ? 'bg-white dark:bg-zinc-800 text-foreground shadow-sm px-4'
                        : 'text-muted-foreground hover:text-foreground/70',
                    )}
                  >
                    {pos.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Timing */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Timer size={14} className="text-primary" />
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  Highlighting
                </label>
              </div>
              <div className="flex bg-zinc-100 dark:bg-zinc-900 rounded-xl p-1 border border-border shadow-inner">
                {TIMING_MODES.map((mode) => (
                  <button
                    key={mode.value}
                    onClick={() => updateConfig({ timing: mode.value as any })}
                    className={cn(
                      'flex-1 py-2 text-xs font-bold rounded-lg transition-all',
                      captions.timing === mode.value
                        ? 'bg-white dark:bg-zinc-800 text-foreground shadow-sm px-4'
                        : 'text-muted-foreground hover:text-foreground/70',
                    )}
                  >
                    {mode.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
