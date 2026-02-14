"use client";

import React from "react";
import {
  AbsoluteFill,
  Img,
  Sequence,
  useCurrentFrame,
  interpolate,
  Easing,
} from "remotion";
import { Audio } from "@remotion/media";
import type { Project } from "@/lib/editor/types";
import { REEL_FPS } from "@/lib/editor/types";
import { getCompositionDimensions } from "@/lib/editor/types";
import { getCaptionCues } from "@/lib/editor/captionTiming";
import { useEditorPreviewContext } from "@/lib/editor/editor-preview-context";

/** SRT cue shape (time-based); same as captionTiming CaptionCueTiming. */
export type CaptionCue = {
  index: number;
  startSeconds: number;
  endSeconds: number;
  text: string;
};

export type ReelCompositionProps = {
  project: Project;
  /** Raw SRT cues from API (optional). Composition derives final cues via getCaptionCues(project, srtCues). */
  srtCues?: CaptionCue[];
  /** Background music URL (passed explicitly so it reaches the composition even if project is default). */
  musicUrl?: string | null;
  width: number;
  height: number;
};

function ZoomScene({
  scene,
}: {
  scene: Project["scenes"][0];
}) {
  const frame = useCurrentFrame();
  const scale = interpolate(
    frame,
    [0, scene.durationInFrames],
    [1, 1.12],
    {
      easing: Easing.out(Easing.cubic),
      extrapolateRight: "clamp",
      extrapolateLeft: "clamp",
    }
  );
  return (
    <AbsoluteFill style={{ transform: `scale(${scale})` }}>
      <Img
        src={scene.imageUrl}
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
      />
    </AbsoluteFill>
  );
}

function FadeScene({
  scene,
}: {
  scene: Project["scenes"][0];
}) {
  const frame = useCurrentFrame();
  const opacity = interpolate(
    frame,
    [0, 8, scene.durationInFrames - 8, scene.durationInFrames],
    [0, 1, 1, 0],
    { extrapolateRight: "clamp", extrapolateLeft: "clamp" }
  );
  return (
    <AbsoluteFill style={{ opacity }}>
      <Img
        src={scene.imageUrl}
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
      />
    </AbsoluteFill>
  );
}

function SlideScene({
  scene,
}: {
  scene: Project["scenes"][0];
}) {
  const frame = useCurrentFrame();
  const translateX = interpolate(
    frame,
    [0, scene.durationInFrames],
    [50, 0],
    {
      easing: Easing.out(Easing.cubic),
      extrapolateRight: "clamp",
      extrapolateLeft: "clamp",
    }
  );
  return (
    <AbsoluteFill style={{ transform: `translateX(${translateX}px)` }}>
      <Img
        src={scene.imageUrl}
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
      />
    </AbsoluteFill>
  );
}

/** One caption line at bottom (shared styling). */
function CaptionOverlay({ text }: { text: string }) {
  if (!text?.trim()) return null;
  return (
    <AbsoluteFill
      style={{
        justifyContent: "flex-end",
        alignItems: "center",
        paddingBottom: "12%",
        paddingLeft: "8%",
        paddingRight: "8%",
      }}
    >
      <div
        style={{
          backgroundColor: "rgba(0,0,0,0.75)",
          color: "#fff",
          fontFamily: "system-ui, sans-serif",
          fontSize: 28,
          fontWeight: 600,
          textAlign: "center",
          padding: "12px 20px",
          borderRadius: 8,
          maxWidth: "90%",
        }}
      >
        {text}
      </div>
    </AbsoluteFill>
  );
}

/** Time-based captions: show only the cue active at current time. Rendered on top of video. */
function SrtCaptionLayer({ cues, fps }: { cues: CaptionCue[]; fps: number }) {
  const frame = useCurrentFrame();
  const timeSeconds = frame / fps;
  const active = cues.find(
    (c) => timeSeconds >= c.startSeconds && timeSeconds < c.endSeconds
  );
  if (!active) return null;
  return (
    <AbsoluteFill style={{ zIndex: 10, pointerEvents: "none" }}>
      <CaptionOverlay text={active.text} />
    </AbsoluteFill>
  );
}

function AnimatedScene({
  scene,
  showSceneCaption,
}: {
  scene: Project["scenes"][0];
  showSceneCaption: boolean;
}) {
  const { durationInFrames, animation, imageUrl } = scene;
  if (!imageUrl) {
    return <AbsoluteFill style={{ backgroundColor: "#111" }} />;
  }
  const caption = showSceneCaption ? <CaptionOverlay text={scene.text} /> : null;
  if (animation === "zoom") {
    return (
      <Sequence from={0} durationInFrames={durationInFrames}>
        <ZoomScene scene={scene} />
        {caption}
      </Sequence>
    );
  }
  if (animation === "fade") {
    return (
      <Sequence from={0} durationInFrames={durationInFrames}>
        <FadeScene scene={scene} />
        {caption}
      </Sequence>
    );
  }
  if (animation === "slide") {
    return (
      <Sequence from={0} durationInFrames={durationInFrames}>
        <SlideScene scene={scene} />
        {caption}
      </Sequence>
    );
  }
  return (
    <AbsoluteFill>
      <Img
        src={scene.imageUrl}
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
      />
      {caption}
    </AbsoluteFill>
  );
}

export function ReelComposition({
  project: projectProp,
  srtCues: srtCuesProp = [],
  musicUrl: musicUrlProp,
  width,
  height,
}: ReelCompositionProps) {
  const context = useEditorPreviewContext();
  const project: Project = context?.project ?? projectProp;
  const srtCues = context?.srtCues ?? srtCuesProp;
  const { scenes = [], audio } = project;
  const musicUrl = musicUrlProp ?? project.musicUrl ?? null;
  const musicVolume = Math.max(0, Math.min(1, project.musicVolume ?? 0.45));
  const cues = getCaptionCues(project, srtCues);
  const useSrtCaptions = cues.length > 0;
  const dimensions = width && height ? { width, height } : getCompositionDimensions(project.meta.ratio);
  return (
    <AbsoluteFill style={{ backgroundColor: "#000", width: dimensions.width, height: dimensions.height }}>
      {/* Background music: loop until video ends, volume from project */}
      {musicUrl ? (
        <Audio key="bg-music" src={musicUrl} volume={musicVolume} loop />
      ) : null}
      {/* Voiceover / narration */}
      {audio?.url ? (
        <Audio
          key="voiceover"
          src={audio.url}
          volume={audio.volume}
          trimBefore={Math.round(audio.offset * REEL_FPS)}
        />
      ) : null}
      {scenes.map((scene) => (
        <Sequence
          key={scene.id}
          from={scene.startFrame}
          durationInFrames={scene.durationInFrames}
        >
          <AnimatedScene scene={scene} showSceneCaption={!useSrtCaptions} />
        </Sequence>
      ))}
      {/* Single time-based caption layer from SRT (one place, in sync with timeline) */}
      {useSrtCaptions && (
        <SrtCaptionLayer cues={cues} fps={REEL_FPS} />
      )}
    </AbsoluteFill>
  );
}

export const REEL_COMPOSITION_DEFAULT_PROPS: ReelCompositionProps = {
  project: {
    id: "",
    meta: {
      title: "",
      duration: 30,
      fps: REEL_FPS,
      ratio: "9:16",
    },
    scenes: [],
  },
  srtCues: [],
  musicUrl: null,
  width: 1080,
  height: 1920,
};
