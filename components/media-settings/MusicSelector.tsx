import React, { useState, useEffect, useRef } from 'react';
import {
  Music,
  Play,
  Pause,
  Upload,
  Check,
  Loader2,
  Volume2,
  X,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils/format';
import { MediaSettingsProps } from './types';
import apiClient from '@/lib/api/client';

interface BackgroundMusic {
  id: string;
  name: string;
  category: string;
  url: string;
}

export const MusicSelector: React.FC<MediaSettingsProps> = ({ settings, onUpdate }) => {
  const [musicTracks, setMusicTracks] = useState<BackgroundMusic[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [lastActiveId, setLastActiveId] = useState<string | null>(null);
  const [lastVolume, setLastVolume] = useState(0.5);

  useEffect(() => {
    fetchMusic();
  }, []);

  useEffect(() => {
    if (settings.music?.id) {
      setLastActiveId(settings.music.id);
    }
    if (settings.music?.volume !== undefined) {
      setLastVolume(settings.music.volume);
    }
  }, [settings.music?.id, settings.music?.volume]);

  const fetchMusic = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/music/system');
      setMusicTracks(res.data);
    } catch (error) {
      console.error('Failed to fetch music:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePlay = (track: BackgroundMusic) => {
    if (playingId === track.id) {
      audioRef.current?.pause();
      setPlayingId(null);
    } else {
      if (audioRef.current) {
        audioRef.current.src = track.url;
        audioRef.current.play();
        setPlayingId(track.id);
      }
    }
  };

  const handleSelect = (track: BackgroundMusic | null) => {
    onUpdate({
      music: track
        ? {
            id: track.id,
            url: track.url,
            name: track.name,
            volume: settings.music?.volume ?? lastVolume,
          }
        : undefined,
    });
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('file', file);
      formData.append('name', file.name.replace(/\.[^/.]+$/, ''));

      const res = await apiClient.post('/music/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setMusicTracks((prev) => [res.data, ...prev]);
      handleSelect(res.data);
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleToggle = () => {
    if (settings.music) {
      onUpdate({ music: undefined });
    } else {
      const trackToSelect = musicTracks.find((t) => t.id === lastActiveId) || musicTracks[0];
      if (trackToSelect) {
        handleSelect(trackToSelect);
      }
    }
  };

  const currentMusicId = settings.music?.id;
  const isEnabled = !!settings.music;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-border/40 pb-3 px-1">
        <div className="flex items-center gap-3">
          <div className="w-1.5 h-1.5 rounded-full bg-[#ec4899]" />
          <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60">
            Background Atmosphere
          </h3>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <input
              type="file"
              id="music-upload"
              className="hidden"
              accept="audio/*"
              onChange={handleUpload}
              disabled={uploading}
            />
            <button
              onClick={() => document.getElementById('music-upload')?.click()}
              className={cn(
                'flex items-center gap-2 rounded-full px-4 py-1.5 text-[10px] font-bold transition-all border',
                'bg-zinc-100 dark:bg-zinc-900 text-foreground border-border hover:border-primary/50',
              )}
            >
              {uploading ? <Loader2 size={12} className="animate-spin" /> : <Upload size={12} />}
              UPLOAD CUSTOM
            </button>
          </div>

          <button
            onClick={handleToggle}
            className={cn(
              'flex items-center gap-2 rounded-full px-5 py-2 text-[11px] font-bold transition-all border',
              isEnabled
                ? 'bg-[#fdf2f8] text-[#ec4899] border-[#fbcfe8] shadow-sm dark:bg-[#ec4899]/10 dark:border-[#ec4899]/20'
                : 'bg-muted text-muted-foreground border-border',
            )}
          >
            {isEnabled ? (
              <>
                <CheckCircle2 size={14} fill="currentColor" className="text-[#ec4899]" />
                <span className="text-[#ec4899]">Enabled</span>
              </>
            ) : (
              <>
                <XCircle size={14} />
                Disabled
              </>
            )}
          </button>
        </div>
      </div>

      {isEnabled && (
        <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="relative group/music">
            <div
              className="flex items-center gap-4 overflow-x-auto pb-4 pt-2 px-1 snap-x mandatory no-scrollbar -mx-1"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {loading
                ? Array.from({ length: 4 }).map((_, i) => (
                    <div
                      key={i}
                      className="shrink-0 w-28 h-24 rounded-2xl bg-muted animate-pulse"
                    />
                  ))
                : musicTracks.map((track) => (
                    <div key={track.id} className="relative shrink-0 snap-start">
                      <button
                        onClick={() => handleSelect(track)}
                        className={cn(
                          'group relative w-32 h-24 rounded-2xl overflow-hidden transition-all duration-300 border flex flex-col p-3 text-left',
                          currentMusicId === track.id
                            ? 'border-[#ec4899] ring-4 ring-[#ec4899]/10 shadow-xl scale-[1.05] z-10 bg-white dark:bg-zinc-800'
                            : 'border-border/40 opacity-70 hover:opacity-100 bg-zinc-50 dark:bg-zinc-900 grayscale-[0.2] hover:grayscale-0',
                        )}
                      >
                        <div className="flex justify-between items-start w-full">
                          <span className="text-[8px] font-bold uppercase tracking-wider text-[#ec4899] bg-[#ec4899]/10 px-1.5 py-0.5 rounded">
                            {track.category || 'Custom'}
                          </span>
                          {currentMusicId === track.id && (
                            <div className="bg-[#ec4899] text-white rounded-full p-0.5 shadow-lg border border-white/20">
                              <Check size={8} strokeWidth={5} />
                            </div>
                          )}
                        </div>

                        <div className="mt-auto">
                          <span
                            className={cn(
                              'text-[10px] font-black uppercase tracking-tight block truncate mb-1',
                              currentMusicId === track.id
                                ? 'text-foreground'
                                : 'text-muted-foreground',
                            )}
                          >
                            {track.name}
                          </span>
                        </div>
                      </button>

                      {/* Play/Pause Float Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleTogglePlay(track);
                        }}
                        className={cn(
                          'absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center transition-all bg-white dark:bg-zinc-800 shadow-md border border-border z-20',
                          playingId === track.id
                            ? 'bg-[#ec4899] text-white'
                            : 'text-muted-foreground hover:text-foreground',
                        )}
                      >
                        {playingId === track.id ? (
                          <Pause size={12} fill="currentColor" />
                        ) : (
                          <Play size={12} fill="currentColor" />
                        )}
                      </button>
                    </div>
                  ))}
            </div>
          </div>

          <audio ref={audioRef} onEnded={() => setPlayingId(null)} className="hidden" />

          {settings.music && (
            <div className="flex items-center gap-4 px-2 py-3 bg-zinc-50 dark:bg-zinc-900/50 rounded-xl border border-border/50 animate-in fade-in slide-in-from-top-2">
              <Volume2 size={14} className="text-[#ec4899]" />
              <div className="flex-1 flex flex-col gap-1.5">
                <div className="flex justify-between text-[9px] font-bold uppercase tracking-wider">
                  <span className="text-muted-foreground">Original Background Volume</span>
                  <span className="text-foreground">
                    {Math.round((settings.music.volume ?? 0.5) * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={settings.music.volume ?? 0.5}
                  onChange={(e) =>
                    onUpdate({ music: { ...settings.music!, volume: parseFloat(e.target.value) } })
                  }
                  className="w-full h-1 bg-zinc-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-[#ec4899]"
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
