"use client";

import { useState, useRef, useEffect } from "react";
import { 
  Loader2, 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize, 
  RotateCcw,
  Settings2
} from "lucide-react";
import { cn } from "@/lib/utils/format";

interface VideoPlayerProps {
  videoUrl: string;
  title?: string;
  className?: string;
}

export function VideoPlayer({ videoUrl, title, className }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const [isHovering, setIsHovering] = useState(false);

  // Auto-hide controls after inactivity
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (isPlaying && isHovering) {
      setShowControls(true);
      timeout = setTimeout(() => {
        if (!isHovering) setShowControls(false);
      }, 3000);
    } else if (!isPlaying) {
      setShowControls(true);
    }
    return () => clearTimeout(timeout);
  }, [isPlaying, isHovering]);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const current = videoRef.current.currentTime;
    const total = videoRef.current.duration;
    setCurrentTime(current);
    setProgress((current / total) * 100);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!videoRef.current) return;
    const seekTime = (Number(e.target.value) / 100) * duration;
    videoRef.current.currentTime = seekTime;
    setProgress(Number(e.target.value));
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      containerRef.current.requestFullscreen();
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  return (
    <div 
      ref={containerRef}
      className={cn(
        "relative w-full h-full bg-zinc-950 flex items-center justify-center overflow-hidden group select-none", 
        className
      )}
      onMouseEnter={() => { setIsHovering(true); setShowControls(true); }}
      onMouseLeave={() => { setIsHovering(false); if (isPlaying) setShowControls(false); }}
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        src={videoUrl}
        className="max-h-full max-w-full object-contain cursor-pointer"
        playsInline
        onClick={togglePlay}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={() => setDuration(videoRef.current?.duration || 0)}
        onLoadedData={() => setIsLoading(false)}
        onEnded={() => setIsPlaying(false)}
        onError={() => {
          setIsLoading(false);
          setHasError(true);
        }}
      />

      {/* Loading State */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-[2px] z-50">
          <Loader2 className="h-8 w-8 animate-spin text-white/50" />
        </div>
      )}

      {/* Error State */}
      {hasError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-900 z-50 p-6 text-center">
          <RotateCcw className="h-8 w-8 text-zinc-500 mb-4" />
          <p className="text-zinc-400 text-sm font-medium">Failed to load media</p>
        </div>
      )}

      {/* Play Overlay (Big Center Button on Pause) */}
      {!isPlaying && !isLoading && !hasError && (
        <div 
          className="absolute inset-0 flex items-center justify-center bg-black/10 transition-colors duration-300 cursor-pointer z-30"
          onClick={togglePlay}
        >
          <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center scale-100 hover:scale-110 transition-transform shadow-2xl">
            <Play className="h-6 w-6 text-white fill-current translate-x-0.5" />
          </div>
        </div>
      )}

      {/* Custom Controls UI */}
      <div 
        className={cn(
          "absolute inset-x-0 bottom-4 z-40 px-4 transition-all duration-300 ease-in-out transform",
          showControls ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0 pointer-events-none"
        )}
      >
        <div className="max-w-4xl mx-auto">
          <div className="relative flex flex-col bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md rounded-xl border border-black/[0.08] dark:border-white/10 shadow-xl overflow-hidden">
            {/* Integrated Progress Bar (Top edge) */}
            <div className="group/progress absolute top-0 inset-x-0 h-[3px] bg-transparent z-20">
              {/* Background Track */}
              <div className="absolute inset-0 bg-zinc-200 dark:bg-white/10 transition-all group-hover/progress:h-1" />
              {/* Active Progress */}
              <div 
                className="absolute inset-y-0 left-0 bg-primary transition-all duration-100 group-hover/progress:h-1" 
                style={{ width: `${progress}%` }} 
              />
              {/* Seek Input */}
              <input
                type="range"
                min="0"
                max="100"
                step="0.1"
                value={progress}
                onChange={handleSeek}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-30"
              />
            </div>

            {/* Controls Row (Compact 44px) */}
            <div className="flex items-center justify-between gap-4 h-11 px-3 pt-[3px]">
              <div className="flex items-center gap-1 sm:gap-2">
                {/* Play/Pause */}
                <button 
                  onClick={togglePlay}
                  className="p-1.5 text-zinc-900 dark:text-white hover:bg-black/[0.04] dark:hover:bg-white/[0.04] transition-colors rounded-lg"
                >
                  {isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" />}
                </button>

                {/* Time Display */}
                <div className="flex items-center gap-1 px-1">
                  <span className="text-[11px] font-bold text-zinc-900 dark:text-white tabular-nums">
                    {formatTime(currentTime)}
                  </span>
                  <span className="text-[11px] text-zinc-400 dark:text-white/30">/</span>
                  <span className="text-[11px] font-medium text-zinc-500 dark:text-white/50 tabular-nums">
                    {formatTime(duration)}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1">
                {/* Mute/Volume */}
                <button 
                  onClick={toggleMute}
                  className="p-1.5 text-zinc-900 dark:text-white hover:bg-black/[0.04] dark:hover:bg-white/[0.04] transition-colors rounded-lg"
                >
                  {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                </button>

                {/* Extra Settings */}
                <button className="hidden sm:block p-1.5 text-zinc-400 dark:text-white/40 hover:text-zinc-900 dark:hover:text-white transition-colors rounded-lg hover:bg-black/[0.04] dark:hover:bg-white/[0.04]">
                  <Settings2 size={18} />
                </button>

                {/* Toggle Fullscreen */}
                <button 
                  onClick={toggleFullscreen}
                  className="p-1.5 text-zinc-900 dark:text-white hover:bg-black/[0.04] dark:hover:bg-white/[0.04] transition-colors rounded-lg"
                >
                  <Maximize size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Title Overlay (Top Left) - Refined */}
      {showControls && title && (
        <div className="absolute top-0 inset-x-0 p-4 bg-gradient-to-b from-black/20 to-transparent z-40 pointer-events-none">
          <div className="max-w-[70%] bg-black/40 backdrop-blur-sm border border-white/10 rounded-lg px-3 py-1.5">
            <h3 className="text-white text-[11px] font-bold tracking-tight truncate leading-tight">
              {title}
            </h3>
          </div>
        </div>
      )}
    </div>
  );
}
