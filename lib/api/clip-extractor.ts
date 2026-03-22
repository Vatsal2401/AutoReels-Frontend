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
// Snake_case → camelCase mappers (backend returns raw TypeORM entities)
// ─────────────────────────────────────────────────────────────────────────────

function mapClip(c: any): ExtractedClip {
  return {
    id: c.id,
    clipIndex: c.clip_index,
    viralScore: c.viral_score,
    hookLine: c.hook_line,
    reasoning: c.reasoning,
    tags: c.tags ?? [],
    startSec: c.start_sec,
    endSec: c.end_sec,
    durationSec: c.duration_sec,
    rawClipS3Key: c.raw_clip_s3_key,
    renderedClipS3Key: c.rendered_clip_s3_key,
    thumbnailS3Key: c.thumbnail_s3_key,
    renderStatus: c.render_status,
    renderError: c.render_error,
    createdAt: c.created_at,
    updatedAt: c.updated_at,
  };
}

function mapJobSummary(j: any): ClipExtractJobSummary {
  return {
    id: j.id,
    status: j.status,
    progressPct: j.progress_pct,
    currentStage: j.current_stage,
    videoTitle: j.video_title,
    sourceVideoUrl: j.source_url,
    options: j.options,
    creditsReserved: j.credits_reserved,
    createdAt: j.created_at,
    updatedAt: j.updated_at,
    completedAt: j.completed_at,
    clipsCount: j.clips?.length ?? 0,
  };
}

function mapJobStatus(j: any): ClipExtractJobStatus {
  return {
    ...mapJobSummary(j),
    clips: (j.clips ?? []).map(mapClip),
    errorMessage: j.error_message,
    sourceVideoDurationSec: j.source_video_duration_sec,
  };
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
    const res = await apiClient.get<{ items: unknown[]; total: number; page: number; limit: number }>(
      `/clip-extractor/jobs?page=${page}&limit=${limit}`,
    );
    return {
      items: res.data.items.map(mapJobSummary),
      total: res.data.total,
      page: res.data.page,
      limit: res.data.limit,
    };
  },

  getJob: async (jobId: string): Promise<ClipExtractJobStatus> => {
    const res = await apiClient.get(`/clip-extractor/jobs/${jobId}`);
    return mapJobStatus(res.data);
  },

  getClips: async (jobId: string): Promise<ExtractedClip[]> => {
    const res = await apiClient.get<unknown[]>(`/clip-extractor/jobs/${jobId}/clips`);
    return res.data.map(mapClip);
  },

  getClipUrl: async (clipId: string): Promise<ClipSignedUrl> => {
    const res = await apiClient.get<ClipSignedUrl>(`/clip-extractor/clips/${clipId}/url`);
    return res.data;
  },

  getClipThumbUrl: async (clipId: string): Promise<string | null> => {
    const res = await apiClient.get<{ url: string | null }>(`/clip-extractor/clips/${clipId}/thumb-url`);
    return res.data.url;
  },

  deleteJob: async (jobId: string): Promise<void> => {
    await apiClient.delete(`/clip-extractor/jobs/${jobId}`);
  },
};
