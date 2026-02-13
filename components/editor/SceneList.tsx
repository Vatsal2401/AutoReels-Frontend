"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/format";
import type { EditorScene } from "@/lib/editor/types";
import { Plus, GripVertical, ChevronRight, Trash2 } from "lucide-react";
import { REEL_FPS } from "@/lib/editor/types";

function formatTime(frames: number): string {
  const sec = Math.floor(frames / REEL_FPS);
  return `0:${sec.toString().padStart(2, "0")}`;
}

function formatRange(start: number, duration: number): string {
  const end = start + duration;
  return `${formatTime(start)} - ${formatTime(end)}`;
}

interface SceneListProps {
  scenes: EditorScene[];
  selectedSceneId: string | null;
  onSelectScene: (id: string) => void;
  onAddScene: (afterIndex?: number) => void;
  onRemoveScene: (id: string) => void;
  onReorder?: (fromIndex: number, toIndex: number) => void;
  canRemove: boolean;
}

export function SceneList({
  scenes,
  selectedSceneId,
  onSelectScene,
  onAddScene,
  onRemoveScene,
  canRemove,
}: SceneListProps) {
  return (
    <div className="flex flex-col h-full bg-card border-r border-border">
      <div className="p-3 border-b border-border flex items-center justify-between">
        <span className="text-sm font-medium text-foreground">Scenes</span>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-8"
          onClick={() => onAddScene()}
        >
          <Plus className="h-4 w-4 mr-1" />
          Add Scene
        </Button>
      </div>
      <ul className="flex-1 overflow-y-auto p-2 space-y-1">
        {scenes.map((scene, index) => (
          <li
            key={scene.id}
            className={cn(
              "rounded-md border transition-colors",
              selectedSceneId === scene.id
                ? "border-primary bg-primary/10"
                : "border-border hover:bg-muted/50"
            )}
          >
            <div
              className="flex items-center gap-2 p-2 cursor-pointer"
              onClick={() => onSelectScene(scene.id)}
            >
              <div className="flex-shrink-0 w-14 h-24 rounded bg-muted overflow-hidden">
                {scene.imageUrl ? (
                  <img
                    src={scene.imageUrl}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
                    No image
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  Scene {index + 1}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatRange(scene.startFrame, scene.durationInFrames)}
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 flex-shrink-0"
                onClick={(e) => {
                  e.stopPropagation();
                  if (canRemove) onRemoveScene(scene.id);
                }}
                disabled={!canRemove}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
