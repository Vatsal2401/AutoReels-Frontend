export const MAX_VIDEO_SIZE_MB = 100;
export const MAX_VIDEO_SIZE_BYTES = MAX_VIDEO_SIZE_MB * 1024 * 1024;

export const FILE_TOO_LARGE_MESSAGE =
  "File exceeds 100MB limit. Please upload a smaller video.";

export function validateVideoFile(file: File): { valid: boolean; error?: string } {
  if (file.size > MAX_VIDEO_SIZE_BYTES) {
    return { valid: false, error: FILE_TOO_LARGE_MESSAGE };
  }
  if (!file.type.startsWith("video/")) {
    return { valid: false, error: "Please select a video file." };
  }
  return { valid: true };
}
