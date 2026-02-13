import type { EditorProjectDto } from "@/lib/api/media";
import type { Project, EditorScene, ProjectMeta, ProjectAudio } from "./types";
import {
  REEL_FPS,
  REEL_HEIGHT,
  REEL_WIDTH,
  durationToSeconds,
  type SceneAnimation,
} from "./types";

function generateId(): string {
  return `scene-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

/**
 * Split script into lines (paragraphs or sentences) for scene captions.
 */
function scriptToLines(script: string | null): string[] {
  if (!script?.trim()) return [];
  return script
    .split(/\n+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

/**
 * Build editor Project from API editor payload.
 * Distributes duration evenly across scenes; assigns text from script lines.
 */
export function mapEditorPayloadToProject(dto: EditorProjectDto): Project {
  const durationSec = durationToSeconds(dto.duration);
  const totalFrames = Math.round(durationSec * REEL_FPS);
  const imageUrls = Array.isArray(dto.imageUrls) ? dto.imageUrls : [];
  const lines = scriptToLines(dto.script);

  const sceneCount = Math.max(1, imageUrls.length);
  const durationPerScene = Math.floor(totalFrames / sceneCount);
  const scenes: EditorScene[] = [];

  for (let i = 0; i < sceneCount; i++) {
    const startFrame = i * durationPerScene;
    const text = lines[i] ?? lines[0] ?? "";
    scenes.push({
      id: generateId(),
      imageUrl: imageUrls[i] ?? "",
      text,
      startFrame,
      durationInFrames: durationPerScene,
      animation: "zoom",
    });
  }

  // If no images from API, create one placeholder scene so editor is usable
  if (scenes.length === 0) {
    scenes.push({
      id: generateId(),
      imageUrl: "",
      text: lines[0] ?? "",
      startFrame: 0,
      durationInFrames: totalFrames,
      animation: "zoom",
    });
  }

  const meta: ProjectMeta = {
    title: dto.title || "Untitled",
    duration: durationSec,
    fps: REEL_FPS,
    ratio: "9:16",
  };

  const audio: ProjectAudio | undefined = dto.audioUrl
    ? {
        url: dto.audioUrl,
        volume: 1,
        offset: 0,
      }
    : undefined;

  return {
    id: dto.id,
    meta,
    scenes,
    audio,
  };
}

/**
 * Project → payload for PATCH (input_config + script).
 * Rebuild script from scene texts.
 */
export function projectToPatchPayload(project: Project): {
  topic: string;
  script: string;
  duration?: string;
} {
  const script = project.scenes.map((s) => s.text).filter(Boolean).join("\n\n") || "";
  let durationStr = "30-60";
  if (project.meta.duration <= 30) durationStr = "30-60";
  else if (project.meta.duration <= 45) durationStr = "30-60";
  else durationStr = "30-60";
  return {
    topic: project.meta.title,
    script,
    duration: durationStr,
  };
}

export { generateId };
