import React from 'react';
import { MediaSettingsProps } from './types';
import { Play, Mic, Globe } from 'lucide-react';
import { cn } from '@/lib/utils';
import { VoiceSelect } from '@/components/ui/select-enhanced-voice';
import { SelectEnhanced } from '@/components/ui/select-enhanced';
import { VOICES } from './voice-data';

export const NarrationSettings: React.FC<MediaSettingsProps> = ({ settings, onUpdate }) => {
  const selectedVoice = VOICES.find(v => v.value === settings.voiceId);

  const LANGUAGES = [
    { value: 'English (US)', label: 'English (US) 🇺🇸' },
    { value: 'Spanish', label: 'Spanish 🇪🇸' },
    { value: 'French', label: 'French 🇫🇷' },
    { value: 'German', label: 'German 🇩🇪' },
    { value: 'Japanese', label: 'Japanese 🇯🇵' },
  ];

  return (
    <div className="space-y-3">
      {/* Voice Card */}
      <div className="p-1 rounded-xl bg-card border border-border">
        <div className="flex items-center gap-3 p-3">
          <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center text-primary shrink-0">
            <Mic size={18} />
          </div>
          
          <div className="flex-1 min-w-0">
             <VoiceSelect
                value={settings.voiceId}
                onChange={(value) => onUpdate({ voiceId: value })}
                options={VOICES}
                className="border-none bg-transparent shadow-none"
                placeholder="Select Voice"
             />
          </div>

          <button 
            type="button" 
            className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground hover:bg-primary/90 transition-colors shadow-glow shrink-0"
            aria-label={`Preview ${selectedVoice?.name || 'voice'}`}
          >
            <Play size={14} fill="currentColor" />
          </button>
        </div>
        
        <div className="h-px bg-border mx-3" />

        {/* Language Selector */}
        <div className="flex items-center gap-3 p-3">
            <div className="h-10 w-10 flex items-center justify-center text-muted-foreground shrink-0">
                <Globe size={18} />
            </div>
            <div className="flex-1 min-w-0">
                <SelectEnhanced
                    value={settings.language}
                    onChange={(value) => onUpdate({ language: value })}
                    options={LANGUAGES}
                    className="border-none bg-transparent shadow-none"
                    placeholder="Select Language"
                />
            </div>
        </div>
      </div>
    </div>
  );
};
