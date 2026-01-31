import apiClient from "./client";

export type VideoStatus =
  | "pending"
  | "script_generating"
  | "script_complete"
  | "processing"
  | "rendering"
  | "completed"
  | "failed";

export interface CreateVideoDto {
  topic: string;
  language?: string;
  duration?: string;
  imageStyle?: string;
  imageAspectRatio?: string;
  voiceId?: string;
  imageProvider?: string;
}

export interface Video {
  id: string;
  status: VideoStatus;
  topic: string;
  script?: string;
  final_video_url?: string;
  error_message?: string;
  metadata?: {
    duration?: string;
    imageStyle?: string;
    imageAspectRatio?: string;
    language?: string;
  };
  created_at: string;
  completed_at?: string;
}

export const videosApi = {
  createVideo: async (data: CreateVideoDto): Promise<{ video_id: string; status: string; topic: string }> => {
    const response = await apiClient.post("/videos", data);
    return response.data;
  },

  getVideos: async (): Promise<Video[]> => {
    const response = await apiClient.get("/videos");
    return response.data;
  },

  getVideo: async (id: string): Promise<Video> => {
    const response = await apiClient.get(`/videos/${id}`);
    return response.data;
  },

  getDownloadUrl: async (id: string): Promise<{ url: string }> => {
    const response = await apiClient.get<{ url: string }>(`/videos/${id}/download-url`);
    return response.data;
  },

  searchVideos: async (query: string): Promise<Video[]> => {
    const response = await apiClient.get(`/videos/search?q=${encodeURIComponent(query)}`);
    return response.data;
  },
};
