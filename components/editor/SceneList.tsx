"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/format";
import type { EditorScene } from "@/lib/editor/types";
import { Plus, Trash2 } from "lucide-react";
import { REEL_FPS } from "@/lib/editor/types";

function formatTime(frames: number): string {
  const sec = Math.floor(frames / REEL_FPS);
  return `0:${sec.toString().padStart(2, "0")}`;
}

function formatRange(start: number, duration: number): string {
  const end = start + duration;
  return `${formatTime(start)} – ${formatTime(end)}`;
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
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-3 py-2 border-b border-[#e5e7eb]">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          SCENES
        </span>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-7 px-2 text-primary hover:bg-primary/10 transition-colors duration-200"
          onClick={() => onAddScene()}
        >
          <Plus className="h-3.5 w-3.5 mr-1" />
          Add
        </Button>
      </div>
      <ul className="flex-1 overflow-y-auto py-2">
        {scenes.map((scene, index) => {
          const isSelected = selectedSceneId === scene.id;
          return (
            <li key={scene.id} className="px-2">
              <div
                role="button"
                tabIndex={0}
                onClick={() => onSelectScene(scene.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onSelectScene(scene.id);
                  }
                }}
                className={cn(
                  "group flex items-center gap-2 py-2 px-2 rounded-lg cursor-pointer transition-all duration-150 ease-out outline-none focus-visible:ring-2 focus-visible:ring-violet-500/30",
                  isSelected
                    ? "bg-violet-50 border-l-2 border-l-violet-500 ml-0 -ml-0.5 pl-2.5"
                    : "hover:bg-[#F3F4F6] border-l-2 border-l-transparent"
                )}
              >
                <div className="flex-shrink-0 w-14 h-[56px] rounded-[10px] overflow-hidden bg-[#e5e7eb]">
                  {scene.imageUrl ? (
                    <img
                      src={scene.imageUrl}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[10px] font-medium text-muted-foreground/60">
                      No image
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className={cn(
                      "text-[13px] font-medium truncate",
                      isSelected ? "text-foreground" : "text-foreground/90"
                    )}
                  >
                    Scene {index + 1}
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-0.5 tabular-nums">
                    {formatRange(scene.startFrame, scene.durationInFrames)}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "h-7 w-7 flex-shrink-0 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all duration-200",
                    !canRemove && "opacity-0 pointer-events-none",
                    canRemove && "opacity-0 group-hover:opacity-100"
                  )}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (canRemove) onRemoveScene(scene.id);
                  }}
                  disabled={!canRemove}
                  aria-label="Delete scene"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
              {index < scenes.length - 1 && (
                <div className="mx-2 my-0 h-px bg-[#e5e7eb]/80" />
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
