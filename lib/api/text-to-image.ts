import apiClient from "./client";

export interface GenerateImageDto {
  prompt: string;
  aspectRatio: "9:16" | "16:9" | "1:1";
  model: "standard" | "fast" | "nano";
}

export interface GenerateImageResult {
  projectId: string;
  imageUrl: string;
  status: string;
}

export const textToImageApi = {
  generate: (dto: GenerateImageDto) =>
    apiClient
      .post<GenerateImageResult>("/text-to-image/generate", dto)
      .then((r) => r.data),
};
