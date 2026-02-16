import type { LucideIcon } from "lucide-react";
import { Video, Type, Image } from "lucide-react";

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
  GRAPHIC_MOTION_TOOL,
  {
    id: "text-to-image",
    name: "Text to Image",
    description: "Generate images from text prompts using AI.",
    route: "/studio/text-to-image",
    icon: Image,
    comingSoon: true,
    category: "image",
  },
];

export const TOOL_REGISTRY: ToolEntry[] = TOOL_LIST;

export function getToolById(id: string): ToolEntry | undefined {
  if (id === "kinetic-typography") return GRAPHIC_MOTION_TOOL;
  return TOOL_LIST.find((t) => t.id === id);
}
