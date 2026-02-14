"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { cn } from "@/lib/utils/format";
import type { Project } from "@/lib/editor/types";
import { REEL_FPS, getProjectDurationFrames, getCompositionDimensions, getAspectRatioCss } from "@/lib/editor/types";
import { EditorPreviewProvider, type SrtCueLike } from "@/lib/editor/editor-preview-context";
import { useEditorStore } from "@/lib/editor/editor-store";
import type { PlayerRef } from "@remotion/player";
import { useSrtCaptions } from "@/lib/hooks/useSrtCaptions";

const ReelComposition = dynamic(
  () =>
    import("@/app/(dashboard)/editor/remotion/ReelComposition").then(
      (mod) => mod.ReelComposition
    ),
  { ssr: false }
);

/** Wrapper so we can pass ref via prop (next/dynamic does not forward refs to the inner Player). */
const RemotionPlayerWrapper = dynamic(
  () =>
    import("@remotion/player").then((mod) => {
      const Player = mod.Player;
      return function Wrapper({
        forwardedRef,
        ...playerProps
      }: {
        forwardedRef: React.RefObject<PlayerRef | null>;
        component: React.ComponentType<unknown>;
        inputProps: unknown;
        durationInFrames: number;
        fps: number;
        compositionWidth: number;
        compositionHeight: number;
        style: React.CSSProperties;
        controls: boolean;
        loop: boolean;
        numberOfSharedAudioTags: number;
        playbackRate: number;
        initiallyMuted: boolean;
        initialFrame: number;
        clickToPlay?: boolean;
      }) {
        return <Player ref={forwardedRef as React.RefObject<PlayerRef>} {...playerProps} />;
      };
    }),
  { ssr: false }
);

const PLAYBACK_RATES = [0.5, 1, 1.5, 2] as const;

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export interface RemotionPreviewProps {
  project: Project;
  className?: string;
  /** Called when the player reports a new frame (playback). */
  onFrameUpdate: (frame: number) => void;
  /** When set, seek the player to this frame then clear. */
  seekToFrame: number | null;
  /** Clear seek request after seeking. */
  onClearSeek: () => void;
  /** When provided, playback is controlled by parent (e.g. timeline); control bar is hidden. */
  playerRef?: React.RefObject<PlayerRef | null>;
  onPlayingChange?: (playing: boolean) => void;
  playbackRate?: number;
  loop?: boolean;
  previewFit?: "contain" | "cover";
  showSafeArea?: boolean;
}

export function RemotionPreview({
  project,
  className = "",
  onFrameUpdate,
  seekToFrame,
  onClearSeek,
  playerRef: externalPlayerRef,
  onPlayingChange,
  playbackRate: externalPlaybackRate = 1,
  loop: externalLoop = true,
  previewFit: externalPreviewFit = "contain",
  showSafeArea: externalShowSafeArea = false,
}: RemotionPreviewProps) {
  const internalPlayerRef = useRef<PlayerRef>(null);
  const playerRef = externalPlayerRef ?? internalPlayerRef;
  const durationInFrames = getProjectDurationFrames(project);
  const { cues: srtCues } = useSrtCaptions(project.captionUrl ?? null);
  const currentFrame = useEditorStore((s) => s.currentFrame);

  const controlledByParent = onPlayingChange != null;
  const [internalPlaying, setInternalPlaying] = useState(false);
  const [internalPlaybackRate, setInternalPlaybackRate] = useState(1);
  const [internalLoop, setInternalLoop] = useState(true);
  const [internalShowSafeArea, setInternalShowSafeArea] = useState(false);
  const [internalPreviewFit, setInternalPreviewFit] = useState<"contain" | "cover">("contain");

  const setPlaying = controlledByParent ? onPlayingChange! : setInternalPlaying;
  const playbackRate = controlledByParent ? externalPlaybackRate : internalPlaybackRate;
  const loop = controlledByParent ? externalLoop : internalLoop;
  const showSafeArea = controlledByParent ? externalShowSafeArea : internalShowSafeArea;
  const previewFit = controlledByParent ? externalPreviewFit : internalPreviewFit;
  const setPlaybackRateState = controlledByParent ? () => {} : (r: number) => setInternalPlaybackRate(r);
  const setLoop = controlledByParent ? () => {} : (l: boolean) => setInternalLoop(l);
  const setPreviewFit = controlledByParent ? () => {} : (f: "contain" | "cover") => setInternalPreviewFit(f);
  const setShowSafeArea = controlledByParent ? () => {} : (s: boolean) => setInternalShowSafeArea(s);

  const ratio = project.meta.ratio;
  const compositionDimensions = useMemo(() => getCompositionDimensions(ratio), [ratio]);

  const stableInitialFrame = 0;

  const seekToFrameRef = useRef(seekToFrame);
  seekToFrameRef.current = seekToFrame;
  useEffect(() => {
    if (seekToFrame === null) return;
    const frame = Math.max(0, Math.min(seekToFrame, durationInFrames - 1));
    const apply = () => {
      if (seekToFrameRef.current === null) return;
      const player = playerRef.current;
      if (player && typeof player.seekTo === "function") {
        player.seekTo(frame);
        onClearSeek();
        return true;
      }
      return false;
    };
    if (apply()) return;
    const id = setInterval(() => {
      if (apply()) clearInterval(id);
    }, 50);
    return () => clearInterval(id);
  }, [seekToFrame, durationInFrames, onClearSeek]);

  const onFrameUpdateRef = useRef(onFrameUpdate);
  onFrameUpdateRef.current = onFrameUpdate;

  useEffect(() => {
    const intervalMs = 200;
    let lastFrame = -1;
    const id = setInterval(() => {
      const player = playerRef.current;
      if (!player || typeof player.getCurrentFrame !== "function") return;
      const frame = Math.max(0, Math.floor(player.getCurrentFrame()));
      if (frame !== lastFrame) {
        lastFrame = frame;
        onFrameUpdateRef.current(frame);
      }
    }, intervalMs);
    return () => clearInterval(id);
  }, []);

  // Sync isPlaying with player events (e.g. timeline seek, end of video)
  useEffect(() => {
    let cancelled = false;
    const onPlay = () => { if (!cancelled) setPlaying(true); };
    const onPause = () => { if (!cancelled) setPlaying(false); };
    const onEnded = () => { if (!loop && !cancelled) setPlaying(false); };
    const id = setTimeout(() => {
      const p = playerRef.current;
      if (p && typeof p.addEventListener === "function") {
        p.addEventListener("play", onPlay);
        p.addEventListener("pause", onPause);
        p.addEventListener("ended", onEnded);
      }
    }, 150);
    return () => {
      cancelled = true;
      clearTimeout(id);
      const p = playerRef.current;
      if (p && typeof p.removeEventListener === "function") {
        p.removeEventListener("play", onPlay);
        p.removeEventListener("pause", onPause);
        p.removeEventListener("ended", onEnded);
      }
    };
  }, [loop, setPlaying]);

  const togglePlay = useCallback(
    (e: React.MouseEvent) => {
      const player = playerRef.current;
      if (!player) return;
      const playing = controlledByParent ? undefined : internalPlaying;
      if (playing) {
        setPlaying(false);
        player.pause();
      } else {
        setPlaying(true);
        player.play(e as unknown as React.SyntheticEvent<Element, Event>);
      }
    },
    [controlledByParent, internalPlaying, setPlaying]
  );

  const stepFrame = useCallback(
    (delta: number) => {
      const player = playerRef.current;
      if (!player) return;
      const next = Math.max(0, Math.min(durationInFrames - 1, currentFrame + delta));
      player.seekTo(next);
      onFrameUpdate(next);
    },
    [currentFrame, durationInFrames, onFrameUpdate]
  );

  const setPlaybackRate = useCallback((rate: number) => {
    setPlaybackRateState(rate);
  }, []);

  const inputProps = useMemo(
    () => ({
      project,
      srtCues: srtCues ?? [],
      musicUrl: project.musicUrl ?? null,
      width: compositionDimensions.width,
      height: compositionDimensions.height,
    }),
    [project, srtCues, compositionDimensions]
  );

  const timeSeconds = currentFrame / REEL_FPS;
  const durationSeconds = durationInFrames / REEL_FPS;

  const aspectRatioCss = getAspectRatioCss(ratio);

  const providerProps = { project, srtCues: srtCues ?? [] };
  function renderContent() {
    return (
      <>
        {/* Preview video only: shadow on this card; no wrapper border */}
        <div
        className={cn(
          "relative w-full flex-shrink-0 overflow-hidden rounded-xl max-h-[75vh]",
          "bg-[#F3F4F6]",
          className
        )}
        style={{ aspectRatio: aspectRatioCss, boxShadow: "0 4px 24px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.04)" }}
      >
        <div className="absolute inset-0 overflow-hidden bg-[#F3F4F6] rounded-xl">
          <RemotionPlayerWrapper
            key={`preview-${project?.id ?? "default"}-${ratio}`}
            forwardedRef={playerRef}
            component={ReelComposition as React.ComponentType<unknown>}
            inputProps={inputProps}
            durationInFrames={durationInFrames}
            fps={REEL_FPS}
            compositionWidth={compositionDimensions.width}
            compositionHeight={compositionDimensions.height}
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              display: "block",
              objectFit: previewFit,
              objectPosition: "center",
            }}
            controls={false}
            clickToPlay={false}
            loop={loop}
            numberOfSharedAudioTags={2}
            playbackRate={playbackRate}
            initiallyMuted={false}
            initialFrame={stableInitialFrame}
          />
          {/* Safe area grid overlay (optional) */}
          {showSafeArea && (
            <div
              className="absolute inset-0 pointer-events-none z-[5] flex items-center justify-center"
              aria-hidden
            >
              <div className="w-[90%] h-[90%] border border-[#9ca3af]/40 rounded-sm grid grid-cols-2 grid-rows-2">
                {[0, 1, 2, 3].map((i) => (
                  <div key={i} className="border border-[#9ca3af]/25" />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

        {/* Control bar: only when playback is not controlled by parent (e.g. timeline) */}
        {!controlledByParent && (
        <div
          className="shrink-0 w-full border-t border-[#e8eaed] bg-[#f7f8fa] px-3 py-2.5 rounded-b-2xl"
          role="toolbar"
          aria-label="Playback controls"
        >
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClickCapture={togglePlay}
              className="h-9 w-9 rounded-full flex items-center justify-center bg-violet-500 hover:bg-violet-600 text-white transition-colors shrink-0 shadow-sm"
              aria-label={internalPlaying ? "Pause" : "Play"}
              title={internalPlaying ? "Pause" : "Play"}
            >
              {internalPlaying ? (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <rect x="6" y="5" width="4" height="14" rx="1" />
                  <rect x="14" y="5" width="4" height="14" rx="1" />
                </svg>
              ) : (
                <svg className="w-5 h-5 ml-0.5" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <path d="M8 5v14l11-7L8 5z" />
                </svg>
              )}
            </button>

            {/* Frame step back / forward */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => stepFrame(-1)}
                disabled={currentFrame <= 0}
                className="h-8 w-8 rounded-md flex items-center justify-center bg-white border border-[#e0e2e6] text-[#374151] hover:bg-[#f8f9fa] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                aria-label="Previous frame"
                title="Previous frame"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => stepFrame(1)}
                disabled={currentFrame >= durationInFrames - 1}
                className="h-8 w-8 rounded-md flex items-center justify-center bg-white border border-[#e0e2e6] text-[#374151] hover:bg-[#f8f9fa] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                aria-label="Next frame"
                title="Next frame"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            {/* Current time / total duration */}
            <div className="flex items-center gap-1.5 min-w-0 flex-1 justify-center">
              <span className="text-[12px] font-medium tabular-nums text-[#374151]">
                {formatTime(timeSeconds)}
              </span>
              <span className="text-[#9ca3af]">/</span>
              <span className="text-[12px] tabular-nums text-[#6b7280]">
                {formatTime(durationSeconds)}
              </span>
            </div>

            {/* Playback speed */}
            <select
              value={playbackRate}
              onChange={(e) => setPlaybackRate(Number(e.target.value))}
              className="h-8 rounded-md border border-[#e0e2e6] bg-white text-[#374151] text-[11px] font-medium px-2.5 cursor-pointer focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400"
              aria-label="Playback speed"
              title="Playback speed"
            >
              {PLAYBACK_RATES.map((r) => (
                <option key={r} value={r}>
                  {r}×
                </option>
              ))}
            </select>

            {/* Loop toggle — purple when on (primary) */}
            <button
              type="button"
              onClick={() => setLoop(!loop)}
              className={cn(
                "h-8 px-2.5 rounded-md text-[11px] font-medium transition-colors border",
                loop
                  ? "bg-violet-500 text-white border-violet-500 hover:bg-violet-600"
                  : "bg-white border-[#e0e2e6] text-[#6b7280] hover:bg-[#f8f9fa]"
              )}
              aria-label={loop ? "Loop on" : "Loop off"}
              title={loop ? "Loop on" : "Loop off"}
            >
              Loop
            </button>

            {/* Safe area grid (optional) */}
            <button
              type="button"
              onClick={() => setShowSafeArea(!showSafeArea)}
              className={cn(
                "h-8 w-8 rounded-md flex items-center justify-center transition-colors border",
                showSafeArea
                  ? "bg-[#e5e7eb] text-[#374151] border-[#d1d5db]"
                  : "bg-white border-[#e0e2e6] text-[#6b7280] hover:bg-[#f8f9fa]"
              )}
              aria-label={showSafeArea ? "Hide safe area" : "Show safe area"}
              title="Safe area grid"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v14a1 1 0 01-1 1H5a1 1 0 01-1-1V5z" />
              </svg>
            </button>
          </div>
        </div>
        )}
      </>
    );
  }
  const Provider = EditorPreviewProvider as React.ComponentType<{ project: Project; srtCues: SrtCueLike[]; children?: React.ReactNode }>;
  return React.createElement("div", { style: { display: "contents" } },
    React.createElement(Provider, providerProps, renderContent())
  );
}
