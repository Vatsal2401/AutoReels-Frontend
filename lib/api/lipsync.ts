import apiClient from "./client";

export interface LipSyncParams {
  bbox_shift?: number;
  fps?: number;
  batch_size?: number;
}

export interface LipSyncResponse {
  video_base64: string;
  duration: number;
  fps: number;
}

export async function lipSync(
  faceFile: File,
  audioFile: File,
  params: LipSyncParams = {},
): Promise<LipSyncResponse> {
  const form = new FormData();
  form.append("face", faceFile);
  form.append("audio", audioFile);
  form.append("data", JSON.stringify(params));

  const res = await apiClient.post<LipSyncResponse>("/lipsync", form, {
    headers: { "Content-Type": "multipart/form-data" },
    timeout: 600_000, // 10 min — MuseTalk can be slow on long audio
  });
  return res.data;
}
