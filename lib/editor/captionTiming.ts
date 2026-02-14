/**
 * Deterministic caption timing: SRT → evenly distributed over duration → scene-based.
 * Used by Timeline (blocks) and RemotionPreview (cues) so captions stay in sync.
 */

import type { Project } from "./types";
import { getProjectDurationFrames, REEL_FPS } from "./types";
import type { SrtCue } from "./parseSrt";

export type CaptionCueTiming = {
  index: number;
  startSeconds: number;
  endSeconds: number;
  text: string;
};

function splitScriptIntoSegments(script: string): string[] {
  const trimmed = script.trim();
  if (!trimmed) return [];
  const byParagraph = trimmed.split(/\n\s*\n/).map((s) => s.trim()).filter(Boolean);
  if (byParagraph.length > 1) return byParagraph;
  const byLine = trimmed.split(/\n/).map((s) => s.trim()).filter(Boolean);
  if (byLine.length > 1) return byLine;
  const bySentence = trimmed.split(/(?<=[.!?])\s+/).map((s) => s.trim()).filter(Boolean);
  return bySentence.length > 0 ? bySentence : [trimmed];
}

/**
 * Returns caption cues with startSeconds/endSeconds. Never assigns full video duration to one caption.
 * Priority: SRT (clamped) → evenly distributed script → scene-based.
 */
export function getCaptionCues(project: Project, srtCues: SrtCue[]): CaptionCueTiming[] {
  const totalFrames = getProjectDurationFrames(project);
  const totalSeconds = totalFrames / REEL_FPS;

  if (srtCues.length > 0) {
    return srtCues.map((cue) => {
      const startSeconds = Math.max(0, Math.min(cue.startSeconds, totalSeconds - 0.034));
      let endSeconds = Math.min(cue.endSeconds, totalSeconds);
      if (endSeconds <= startSeconds) endSeconds = startSeconds + 0.034;
      return {
        index: cue.index,
        startSeconds,
        endSeconds,
        text: cue.text,
      };
    });
  }

  // Use a single script source so we don't get duplicate segments when every scene has the same text
  const singleScript = project.scenes[0]?.text?.trim() || "";
  const segments = singleScript ? splitScriptIntoSegments(singleScript) : [];

  if (segments.length > 0) {
    const secPerSegment = totalSeconds / segments.length;
    return segments.map((text, i) => {
      const startSeconds = i * secPerSegment;
      const endSeconds = i === segments.length - 1 ? totalSeconds : startSeconds + secPerSegment;
      return {
        index: i,
        startSeconds,
        endSeconds,
        text,
      };
    });
  }

  // Scene-based: one cue per scene; assign script chunks so each scene gets different text
  const sceneCount = project.scenes.length;
  const scriptForScenes = project.scenes[0]?.text?.trim() || "";
  const sceneSegments = scriptForScenes
    ? splitScriptIntoSegments(scriptForScenes)
    : [];
  const textPerScene =
    sceneSegments.length >= sceneCount
      ? sceneSegments.slice(0, sceneCount)
      : sceneSegments.length > 0
        ? Array.from({ length: sceneCount }, (_, i) => sceneSegments[i % sceneSegments.length])
        : project.scenes.map((_, i) => `Scene ${i + 1}`);

  return project.scenes.map((scene, i) => {
    const startSeconds = scene.startFrame / REEL_FPS;
    const maxDurationFrames = Math.max(1, totalFrames - scene.startFrame);
    const durationFrames = Math.min(scene.durationInFrames, maxDurationFrames);
    const endSeconds = startSeconds + durationFrames / REEL_FPS;
    return {
      index: i,
      startSeconds,
      endSeconds,
      text: textPerScene[i] ?? (scene.text?.trim() || `Scene ${i + 1}`),
    };
  });
}
