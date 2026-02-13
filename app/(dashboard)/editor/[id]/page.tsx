"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/hooks/useAuth";
import { useEditorProject } from "@/lib/hooks/useEditorProject";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { useEditorStore } from "@/lib/editor/editor-store";
import { canRerenderReel, isReelProcessing } from "@/lib/constants/reel-status";
import { mediaApi } from "@/lib/api/media";
import { projectToPatchPayload } from "@/lib/editor/mapApiToProject";
import { SceneList } from "@/components/editor/SceneList";
import { RemotionPreview } from "@/components/editor/RemotionPreview";
import { InspectorPanel } from "@/components/editor/InspectorPanel";
import {
  ArrowLeft,
  Loader2,
  Save,
  Film,
  AlertCircle,
  Pencil,
} from "lucide-react";

export default function EditorPage() {
  const router = useRouter();
  const params = useParams();
  const mediaId = params.id as string;
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { project: apiProject, isLoading: projectLoading, error } = useEditorProject(
    mediaId,
    !!isAuthenticated
  );

  const {
    project,
    mediaId: storeMediaId,
    status,
    selectedSceneId,
    lastSavedAt,
    initFromPayload,
    setMedia,
    setSelectedSceneId,
    updateScene,
    addScene,
    removeScene,
    updateMeta,
    updateAudio,
    setLastSavedAt,
    reset,
  } = useEditorStore();

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

  if (authLoading) {
    return (
      <DashboardLayout>
        <div className="flex min-h-screen items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  if (!isAuthenticated) return null;

  if (projectLoading || !apiProject) {
    return (
      <DashboardLayout>
        <div className="flex min-h-[60vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="max-w-md mx-auto py-12 px-4">
          <div className="rounded-lg border border-border bg-card p-8 text-center">
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
      </DashboardLayout>
    );
  }

  if (!project) {
    return (
      <DashboardLayout>
        <div className="flex min-h-[60vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col h-[calc(100vh-4rem)] bg-background">
        {/* Top bar: breadcrumb, title, actions */}
        <header className="shrink-0 flex items-center justify-between gap-4 px-4 py-2 border-b border-border bg-card">
          <div className="flex items-center gap-3 min-w-0">
            <Link href="/reels">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-1" />
                My Reels
              </Button>
            </Link>
            <span className="text-muted-foreground">Editor</span>
            <span className="text-sm font-medium truncate flex items-center gap-1">
              {project.meta.title || "Untitled"}
              <Pencil className="h-3 w-3 text-muted-foreground" />
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {lastSavedAt && (
              <span className="text-xs text-muted-foreground">
                Saved just now
              </span>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={handleSaveDraft}
              disabled={processing || saving}
            >
              {saving ? (
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-1" />
              )}
              Save Draft
            </Button>
            {showRender && (
              <Button
                size="sm"
                onClick={handleRenderExport}
                disabled={processing || rendering}
              >
                {rendering ? (
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                ) : (
                  <Film className="h-4 w-4 mr-1" />
                )}
                Render & Export
              </Button>
            )}
          </div>
        </header>

        {/* 3-column layout */}
        <div className="flex-1 flex min-h-0">
          {/* Left: Scene list */}
          <aside className="w-64 shrink-0 flex flex-col border-r border-border">
            <SceneList
              scenes={project.scenes}
              selectedSceneId={selectedSceneId}
              onSelectScene={setSelectedSceneId}
              onAddScene={addScene}
              onRemoveScene={removeScene}
              canRemove={project.scenes.length > 1}
            />
          </aside>

          {/* Center: Remotion preview */}
          <main className="flex-1 flex items-center justify-center p-4 min-w-0 bg-muted/20">
            <div className="w-full max-w-md">
              <RemotionPreview project={project} />
            </div>
          </main>

          {/* Right: Inspector */}
          <aside className="w-72 shrink-0 flex flex-col">
            <InspectorPanel
              project={project}
              selectedScene={selectedScene}
              onUpdateScene={updateScene}
              onUpdateMeta={updateMeta}
              onUpdateAudio={updateAudio}
            />
          </aside>
        </div>
      </div>
    </DashboardLayout>
  );
}
