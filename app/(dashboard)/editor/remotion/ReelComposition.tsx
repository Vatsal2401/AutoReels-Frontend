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
import { REEL_WIDTH, REEL_HEIGHT, REEL_FPS } from "@/lib/editor/types";

export type ReelCompositionProps = {
  project: Project;
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

function AnimatedScene({ scene }: { scene: Project["scenes"][0] }) {
  const { durationInFrames, animation, imageUrl } = scene;
  if (!imageUrl) {
    return <AbsoluteFill style={{ backgroundColor: "#111" }} />;
  }
  if (animation === "zoom") {
    return (
      <Sequence from={0} durationInFrames={durationInFrames}>
        <ZoomScene scene={scene} />
      </Sequence>
    );
  }
  if (animation === "fade") {
    return (
      <Sequence from={0} durationInFrames={durationInFrames}>
        <FadeScene scene={scene} />
      </Sequence>
    );
  }
  if (animation === "slide") {
    return (
      <Sequence from={0} durationInFrames={durationInFrames}>
        <SlideScene scene={scene} />
      </Sequence>
    );
  }
  return (
    <AbsoluteFill>
      <Img
        src={scene.imageUrl}
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
      />
    </AbsoluteFill>
  );
}

export function ReelComposition({ project, width, height }: ReelCompositionProps) {
  const { scenes = [], audio } = project;
  return (
    <AbsoluteFill style={{ backgroundColor: "#000", width, height }}>
      {audio?.url ? (
        <Audio
          src={audio.url}
          volume={audio.volume}
          startFrom={Math.round(audio.offset * REEL_FPS)}
        />
      ) : null}
      {scenes.map((scene) => (
        <Sequence
          key={scene.id}
          from={scene.startFrame}
          durationInFrames={scene.durationInFrames}
        >
          <AnimatedScene scene={scene} />
        </Sequence>
      ))}
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
  width: REEL_WIDTH,
  height: REEL_HEIGHT,
};
