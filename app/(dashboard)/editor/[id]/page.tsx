"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { useShallow } from "zustand/react/shallow";
import { useAuth } from "@/lib/hooks/useAuth";
import { useEditorProject } from "@/lib/hooks/useEditorProject";
import { Button } from "@/components/ui/button";
import { EditorTopBar } from "@/components/editor/EditorTopBar";
import { useEditorStore } from "@/lib/editor/editor-store";
import { canRerenderReel, isReelProcessing, getReelStatusConfig } from "@/lib/constants/reel-status";
import { mediaApi } from "@/lib/api/media";
import { projectToPatchPayload } from "@/lib/editor/mapApiToProject";
import { getProjectDurationFrames, getPreviewMaxWidth } from "@/lib/editor/types";
import type { PlayerRef } from "@remotion/player";
import { SceneList } from "@/components/editor/SceneList";
import { RemotionPreview } from "@/components/editor/RemotionPreview";
import { EditorPreviewHoverControls } from "@/components/editor/EditorPreviewHoverControls";
import { InspectorPanel } from "@/components/editor/InspectorPanel";
import { Timeline } from "@/components/editor/Timeline";
import { Loader2, Save, Film, AlertCircle } from "lucide-react";

export default function EditorPage() {
  const router = useRouter();
  const params = useParams();
  const mediaId = params.id as string;
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { project: apiProject, isLoading: projectLoading, error } = useEditorProject(
    mediaId,
    !!isAuthenticated
  );

  // Select everything except currentFrame so playhead updates don't re-render this page (avoids audio glitches)
  const {
    project,
    mediaId: storeMediaId,
    status,
    selectedSceneId,
    lastSavedAt,
    currentFrame,
    setCurrentFrame,
    seekToFrame,
    setSeekToFrame,
    initFromPayload,
    setMedia,
    setSelectedSceneId,
    updateScene,
    addScene,
    removeScene,
    updateMeta,
    updateAudio,
    updateMusicVolume,
    setLastSavedAt,
    reset,
    updateSceneFrames,
    reorderScenes,
  } = useEditorStore(
    useShallow((s) => ({
      project: s.project,
      mediaId: s.mediaId,
      status: s.status,
      selectedSceneId: s.selectedSceneId,
      lastSavedAt: s.lastSavedAt,
      currentFrame: s.currentFrame,
      setCurrentFrame: s.setCurrentFrame,
      seekToFrame: s.seekToFrame,
      setSeekToFrame: s.setSeekToFrame,
      initFromPayload: s.initFromPayload,
      setMedia: s.setMedia,
      setSelectedSceneId: s.setSelectedSceneId,
      updateScene: s.updateScene,
      addScene: s.addScene,
      removeScene: s.removeScene,
      updateMeta: s.updateMeta,
      updateAudio: s.updateAudio,
      updateMusicVolume: s.updateMusicVolume,
      setLastSavedAt: s.setLastSavedAt,
      reset: s.reset,
      updateSceneFrames: s.updateSceneFrames,
      reorderScenes: s.reorderScenes,
    }))
  );

  const playerRef = useRef<PlayerRef>(null);
  const previewWrapperRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [loop, setLoop] = useState(true);
  const [previewFit, setPreviewFit] = useState<"contain" | "cover">("contain");
  const [showSafeArea, setShowSafeArea] = useState(false);

  const durationFrames = useMemo(
    () => (project ? getProjectDurationFrames(project) : 0),
    [project]
  );

  const handlePlay = useCallback((e: React.MouseEvent) => {
    const player = playerRef.current;
    if (player && typeof player.play === "function") {
      // Pass native event for Safari audio; cast for Remotion types
      player.play(e.nativeEvent as unknown as React.SyntheticEvent);
      setIsPlaying(true);
    }
  }, []);

  const handlePause = useCallback(() => {
    const player = playerRef.current;
    if (player && typeof player.pause === "function") {
      player.pause();
      setIsPlaying(false);
    }
  }, []);

  const handleStepFrame = useCallback(
    (delta: number) => {
      const player = playerRef.current;
      if (!player || typeof player.seekTo !== "function") return;
      const next = Math.max(0, Math.min(durationFrames - 1, currentFrame + delta));
      player.seekTo(next);
      setCurrentFrame(next);
    },
    [currentFrame, durationFrames, setCurrentFrame]
  );

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    if (!mediaId) return;
    return () => reset();
  }, [mediaId, reset]);

  useEffect(() => {
    if (apiProject) {
      initFromPayload(apiProject);
      setMedia(apiProject.id, apiProject.status);
    }
  }, [apiProject, initFromPayload, setMedia]);

  const handleSaveDraft = async () => {
    if (!storeMediaId || !project) return;
    setSaving(true);
    try {
      const payload = projectToPatchPayload(project);
      await mediaApi.updateMedia(storeMediaId, payload);
      setLastSavedAt(new Date());
    } catch (_) {
      // toast or inline error
    } finally {
      setSaving(false);
    }
  };

  const handleRenderExport = async () => {
    if (!storeMediaId || !canRerenderReel(status)) return;
    if (isReelProcessing(status)) return;
    setRendering(true);
    try {
      if (project) {
        const payload = projectToPatchPayload(project);
        await mediaApi.updateMedia(storeMediaId, payload);
      }
      const newMedia = await mediaApi.exportAsVersion(storeMediaId);
      router.push(`/videos/${newMedia.id}`);
    } catch (_) {
      setRendering(false);
    }
  };

  const [saving, setSaving] = useState(false);
  const [rendering, setRendering] = useState(false);
  const processing = isReelProcessing(status);
  const showRender = canRerenderReel(status);
  const selectedScene = useMemo(
    () => project?.scenes.find((s) => s.id === selectedSceneId) ?? null,
    [project, selectedSceneId]
  );
  const statusConfig = getReelStatusConfig(status);

  if (authLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-[#f6f7f9] overflow-hidden">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) return null;

  if (projectLoading || !apiProject) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-[#f6f7f9] overflow-hidden">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-[#f6f7f9] overflow-hidden p-4">
        <div className="rounded-lg border border-border bg-card p-8 text-center max-w-md">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto" />
          <p className="text-muted-foreground mt-4">
            Reel not found or you don&apos;t have access.
          </p>
          <Link href="/reels">
            <Button variant="outline" className="mt-4">
              Back to Reels
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-[#f6f7f9] overflow-hidden">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const statusDisplay = statusConfig.displayStatus;

  const rootClassName = "flex flex-col overflow-hidden min-h-0 h-screen w-full";
  const rootStyle = { height: "100vh" as const, display: "flex", flexDirection: "column" as const, background: "#F8F9FB" };
  const previewMaxWidth = getPreviewMaxWidth(project.meta.ratio);

  return (
    <div className={rootClassName} style={rootStyle}>
      <EditorTopBar
        backHref="/reels"
        backLabel="My Reels"
        title={project.meta.title || "Untitled"}
        onTitleChange={(t) => updateMeta({ ...project.meta, title: t })}
        statusLabel={statusConfig.label}
        statusDisplay={statusDisplay}
        lastSavedAt={lastSavedAt}
        onSave={handleSaveDraft}
        saving={saving}
        onExport={handleRenderExport}
        exporting={rendering}
        showExport={showRender}
      />

      {/* MainContent: flex 1, overflow hidden; only panels scroll */}
      <div className="flex-1 flex min-h-0 overflow-hidden min-w-0">
        <aside className="w-[248px] shrink-0 flex flex-col min-h-0 overflow-y-auto bg-white border-r border-[#E5E7EB]">
          <SceneList
            scenes={project.scenes}
            selectedSceneId={selectedSceneId}
            onSelectScene={setSelectedSceneId}
            onAddScene={addScene}
            onRemoveScene={removeScene}
            canRemove={project.scenes.length > 1}
          />
        </aside>

        <main className="flex-1 flex flex-col min-w-0 min-h-0 overflow-hidden bg-[#F8F9FB]">
          {/* Preview section: video + hover overlay controls inside one wrapper */}
          <section
            className="flex-1 min-h-0 flex justify-center items-center overflow-visible"
            style={{ background: "#F3F4F6" }}
            aria-label="Preview"
          >
            <div
              className="h-full w-full flex justify-center items-center p-4 overflow-visible"
              style={{ maxWidth: previewMaxWidth, margin: "0 auto" }}
            >
              <div
                ref={previewWrapperRef}
                className="group relative flex justify-center items-center flex-shrink-0 w-full overflow-visible"
                style={{ maxWidth: previewMaxWidth }}
              >
                <RemotionPreview
                  project={project}
                  playerRef={playerRef}
                  onPlayingChange={setIsPlaying}
                  onFrameUpdate={setCurrentFrame}
                  seekToFrame={seekToFrame}
                  onClearSeek={() => setSeekToFrame(null)}
                  playbackRate={playbackRate}
                  loop={loop}
                  previewFit={previewFit}
                  showSafeArea={showSafeArea}
                />
                <EditorPreviewHoverControls
                  isPlaying={isPlaying}
                  onPlay={handlePlay}
                  onPause={handlePause}
                  onStepFrame={handleStepFrame}
                  currentFrame={currentFrame}
                  durationFrames={durationFrames}
                  playbackRate={playbackRate}
                  onPlaybackRateChange={setPlaybackRate}
                  loop={loop}
                  onLoopChange={setLoop}
                  showSafeArea={showSafeArea}
                  onShowSafeAreaChange={setShowSafeArea}
                  containerRef={previewWrapperRef}
                />
              </div>
            </div>
          </section>
        </main>

        <aside className="w-[300px] shrink-0 flex flex-col min-h-0 overflow-y-auto bg-white border-l border-[#E5E7EB]">
          <InspectorPanel
            project={project}
            selectedScene={selectedScene}
            onUpdateScene={updateScene}
            onUpdateMeta={updateMeta}
            onUpdateAudio={updateAudio}
            onUpdateMusicVolume={updateMusicVolume}
          />
        </aside>
      </div>

      {/* Timeline: fixed 240px, no page scroll; only timeline scrolls horizontally */}
      <section
        className="shrink-0 flex flex-col overflow-x-auto overflow-y-hidden border-t border-[#E5E7EB]"
        style={{ height: 240, background: "#F9FAFB" }}
        aria-label="Timeline"
      >
        <Timeline
          project={project}
          onSeek={(frame) => {
            setCurrentFrame(frame);
            setSeekToFrame(frame);
          }}
          selectedSceneId={selectedSceneId}
          onSelectScene={setSelectedSceneId}
          onUpdateSceneFrames={updateSceneFrames}
          onReorderScenes={reorderScenes}
        />
      </section>
    </div>
  );
}
