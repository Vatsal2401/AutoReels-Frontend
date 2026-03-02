import apiClient from "./client";

export type VideoFormat = "horizontal" | "vertical" | "square";

export interface AnimateParams {
  format?: VideoFormat;
  num_frames?: number;
  num_inference_steps?: number;
  fps?: number;
  motion_bucket_id?: number;
  noise_aug_strength?: number;
  seed?: number;
}

export interface AnimateResponse {
  video_base64: string;
  frames: number;
  seed_used: number;
}

export async function animateImage(file: File, params: AnimateParams = {}): Promise<AnimateResponse> {
  const form = new FormData();
  form.append("image", file);
  form.append("data", JSON.stringify(params));

  const res = await apiClient.post<AnimateResponse>("/image-to-video/animate", form, {
    headers: { "Content-Type": "multipart/form-data" },
    timeout: 300_000, // 5 min
  });
  return res.data;
}
