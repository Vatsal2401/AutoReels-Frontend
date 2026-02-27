import { Metadata } from "next";
import { notFound } from "next/navigation";
import { SharedVideoView } from "@/components/share/SharedVideoView";
import { projectsApi, SharedProject } from "@/lib/api/projects";

interface Props {
  params: { token: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const project = await projectsApi.getSharedProject(params.token);
    const topic =
      (project.metadata as { topic?: string } | null)?.topic ??
      "AI-Generated Reel";
    return {
      title: `${topic} — Made with AutoReels`,
      description: "Watch this AI-generated reel and create your own for free.",
      openGraph: { title: `${topic} — Made with AutoReels`, type: "video.other" },
    };
  } catch {
    return { title: "Shared Reel — AutoReels" };
  }
}

export default async function SharePage({ params }: Props) {
  let project: SharedProject;
  try {
    project = await projectsApi.getSharedProject(params.token);
  } catch {
    notFound();
  }

  return <SharedVideoView project={project} />;
}
