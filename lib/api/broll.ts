import apiClient from './client';

// ─── Library types ────────────────────────────────────────────────────────────

export interface BrollLibrary {
  id: string;
  userId: string;
  name: string;
  description: string | null;
  status: string;
  videoCount: number;
  indexedCount: number;
  sceneCount: number;
  scriptCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface BrollVideo {
  id: string;
  file_path: string;
  filename: string;
  status: string;
  duration_seconds: number | null;
  frame_count: number;
  ingested_at: string | null;
  error_message: string | null;
  library_id: string | null;
  user_id: string | null;
  job_status: string | null;
  job_stage: string | null;
  job_frames_processed: number | null;
  job_total_frames: number | null;
  video_summary?: string | null;
}

export interface FrameData {
  frameTime: number;
  frameIndex: number;
  caption: string | null;
}

export interface BrollIngestionJob {
  id: string;
  videoId: string;
  libraryId: string;
  status: string;
  stage: string | null;
  framesProcessed: number;
  totalFrames: number | null;
  errorMessage: string | null;
  attempts: number;
  createdAt: string;
  updatedAt: string;
}

// ─── Script types ─────────────────────────────────────────────────────────────

export interface BrollMatchResult {
  id: string;
  scriptId: string;
  lineIndex: number;
  scriptLine: string;
  primaryVideoId: string | null;
  primaryFilename: string | null;
  primaryS3Key: string | null;
  primaryFrameTime: number | null;
  primaryScore: number | null;
  altVideoId: string | null;
  altFilename: string | null;
  altFrameTime: number | null;
  altScore: number | null;
  overrideVideoId: string | null;
  overrideFilename: string | null;
  overrideS3Key: string | null;
  overrideFrameTime: number | null;
  overrideNote: string | null;
  isLocked: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BrollScript {
  id: string;
  libraryId: string;
  userId: string;
  name: string;
  scriptText: string;
  version: number;
  status: string;
  totalLines: number;
  matchedLines: number;
  createdAt: string;
  updatedAt: string;
  results?: BrollMatchResult[];
}

// ─── AIR import types ─────────────────────────────────────────────────────────

export interface BrollAirImport {
  id: string;
  libraryId: string;
  userId: string;
  boardUrl: string;
  boardId: string;
  status: string; // running | completed | partial | failed
  totalClips: number;
  importedClips: number;
  failedClips: number;
  errorMessage: string | null;
  createdAt: string;
  updatedAt: string;
}

// ─── Legacy types (kept for backward compat) ─────────────────────────────────

export interface ClipMatch {
  filename: string;
  file_path: string;
  frame_time: number;
  similarity_score: number;
  duration_seconds: number | null;
}

export interface ScriptLineResult {
  script_line: string;
  matches: ClipMatch[];
}

export interface MatchResponse {
  results: ScriptLineResult[];
  csv: string;
}

export interface BrollLibraryStats {
  total: number;
  done: number;
  pending: number;
  error: number;
  videos: {
    id: string;
    filename: string;
    file_path: string;
    status: string;
    duration_seconds: number | null;
    frame_count: number;
    ingested_at: string | null;
    error_message: string | null;
  }[];
}

// ─── API client ───────────────────────────────────────────────────────────────

export const brollApi = {
  // Libraries
  createLibrary: (dto: { name: string; description?: string }) =>
    apiClient.post<BrollLibrary>('/broll/libraries', dto).then((r) => r.data),
  listLibraries: () =>
    apiClient.get<BrollLibrary[]>('/broll/libraries').then((r) => r.data),
  getLibrary: (id: string) =>
    apiClient.get<BrollLibrary>(`/broll/libraries/${id}`).then((r) => r.data),
  updateLibrary: (id: string, dto: { name?: string; description?: string }) =>
    apiClient.patch<{ success: boolean }>(`/broll/libraries/${id}`, dto).then((r) => r.data),
  deleteLibrary: (id: string) =>
    apiClient.delete(`/broll/libraries/${id}`),

  // Videos
  presignUpload: (
    libId: string,
    filename: string,
    contentType?: string,
  ): Promise<{ uploadUrl: string; s3Key: string; videoId: string }> =>
    apiClient
      .post(`/broll/libraries/${libId}/videos/presign`, { filename, contentType })
      .then((r) => r.data as { uploadUrl: string; s3Key: string; videoId: string }),

  uploadVideoToLibrary: async (
    libId: string,
    file: File,
    onProgress?: (pct: number) => void,
  ): Promise<{ videoId: string; s3Key: string }> => {
    const presign = await brollApi.presignUpload(libId, file.name, file.type || 'video/mp4');
    await new Promise<void>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('PUT', presign.uploadUrl);
      xhr.setRequestHeader('Content-Type', file.type || 'video/mp4');
      xhr.upload.onprogress = (e) => {
        if (onProgress && e.lengthComputable) {
          onProgress(Math.round((e.loaded * 100) / e.total));
        }
      };
      xhr.onload = () =>
        xhr.status >= 200 && xhr.status < 300
          ? resolve()
          : reject(new Error(`S3 upload failed: ${xhr.status}`));
      xhr.onerror = () => reject(new Error('S3 upload network error'));
      xhr.send(file);
    });
    return { videoId: presign.videoId, s3Key: presign.s3Key };
  },

  confirmUpload: (libId: string, videoId: string): Promise<void> =>
    apiClient.post(`/broll/libraries/${libId}/videos/${videoId}/confirm`).then(() => undefined),

  listVideos: (libId: string) =>
    apiClient.get<BrollVideo[]>(`/broll/libraries/${libId}/videos`).then((r) => r.data),
  deleteVideo: (libId: string, videoId: string) =>
    apiClient.delete(`/broll/libraries/${libId}/videos/${videoId}`),
  indexAll: (libId: string) =>
    apiClient.post<{ queued: number }>(`/broll/libraries/${libId}/index`).then((r) => r.data),
  indexOne: (libId: string, videoId: string) =>
    apiClient.post(`/broll/libraries/${libId}/videos/${videoId}/index`).then((r) => r.data),
  reindexOne: (libId: string, videoId: string) =>
    apiClient.post(`/broll/libraries/${libId}/videos/${videoId}/reindex`).then((r) => r.data),
  listJobs: (libId: string) =>
    apiClient.get<BrollIngestionJob[]>(`/broll/libraries/${libId}/jobs`).then((r) => r.data),
  getVideoPreviewUrl: (libId: string, videoId: string) =>
    apiClient
      .get<{ signedUrl: string }>(`/broll/libraries/${libId}/videos/${videoId}/preview`)
      .then((r) => r.data),
  getVideoFrames: (libId: string, videoId: string): Promise<FrameData[]> =>
    apiClient
      .get<FrameData[]>(`/broll/libraries/${libId}/videos/${videoId}/frames`)
      .then((r) => r.data),

  // Scripts
  createScript: (libId: string, dto: { name?: string; scriptText?: string }) =>
    apiClient.post<BrollScript>(`/broll/libraries/${libId}/scripts`, dto).then((r) => r.data),
  listScripts: (libId: string) =>
    apiClient.get<BrollScript[]>(`/broll/libraries/${libId}/scripts`).then((r) => r.data),
  getScript: (libId: string, sid: string) =>
    apiClient.get<BrollScript>(`/broll/libraries/${libId}/scripts/${sid}`).then((r) => r.data),
  updateScript: (libId: string, sid: string, dto: { name?: string; scriptText?: string }) =>
    apiClient.patch<{ success: boolean }>(`/broll/libraries/${libId}/scripts/${sid}`, dto).then((r) => r.data),
  deleteScript: (libId: string, sid: string) =>
    apiClient.delete(`/broll/libraries/${libId}/scripts/${sid}`),
  runScript: (libId: string, sid: string, dto?: { topK?: number }) =>
    apiClient.post<BrollScript>(`/broll/libraries/${libId}/scripts/${sid}/run`, dto ?? {}).then((r) => r.data),
  overrideResult: (
    libId: string,
    sid: string,
    lineIndex: number,
    dto: {
      overrideVideoId: string;
      overrideFilename: string;
      overrideS3Key: string;
      overrideFrameTime: number;
      overrideNote?: string;
    },
  ) =>
    apiClient
      .patch(`/broll/libraries/${libId}/scripts/${sid}/results/${lineIndex}/override`, dto)
      .then((r) => r.data),
  lockResult: (libId: string, sid: string, lineIndex: number, locked: boolean) =>
    apiClient
      .patch(`/broll/libraries/${libId}/scripts/${sid}/results/${lineIndex}/lock`, { locked })
      .then((r) => r.data),
  exportScript: (libId: string, sid: string, format: string) =>
    apiClient
      .get<{ content: string; format: string }>(`/broll/libraries/${libId}/scripts/${sid}/export?format=${format}`)
      .then((r) => r.data),

  // Multipart upload (for files ≥ 100 MB)
  presignMultipart: (
    libId: string,
    filename: string,
    contentType: string,
    size: number,
  ): Promise<{ uploadId: string; key: string; videoId: string }> =>
    apiClient
      .post(`/broll/libraries/${libId}/videos/presign-multipart`, { filename, contentType, size })
      .then((r) => r.data as { uploadId: string; key: string; videoId: string }),

  presignParts: (
    libId: string,
    videoId: string,
    uploadId: string,
    key: string,
    partNumbers: number[],
  ): Promise<{ parts: { partNumber: number; url: string }[] }> =>
    apiClient
      .post(`/broll/libraries/${libId}/videos/presign-parts`, { videoId, uploadId, key, partNumbers })
      .then((r) => r.data as { parts: { partNumber: number; url: string }[] }),

  completeMultipart: (
    libId: string,
    videoId: string,
    uploadId: string,
    key: string,
    parts: { partNumber: number; etag: string }[],
  ): Promise<{ videoId: string }> =>
    apiClient
      .post(`/broll/libraries/${libId}/videos/complete-multipart`, { videoId, uploadId, key, parts })
      .then((r) => r.data as { videoId: string }),

  abortMultipart: (libId: string, videoId: string, uploadId: string, key: string): Promise<void> =>
    apiClient
      .delete(`/broll/libraries/${libId}/videos/abort-multipart`, { data: { videoId, uploadId, key } })
      .then(() => undefined),

  // AIR → S3 server-side import
  importFromAir: (
    libId: string,
    dto: { boardUrl: string; airApiKey: string; autoIndex?: boolean },
  ): Promise<BrollAirImport> =>
    apiClient.post(`/broll/libraries/${libId}/import/air`, dto).then((r) => r.data as BrollAirImport),
  listImportJobs: (libId: string): Promise<BrollAirImport[]> =>
    apiClient.get(`/broll/libraries/${libId}/import-jobs`).then((r) => r.data as BrollAirImport[]),

  // Clip search (for ClipPickerPanel — Replace flow)
  searchClips: (libId: string, query: string, topK = 10): Promise<ClipMatch[]> =>
    apiClient
      .post<ClipMatch[]>(`/broll/libraries/${libId}/search`, { query, topK })
      .then((r) => r.data),

  // Legacy endpoints (kept for backward compat)
  uploadVideo: async (file: File, onProgress?: (pct: number) => void) => {
    const { data: presign } = await apiClient.post<{ uploadUrl: string; s3Key: string }>(
      '/broll/videos/presign',
      { filename: file.name, contentType: file.type || 'video/mp4' },
    );
    await new Promise<void>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('PUT', presign.uploadUrl);
      xhr.setRequestHeader('Content-Type', file.type || 'video/mp4');
      xhr.upload.onprogress = (e) => {
        if (onProgress && e.lengthComputable) onProgress(Math.round((e.loaded * 100) / e.total));
      };
      xhr.onload = () =>
        xhr.status >= 200 && xhr.status < 300
          ? resolve()
          : reject(new Error(`S3 upload failed: ${xhr.status}`));
      xhr.onerror = () => reject(new Error('S3 upload network error'));
      xhr.send(file);
    });
    const { data } = await apiClient.post('/broll/videos/ingest', {
      s3Key: presign.s3Key,
      filename: file.name,
    });
    return data;
  },
  matchScript: async (scriptLines: string[], topK = 2): Promise<MatchResponse> => {
    const res = await apiClient.post<MatchResponse>('/broll/match', {
      scriptLines,
      topK,
      dedupConsecutive: true,
    });
    return res.data;
  },
  listVideos_legacy: async (): Promise<BrollLibraryStats> => {
    const res = await apiClient.get<BrollLibraryStats>('/broll/videos');
    return res.data;
  },
};
