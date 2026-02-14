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

export interface EditorPreviewControlsProps {
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
  previewFit: "contain" | "cover";
  onPreviewFitChange: (fit: "contain" | "cover") => void;
  showSafeArea: boolean;
  onShowSafeAreaChange: (show: boolean) => void;
}

const iconClass = "shrink-0";

/** Control bar for the preview stage — grouped, consistent height, clear labels. */
export function EditorPreviewControls({
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
  previewFit,
  onPreviewFitChange,
  showSafeArea,
  onShowSafeAreaChange,
}: EditorPreviewControlsProps) {
  const transitionClass = "transition-all duration-150 ease-out";

  return (
    <div
      className={cn(
        "w-full min-w-0 rounded-2xl px-2 py-1.5 flex items-center justify-center gap-2 flex-nowrap bg-white/95 border border-[#E5E7EB]/80 shadow-[0_1px_2px_rgba(0,0,0,0.04)] overflow-hidden",
        transitionClass
      )}
      role="toolbar"
      aria-label="Playback controls"
    >
      {/* Playback: play (pill + glow) + step pills */}
      <div className="flex items-center gap-1.5 shrink-0">
        <button
          type="button"
          onClickCapture={isPlaying ? onPause : onPlay}
          className={cn(
            "h-7 w-7 rounded-full flex items-center justify-center text-white shrink-0",
            transitionClass,
            isPlaying
              ? "bg-violet-500 hover:bg-violet-600 shadow-[0_0_0_1px_rgba(124,58,237,0.2),0_2px_8px_rgba(124,58,237,0.25)]"
              : "bg-violet-500 hover:bg-violet-600 hover:shadow-[0_0_0_1px_rgba(124,58,237,0.2),0_2px_10px_rgba(124,58,237,0.3)] shadow-[0_0_0_1px_rgba(124,58,237,0.15),0_2px_6px_rgba(124,58,237,0.2)]"
          )}
          aria-label={isPlaying ? "Pause" : "Play"}
        >
          {isPlaying ? (
            <svg className={cn(iconClass, "w-3.5 h-3.5")} fill="currentColor" viewBox="0 0 24 24">
              <rect x="6" y="5" width="4" height="14" rx="1" />
              <rect x="14" y="5" width="4" height="14" rx="1" />
            </svg>
          ) : (
            <svg className={cn(iconClass, "w-4 h-4 ml-0.5")} fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7L8 5z" />
            </svg>
          )}
        </button>
        <button
          type="button"
          onClick={() => onStepFrame(-1)}
          disabled={currentFrame <= 0}
          className={cn(
            "h-6 w-6 rounded-full flex items-center justify-center border border-[#E5E7EB] bg-[#FAFAFA] text-[#374151] hover:bg-white hover:border-[#D1D5DB] hover:shadow-sm disabled:opacity-40 disabled:cursor-not-allowed shrink-0",
            transitionClass
          )}
          aria-label="Previous frame"
        >
          <svg className={cn(iconClass, "w-3 h-3")} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <button
          type="button"
          onClick={() => onStepFrame(1)}
          disabled={currentFrame >= durationFrames - 1}
          className={cn(
            "h-6 w-6 rounded-full flex items-center justify-center border border-[#E5E7EB] bg-[#FAFAFA] text-[#374151] hover:bg-white hover:border-[#D1D5DB] hover:shadow-sm disabled:opacity-40 disabled:cursor-not-allowed shrink-0",
            transitionClass
          )}
          aria-label="Next frame"
        >
          <svg className={cn(iconClass, "w-3 h-3")} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      <div className="w-px h-5 bg-[#E5E7EB] shrink-0" aria-hidden />

      {/* Time: visible, fixed min width so layout is stable */}
      <span className="text-[11px] font-semibold tabular-nums text-[#111827] text-center shrink-0 min-w-[4rem]">
        {formatTime(currentFrame / REEL_FPS)} / {formatTime(durationFrames / REEL_FPS)}
      </span>

      <div className="w-px h-5 bg-[#E5E7EB] shrink-0" aria-hidden />

      {/* Speed: compact, max-width to prevent overflow */}
      <select
        value={playbackRate}
        onChange={(e) => onPlaybackRateChange(Number(e.target.value))}
        className={cn(
          "h-7 max-w-[3.5rem] rounded-full border border-[#E5E7EB] bg-[#FAFAFA] text-[#374151] text-[11px] font-medium pl-2 pr-5 cursor-pointer focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 shrink-0",
          transitionClass
        )}
        aria-label="Playback speed"
      >
        {PLAYBACK_RATES.map((r) => (
          <option key={r} value={r}>
            {r}×
          </option>
        ))}
      </select>

      <div className="w-px h-5 bg-[#E5E7EB] shrink-0" aria-hidden />

      {/* Loop + Fit/Fill + Safe: pill style, compact */}
      <div className="flex items-center gap-1.5 min-w-0 shrink">
        <button
          type="button"
          onClick={() => onLoopChange(!loop)}
          className={cn(
            "h-6 px-2 rounded-full text-[10px] font-medium border shrink-0",
            transitionClass,
            loop
              ? "bg-violet-500 text-white border-violet-500 hover:bg-violet-600"
              : "border-[#E5E7EB] bg-[#FAFAFA] text-[#6b7280] hover:bg-white hover:shadow-sm hover:border-[#D1D5DB]"
          )}
        >
          Loop
        </button>
        <div className="flex rounded-full overflow-hidden border border-[#E5E7EB] shrink-0">
          <button
            type="button"
            onClick={() => onPreviewFitChange("contain")}
            className={cn(
              "h-6 px-2 text-[10px] font-medium shrink-0",
              transitionClass,
              previewFit === "contain" ? "bg-violet-500 text-white" : "bg-[#FAFAFA] text-[#6b7280] hover:bg-white hover:shadow-sm"
            )}
          >
            Fit
          </button>
          <button
            type="button"
            onClick={() => onPreviewFitChange("cover")}
            className={cn(
              "h-6 px-2 text-[10px] font-medium shrink-0",
              transitionClass,
              previewFit === "cover" ? "bg-violet-500 text-white" : "bg-[#FAFAFA] text-[#6b7280] hover:bg-white hover:shadow-sm"
            )}
          >
            Fill
          </button>
        </div>
        <button
          type="button"
          onClick={() => onShowSafeAreaChange(!showSafeArea)}
          title="Safe area guides"
          className={cn(
            "h-6 px-1.5 rounded-full flex items-center gap-1 border shrink-0",
            transitionClass,
            showSafeArea ? "bg-violet-50 border-violet-200 text-violet-700" : "border-[#E5E7EB] bg-[#FAFAFA] text-[#6b7280] hover:bg-white hover:shadow-sm hover:border-[#D1D5DB]"
          )}
          aria-label="Toggle safe area guides"
        >
          <svg className={cn(iconClass, "w-3 h-3")} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 018.25 20.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
          </svg>
          <span className="text-[10px] font-medium hidden sm:inline">Safe</span>
        </button>
      </div>
    </div>
  );
}
