"use client";

import { create } from "zustand";
import type { Project, EditorScene, ProjectMeta, ProjectAudio } from "./types";
import type { EditorProjectDto } from "@/lib/api/media";
import { mapEditorPayloadToProject } from "./mapApiToProject";
import { REEL_FPS, getProjectDurationFrames } from "./types";
import { generateId } from "./mapApiToProject";

interface EditorState {
  /** Current project (single source of truth). */
  project: Project | null;
  /** Media id from API (for save/rerender). */
  mediaId: string | null;
  /** API status (pending | processing | completed | failed). */
  status: string;
  /** Selected scene id for inspector. */
  selectedSceneId: string | null;
  /** Last saved at (for "Saved just now" etc.). */
  lastSavedAt: Date | null;
  /** Playhead frame (synced with timeline and Remotion preview). */
  currentFrame: number;
  /** When set, preview should seek to this frame (then clear). Used for timeline ruler click. */
  seekToFrame: number | null;
}

interface EditorActions {
  /** Replace full project (e.g. after load). */
  setProject: (project: Project | null) => void;
  /** Initialize from API editor payload. */
  initFromPayload: (dto: EditorProjectDto) => void;
  /** Set media id and status (from API). */
  setMedia: (mediaId: string | null, status: string) => void;
  /** Update a scene by id. */
  updateScene: (sceneId: string, patch: Partial<EditorScene>) => void;
  /** Add a new scene after the given index (or at end). */
  addScene: (afterIndex?: number) => void;
  /** Remove scene by id. */
  removeScene: (sceneId: string) => void;
  /** Reorder: move scene at fromIndex to toIndex. */
  reorderScenes: (fromIndex: number, toIndex: number) => void;
  /** Recompute startFrame/durationInFrames after reorder/add/remove. */
  recalcFrames: () => void;
  /** Update project meta. */
  updateMeta: (patch: Partial<ProjectMeta>) => void;
  /** Update or set audio. */
  updateAudio: (audio: ProjectAudio | null) => void;
  /** Update background music volume (0–1). */
  updateMusicVolume: (volume: number) => void;
  /** Set selected scene for inspector. */
  setSelectedSceneId: (id: string | null) => void;
  /** Mark as just saved. */
  setLastSavedAt: (date: Date | null) => void;
  /** Set playhead frame (timeline scrubbing / preview sync). Clamps to project duration. */
  setCurrentFrame: (frame: number) => void;
  /** Request preview to seek to this frame (cleared after seek). Use with setCurrentFrame for timeline seek. */
  setSeekToFrame: (frame: number | null) => void;
  /** Update scene start and duration (timeline drag/resize). Clamps to project duration. */
  updateSceneFrames: (sceneId: string, startFrame: number, durationInFrames: number) => void;
  /** Reset store (e.g. on route change). */
  reset: () => void;
}

const initialState: EditorState = {
  project: null,
  mediaId: null,
  status: "",
  selectedSceneId: null,
  lastSavedAt: null,
  currentFrame: 0,
  seekToFrame: null,
};

function recalcSceneFrames(scenes: EditorScene[], totalDurationSec: number): EditorScene[] {
  const totalFrames = Math.round(totalDurationSec * REEL_FPS);
  const durationPerScene = Math.floor(totalFrames / Math.max(1, scenes.length));
  return scenes.map((s, i) => ({
    ...s,
    startFrame: i * durationPerScene,
    durationInFrames: durationPerScene,
  }));
}

export const useEditorStore = create<EditorState & EditorActions>((set, get) => ({
  ...initialState,

  setProject: (project) => set({ project }),

  initFromPayload: (dto) => {
    const project = mapEditorPayloadToProject(dto);
    set({
      project,
      mediaId: dto.id,
      status: dto.status ?? "",
      selectedSceneId: project.scenes[0]?.id ?? null,
      currentFrame: 0,
    });
  },

  setMedia: (mediaId, status) => set({ mediaId, status }),

  updateScene: (sceneId, patch) => {
    const { project } = get();
    if (!project) return;
    set({
      project: {
        ...project,
        scenes: project.scenes.map((s) =>
          s.id === sceneId ? { ...s, ...patch } : s
        ),
      },
    });
  },

  addScene: (afterIndex) => {
    const { project } = get();
    if (!project) return;
    const scenes = [...project.scenes];
    const newScene: EditorScene = {
      id: generateId(),
      imageUrl: "",
      text: "",
      startFrame: 0,
      durationInFrames: Math.round(project.meta.duration * REEL_FPS / Math.max(1, scenes.length + 1)),
      animation: "zoom",
    };
    const insertAt = afterIndex === undefined ? scenes.length : Math.min(afterIndex + 1, scenes.length);
    scenes.splice(insertAt, 0, newScene);
    const updated = recalcSceneFrames(scenes, project.meta.duration);
    set({
      project: { ...project, scenes: updated },
      selectedSceneId: newScene.id,
    });
  },

  removeScene: (sceneId) => {
    const { project } = get();
    if (!project || project.scenes.length <= 1) return;
    const scenes = project.scenes.filter((s) => s.id !== sceneId);
    const updated = recalcSceneFrames(scenes, project.meta.duration);
    const newSelected = get().selectedSceneId === sceneId
      ? (updated[0]?.id ?? null)
      : get().selectedSceneId;
    set({
      project: { ...project, scenes: updated },
      selectedSceneId: newSelected,
    });
  },

  reorderScenes: (fromIndex, toIndex) => {
    const { project } = get();
    if (!project) return;
    const scenes = [...project.scenes];
    const [removed] = scenes.splice(fromIndex, 1);
    scenes.splice(toIndex, 0, removed);
    const updated = recalcSceneFrames(scenes, project.meta.duration);
    set({ project: { ...project, scenes: updated } });
  },

  recalcFrames: () => {
    const { project } = get();
    if (!project) return;
    const updated = recalcSceneFrames(project.scenes, project.meta.duration);
    set({ project: { ...project, scenes: updated } });
  },

  updateMeta: (patch) => {
    const { project } = get();
    if (!project) return;
    const meta = { ...project.meta, ...patch };
    const updated = recalcSceneFrames(project.scenes, meta.duration);
    set({ project: { ...project, meta, scenes: updated } });
  },

  updateAudio: (audio) => set({ project: get().project ? { ...get().project!, audio: audio ?? undefined } : null }),

  updateMusicVolume: (volume) => {
    const { project } = get();
    if (!project) return;
    const v = Math.max(0, Math.min(1, Number(volume)));
    set({ project: { ...project, musicVolume: v } });
  },

  setSelectedSceneId: (id) => set({ selectedSceneId: id }),

  setLastSavedAt: (date) => set({ lastSavedAt: date }),

  setCurrentFrame: (frame) => {
    const { project } = get();
    const f = Math.max(0, Math.floor(frame));
    const maxFrame = project ? getProjectDurationFrames(project) - 1 : 0;
    set({ currentFrame: Math.min(f, maxFrame) });
  },
  setSeekToFrame: (frame) => set({ seekToFrame: frame }),

  updateSceneFrames: (sceneId, startFrame, durationInFrames) => {
    const { project } = get();
    if (!project) return;
    const totalFrames = Math.round(project.meta.duration * REEL_FPS);
    const clampedStart = Math.max(0, Math.min(Math.floor(startFrame), totalFrames - 1));
    const clampedDuration = Math.max(REEL_FPS, Math.min(Math.floor(durationInFrames), totalFrames - clampedStart));
    set({
      project: {
        ...project,
        scenes: project.scenes.map((s) =>
          s.id === sceneId
            ? { ...s, startFrame: clampedStart, durationInFrames: clampedDuration }
            : s
        ),
      },
    });
  },

  reset: () => set(initialState),
}));
