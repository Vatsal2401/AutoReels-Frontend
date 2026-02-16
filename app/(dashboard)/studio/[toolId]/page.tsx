"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, Suspense } from "react";
import { getToolById } from "@/lib/studio/tool-registry";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { GraphicMotionWorkspace } from "@/components/studio/GraphicMotionWorkspace";
import { CreateVideoForm } from "@/components/video/CreateVideoForm";
import { Loader2 } from "lucide-react";

export default function StudioToolPage() {
  const params = useParams();
  const router = useRouter();
  const toolId = params?.toolId as string;
  const tool = toolId ? getToolById(toolId) : undefined;

  useEffect(() => {
    if (!toolId) return;
    if (toolId === "kinetic-typography") {
      router.replace("/studio/graphic-motion");
      return;
    }
    if (!tool) {
      router.replace("/studio");
    }
  }, [toolId, tool, router]);

  if (tool?.id === "reel") {
    return (
      <DashboardLayout>
        <div className="flex flex-col lg:h-full lg:overflow-hidden">
          <Suspense
            fallback={
              <div className="flex items-center justify-center h-full min-h-[60vh]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            }
          >
            <CreateVideoForm />
          </Suspense>
        </div>
      </DashboardLayout>
    );
  }

  if (!tool) {
    return null;
  }

  if (tool.id === "graphic-motion") {
    return (
      <DashboardLayout>
        <div className="h-full min-h-0 overflow-hidden flex flex-col bg-background p-6 sm:p-8">
          <GraphicMotionWorkspace />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="h-full overflow-y-auto custom-scrollbar bg-background p-6 sm:p-8">
        <div className="max-w-xl mx-auto text-center space-y-6 py-16">
          <div className="w-16 h-16 rounded-2xl bg-muted border border-border flex items-center justify-center mx-auto">
            <tool.icon className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-xl font-bold text-foreground">{tool.name}</h1>
          <p className="text-muted-foreground text-sm">{tool.description}</p>
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
            Coming soon
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}
