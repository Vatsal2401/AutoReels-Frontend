/**
 * JSON-driven project model for the in-app video editor.
 * Extensible for future multi-track system.
 */

export type AspectRatio = "9:16" | "1:1" | "16:9" | "4:5";
export type SceneAnimation = "zoom" | "fade" | "slide";

/** Composition dimensions at 1080px on the longer side (or width for landscape). */
export function getCompositionDimensions(ratio: AspectRatio): { width: number; height: number } {
  switch (ratio) {
    case "9:16":
      return { width: 1080, height: 1920 };
    case "16:9":
      return { width: 1920, height: 1080 };
    case "1:1":
      return { width: 1080, height: 1080 };
    case "4:5":
      return { width: 864, height: 1080 };
    default:
      return { width: 1080, height: 1920 };
  }
}

/** CSS aspect-ratio value from project ratio (e.g. "9/16", "16/9"). */
export function getAspectRatioCss(ratio: AspectRatio): string {
  switch (ratio) {
    case "9:16":
      return "9/16";
    case "16:9":
      return "16/9";
    case "1:1":
      return "1/1";
    case "4:5":
      return "4/5";
    default:
      return "9/16";
  }
}

/** Max width (px) for preview container by aspect ratio — keeps 9:16 narrow, 16:9 wide. */
export function getPreviewMaxWidth(ratio: AspectRatio): number {
  switch (ratio) {
    case "9:16":
      return 460;
    case "16:9":
      return 900;
    case "1:1":
      return 520;
    case "4:5":
      return 460;
    default:
      return 420;
  }
}

export interface ProjectMeta {
  title: string;
  duration: number; // seconds
  fps: number;
  ratio: AspectRatio;
}

export interface EditorScene {
  id: string;
  imageUrl: string;
  text: string;
  startFrame: number;
  durationInFrames: number;
  animation: SceneAnimation;
}

export interface ProjectAudio {
  url: string;
  volume: number;
  offset: number; // seconds
}

/** Track types for multi-track timeline (extensible). */
export type TrackType = "video" | "audio" | "text";

/** Single item on a track (frame-based). */
export interface TrackItem {
  id: string;
  startFrame: number;
  durationInFrames: number;
  /** Video: EditorScene id ref. Audio: "audio". Text: cue index or id. */
  content?: unknown;
}

/** One track in the timeline. */
export interface Track {
  id: string;
  type: TrackType;
  label: string;
  items: TrackItem[];
}

export interface Project {
  id: string;
  meta: ProjectMeta;
  scenes: EditorScene[];
  /** Optional track list; if absent, timeline derives from scenes/audio/captions. */
  tracks?: Track[];
  /** Voiceover/narration track from API */
  audio?: ProjectAudio;
  /** SRT captions file URL (from API) */
  captionUrl?: string | null;
  /** Background music URL from input config (if any) */
  musicUrl?: string | null;
  /** Background music volume 0–1 (default 0.45). */
  musicVolume?: number;
}

/** Get total duration in frames from project (scenes or meta). */
export function getProjectDurationFrames(project: Project): number {
  if (project.scenes.length === 0)
    return Math.round((project.meta.duration || 30) * REEL_FPS);
  return project.scenes.reduce(
    (acc, s) => Math.max(acc, s.startFrame + s.durationInFrames),
    0
  );
}

/** Dimensions for 9:16 at 1080px width. */
export const REEL_WIDTH = 1080;
export const REEL_HEIGHT = 1920;
export const REEL_FPS = 30;

export function durationToSeconds(durationStr: string): number {
  if (!durationStr) return 30;
  const match = durationStr.match(/^(\d+)-(\d+)$/);
  if (match) return (parseInt(match[1], 10) + parseInt(match[2], 10)) / 2;
  const n = parseInt(durationStr, 10);
  return Number.isFinite(n) ? n : 30;
}

export function secondsToDuration(seconds: number): string {
  if (seconds <= 30) return "30-60";
  if (seconds <= 45) return "30-60";
  return "30-60";
}
