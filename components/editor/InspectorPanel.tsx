"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import type { EditorScene, Project, SceneAnimation } from "@/lib/editor/types";
import { REEL_FPS } from "@/lib/editor/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const ANIMATIONS: { value: SceneAnimation; label: string }[] = [
  { value: "zoom", label: "Zoom" },
  { value: "fade", label: "Fade" },
  { value: "slide", label: "Slide" },
];

function Label({
  children,
  htmlFor,
  className = "",
}: {
  children: React.ReactNode;
  htmlFor?: string;
  className?: string;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className={`text-sm font-medium leading-none ${className}`}
    >
      {children}
    </label>
  );
}

interface InspectorPanelProps {
  project: Project;
  selectedScene: EditorScene | null;
  onUpdateScene: (sceneId: string, patch: Partial<EditorScene>) => void;
  onUpdateMeta: (patch: Partial<Project["meta"]>) => void;
  onUpdateAudio?: (audio: Project["audio"] | null) => void;
}

export function InspectorPanel({
  project,
  selectedScene,
  onUpdateScene,
  onUpdateMeta,
  onUpdateAudio,
}: InspectorPanelProps) {
  return (
    <div className="flex flex-col h-full bg-card border-l border-border overflow-y-auto">
      <div className="p-3 border-b border-border">
        <span className="text-sm font-medium text-foreground">
          Project Settings
        </span>
      </div>
      <div className="p-3 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="project-title">Title</Label>
          <Input
            id="project-title"
            value={project.meta.title}
            onChange={(e) => onUpdateMeta({ title: e.target.value })}
            placeholder="Reel title"
          />
        </div>
        <div className="space-y-2">
          <Label>Duration (sec)</Label>
          <Select
            value={[30, 45, 60].includes(project.meta.duration) ? String(project.meta.duration) : "30"}
            onValueChange={(v) => onUpdateMeta({ duration: Number(v) })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="30">30 sec</SelectItem>
              <SelectItem value="45">45 sec</SelectItem>
              <SelectItem value="60">60 sec</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {project.audio && onUpdateAudio && (
          <div className="space-y-2">
            <Label>Background music</Label>
            <p className="text-xs text-muted-foreground truncate">
              {project.audio.url ? "Track loaded" : "No track"}
            </p>
            <div className="flex items-center gap-2">
              <Label className="text-xs">Volume</Label>
              <input
                type="range"
                min={0}
                max={1}
                step={0.1}
                value={project.audio.volume}
                onChange={(e) =>
                  onUpdateAudio({
                    ...project.audio!,
                    volume: parseFloat(e.target.value),
                  })
                }
              />
            </div>
          </div>
        )}
      </div>

      {selectedScene && (
        <>
          <div className="p-3 border-t border-border mt-2">
            <span className="text-sm font-medium text-foreground">
              Scene settings
            </span>
          </div>
          <div className="p-3 space-y-4">
            <div className="space-y-2">
              <Label>Text / caption</Label>
              <textarea
                className="min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={selectedScene.text}
                onChange={(e) =>
                  onUpdateScene(selectedScene.id, { text: e.target.value })
                }
                placeholder="Scene text..."
              />
            </div>
            <div className="space-y-2">
              <Label>Duration (frames)</Label>
              <Input
                type="number"
                min={REEL_FPS}
                value={selectedScene.durationInFrames}
                onChange={(e) =>
                  onUpdateScene(selectedScene.id, {
                    durationInFrames: Math.max(
                      REEL_FPS,
                      parseInt(e.target.value, 10) || REEL_FPS
                    ),
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Animation</Label>
              <Select
                value={selectedScene.animation}
                onValueChange={(v) =>
                  onUpdateScene(selectedScene.id, {
                    animation: v as SceneAnimation,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ANIMATIONS.map((a) => (
                    <SelectItem key={a.value} value={a.value}>
                      {a.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Image URL</Label>
              <Input
                value={selectedScene.imageUrl}
                onChange={(e) =>
                  onUpdateScene(selectedScene.id, { imageUrl: e.target.value })
                }
                placeholder="https://..."
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
