import apiClient from "./client";

export type ProjectStatus =
  | "pending"
  | "processing"
  | "rendering"
  | "completed"
  | "failed";

export interface Project {
  id: string;
  user_id: string | null;
  tool_type: string;
  status: ProjectStatus;
  output_url: string | null;
  thumbnail_url: string | null;
  metadata: Record<string, unknown> | null;
  duration: number | null;
  credit_cost: number;
  error_message: string | null;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
  media_id?: string | null;
}

export interface CreateProjectDto {
  tool_type: string;
  script?: string;
  stylePreset?: string;
  animationIntensity?: string;
  fontFamily?: string;
  highlightWords?: string[];
  credit_cost?: number;
  useGraphicMotionEngine?: boolean;
  format?: "reels" | "tiktok" | "horizontal" | "square";
  videoStyle?: string;
  globalTone?: string;
  /** Background music (graphic motion): id from GET /music/system, volume 0–1. */
  music?: { id: string; volume?: number };
  [key: string]: unknown;
}

export const projectsApi = {
  getProjects: async (): Promise<Project[]> => {
    const { data } = await apiClient.get<Project[]>("/projects");
    return data;
  },

  getProject: async (id: string): Promise<Project> => {
    const { data } = await apiClient.get<Project>(`/projects/${id}`);
    return data;
  },

  createProject: async (dto: CreateProjectDto): Promise<Project> => {
    const { data } = await apiClient.post<Project>("/projects", dto);
    return data;
  },

  getOutputUrl: async (projectId: string): Promise<string> => {
    const { data } = await apiClient.get<{ url: string }>(`/projects/${projectId}/output-url`);
    return data.url;
  },
};
