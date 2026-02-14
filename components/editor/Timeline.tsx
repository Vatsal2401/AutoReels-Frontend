"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils/format";
import type { Project, EditorScene } from "@/lib/editor/types";
import {
  getProjectDurationFrames,
  REEL_FPS,
} from "@/lib/editor/types";
import { getCaptionCues } from "@/lib/editor/captionTiming";
import { useEditorStore } from "@/lib/editor/editor-store";
import { useSrtCaptions } from "@/lib/hooks/useSrtCaptions";

const PIXELS_PER_SECOND_MIN = 15;
const PIXELS_PER_SECOND_MAX = 120;
const PIXELS_PER_SECOND_DEFAULT_SHORT = 82; // videos under 60s
const PIXELS_PER_SECOND_DEFAULT_LONG = 45;
const VIDEO_TRACK_HEIGHT = 64;
const AUDIO_TRACK_HEIGHT = 48; // single row for voiceover + music
const CAPTION_TRACK_HEIGHT = 64;
const RULER_HEIGHT = 36;
const LABEL_WIDTH = 100;
const SNAP_THRESHOLD_PX = 6;
const MIN_DURATION_FRAMES = REEL_FPS; // 1 second
const CAPTION_BLOCK_GAP_PX = 2;
const PLAYHEAD_WIDTH_PX = 2;
const CAPTION_DISPLAY_MAX_LEN = 55;
const TRACK_GAP_PX = 0;

function frameToPx(frame: number, pixelsPerFrame: number): number {
  return Math.round(frame * pixelsPerFrame);
}

function pxToFrame(px: number, pixelsPerFrame: number): number {
  return Math.round(px / pixelsPerFrame);
}

/** Format frame as time string (e.g. 0:00, 0:07, 1:23). */
function formatTimeFromFrame(frame: number): string {
  const sec = Math.floor(frame / REEL_FPS);
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

/** Snap frame to nearest second boundary. */
function snapToSecond(frame: number): number {
  return Math.round(frame / REEL_FPS) * REEL_FPS;
}

/** Find snap target: nearest second or nearest clip edge within threshold (px). Returns snapped frame or null. */
function snapFrame(
  frame: number,
  pixelsPerFrame: number,
  durationFrames: number,
  edges: { start: number; end: number }[]
): number {
  const framePx = frame * pixelsPerFrame;
  const thresholdFrames = Math.ceil(SNAP_THRESHOLD_PX / pixelsPerFrame);
  let best = frame;
  let bestDist = Infinity;

  const candidates: number[] = [
    0,
    durationFrames,
    snapToSecond(frame),
    ...edges.flatMap((e) => [e.start, e.end]),
  ];
  const unique = [...new Set(candidates)].filter((f) => f >= 0 && f <= durationFrames);

  for (const target of unique) {
    const dist = Math.abs(target - frame);
    if (dist <= thresholdFrames && dist < bestDist) {
      bestDist = dist;
      best = target;
    }
  }
  return Math.max(0, Math.min(best, durationFrames));
}

// ----- Time Ruler -----
function TimeRuler({
  durationFrames,
  pixelsPerFrame,
  currentFrame,
  onSeek,
  timelineWidth,
}: {
  durationFrames: number;
  pixelsPerFrame: number;
  currentFrame: number;
  onSeek: (frame: number) => void;
  timelineWidth: number;
}) {
  const rulerRef = useRef<HTMLDivElement>(null);
  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const el = rulerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const frame = pxToFrame(x, pixelsPerFrame);
      onSeek(Math.max(0, Math.min(frame, durationFrames)));
    },
    [pixelsPerFrame, durationFrames, onSeek]
  );

  /** One tick per second (0:00, 0:01, 0:02, ...). */
  const ticks = useMemo(() => {
    const step = REEL_FPS;
    const list: number[] = [];
    for (let f = 0; f <= durationFrames; f += step) list.push(f);
    return list;
  }, [durationFrames]);

  return (
    <div
      ref={rulerRef}
      role="slider"
      aria-label="Timeline ruler - click to seek"
      aria-valuenow={currentFrame}
      aria-valuemin={0}
      aria-valuemax={durationFrames}
      tabIndex={0}
      className="relative shrink-0 flex flex-col justify-end border-b border-[#E5E7EB] bg-[#F1F3F5] cursor-pointer select-none"
      style={{ width: timelineWidth, minWidth: "100%", height: RULER_HEIGHT }}
      onClick={handleClick}
    >
      {ticks.map((frame) => (
        <div
          key={frame}
          className="absolute bottom-0 flex flex-col items-center"
          style={{ left: frameToPx(frame, pixelsPerFrame) }}
        >
          <div className="w-px bg-[#d1d5db]" style={{ height: 6 }} />
          <span className="text-[9px] font-medium text-[#6b7280] tabular-nums mt-0.5">
            {formatTimeFromFrame(frame)}
          </span>
        </div>
      ))}
    </div>
  );
}

// ----- Playhead (draggable for scrubbing) -----
function Playhead({
  currentFrame,
  pixelsPerFrame,
  trackAreaHeight,
  durationFrames,
  onSeek,
}: {
  currentFrame: number;
  pixelsPerFrame: number;
  trackAreaHeight: number;
  durationFrames: number;
  onSeek: (frame: number) => void;
}) {
  const [dragging, setDragging] = useState(false);
  const dragStartX = useRef(0);
  const dragStartFrame = useRef(0);

  const left = frameToPx(currentFrame, pixelsPerFrame);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault();
      e.currentTarget.setPointerCapture(e.pointerId);
      setDragging(true);
      dragStartX.current = e.clientX;
      dragStartFrame.current = currentFrame;
    },
    [currentFrame]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragging) return;
      const deltaPx = e.clientX - dragStartX.current;
      const deltaFrame = pxToFrame(deltaPx, pixelsPerFrame);
      const newFrame = Math.max(0, Math.min(durationFrames, dragStartFrame.current + deltaFrame));
      onSeek(Math.floor(newFrame));
    },
    [dragging, pixelsPerFrame, durationFrames, onSeek]
  );

  const handlePointerUp = useCallback(
    (e: React.PointerEvent) => {
      e.currentTarget.releasePointerCapture(e.pointerId);
      setDragging(false);
    },
    []
  );

  return (
    <>
      {/* Visible line: 2px purple, triangle at top, faint shadow */}
      <div
        className="absolute top-0 z-10 pointer-events-none"
        style={{
          left: left - Math.floor(PLAYHEAD_WIDTH_PX / 2),
          width: PLAYHEAD_WIDTH_PX,
          height: RULER_HEIGHT + trackAreaHeight,
          boxShadow: "0 1px 3px rgba(124, 58, 237, 0.25), 0 0 0 1px rgba(124, 58, 237, 0.15)",
          background: "linear-gradient(to bottom, #6d28d9 0%, #7c3aed 10px, #8b5cf6 100%)",
          borderRadius: 1,
        }}
      >
        <div
          className="absolute left-1/2 -translate-x-1/2 w-0 h-0 border-l-[5px] border-r-[5px] border-b-[6px] border-l-transparent border-r-transparent"
          style={{ borderBottomColor: "#6d28d9", top: -1, filter: "drop-shadow(0 1px 1px rgba(0,0,0,0.1))" }}
        />
      </div>
      {/* Draggable hit area for scrubbing */}
      <div
        role="slider"
        aria-label="Playhead - drag to scrub"
        aria-valuenow={currentFrame}
        className="absolute top-0 z-20 cursor-ew-resize"
        style={{
          left: left - 8,
          width: 16,
          height: RULER_HEIGHT + trackAreaHeight,
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      />
    </>
  );
}

// ----- Video track (scenes) -----
const VideoTrackRow = React.memo(function VideoTrackRow({
  scenes,
  pixelsPerFrame,
  timelineWidth,
  durationFrames,
  currentFrame,
  selectedSceneId,
  onSelectScene,
  onUpdateFrames,
  onSeek,
}: {
  scenes: EditorScene[];
  pixelsPerFrame: number;
  timelineWidth: number;
  durationFrames: number;
  currentFrame: number;
  selectedSceneId: string | null;
  onSelectScene: (id: string) => void;
  onUpdateFrames: (sceneId: string, startFrame: number, durationInFrames: number) => void;
  onSeek: (frame: number) => void;
}) {
  const [dragging, setDragging] = useState<string | null>(null);
  const [resizing, setResizing] = useState<string | null>(null);
  const [snapGuide, setSnapGuide] = useState<number | null>(null);
  const dragStartX = useRef(0);
  const dragStartFrame = useRef(0);

  const handleClipPointerDown = useCallback(
    (e: React.PointerEvent, scene: EditorScene) => {
      if ((e.target as HTMLElement).dataset.resize === "true") return;
      e.currentTarget.setPointerCapture(e.pointerId);
      setDragging(scene.id);
      dragStartX.current = e.clientX;
      dragStartFrame.current = scene.startFrame;
    },
    []
  );

  const handleClipPointerMove = useCallback(
    (e: React.PointerEvent, scene: EditorScene) => {
      if (dragging !== scene.id) return;
      const deltaPx = e.clientX - dragStartX.current;
      const rawStart = dragStartFrame.current + pxToFrame(deltaPx, pixelsPerFrame);
      const otherEdges = scenes
        .filter((s) => s.id !== scene.id)
        .map((s) => ({ start: s.startFrame, end: s.startFrame + s.durationInFrames }));
      const clamped = Math.max(0, Math.min(rawStart, durationFrames - MIN_DURATION_FRAMES));
      const snapped = snapFrame(clamped, pixelsPerFrame, durationFrames, otherEdges);
      setSnapGuide(snapped !== clamped ? snapped : null);
      const newStart = Math.max(0, Math.min(snapped, durationFrames - MIN_DURATION_FRAMES));
      const newDuration = Math.max(
        MIN_DURATION_FRAMES,
        scene.startFrame + scene.durationInFrames - newStart
      );
      onUpdateFrames(scene.id, newStart, newDuration);
      onSeek(newStart);
    },
    [dragging, pixelsPerFrame, durationFrames, scenes, onUpdateFrames, onSeek]
  );

  const handleClipPointerUp = useCallback(
    (e: React.PointerEvent, scene: EditorScene) => {
      e.currentTarget.releasePointerCapture(e.pointerId);
      if (dragging === scene.id) setDragging(null);
      if (resizing === scene.id) setResizing(null);
      setSnapGuide(null);
    },
    [dragging, resizing]
  );

  const handleResizePointerDown = useCallback((e: React.PointerEvent, scene: EditorScene) => {
    e.stopPropagation();
    e.currentTarget.setPointerCapture(e.pointerId);
    setResizing(scene.id);
    dragStartX.current = e.clientX;
    dragStartFrame.current = scene.durationInFrames;
  }, []);

  const handleResizePointerMove = useCallback(
    (e: React.PointerEvent, scene: EditorScene) => {
      if (resizing !== scene.id) return;
      const deltaPx = e.clientX - dragStartX.current;
      const rawDuration = dragStartFrame.current + pxToFrame(deltaPx, pixelsPerFrame);
      const maxDuration = durationFrames - scene.startFrame;
      let newDuration = Math.max(MIN_DURATION_FRAMES, Math.min(rawDuration, maxDuration));
      const snappedToSecond = snapToSecond(newDuration);
      if (Math.abs(snappedToSecond - newDuration) * pixelsPerFrame <= SNAP_THRESHOLD_PX) {
        newDuration = Math.max(MIN_DURATION_FRAMES, Math.min(snappedToSecond, maxDuration));
      }
      onUpdateFrames(scene.id, scene.startFrame, newDuration);
      onSeek(scene.startFrame + newDuration - 1);
    },
    [resizing, pixelsPerFrame, durationFrames, onUpdateFrames, onSeek]
  );

  return (
    <div
      className="border-b border-[#E5E7EB] bg-[#E2E6EB]"
      style={{ height: VIDEO_TRACK_HEIGHT, width: timelineWidth, marginBottom: TRACK_GAP_PX }}
    >
      {snapGuide !== null && (
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-violet-400/60 z-[5] pointer-events-none"
          style={{ left: frameToPx(snapGuide, pixelsPerFrame) }}
        />
      )}
      <div className="relative w-full h-full">
        {scenes.map((scene, index) => {
          const sceneEnd = scene.startFrame + scene.durationInFrames;
          const isActive =
            currentFrame >= scene.startFrame && currentFrame < sceneEnd;
          return (
          <div
            key={scene.id}
            className={cn(
              "absolute top-1 bottom-1 rounded-lg overflow-hidden border cursor-grab active:cursor-grabbing",
              "transition-all duration-150 shadow-sm border-[#e5e7eb]",
              "hover:shadow-md hover:brightness-[1.02] hover:border-violet-300",
              selectedSceneId === scene.id
                ? "border-violet-500 ring-2 ring-violet-400/25 shadow-md"
                : "hover:border-violet-300",
              isActive && "ring-2 ring-violet-400/30 border-violet-400 shadow-md"
            )}
            style={{
              left: frameToPx(scene.startFrame, pixelsPerFrame),
              width: Math.max(48, frameToPx(scene.durationInFrames, pixelsPerFrame)),
              height: VIDEO_TRACK_HEIGHT - 8,
            }}
            onPointerDown={(e) => handleClipPointerDown(e, scene)}
            onPointerMove={(e) => {
              handleClipPointerMove(e, scene);
              if (resizing === scene.id) handleResizePointerMove(e, scene);
            }}
            onPointerUp={(e) => handleClipPointerUp(e, scene)}
            onPointerLeave={(e) => {
              if (dragging === scene.id || resizing === scene.id) handleClipPointerUp(e, scene);
            }}
            onClick={() => onSelectScene(scene.id)}
          >
            {scene.imageUrl ? (
              <Image
                src={scene.imageUrl}
                alt=""
                fill
                className="object-cover pointer-events-none"
                unoptimized
                sizes="120px"
              />
            ) : (
              <div className="w-full h-full bg-muted flex items-center justify-center text-[10px] text-muted-foreground">
                Scene {index + 1}
              </div>
            )}
            <div
              data-resize="true"
              className="absolute right-0 top-0 bottom-0 w-2 cursor-ew-resize bg-violet-400/20 hover:bg-violet-400/40 rounded-r shrink-0"
              onPointerDown={(e) => handleResizePointerDown(e, scene)}
            />
          </div>
        );})}
      </div>
    </div>
  );
});

// ----- Single Audio track (voiceover + music combined; waveform when either is present) -----
const AudioTrackRow = React.memo(function AudioTrackRow({
  hasAudio,
  hasMusic,
  durationFrames,
  pixelsPerFrame,
  timelineWidth,
}: {
  hasAudio: boolean;
  hasMusic: boolean;
  durationFrames: number;
  pixelsPerFrame: number;
  timelineWidth: number;
}) {
  const width = frameToPx(durationFrames, pixelsPerFrame);
  const barCount = Math.min(48, Math.max(12, Math.floor(width / 12)));
  const hasAny = hasAudio || hasMusic;
  return (
    <div
      className="border-b border-[#E5E7EB] bg-[#F1F3F5] relative"
      style={{ height: AUDIO_TRACK_HEIGHT, width: timelineWidth, marginBottom: TRACK_GAP_PX }}
    >
      {hasAny ? (
        <div
          className="absolute top-2 bottom-2 left-0 rounded flex items-end justify-start gap-px overflow-hidden"
          style={{ width: Math.max(60, width - 8), left: 4 }}
        >
          {Array.from({ length: barCount }).map((_, i) => (
            <div
              key={i}
              className={cn(
                "flex-1 min-w-0 rounded-sm",
                hasAudio ? "bg-emerald-500/60" : "bg-amber-500/50"
              )}
              style={{
                height: hasAudio
                  ? `${30 + Math.sin(i * 0.5) * 20 + (i % 3) * 10}%`
                  : `${28 + Math.sin(i * 0.4) * 18 + (i % 4) * 8}%`,
              }}
            />
          ))}
        </div>
      ) : (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-[11px] text-muted-foreground">No audio</span>
        </div>
      )}
    </div>
  );
});

/** One caption block for timeline (from SRT or derived from scenes). */
export type CaptionBlock = {
  startFrame: number;
  durationInFrames: number;
  text: string;
  index: number;
};

// ----- Captions track (draggable segments; from SRT or scene text) -----
const CaptionsTrackRow = React.memo(function CaptionsTrackRow({
  items: baseItems,
  pixelsPerFrame,
  timelineWidth,
  durationFrames,
  currentFrame,
  onSeek,
}: {
  items: CaptionBlock[];
  pixelsPerFrame: number;
  timelineWidth: number;
  durationFrames: number;
  currentFrame: number;
  onSeek?: (frame: number) => void;
}) {
  const [overrideStarts, setOverrideStarts] = useState<Record<number, number>>({});
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const dragStartX = useRef(0);
  const dragStartFrame = useRef(0);

  useEffect(() => {
    setOverrideStarts({});
  }, [baseItems.length]);

  const items = useMemo(
    () =>
      baseItems.map((item) => ({
        ...item,
        startFrame: overrideStarts[item.index] ?? item.startFrame,
      })),
    [baseItems, overrideStarts]
  );

  const handlePointerDown = useCallback((e: React.PointerEvent, item: { index: number; startFrame: number }) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    setDragIndex(item.index);
    dragStartX.current = e.clientX;
    dragStartFrame.current = item.startFrame;
  }, []);

  const handlePointerMove = useCallback(
    (e: React.PointerEvent, item: { index: number; durationInFrames: number }) => {
      if (dragIndex !== item.index) return;
      const deltaPx = e.clientX - dragStartX.current;
      const deltaFrame = pxToFrame(deltaPx, pixelsPerFrame);
      const rawStart = dragStartFrame.current + deltaFrame;
      const snapped = snapToSecond(Math.max(0, Math.min(rawStart, durationFrames - item.durationInFrames)));
      setOverrideStarts((prev) => ({ ...prev, [item.index]: snapped }));
      onSeek?.(snapped);
    },
    [dragIndex, pixelsPerFrame, durationFrames, onSeek]
  );

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    e.currentTarget.releasePointerCapture(e.pointerId);
    setDragIndex(null);
  }, []);

  const displayText = (text: string) =>
    text.length > CAPTION_DISPLAY_MAX_LEN
      ? `${text.slice(0, CAPTION_DISPLAY_MAX_LEN).trim()}…`
      : text;

  if (baseItems.length === 0) {
    return (
    <div
      className="border-b border-[#E5E7EB] bg-[#EDE9FE] relative flex items-center justify-center"
      style={{ height: CAPTION_TRACK_HEIGHT, width: timelineWidth }}
    >
      <span className="text-[11px] text-[#6b7280]">No captions</span>
    </div>
    );
  }

  return (
    <div
      className="border-b border-[#E5E7EB] bg-[#EDE9FE] relative"
      style={{ height: CAPTION_TRACK_HEIGHT, width: timelineWidth }}
    >
      {items.map((item) => {
        const blockStart = item.startFrame;
        const blockEnd = item.startFrame + item.durationInFrames;
        const isActive =
          currentFrame >= blockStart && currentFrame < blockEnd;
        const left = frameToPx(item.startFrame, pixelsPerFrame);
        const width = Math.max(
          32,
          frameToPx(item.durationInFrames, pixelsPerFrame) - CAPTION_BLOCK_GAP_PX
        );
        return (
          <div
            key={item.index}
            className={cn(
              "absolute top-1.5 bottom-1.5 left-0 rounded-[6px] border px-2.5 py-1.5 flex items-center overflow-hidden cursor-grab active:cursor-grabbing transition-all duration-150",
              "bg-white border-[#E5E7EB] text-[#374151] hover:border-violet-300 hover:shadow-sm",
              isActive && "ring-2 ring-violet-500/50 border-violet-500 shadow-sm bg-white"
            )}
            style={{
              left,
              width,
              height: CAPTION_TRACK_HEIGHT - 12,
            }}
            onPointerDown={(e) => handlePointerDown(e, item)}
            onPointerMove={(e) => handlePointerMove(e, item)}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
          >
            <span
              className="text-[11px] font-medium text-[#1f2937] pointer-events-none block min-w-0 text-left leading-snug line-clamp-2 break-words"
              style={{
                overflow: "hidden",
                maskImage: "linear-gradient(to right, black 0%, black 85%, transparent 100%)",
                WebkitMaskImage: "linear-gradient(to right, black 0%, black 85%, transparent 100%)",
              }}
            >
              {displayText(item.text)}
            </span>
          </div>
        );
      })}
    </div>
  );
});

const PLAYBACK_RATES = [0.5, 1, 1.5, 2] as const;

// ----- Main Timeline -----
export interface TimelineProps {
  project: Project;
  onSeek: (frame: number) => void;
  selectedSceneId: string | null;
  onSelectScene: (id: string) => void;
  onUpdateSceneFrames: (sceneId: string, startFrame: number, durationInFrames: number) => void;
  onReorderScenes: (fromIndex: number, toIndex: number) => void;
  /** When provided, playback controls are rendered in the timeline header row */
  playback?: {
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
  };
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function Timeline({
  project,
  onSeek,
  selectedSceneId,
  onSelectScene,
  onUpdateSceneFrames,
  onReorderScenes,
  playback,
}: TimelineProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const currentFrame = useEditorStore((s) => s.currentFrame);
  const durationFrames = useMemo(
    () => getProjectDurationFrames(project),
    [project]
  );
  const defaultZoom =
    durationFrames < 60 * REEL_FPS ? PIXELS_PER_SECOND_DEFAULT_SHORT : PIXELS_PER_SECOND_DEFAULT_LONG;
  const [pixelsPerSecond, setPixelsPerSecond] = useState(defaultZoom);
  useEffect(() => {
    setPixelsPerSecond(
      durationFrames < 60 * REEL_FPS ? PIXELS_PER_SECOND_DEFAULT_SHORT : PIXELS_PER_SECOND_DEFAULT_LONG
    );
  }, [project?.id, durationFrames]);
  const pixelsPerFrame = pixelsPerSecond / REEL_FPS;
  const timelineWidth = Math.max(400, frameToPx(durationFrames, pixelsPerFrame));

  const { cues } = useSrtCaptions(project.captionUrl ?? null);

  // Caption blocks from shared timing: startFrame + durationInFrames; positioning = left/width from pixelsPerFrame.
  const captionItems = useMemo((): CaptionBlock[] => {
    const captionCues = getCaptionCues(project, cues);
    return captionCues.map((c) => {
      const startFrame = Math.max(0, Math.min(Math.round(c.startSeconds * REEL_FPS), durationFrames - 1));
      const rawDuration = Math.round((c.endSeconds - c.startSeconds) * REEL_FPS);
      const durationInFrames = Math.max(1, Math.min(rawDuration, durationFrames - startFrame));
      return { startFrame, durationInFrames, text: c.text, index: c.index };
    });
  }, [project, cues, durationFrames]);

  const hasAudio = !!project.audio?.url;
  const hasMusic = !!project.musicUrl;

  const trackAreaHeight =
    VIDEO_TRACK_HEIGHT + AUDIO_TRACK_HEIGHT + CAPTION_TRACK_HEIGHT;

  const zoomIn = useCallback(() => {
    setPixelsPerSecond((p) => Math.min(PIXELS_PER_SECOND_MAX, p + 10));
  }, []);
  const zoomOut = useCallback(() => {
    setPixelsPerSecond((p) => Math.max(PIXELS_PER_SECOND_MIN, p - 10));
  }, []);

  const handleRulerSeek = useCallback(
    (frame: number) => {
      const snapped = snapFrame(frame, pixelsPerFrame, durationFrames, []);
      onSeek(Math.max(0, Math.min(snapped, durationFrames)));
    },
    [pixelsPerFrame, durationFrames, onSeek]
  );

  const trackGapsTotal = 2 * TRACK_GAP_PX;
  const bodyHeight = RULER_HEIGHT + trackAreaHeight + trackGapsTotal;

  return (
    <div className="flex flex-col items-stretch overflow-hidden bg-transparent h-full min-h-0">
      <div className="shrink-0 flex items-center justify-between gap-2 px-2 h-9 border-b border-[#E5E7EB] bg-[#F9FAFB] flex-wrap" style={{ minHeight: 36 }}>
        {/* Left: Timeline label (and playback when provided) */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Timeline
          </span>
        {playback ? (
          <div className="flex items-center gap-2 flex-wrap flex-1 justify-center min-w-0">
            <button
              type="button"
              onClickCapture={playback.isPlaying ? playback.onPause : playback.onPlay}
              className="h-8 w-8 rounded-full flex items-center justify-center bg-violet-500 hover:bg-violet-600 text-white transition-colors shrink-0 shadow-sm"
              aria-label={playback.isPlaying ? "Pause" : "Play"}
            >
              {playback.isPlaying ? (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <rect x="6" y="5" width="4" height="14" rx="1" />
                  <rect x="14" y="5" width="4" height="14" rx="1" />
                </svg>
              ) : (
                <svg className="w-4 h-4 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7L8 5z" />
                </svg>
              )}
            </button>
            <button
              type="button"
              onClick={() => playback.onStepFrame(-1)}
              disabled={playback.currentFrame <= 0}
              className="h-7 w-7 rounded border border-[#e0e2e6] bg-white text-[#374151] hover:bg-[#f8f9fa] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center"
              aria-label="Previous frame"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => playback.onStepFrame(1)}
              disabled={playback.currentFrame >= playback.durationFrames - 1}
              className="h-7 w-7 rounded border border-[#e0e2e6] bg-white text-[#374151] hover:bg-[#f8f9fa] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center"
              aria-label="Next frame"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
            <span className="text-[11px] tabular-nums text-[#374151] min-w-[3.5rem]">
              {formatTime(playback.currentFrame / REEL_FPS)} / {formatTime(playback.durationFrames / REEL_FPS)}
            </span>
            <select
              value={playback.playbackRate}
              onChange={(e) => playback.onPlaybackRateChange(Number(e.target.value))}
              className="h-7 rounded border border-[#e0e2e6] bg-white text-[#374151] text-[11px] px-2 cursor-pointer focus:outline-none focus:ring-1 focus:ring-violet-500/30"
              aria-label="Playback speed"
            >
              {PLAYBACK_RATES.map((r) => (
                <option key={r} value={r}>{r}×</option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => playback.onLoopChange(!playback.loop)}
              className={cn(
                "h-7 px-2 rounded text-[11px] font-medium border",
                playback.loop ? "bg-violet-500 text-white border-violet-500" : "bg-white border-[#e0e2e6] text-[#6b7280] hover:bg-[#f8f9fa]"
              )}
            >
              Loop
            </button>
            <div className="flex rounded overflow-hidden border border-[#e0e2e6]">
              <button
                type="button"
                onClick={() => playback.onPreviewFitChange("contain")}
                className={cn(
                  "h-7 px-1.5 text-[10px] font-medium",
                  playback.previewFit === "contain" ? "bg-violet-500 text-white" : "bg-white text-[#6b7280] hover:bg-[#f8f9fa]"
                )}
              >
                Fit
              </button>
              <button
                type="button"
                onClick={() => playback.onPreviewFitChange("cover")}
                className={cn(
                  "h-7 px-1.5 text-[10px] font-medium",
                  playback.previewFit === "cover" ? "bg-violet-500 text-white" : "bg-white text-[#6b7280] hover:bg-[#f8f9fa]"
                )}
              >
                Fill
              </button>
            </div>
            <button
              type="button"
              onClick={() => playback.onShowSafeAreaChange(!playback.showSafeArea)}
              className={cn(
                "h-7 w-7 rounded border flex items-center justify-center",
                playback.showSafeArea ? "bg-[#e5e7eb] border-[#d1d5db]" : "bg-white border-[#e0e2e6] text-[#6b7280] hover:bg-[#f8f9fa]"
              )}
              aria-label="Safe area grid"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v14a1 1 0 01-1 1H5a1 1 0 01-1-1V5z" />
              </svg>
            </button>
          </div>
        ) : null}
        </div>
        {/* Right: zoom controls + timer, tight spacing */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={zoomOut}
            disabled={pixelsPerSecond <= PIXELS_PER_SECOND_MIN}
            className="h-6 w-6 rounded border border-[#e5e7eb] bg-white text-[10px] font-bold text-muted-foreground hover:bg-[#e5e7eb] disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Zoom out"
          >
            −
          </button>
          <span className="text-[10px] text-muted-foreground tabular-nums w-7 text-center">
            {Math.round(pixelsPerSecond)}px/s
          </span>
          <button
            type="button"
            onClick={zoomIn}
            disabled={pixelsPerSecond >= PIXELS_PER_SECOND_MAX}
            className="h-6 w-6 rounded border border-[#e5e7eb] bg-white text-[10px] font-bold text-muted-foreground hover:bg-[#e5e7eb] disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Zoom in"
          >
            +
          </button>
          <span
            className="text-[11px] font-medium tabular-nums text-violet-700 bg-violet-100 px-2 py-0.5 rounded ml-0.5"
            aria-label="Current time"
          >
            {formatTimeFromFrame(currentFrame)}
          </span>
        </div>
      </div>
      <div className="shrink-0 flex overflow-hidden" style={{ height: bodyHeight }}>
        {/* Fixed label column */}
        <div
          className="shrink-0 flex flex-col border-r border-[#E5E7EB] bg-[#F9FAFB]"
          style={{ width: LABEL_WIDTH }}
        >
          <div className="shrink-0 border-b border-[#e0e2e6]" style={{ height: RULER_HEIGHT }} />
          <div
            className="shrink-0 flex items-center px-2 border-b border-[#e5e7eb]"
            style={{ height: VIDEO_TRACK_HEIGHT, marginBottom: TRACK_GAP_PX }}
          >
            <span className="text-[11px] font-medium text-muted-foreground">Video</span>
          </div>
          <div
            className="shrink-0 flex items-center px-2 border-b border-[#e0e2e6]"
            style={{ height: AUDIO_TRACK_HEIGHT, marginBottom: TRACK_GAP_PX }}
          >
            <span className="text-[11px] font-medium text-muted-foreground">Audio</span>
          </div>
          <div
            className="shrink-0 flex items-center px-2 border-b border-[#e0e2e6]"
            style={{ height: CAPTION_TRACK_HEIGHT }}
          >
            <span className="text-[11px] font-medium text-muted-foreground">Captions</span>
          </div>
        </div>
        {/* Scrollable timeline content */}
        <div ref={scrollRef} className="flex-1 min-w-0 overflow-x-auto overflow-y-hidden">
          <div className="relative shrink-0" style={{ width: timelineWidth }}>
            <Playhead
              currentFrame={currentFrame}
              pixelsPerFrame={pixelsPerFrame}
              trackAreaHeight={trackAreaHeight}
              durationFrames={durationFrames}
              onSeek={(f) => onSeek(Math.max(0, Math.min(f, durationFrames)))}
            />
            <TimeRuler
              durationFrames={durationFrames}
              pixelsPerFrame={pixelsPerFrame}
              currentFrame={currentFrame}
              onSeek={handleRulerSeek}
              timelineWidth={timelineWidth}
            />
            <VideoTrackRow
              scenes={project.scenes}
              pixelsPerFrame={pixelsPerFrame}
              timelineWidth={timelineWidth}
              durationFrames={durationFrames}
              currentFrame={currentFrame}
              selectedSceneId={selectedSceneId}
              onSelectScene={onSelectScene}
              onUpdateFrames={onUpdateSceneFrames}
              onSeek={onSeek}
            />
            <AudioTrackRow
              hasAudio={hasAudio}
              hasMusic={hasMusic}
              durationFrames={durationFrames}
              pixelsPerFrame={pixelsPerFrame}
              timelineWidth={timelineWidth}
            />
            <CaptionsTrackRow
              items={captionItems}
              pixelsPerFrame={pixelsPerFrame}
              timelineWidth={timelineWidth}
              durationFrames={durationFrames}
              currentFrame={currentFrame}
              onSeek={onSeek}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
