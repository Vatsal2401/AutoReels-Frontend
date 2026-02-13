/**
 * JSON-driven project model for the in-app video editor.
 * Extensible for future multi-track system.
 */

export type AspectRatio = "9:16" | "1:1" | "16:9";
export type SceneAnimation = "zoom" | "fade" | "slide";

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

export interface Project {
  id: string;
  meta: ProjectMeta;
  scenes: EditorScene[];
  audio?: ProjectAudio;
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
