'use client';

import React, { useState } from 'react';
import { MediaSettings, AspectRatio, Duration } from './types';
import { VisualStyle } from './styles';
import { VisualStyleSelector } from './VisualStyleSelector';
import { FormatSelector } from './FormatSelector';
import { NarrationSettings } from './NarrationSettings';
import { DurationSelector } from './DurationSelector';
import { CaptionSettings } from './CaptionSettings';
import { ChevronDown, ChevronUp, Settings2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export const MediaSettingsPanel: React.FC = () => {
  // Default State
  const [settings, setSettings] = useState<MediaSettings>({
    visualStyleId: 'cinematic',
    aspectRatio: '9:16',
    voiceId: '21m00Tcm4TlvDq8ikWAM', // Rachel
    language: 'English (US)',
    duration: 'Short',
    imageProvider: 'gemini',
    advancedOptions: {
      styleStrength: 'medium',
      lighting: 'none',
      colorTone: 'none',
      cameraFraming: 'none',
    },
    captions: {
      enabled: true,
      preset: 'bold-stroke',
      position: 'bottom',
      timing: 'word',
    },
  });

  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);

  const handleUpdate = (updates: Partial<MediaSettings>) => {
    setSettings((prev) => ({ ...prev, ...updates }));
    console.log('Settings Updated:', { ...settings, ...updates });
  };

  return (
    <div className="w-full max-w-md mx-auto bg-card text-card-foreground rounded-2xl shadow-xl overflow-hidden border border-border">
      {/* Header */}
      <div className="p-4 border-b border-border flex items-center justify-between bg-zinc-900/50 backdrop-blur-sm">
        <h2 className="text-lg font-semibold tracking-tight">Create New Media</h2>
        {/* Close button placeholder */}
        <button className="h-8 w-8 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors">
          <span className="sr-only">Close</span>
          <svg
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M9 3L3 9"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M3 3L9 9"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>

      <div className="p-4 space-y-6 max-h-[80vh] overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-700">
        {/* Visual Style Section */}
        <section>
          <VisualStyleSelector settings={settings} onUpdate={handleUpdate} />
        </section>

        {/* Format Section */}
        <section>
          <FormatSelector settings={settings} onUpdate={handleUpdate} />
        </section>

        {/* Narration Section */}
        <section>
          <NarrationSettings settings={settings} onUpdate={handleUpdate} />
        </section>

        {/* Caption Section */}
        <section>
          <CaptionSettings settings={settings} onUpdate={handleUpdate} />
        </section>

        {/* Duration Section */}
        <section>
          <DurationSelector settings={settings} onUpdate={handleUpdate} />
        </section>

        {/* Advanced Settings */}
        <section className="pt-2 border-t border-border">
          <button
            onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
            className="flex items-center justify-between w-full p-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors group"
          >
            <div className="flex items-center gap-2">
              <Settings2 size={16} />
              <span>Advanced Settings</span>
            </div>
            {isAdvancedOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>

          {isAdvancedOpen && (
            <div className="p-3 mt-2 space-y-3 bg-secondary/30 rounded-lg text-xs animate-in slide-in-from-top-2 fade-in">
              <div className="flex flex-col gap-1">
                <label className="text-muted-foreground">Negative Prompt</label>
                <input
                  type="text"
                  placeholder="blur, low quality, distortion"
                  className="bg-background border border-border rounded p-1.5 focus:ring-1 focus:ring-primary outline-none"
                />
              </div>
            </div>
          )}
        </section>
      </div>

      {/* Footer Action */}
      <div className="p-4 border-t border-border bg-zinc-900/50 backdrop-blur-sm">
        <button className="w-full py-3 bg-primary text-primary-foreground font-semibold rounded-xl shadow-glow hover:bg-primary/90 transition-all active:scale-[0.98]">
          Generate Media
        </button>
      </div>
    </div>
  );
};
