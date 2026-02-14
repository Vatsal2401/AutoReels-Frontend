"use client";

import React from "react";
import { cn } from "@/lib/utils/format";
import { REEL_FPS } from "@/lib/editor/types";

const PLAYBACK_RATES = [0.5, 1, 1.5, 2] as const;

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export interface EditorPreviewHoverControlsProps {
  isPlaying: boolean;
  onPlay: (e: React.MouseEvent) => void;
  onPause: () => void;
  onStepFrame: (delta: number) => void;
  currentFrame: number;
  durationFrames: number;
  playbackRate: number;
  onPlaybackRateChange: (rate: number) => void;
  loop: boolean;
  onLoopChange: (loop: boolean) => void;
  showSafeArea: boolean;
  onShowSafeAreaChange: (show: boolean) => void;
  /** Optional ref to the video container for fullscreen */
  containerRef?: React.RefObject<HTMLElement | null>;
}

const iconClass = "shrink-0";
const transition = "transition-all duration-200 ease-out";

/**
 * Compact hover overlay for video preview. Vimeo / Framer-style.
 * Width: fit-content, tight spacing, no stretch. Use with wrapper className "group".
 */
export function EditorPreviewHoverControls({
  isPlaying,
  onPlay,
  onPause,
  onStepFrame,
  currentFrame,
  durationFrames,
  playbackRate,
  onPlaybackRateChange,
  loop,
  onLoopChange,
  showSafeArea,
  onShowSafeAreaChange,
  containerRef,
}: EditorPreviewHoverControlsProps) {
  const handleFullscreen = () => {
    const el = containerRef?.current;
    if (el?.requestFullscreen) el.requestFullscreen();
  };

  return (
    <div
      className={cn(
        "absolute left-1/2 z-20",
        "flex items-center rounded-full shrink-0 w-fit min-w-0 overflow-x-auto",
        "backdrop-blur-md border",
        "opacity-0 pointer-events-none",
        "gap-2.5 px-5 py-2.5",
        "[transform:translate(-50%,6px)] group-hover:[transform:translate(-50%,0)] group-hover:opacity-100 group-hover:pointer-events-auto"
      )}
      style={{
        bottom: 20,
        maxWidth: "calc(100% - 32px)",
        background: "rgba(255,255,255,0.85)",
        borderColor: "rgba(0,0,0,0.06)",
        boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
        transition: "opacity 200ms ease, transform 200ms ease",
      }}
      role="toolbar"
      aria-label="Playback controls"
    >
      {/* Play — slightly bigger, strong purple */}
      <button
        type="button"
        onClickCapture={isPlaying ? onPause : onPlay}
        className={cn(
          "h-9 w-9 rounded-full flex items-center justify-center bg-violet-500 text-white shrink-0",
          "hover:bg-violet-600 hover:scale-105 active:scale-95",
          transition
        )}
        aria-label={isPlaying ? "Pause" : "Play"}
        title={isPlaying ? "Pause" : "Play"}
      >
        {isPlaying ? (
          <svg className={cn(iconClass, "w-4 h-4")} fill="currentColor" viewBox="0 0 24 24">
            <rect x="6" y="5" width="4" height="14" rx="1" />
            <rect x="14" y="5" width="4" height="14" rx="1" />
          </svg>
        ) : (
          <svg className={cn(iconClass, "w-4 h-4 ml-0.5")} fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7L8 5z" />
          </svg>
        )}
      </button>

      {/* Prev | Next */}
      <button
        type="button"
        onClick={() => onStepFrame(-1)}
        disabled={currentFrame <= 0}
        className={cn(
          "h-7 w-7 rounded-full flex items-center justify-center text-[#374151] shrink-0",
          "bg-transparent hover:bg-black/5 disabled:opacity-40 disabled:cursor-not-allowed",
          transition
        )}
        aria-label="Previous frame"
        title="Previous frame"
      >
        <svg className={cn(iconClass, "w-3.5 h-3.5")} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <button
        type="button"
        onClick={() => onStepFrame(1)}
        disabled={currentFrame >= durationFrames - 1}
        className={cn(
          "h-7 w-7 rounded-full flex items-center justify-center text-[#374151] shrink-0",
          "bg-transparent hover:bg-black/5 disabled:opacity-40 disabled:cursor-not-allowed",
          transition
        )}
        aria-label="Next frame"
        title="Next frame"
      >
        <svg className={cn(iconClass, "w-3.5 h-3.5")} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* Time */}
      <span
        className="text-[10px] font-medium tabular-nums text-[#374151] shrink-0"
        style={{ opacity: 0.85 }}
      >
        {formatTime(currentFrame / REEL_FPS)} / {formatTime(durationFrames / REEL_FPS)}
      </span>

      {/* Speed — compact dropdown */}
      <div className="relative shrink-0">
        <select
          value={playbackRate}
          onChange={(e) => onPlaybackRateChange(Number(e.target.value))}
          className={cn(
            "h-6 w-12 rounded-md text-[10px] font-medium text-[#374151] cursor-pointer",
            "pl-1.5 pr-5 py-0 appearance-none",
            "bg-black/5 border border-transparent hover:bg-black/[0.07]",
            "focus:outline-none focus:ring-1 focus:ring-violet-500/30 focus:border-violet-500/20",
            transition
          )}
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236b7280' stroke-width='2'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`,
            backgroundRepeat: "no-repeat",
            backgroundPosition: "right 2px center",
            backgroundSize: "14px",
          }}
          aria-label="Playback speed"
        >
          {PLAYBACK_RATES.map((r) => (
            <option key={r} value={r}>
              {r}×
            </option>
          ))}
        </select>
      </div>

      {/* Loop */}
      <button
        type="button"
        onClick={() => onLoopChange(!loop)}
        className={cn(
          "h-6 px-2.5 rounded-full text-[10px] font-medium shrink-0",
          transition,
          loop
            ? "bg-violet-500 text-white hover:bg-violet-600"
            : "bg-transparent text-[#6b7280] hover:bg-black/5"
        )}
        title="Loop"
      >
        Loop
      </button>

      {/* Icons — 8px gap, circular ghost, fully contained */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          type="button"
          onClick={() => onShowSafeAreaChange(!showSafeArea)}
          title="Safe area guides"
          className={cn(
            "h-8 w-8 rounded-full flex items-center justify-center shrink-0 overflow-hidden",
            transition,
            showSafeArea ? "text-violet-600 bg-violet-100/80" : "text-[#6b7280] bg-transparent hover:bg-black/5"
          )}
          aria-label="Toggle safe area guides"
        >
          <svg className={cn(iconClass, "w-3.5 h-3.5")} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 018.25 20.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
          </svg>
        </button>
        <button
          type="button"
          onClick={handleFullscreen}
          className={cn(
            "h-8 w-8 rounded-full flex items-center justify-center text-[#6b7280] shrink-0 overflow-hidden",
            "bg-transparent hover:bg-black/5",
            transition
          )}
          aria-label="Fullscreen"
        >
          <svg className={cn(iconClass, "w-3.5 h-3.5 flex-shrink-0")} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m5 5v-4m0 4h-4m4 0l-5-5" />
          </svg>
        </button>
      </div>
    </div>
  );
}
