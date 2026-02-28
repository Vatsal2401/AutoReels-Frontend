import apiClient from "./client";
import { mediaApi, Media, MediaStatus } from "./media";

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
  voiceLabel?: string;
  imageProvider?: string;
  captions?: {
    enabled: boolean;
    preset: string;
    position: 'top' | 'bottom' | 'center';
    timing: 'sentence' | 'word';
  };
  music?: {
    id?: string;
    url?: string;
    name?: string;
    volume?: number;
  };
  tone?: string;
  hookType?: string;
  cta?: string;
}

export interface Video {
  id: string;
  status: VideoStatus;
  topic: string;
  script?: string;
  final_video_url?: string;
  s3_key?: string;
  error_message?: string;
  metadata?: {
    duration?: string;
    imageStyle?: string;
    imageAspectRatio?: string;
    language?: string;
  };
  created_at: string;
  completed_at?: string;
  // New fields for progress tracking fallback
  steps?: any[];
}

const transformMediaToVideo = (media: Media): Video => {
  // Find script asset for the text
  const scriptAsset = media.assets?.find(a => a.type === "script") ||
    (media.assets_by_type?.script ? media.assets_by_type.script[0] : null);

  const scriptText = media.script ||
    scriptAsset?.metadata?.text ||
    media.input_config?.script ||
    "";

  return {
    id: media.id,
    status: media.status as VideoStatus,
    topic: media.input_config?.topic || "Untitled",
    script: scriptText,
    final_video_url: media.final_url || media.blob_storage_id || undefined,
    s3_key: media.blob_storage_id || undefined,
    error_message: media.error_message || undefined,
    metadata: {
      duration: media.input_config?.duration,
      imageStyle: media.input_config?.imageStyle,
      imageAspectRatio: media.input_config?.imageAspectRatio,
      language: media.input_config?.language,
    },
    created_at: media.created_at,
    completed_at: media.completed_at || undefined,
    steps: media.steps,
  };
};

export const videosApi = {
  createVideo: async (data: CreateVideoDto): Promise<{ video_id: string; status: string; topic: string }> => {
    const media = await mediaApi.createMedia(data);
    return {
      video_id: media.id,
      status: media.status,
      topic: media.input_config?.topic || "",
    };
  },

  getVideos: async (): Promise<Video[]> => {
    const mediaList = await mediaApi.getAllMedia();
    return mediaList.map(transformMediaToVideo);
  },

  getVideo: async (id: string): Promise<Video> => {
    const media = await mediaApi.getMedia(id);
    return transformMediaToVideo(media);
  },

  getDownloadUrl: async (id: string): Promise<{ url: string }> => {
    // Media objects in new system might have direct signed URLs in assets
    const media = await mediaApi.getMedia(id);
    return { url: media.final_url || "" };
  },

  searchVideos: async (query: string): Promise<Video[]> => {
    // Simple search fallback
    const videos = await videosApi.getVideos();
    return videos.filter(v => v.topic.toLowerCase().includes(query.toLowerCase()));
  },

  retryVideo: async (id: string): Promise<{ video_id: string; status: string; topic: string }> => {
    const media = await mediaApi.retryMedia(id);
    return {
      video_id: media.id,
      status: media.status,
      topic: media.input_config?.topic || "",
    };
  },

  updateVideo: async (id: string, data: Partial<CreateVideoDto>): Promise<void> => {
    await mediaApi.updateMedia(id, data);
  },
};
