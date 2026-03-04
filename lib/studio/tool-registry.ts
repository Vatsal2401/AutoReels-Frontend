import type { LucideIcon } from "lucide-react";
import { Video, Type, Image, Maximize2, Minus, Clapperboard, Mic2, UserCheck } from "lucide-react";

export type ToolCategory = "video" | "image" | "text";

export interface ToolEntry {
  id: string;
  name: string;
  description: string;
  route: string;
  icon: LucideIcon;
  comingSoon?: boolean;
  creditCost?: number;
  category?: ToolCategory;
}

/** User-facing tool id and route; API still uses tool_type "kinetic-typography". */
const GRAPHIC_MOTION_TOOL: ToolEntry = {
  id: "graphic-motion",
  name: "Graphic Motion",
  description: "Animate text and headlines into motion graphics with AI-driven scenes, layout, and templates.",
  route: "/studio/graphic-motion",
  icon: Type,
  creditCost: 1,
  category: "text",
};

const VIDEO_RESIZER_TOOL: ToolEntry = {
  id: "video-resizer",
  name: "Video Resizer",
  description: "Change video resolution and aspect ratio. 100% free. Processed on our servers.",
  route: "/studio/video-resizer",
  icon: Maximize2,
  category: "video",
};

const VIDEO_COMPRESSOR_TOOL: ToolEntry = {
  id: "video-compressor",
  name: "Video Compressor",
  description: "Reduce video file size. 100% free. Unlimited usage.",
  route: "/studio/video-compressor",
  icon: Minus,
  category: "video",
};

export const UGC_VIDEO_TOOL: ToolEntry = {
  id: "ugc",
  name: "UGC Video Ad",
  description: "Generate AI actor-driven influencer-style ads for TikTok and Instagram Reels.",
  route: "/studio/ugc",
  icon: UserCheck,
  creditCost: 3,
  category: "video",
};

const TOOL_LIST: ToolEntry[] = [
  {
    id: "reel",
    name: "Reel",
    description: "Create short-form video reels from a topic or script with AI-generated visuals and voice.",
    route: "/studio/reel",
    icon: Video,
    creditCost: 1,
    category: "video",
  },
  UGC_VIDEO_TOOL,
  GRAPHIC_MOTION_TOOL,
  VIDEO_RESIZER_TOOL,
  VIDEO_COMPRESSOR_TOOL,
  {
    id: "text-to-image",
    name: "Text to Image",
    description: "Generate images from text prompts using AI.",
    route: "/studio/text-to-image",
    icon: Image,
    creditCost: 0,
    category: "image",
  },
  {
    id: "image-to-video",
    name: "Image to Video",
    description: "Animate any image into a short cinematic video using AI.",
    route: "/studio/image-to-video",
    icon: Clapperboard,
    category: "video",
  },
  {
    id: "lipsync",
    name: "Lip Sync",
    description: "Animate a face image to speak any audio using AI-driven lip sync.",
    route: "/studio/lipsync",
    icon: Mic2,
    category: "video",
  },
];

export const TOOL_REGISTRY: ToolEntry[] = TOOL_LIST;

export function getToolById(id: string): ToolEntry | undefined {
  if (id === "kinetic-typography") return GRAPHIC_MOTION_TOOL;
  if (id === "video-resize") return VIDEO_RESIZER_TOOL;
  if (id === "video-compress") return VIDEO_COMPRESSOR_TOOL;
  return TOOL_LIST.find((t) => t.id === id);
}
