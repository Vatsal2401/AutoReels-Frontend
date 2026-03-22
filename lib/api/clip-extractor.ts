import apiClient from './client';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export type CaptionStyle = 'bold' | 'minimal' | 'neon' | 'classic';

export type ClipExtractStatus =
  | 'pending'
  | 'downloading'
  | 'transcribing'
  | 'analyzing'
  | 'clipping'
  | 'rendering'
  | 'completed'
  | 'failed'
  | 'rate_limited';

export type ClipRenderStatus = 'pending' | 'rendering' | 'done' | 'failed';

export interface ClipExtractOptions {
  maxClips: number;
  minClipSec: number;
  maxClipSec: number;
  removeSilence: boolean;
  captionStyle: CaptionStyle;
  splitScreenBroll: boolean;
  brollLibraryId?: string;
}

export interface CreateClipExtractJobDto {
  sourceUrl: string;
  maxClips?: number;
  minClipSec?: number;
  maxClipSec?: number;
  removeSilence?: boolean;
  captionStyle?: CaptionStyle;
  splitScreenBroll?: boolean;
  brollLibraryId?: string;
}

export interface ExtractedClip {
  id: string;
  clipIndex: number;
  viralScore: number;
  hookLine: string;
  reasoning: string;
  tags: string[];
  startSec: number;
  endSec: number;
  durationSec: number;
  rawClipS3Key: string | null;
  renderedClipS3Key: string | null;
  thumbnailS3Key: string | null;
  renderStatus: ClipRenderStatus;
  renderError: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ClipExtractJobSummary {
  id: string;
  status: ClipExtractStatus;
  progressPct: number;
  currentStage: string | null;
  videoTitle: string | null;
  sourceVideoUrl: string;
  options: ClipExtractOptions;
  creditsReserved: number;
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
  clipsCount: number;
}

export interface ClipExtractJobStatus extends ClipExtractJobSummary {
  clips: ExtractedClip[];
  errorMessage: string | null;
  sourceVideoDurationSec: number | null;
}

export interface ClipSignedUrl {
  url: string;
  expiresAt: string;
}

export interface ClipExtractJobListResponse {
  items: ClipExtractJobSummary[];
  total: number;
  page: number;
  limit: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// API Client
// ─────────────────────────────────────────────────────────────────────────────

export const clipExtractorApi = {
  createJob: async (dto: CreateClipExtractJobDto): Promise<{ id: string; creditsDeducted: number }> => {
    const res = await apiClient.post<{ id: string; creditsDeducted: number }>('/clip-extractor/create', dto);
    return res.data;
  },

  listJobs: async (page = 1, limit = 20): Promise<ClipExtractJobListResponse> => {
    const res = await apiClient.get<ClipExtractJobListResponse>(
      `/clip-extractor/jobs?page=${page}&limit=${limit}`,
    );
    return res.data;
  },

  getJob: async (jobId: string): Promise<ClipExtractJobStatus> => {
    const res = await apiClient.get<ClipExtractJobStatus>(`/clip-extractor/jobs/${jobId}`);
    return res.data;
  },

  getClips: async (jobId: string): Promise<ExtractedClip[]> => {
    const res = await apiClient.get<ExtractedClip[]>(`/clip-extractor/jobs/${jobId}/clips`);
    return res.data;
  },

  getClipUrl: async (clipId: string): Promise<ClipSignedUrl> => {
    const res = await apiClient.get<ClipSignedUrl>(`/clip-extractor/clips/${clipId}/url`);
    return res.data;
  },

  deleteJob: async (jobId: string): Promise<void> => {
    await apiClient.delete(`/clip-extractor/jobs/${jobId}`);
  },
};
