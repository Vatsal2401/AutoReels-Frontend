import apiClient from './client';

export type VideoStatus =
  | 'pending'
  | 'script_generating'
  | 'script_complete'
  | 'processing'
  | 'rendering'
  | 'completed'
  | 'failed';

export interface Video {
  id: string;
  status: VideoStatus;
  topic: string;
  script: string | null;
  final_video_url: string | null;
  error_message: string | null;
  created_at: string;
  completed_at: string | null;
}

export interface CreateVideoDto {
  topic: string;
}

export interface CreateVideoResponse {
  video_id: string;
  status: VideoStatus;
  topic: string;
}

export const videosApi = {
  createVideo: async (data: CreateVideoDto): Promise<CreateVideoResponse> => {
    const response = await apiClient.post<CreateVideoResponse>('/videos', data);
    return response.data;
  },

  getVideo: async (id: string): Promise<Video> => {
    const response = await apiClient.get<Video>(`/videos/${id}`);
    return response.data;
  },

  // Note: This endpoint needs to be added to backend
  getVideos: async (): Promise<Video[]> => {
    const response = await apiClient.get<Video[]>('/videos');
    return response.data;
  },

  getDownloadUrl: async (id: string): Promise<{ url: string }> => {
    const response = await apiClient.get<{ url: string }>(`/videos/${id}/download-url`);
    return response.data;
  },
};
