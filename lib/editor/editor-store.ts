"use client";

import { create } from "zustand";
import type { Project, EditorScene, ProjectMeta, ProjectAudio } from "./types";
import type { EditorProjectDto } from "@/lib/api/media";
import { mapEditorPayloadToProject } from "./mapApiToProject";
import { REEL_FPS } from "./types";
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
  /** Set selected scene for inspector. */
  setSelectedSceneId: (id: string | null) => void;
  /** Mark as just saved. */
  setLastSavedAt: (date: Date | null) => void;
  /** Reset store (e.g. on route change). */
  reset: () => void;
}

const initialState: EditorState = {
  project: null,
  mediaId: null,
  status: "",
  selectedSceneId: null,
  lastSavedAt: null,
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

  setSelectedSceneId: (id) => set({ selectedSceneId: id }),

  setLastSavedAt: (date) => set({ lastSavedAt: date }),

  reset: () => set(initialState),
}));
