import apiClient from './client';

export interface UploadVideoResponse {
  s3Key: string;
  filename: string;
  status: string;
}

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

export interface IngestionStatus {
  status: 'idle' | 'running' | 'completed' | 'error';
  total_files: number;
  processed: number;
  errors: number;
  current_file: string | null;
}

export interface BrollVideoInfo {
  id: string;
  filename: string;
  file_path: string;
  status: string;
  duration_seconds: number | null;
  frame_count: number;
  ingested_at: string | null;
  error_message: string | null;
}

export interface BrollLibraryStats {
  total: number;
  done: number;
  pending: number;
  error: number;
  videos: BrollVideoInfo[];
}

export const brollApi = {
  uploadVideo: async (file: File, onProgress?: (pct: number) => void): Promise<UploadVideoResponse> => {
    // 1. Get presigned PUT URL from backend
    const { data: presign } = await apiClient.post<{ uploadUrl: string; s3Key: string }>('/broll/videos/presign', {
      filename: file.name,
      contentType: file.type || 'video/mp4',
    });

    // 2. PUT file directly to S3 (browser → S3, no proxy through NestJS)
    await new Promise<void>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('PUT', presign.uploadUrl);
      xhr.setRequestHeader('Content-Type', file.type || 'video/mp4');
      xhr.upload.onprogress = (e) => {
        if (onProgress && e.lengthComputable) {
          onProgress(Math.round((e.loaded * 100) / e.total));
        }
      };
      xhr.onload = () => (xhr.status >= 200 && xhr.status < 300 ? resolve() : reject(new Error(`S3 upload failed: ${xhr.status}`)));
      xhr.onerror = () => reject(new Error('S3 upload network error'));
      xhr.send(file);
    });

    // 3. Notify backend to trigger Python ingestion
    const { data } = await apiClient.post<UploadVideoResponse>('/broll/videos/ingest', {
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

  getIngestionStatus: async (): Promise<IngestionStatus> => {
    const res = await apiClient.get<IngestionStatus>('/broll/ingest/status');
    return res.data;
  },

  listVideos: async (): Promise<BrollLibraryStats> => {
    const res = await apiClient.get<BrollLibraryStats>('/broll/videos');
    return res.data;
  },
};
