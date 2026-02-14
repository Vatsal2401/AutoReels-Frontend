import React, { useState, useEffect, useRef } from 'react';
import { Mic, Globe, Square, Loader2, Volume2, Sparkles } from 'lucide-react';
import { VoiceSelectRadix, VoiceSelectOption } from '@/components/ui/voice-select-radix';
import { SelectRadix } from '@/components/ui/select-radix';
import { aiApi } from '@/lib/api/ai';
import { cn } from '@/lib/utils/format';
import { MediaSettingsProps } from './types';

export const NarrationSettings: React.FC<MediaSettingsProps> = ({
  settings,
  onUpdate,
}) => {
  const [voices, setVoices] = useState<VoiceSelectOption[]>([]);
  const [isLoadingVoices, setIsLoadingVoices] = useState(true);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [previewingId, setPreviewingId] = useState<string | null>(null);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const initialLoadDone = useRef(false);

  useEffect(() => {
    const fetchVoices = async () => {
      try {
        const data = await aiApi.getVoices();
        setVoices(data);
      } catch (error) {
        console.error('Failed to fetch voices from ElevenLabs', error);
      } finally {
        setIsLoadingVoices(false);
      }
    };
    fetchVoices();

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (isLoadingVoices || voices.length === 0 || initialLoadDone.current) return;

    const languageMeta = settings.language === 'Hindi' ? 'Hindi' : 'English';
    const forLang = voices.filter((v) => v.meta === languageMeta);
    const opts = forLang.length > 0 ? forLang : voices;
    const currentVoice = opts.find((v) => v.value === settings.voiceId);

    if (!currentVoice) {
      onUpdate({
        voiceId: opts[0].value,
        voiceLabel: opts[0].label,
      });
    } else if (!settings.voiceLabel) {
      onUpdate({ voiceLabel: currentVoice.label });
    }

    initialLoadDone.current = true;
  }, [voices, isLoadingVoices, settings.voiceId, settings.voiceLabel, settings.language, onUpdate]);

  const handlePreview = async () => {
    if (previewingId && audioRef.current) {
      audioRef.current.pause();
      setPreviewingId(null);
      return;
    }

    if (!settings.voiceId) return;

    try {
      setIsPreviewLoading(true);
      const audioBlob = await aiApi.getTTSPreview(settings.voiceId, settings.language || 'English (US)');
      const audioUrl = URL.createObjectURL(audioBlob);
      
      if (audioRef.current) {
        audioRef.current.pause();
      }

      const audio = new Audio(audioUrl);
      audioRef.current = audio;
      
      audio.onplay = () => setPreviewingId(settings.voiceId);
      audio.onended = () => {
        setPreviewingId(null);
        URL.revokeObjectURL(audioUrl);
      };
      audio.onerror = () => {
        setPreviewingId(null);
        setIsPreviewLoading(false);
        URL.revokeObjectURL(audioUrl);
      };

      await audio.play();
    } catch (error: any) {
      console.error('Failed to play preview:', error);
      let detailMsg = 'Failed to generate preview. Please try another voice.';
      if (error.response?.data instanceof Blob) {
        const text = await error.response.data.text();
        try {
          const parsed = JSON.parse(text);
          detailMsg = parsed.details || parsed.message || detailMsg;
        } catch (e) {
          detailMsg = text || detailMsg;
        }
      } else if (error.message) {
        detailMsg = error.message;
      }
      alert(detailMsg);
    } finally {
      setIsPreviewLoading(false);
    }
  };

  const LANGUAGES = [
    { value: 'English (US)', label: 'English (US) 🇺🇸' },
    { value: 'Hindi', label: 'Hindi 🇮🇳' },
    { value: 'Spanish', label: 'Spanish 🇪🇸' },
    { value: 'French', label: 'French 🇫🇷' },
    { value: 'German', label: 'German 🇩🇪' },
    { value: 'Japanese', label: 'Japanese 🇯🇵' },
  ];

  // Backend returns voices with meta "English" or "Hindi". Filter by selected language.
  const languageMeta = settings.language === 'Hindi' ? 'Hindi' : 'English';
  const voicesForLanguage = voices.filter((v) => v.meta === languageMeta);
  const voiceOptions = voicesForLanguage.length > 0 ? voicesForLanguage : voices;
  const selectedVoice = voiceOptions.find((v) => v.value === settings.voiceId);

  // When language changes, if current voice not in filtered list, switch to first for that language
  useEffect(() => {
    if (voices.length === 0 || !settings.voiceId) return;
    const meta = settings.language === 'Hindi' ? 'Hindi' : 'English';
    const forLang = voices.filter((v) => v.meta === meta);
    const opts = forLang.length > 0 ? forLang : voices;
    if (!opts.some((v) => v.value === settings.voiceId)) {
      onUpdate({ voiceId: opts[0].value, voiceLabel: opts[0].label });
    }
  }, [settings.language, settings.voiceId, voices, onUpdate]);

  return (
    <div className="space-y-4">
      <div className="relative flex flex-col rounded-xl border border-border bg-card shadow-sm overflow-hidden transition-all duration-200 hover:border-border-hover">
        <div className="p-4 px-5">
          <div className="flex items-center gap-4 mb-3">
            <div className="flex h-10 w-10 min-w-[40px] items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-900 text-foreground border border-border shrink-0">
              <Mic size={18} />
            </div>
            
            <div className="flex-1 min-w-0 flex flex-col justify-center">
              <h3 className="text-xs font-bold tracking-tight text-foreground uppercase">Voice</h3>
              <p className="text-[10px] font-medium text-muted-foreground truncate leading-tight mt-0.5">
                Synthetic high-fidelity narration
              </p>
            </div>

            {selectedVoice && !isLoadingVoices && (
              <button
                type="button"
                disabled={isPreviewLoading}
                onClick={handlePreview}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-3 py-1.5 text-[11px] font-bold transition-all duration-200 border shrink-0",
                  previewingId === settings.voiceId 
                    ? "bg-red-50 text-red-600 border-red-100 hover:bg-red-100 dark:bg-red-900/10 dark:border-red-900/20 shadow-sm"
                    : "bg-white dark:bg-zinc-900 border-border hover:border-border-hover hover:bg-zinc-50 dark:hover:bg-zinc-800 text-foreground shadow-sm"
                )}
              >
                {isPreviewLoading ? (
                  <Loader2 size={13} className="animate-spin text-muted-foreground" />
                ) : previewingId === settings.voiceId ? (
                  <Square size={11} fill="currentColor" />
                ) : (
                  <Volume2 size={13} className="text-muted-foreground" />
                )}
                <span>{previewingId === settings.voiceId ? 'Stop' : 'Listen'}</span>
              </button>
            )}
          </div>

          <div className="relative mt-1">
            <VoiceSelectRadix
              value={settings.voiceId}
              onChange={(v) => {
                const opt = voices.find(x => x.value === v);
                onUpdate({ voiceId: v, voiceLabel: opt?.label });
              }}
              options={voiceOptions}
              placeholder={isLoadingVoices ? "Loading..." : "Select a voice"}
              disabled={isLoadingVoices}
              className="z-50"
            />
            {isLoadingVoices && (
              <div className="absolute inset-x-0 bottom-[-2px] h-0.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                <div className="h-full bg-primary animate-pulse" />
              </div>
            )}
          </div>

          {selectedVoice && selectedVoice.description && (
            <div className="mt-3 flex animate-in fade-in slide-in-from-top-1 duration-300">
              <div className="flex items-start gap-3 p-2.5 rounded-lg bg-zinc-50/50 dark:bg-zinc-900/50 border border-border/50 w-full">
                <Sparkles size={13} className="text-primary/60 mt-0.5 shrink-0" />
                <p className="text-[10px] font-medium text-muted-foreground leading-relaxed">
                  {selectedVoice.label} is {selectedVoice.description.toLowerCase()}
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="h-px bg-border/40 mx-5" />

        <div className="p-4 px-5 bg-zinc-50/30 dark:bg-zinc-900/30">
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 min-w-[40px] items-center justify-center rounded-lg bg-background text-foreground border border-border shrink-0 shadow-sm">
              <Globe size={18} className="text-muted-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <SelectRadix
                value={settings.language}
                onChange={(v) => onUpdate({ language: v })}
                options={LANGUAGES}
                placeholder="Select language"
                className="bg-transparent border-transparent hover:border-border focus:ring-0 shadow-none px-0 h-8 font-bold text-xs"
              />
              <p className="text-[10px] font-medium text-muted-foreground/50 leading-tight truncate">
                The script will be translated and voiced accordingly.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
