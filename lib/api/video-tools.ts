import apiClient from "./client";
import type { Project } from "./projects";

export interface ResizeOptions {
  width: number;
  height: number;
  fit: "fill" | "contain" | "cover";
}

export interface CompressOptions {
  width: number;
  height: number;
  crf: number;
  presetLabel: string;
}

export interface RequestUploadResponse {
  project: Project;
  uploadUrl: string;
  inputBlobId: string;
  expiresIn: number;
}

/**
 * 1. Get presigned upload URL from backend
 * 2. PUT file directly to S3
 * 3. Call start-job to enqueue processing
 * Returns the project (202); frontend should poll GET /projects/:id.
 */
export async function resizeVideoWithPresignedUrl(
  file: File,
  options: ResizeOptions,
  outputFileName: string
): Promise<Project> {
  const fileExtension = file.name.match(/\.[^.]+$/)?.[0]?.toLowerCase() || ".mp4";
  const { data: uploadData } = await apiClient.post<RequestUploadResponse>(
    "/video-tools/request-upload",
    {
      toolType: "video-resize",
      options,
      outputFileName,
      originalFileName: file.name,
      fileExtension,
    }
  );

  const putRes = await fetch(uploadData.uploadUrl, {
    method: "PUT",
    body: file,
    headers: { "Content-Type": file.type || "video/mp4" },
  });
  if (!putRes.ok) {
    const body = await putRes.text();
    const detail = body ? ` — ${body.slice(0, 200)}` : "";
    throw new Error(`Upload failed: ${putRes.status} ${putRes.statusText}${detail}`);
  }

  const { data: project } = await apiClient.post<Project>(
    "/video-tools/start-job",
    { projectId: uploadData.project.id, inputBlobId: uploadData.inputBlobId },
    { validateStatus: (s) => s === 202 }
  );
  return project;
}

export async function compressVideoWithPresignedUrl(
  file: File,
  options: CompressOptions,
  outputFileName: string
): Promise<Project> {
  const fileExtension = file.name.match(/\.[^.]+$/)?.[0]?.toLowerCase() || ".mp4";
  const { data: uploadData } = await apiClient.post<RequestUploadResponse>(
    "/video-tools/request-upload",
    {
      toolType: "video-compress",
      options,
      outputFileName,
      originalFileName: file.name,
      fileExtension,
    }
  );

  const putRes = await fetch(uploadData.uploadUrl, {
    method: "PUT",
    body: file,
    headers: { "Content-Type": file.type || "video/mp4" },
  });
  if (!putRes.ok) {
    const body = await putRes.text();
    const detail = body ? ` — ${body.slice(0, 200)}` : "";
    throw new Error(`Upload failed: ${putRes.status} ${putRes.statusText}${detail}`);
  }

  const { data: project } = await apiClient.post<Project>(
    "/video-tools/start-job",
    { projectId: uploadData.project.id, inputBlobId: uploadData.inputBlobId },
    { validateStatus: (s) => s === 202 }
  );
  return project;
}

/** Legacy: POST /video-tools/resize (multipart). Use when presigned upload is not available. */
export async function resizeVideo(
  file: File,
  options: ResizeOptions
): Promise<Project> {
  const form = new FormData();
  form.append("file", file);
  form.append("options", JSON.stringify(options));
  const { data } = await apiClient.post<Project>("/video-tools/resize", form, {
    headers: { "Content-Type": "multipart/form-data" },
    validateStatus: (s) => s === 202,
  });
  return data;
}

/** Legacy: POST /video-tools/compress (multipart). Use when presigned upload is not available. */
export async function compressVideo(
  file: File,
  options: CompressOptions
): Promise<Project> {
  const form = new FormData();
  form.append("file", file);
  form.append("options", JSON.stringify(options));
  const { data } = await apiClient.post<Project>("/video-tools/compress", form, {
    headers: { "Content-Type": "multipart/form-data" },
    validateStatus: (s) => s === 202,
  });
  return data;
}
