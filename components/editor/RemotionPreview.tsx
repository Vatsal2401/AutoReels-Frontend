"use client";

import React, { useState, useCallback } from "react";
import dynamic from "next/dynamic";
import type { Project } from "@/lib/editor/types";
import { REEL_WIDTH, REEL_HEIGHT, REEL_FPS } from "@/lib/editor/types";

const Player = dynamic(
  () => import("@remotion/player").then((mod) => mod.Player),
  { ssr: false }
);

const ReelComposition = dynamic(
  () =>
    import("@/app/(dashboard)/editor/remotion/ReelComposition").then(
      (mod) => mod.ReelComposition
    ),
  { ssr: false }
);

interface RemotionPreviewProps {
  project: Project;
  className?: string;
}

function totalDurationInFrames(project: Project): number {
  if (!project.scenes.length) return REEL_FPS * 30;
  return project.scenes.reduce(
    (acc, s) => Math.max(acc, s.startFrame + s.durationInFrames),
    0
  );
}

export function RemotionPreview({ project, className = "" }: RemotionPreviewProps) {
  const [currentFrame, setCurrentFrame] = useState(0);
  const durationInFrames = totalDurationInFrames(project);

  const inputProps = {
    project,
    width: REEL_WIDTH,
    height: REEL_HEIGHT,
  };

  return (
    <div
      className={`rounded-lg border border-border overflow-hidden bg-black ${className}`}
    >
      <Player
        component={ReelComposition}
        inputProps={inputProps}
        durationInFrames={durationInFrames}
        fps={REEL_FPS}
        compositionWidth={REEL_WIDTH}
        compositionHeight={REEL_HEIGHT}
        style={{ width: "100%", height: "auto", aspectRatio: "9/16" }}
        controls
        loop
        numberOfSharedAudioTags={1}
        playbackRate={1}
        initiallyMuted={false}
        currentFrame={currentFrame}
        onFrameUpdate={setCurrentFrame}
      />
    </div>
  );
}
