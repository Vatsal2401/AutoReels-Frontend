"use client";

import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import type { AspectRatio, EditorScene, Project, ProjectAudio, SceneAnimation } from "@/lib/editor/types";
import { REEL_FPS } from "@/lib/editor/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils/format";
import {
  Mic,
  FileText,
  Music2,
  Download,
  ExternalLink,
  ChevronDown,
  ChevronRight,
} from "lucide-react";

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
      className={cn(
        "text-[11px] font-medium text-muted-foreground leading-none block",
        className
      )}
    >
      {children}
    </label>
  );
}

function CollapsibleSection({
  title,
  defaultOpen = true,
  open,
  onToggle,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="border-b border-[#e5e7eb] last:border-b-0">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-[#F9FAFB] transition-colors duration-150"
      >
        {open ? (
          <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
        ) : (
          <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
        )}
        <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          {title}
        </span>
      </button>
      {open && <div className="px-3 pb-3 pt-0 space-y-2">{children}</div>}
    </div>
  );
}

function InspectorRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
    </div>
  );
}

const inputClass =
  "h-8 text-[13px] rounded-[8px] border-[#e5e7eb] focus-visible:ring-2 focus-visible:ring-primary/20 transition-shadow duration-200";

interface InspectorPanelProps {
  project: Project;
  selectedScene: EditorScene | null;
  onUpdateScene: (sceneId: string, patch: Partial<EditorScene>) => void;
  onUpdateMeta: (patch: Partial<Project["meta"]>) => void;
  onUpdateAudio?: (audio: ProjectAudio | null) => void;
  onUpdateMusicVolume?: (volume: number) => void;
}

export function InspectorPanel({
  project,
  selectedScene,
  onUpdateScene,
  onUpdateMeta,
  onUpdateAudio,
  onUpdateMusicVolume,
}: InspectorPanelProps) {
  const [projectOpen, setProjectOpen] = useState(true);
  const [audioOpen, setAudioOpen] = useState(true);
  const [sceneOpen, setSceneOpen] = useState(true);

  useEffect(() => {
    if (selectedScene) setSceneOpen(true);
  }, [selectedScene]);

  const hasVoiceover = !!project.audio?.url;
  const hasCaptions = project.scenes.some((s) => s.text?.trim());
  const captionCount = project.scenes.filter((s) => s.text?.trim()).length;
  const hasSrt = !!project.captionUrl;
  const hasMusic = !!project.musicUrl;

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <CollapsibleSection
        title="Project"
        open={projectOpen}
        onToggle={() => setProjectOpen((o) => !o)}
      >
        <InspectorRow label="Title">
          <Input
            id="project-title"
            value={project.meta.title}
            onChange={(e) => onUpdateMeta({ title: e.target.value })}
            placeholder="Reel title"
            className={inputClass}
          />
        </InspectorRow>
        <InspectorRow label="Duration">
          <Select
            value={[30, 45, 60].includes(project.meta.duration) ? String(project.meta.duration) : "30"}
            onValueChange={(v) => onUpdateMeta({ duration: Number(v) })}
          >
            <SelectTrigger className={inputClass}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="30">30 sec</SelectItem>
              <SelectItem value="45">45 sec</SelectItem>
              <SelectItem value="60">60 sec</SelectItem>
            </SelectContent>
          </Select>
        </InspectorRow>
        <InspectorRow label="Aspect ratio">
          <Select
            value={project.meta.ratio}
            onValueChange={(v) => onUpdateMeta({ ratio: v as AspectRatio })}
          >
            <SelectTrigger className={inputClass}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="9:16">9:16 (vertical)</SelectItem>
              <SelectItem value="16:9">16:9 (landscape)</SelectItem>
              <SelectItem value="1:1">1:1 (square)</SelectItem>
              <SelectItem value="4:5">4:5</SelectItem>
            </SelectContent>
          </Select>
        </InspectorRow>
      </CollapsibleSection>

      <CollapsibleSection
        title="Audio & Tracks"
        open={audioOpen}
        onToggle={() => setAudioOpen((o) => !o)}
      >
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Mic className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-[12px] font-medium">Voiceover</span>
          </div>
          {hasVoiceover ? (
            <>
              <p className="text-[11px] text-muted-foreground">Narration loaded</p>
              {onUpdateAudio && (
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.1}
                    value={project.audio!.volume}
                    onChange={(e) =>
                      onUpdateAudio({
                        ...project.audio!,
                        volume: parseFloat(e.target.value),
                      })
                    }
                    className="flex-1 h-1.5 rounded-full accent-primary bg-[#e5e7eb]"
                  />
                  <span className="text-[11px] text-muted-foreground w-7 tabular-nums">
                    {Math.round((project.audio!.volume ?? 1) * 100)}%
                  </span>
                </div>
              )}
            </>
          ) : (
            <p className="text-[11px] text-muted-foreground">No voiceover</p>
          )}
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <FileText className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-[12px] font-medium">Captions</span>
          </div>
          {hasCaptions && (
            <p className="text-[11px] text-muted-foreground">
              {captionCount} scene{captionCount !== 1 ? "s" : ""} with text
            </p>
          )}
          {hasSrt ? (
            <a
              href={project.captionUrl!}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[11px] text-primary hover:underline transition-colors duration-200"
            >
              <Download className="h-3 w-3" />
              Download SRT
            </a>
          ) : !hasCaptions && (
            <p className="text-[11px] text-muted-foreground">No captions</p>
          )}
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Music2 className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-[12px] font-medium">Music</span>
          </div>
          {hasMusic ? (
            <>
              <p className="text-[11px] text-muted-foreground">Background music (loops with video)</p>
              {onUpdateMusicVolume && (
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.05}
                    value={project.musicVolume ?? 0.45}
                    onChange={(e) =>
                      onUpdateMusicVolume(parseFloat(e.target.value))
                    }
                    className="flex-1 h-1.5 rounded-full accent-primary bg-[#e5e7eb]"
                  />
                  <span className="text-[11px] text-muted-foreground w-7 tabular-nums">
                    {Math.round((project.musicVolume ?? 0.45) * 100)}%
                  </span>
                </div>
              )}
              <a
                href={project.musicUrl!}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[11px] text-primary hover:underline transition-colors duration-200"
              >
                <ExternalLink className="h-3 w-3" />
                Open track
              </a>
            </>
          ) : (
            <p className="text-[11px] text-muted-foreground">No music</p>
          )}
        </div>
      </CollapsibleSection>

      {selectedScene && (
        <CollapsibleSection
          title="Scene Settings"
          open={sceneOpen}
          onToggle={() => setSceneOpen((o) => !o)}
        >
          <InspectorRow label="Caption / script">
            <textarea
              className="min-h-[72px] w-full rounded-[8px] border border-[#e5e7eb] px-2.5 py-2 text-[13px] resize-y focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 transition-shadow duration-200"
              value={selectedScene.text}
              onChange={(e) =>
                onUpdateScene(selectedScene.id, { text: e.target.value })
              }
              placeholder="Caption or script..."
            />
          </InspectorRow>
          <InspectorRow label="Duration (frames)">
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
              className={inputClass}
            />
          </InspectorRow>
          <InspectorRow label="Animation">
            <Select
              value={selectedScene.animation}
              onValueChange={(v) =>
                onUpdateScene(selectedScene.id, {
                  animation: v as SceneAnimation,
                })
              }
            >
              <SelectTrigger className={inputClass}>
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
          </InspectorRow>
          <InspectorRow label="Image URL">
            <Input
              value={selectedScene.imageUrl}
              onChange={(e) =>
                onUpdateScene(selectedScene.id, { imageUrl: e.target.value })
              }
              placeholder="https://..."
              className={inputClass}
            />
          </InspectorRow>
        </CollapsibleSection>
      )}
    </div>
  );
}
