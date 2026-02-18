"use client";

import { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/hooks/useAuth";
import { projectsApi, Project, ProjectStatus } from "@/lib/api/projects";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Download,
  Plus,
  AlertCircle,
  Loader2,
  CheckCircle2,
  FileText,
} from "lucide-react";
import { formatRelativeTime, cn } from "@/lib/utils/format";
import { getToolById } from "@/lib/studio/tool-registry";
import { VideoPlayer } from "@/components/video/VideoPlayer";

const STATUS_CONFIG: Record<
  ProjectStatus,
  { label: string; dotClass: string; textClass: string; icon: typeof Loader2; spin?: boolean }
> = {
  pending: { label: "Queued", dotClass: "bg-muted-foreground/60", textClass: "text-muted-foreground", icon: Loader2, spin: true },
  processing: { label: "Creating", dotClass: "bg-amber-500", textClass: "text-amber-600", icon: Loader2, spin: true },
  rendering: { label: "Rendering", dotClass: "bg-primary", textClass: "text-primary", icon: Loader2, spin: true },
  completed: { label: "Done", dotClass: "bg-emerald-500", textClass: "text-emerald-600", icon: CheckCircle2 },
  failed: { label: "Failed", dotClass: "bg-red-500", textClass: "text-red-600", icon: AlertCircle },
};

function getProjectTitle(project: Project): string {
  const meta = project.metadata as { topic?: string; script?: string } | null;
  if (meta?.topic) return meta.topic;
  if (meta?.script && typeof meta.script === "string") {
    return meta.script.slice(0, 60) + (meta.script.length > 60 ? "…" : "");
  }
  const tool = getToolById(project.tool_type);
  return tool?.name ?? project.tool_type;
}

export default function ProjectDetailPage() {
  const router = useRouter();
  const params = useParams();
  const projectId = params?.id as string;
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  const { data: project, isLoading, error } = useQuery({
    queryKey: ["project", projectId],
    queryFn: () => projectsApi.getProject(projectId),
    enabled: !!projectId && isAuthenticated,
  });

  const { data: outputUrl, isLoading: urlLoading } = useQuery({
    queryKey: ["project-output-url", projectId],
    queryFn: () => projectsApi.getOutputUrl(projectId),
    enabled: !!projectId && project?.status === "completed",
  });

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, authLoading, router]);

  if (authLoading || (projectId && isLoading)) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="mt-4 text-sm text-muted-foreground">Loading project…</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!isAuthenticated) return null;

  if (error || !project) {
    return (
      <DashboardLayout>
        <div className="max-w-2xl mx-auto px-4 py-12">
          <Card>
            <CardContent className="pt-12 pb-12">
              <div className="text-center space-y-6">
                <div className="flex justify-center">
                  <div className="flex items-center justify-center w-20 h-20 rounded-full bg-destructive/20 border border-destructive/30">
                    <AlertCircle className="h-10 w-10 text-destructive" />
                  </div>
                </div>
                <div>
                  <h2 className="text-2xl font-semibold mb-2">Project not found</h2>
                  <p className="text-muted-foreground mb-6">
                    The project you're looking for doesn't exist or you don't have access.
                  </p>
                </div>
                <Link href="/projects">
                  <Button>Back to Projects</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  const isProcessing = ["pending", "processing", "rendering"].includes(project.status);
  const isCompleted = project.status === "completed";
  const isFailed = project.status === "failed";
  const tool = getToolById(project.tool_type);
  const isGraphicMotion = project.tool_type === "kinetic-typography";
  const isTextToImage = project.tool_type === "text-to-image";
  const scriptSnippet = (project.metadata as { script?: string })?.script;
  const format = (project.metadata as { format?: "reels" | "tiktok" | "horizontal" | "square" })?.format;
  const meta = project.metadata as { aspectRatio?: string } | null;
  const aspectClass = isTextToImage
    ? meta?.aspectRatio === "16:9"
      ? "aspect-video"
      : meta?.aspectRatio === "1:1"
        ? "aspect-square"
        : "aspect-[9/16]"
    : format === "horizontal"
      ? "aspect-video"
      : format === "square"
        ? "aspect-square"
        : "aspect-[9/16]";

  return (
    <DashboardLayout>
      <div className="relative flex flex-col min-h-full h-full">
        <div className="w-full max-w-[1920px] mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 py-4 lg:py-6 flex flex-col flex-1 min-h-0">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6 mb-6">
            <div className="flex items-start sm:items-center gap-3 lg:gap-8">
              <Link href="/projects">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 px-2 sm:px-3 text-[10px] font-bold tracking-wider"
                >
                  <ArrowLeft className="mr-1 sm:mr-2 h-3 w-3" />
                  <span className="hidden sm:inline">BACK TO PROJECTS</span>
                  <span className="sm:hidden">BACK</span>
                </Button>
              </Link>
              <div className="h-6 w-px bg-border hidden sm:block" />
              <div className="flex flex-col min-w-0">
                <h1 className="text-sm lg:text-lg font-bold tracking-tight text-foreground line-clamp-2">
                  {getProjectTitle(project)}
                </h1>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[9px] lg:text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">
                    {tool?.name ?? project.tool_type}
                  </span>
                  <span className="text-[10px] text-muted-foreground/40">•</span>
                  <span className="text-[9px] lg:text-[10px] text-muted-foreground/70">
                    {formatRelativeTime(project.created_at)}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {isCompleted && (
                <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
                  <CheckCircle2 size={10} className="mr-1.5" />
                  READY
                </Badge>
              )}
              {isProcessing && (
                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 animate-pulse">
                  <Loader2 size={10} className="mr-1.5 animate-spin" />
                  {project.status === "rendering" || project.status === "processing"
                    ? "RENDERING"
                    : "QUEUED"}
                </Badge>
              )}
              {isFailed && (
                <Badge variant="outline" className="bg-red-500/10 text-red-600 border-red-500/20">
                  <AlertCircle size={10} className="mr-1.5" />
                  FAILED
                </Badge>
              )}
            </div>
          </div>

          {/* Processing */}
          {isProcessing && (
            <div className="max-w-2xl mx-auto py-12">
              <Card className="bg-card border-border overflow-hidden rounded-2xl">
                <CardContent className="px-10 py-16">
                  <div className="flex flex-col items-center justify-center gap-6 text-center">
                    <Loader2 className="h-14 w-14 animate-spin text-primary" />
                    <div>
                      <h2 className="text-lg font-semibold text-foreground">
                        {project.status === "rendering" || project.status === "processing"
                          ? isTextToImage ? "Generating your image" : "Rendering your video"
                          : "Queued"}
                      </h2>
                      <p className="text-sm text-muted-foreground mt-1">
                        This may take a few minutes. You can leave and come back.
                      </p>
                    </div>
                    <Link href="/projects">
                      <Button variant="outline">Back to Projects</Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Failed */}
          {isFailed && (
            <div className="max-w-2xl mx-auto py-12">
              <Card className="bg-card border-destructive/20 overflow-hidden rounded-2xl">
                <CardContent className="pt-12 pb-12">
                  <div className="text-center space-y-6">
                    <div className="flex justify-center">
                      <div className="flex items-center justify-center w-20 h-20 rounded-full bg-destructive/10 border border-destructive/20">
                        <AlertCircle className="h-10 w-10 text-destructive" />
                      </div>
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-foreground">Render failed</h2>
                      <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto">
                        {project.error_message || "Something went wrong. Please try again."}
                      </p>
                    </div>
                    <div className="flex gap-3 justify-center">
                      <Link href={isGraphicMotion ? "/studio/graphic-motion" : "/projects"}>
                        <Button>Try again</Button>
                      </Link>
                      <Link href="/projects">
                        <Button variant="outline">Back to Projects</Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Completed: Video + sidebar — use full width */}
          {isCompleted && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 flex-1 min-h-0">
              <div className="lg:col-span-9 flex flex-col gap-4 min-h-0">
                <div className="flex-1 min-h-[320px] lg:min-h-0 bg-muted/10 border border-border/50 rounded-2xl overflow-hidden flex items-center justify-center p-4 lg:p-6">
                  {urlLoading ? (
                    <div className="flex flex-col items-center gap-4">
                      <Loader2 className="h-10 w-10 animate-spin text-primary" />
                      <span className="text-sm text-muted-foreground">
                        {isTextToImage ? "Loading image…" : "Loading video…"}
                      </span>
                    </div>
                  ) : outputUrl ? (
                    isTextToImage ? (
                      <img
                        src={outputUrl}
                        alt={getProjectTitle(project)}
                        className="max-w-full max-h-full rounded-2xl shadow-lg object-contain"
                        style={{ maxHeight: "70vh" }}
                      />
                    ) : (
                      <div className={cn("w-full max-w-full rounded-2xl overflow-hidden shadow-lg bg-black", aspectClass)}>
                        <VideoPlayer videoUrl={outputUrl} title={getProjectTitle(project)} />
                      </div>
                    )
                  ) : (
                    <div className="text-center text-muted-foreground text-sm">
                      {isTextToImage ? "Image URL not available." : "Video URL not available."}
                    </div>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-4 p-4 bg-muted/20 border border-border/50 rounded-2xl shrink-0">
                  {outputUrl && (
                    <a
                      href={outputUrl}
                      download={isTextToImage ? "output.jpg" : "output.mp4"}
                    >
                      <Button variant="secondary" size="lg" className="gap-2">
                        <Download className="h-4 w-4" />
                        Download
                      </Button>
                    </a>
                  )}
                  <Link
                    href={
                      isTextToImage
                        ? "/studio/text-to-image"
                        : isGraphicMotion
                          ? "/studio/graphic-motion"
                          : "/studio/reel"
                    }
                  >
                    <Button size="lg" className="gap-2">
                      <Plus className="h-4 w-4" />
                      Create another
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="lg:col-span-3 flex flex-col min-h-0">
                <Card className="border border-border/60 rounded-2xl overflow-hidden flex-1 flex flex-col min-h-0">
                  <CardContent className="p-5 lg:p-6 flex flex-col flex-1 min-h-0 gap-5">
                    {scriptSnippet && (
                      <div className="flex flex-col min-h-0 flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2 shrink-0">
                          <FileText className="h-4 w-4 text-primary" />
                          <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                            Script
                          </h4>
                        </div>
                        <div className="p-3 bg-muted/30 rounded-xl min-h-0 flex-1 overflow-y-auto">
                          <p className="text-sm text-foreground/90 whitespace-pre-wrap">
                            {scriptSnippet}
                          </p>
                        </div>
                      </div>
                    )}
                    <div className="grid grid-cols-2 gap-3 shrink-0">
                      <div className="p-3 bg-muted/30 rounded-xl">
                        <span className="block text-[10px] font-bold uppercase text-muted-foreground/70 mb-1">
                          Tool
                        </span>
                        <span className="text-sm font-semibold text-foreground">
                          {tool?.name ?? project.tool_type}
                        </span>
                      </div>
                      {project.duration != null && (
                        <div className="p-3 bg-muted/30 rounded-xl">
                          <span className="block text-[10px] font-bold uppercase text-muted-foreground/70 mb-1">
                            Duration
                          </span>
                          <span className="text-sm font-semibold text-foreground">
                            {project.duration >= 60
                              ? `${Math.floor(project.duration / 60)}:${String(project.duration % 60).padStart(2, "0")}`
                              : `${project.duration}s`}
                          </span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
