"use client";

import { useCallback, useRef, useState } from "react";
import { brollApi } from "@/lib/api/broll";

const MULTIPART_THRESHOLD = 100 * 1024 * 1024; // 100 MB
const PART_SIZE = 10 * 1024 * 1024; // 10 MB per part
const CONCURRENT_PARTS = 3;

export type UploadStatus = "pending" | "uploading" | "paused" | "done" | "error";

export interface UploadFile {
  id: string;
  file: File;
  videoId: string | null;
  uploadId: string | null; // S3 multipart UploadId
  key: string | null;
  bytesUploaded: number;
  totalBytes: number;
  status: UploadStatus;
  error: string | null;
  isMultipart: boolean;
  // Completed part ETags for resume
  completedParts: { partNumber: number; etag: string }[];
}

interface UseUploadManagerReturn {
  uploads: UploadFile[];
  addFiles: (files: FileList | File[]) => void;
  cancelUpload: (id: string) => Promise<void>;
  dismissDone: (id: string) => void;
  activeCount: number;
  totalProgress: number;
}

export function useUploadManager(
  libraryId: string,
  onFileAdded?: () => void,
): UseUploadManagerReturn {
  const [uploads, setUploads] = useState<UploadFile[]>([]);
  // Keep a mutable ref so abort controllers can be looked up by upload id
  const xhrMapRef = useRef<Map<string, AbortController>>(new Map());

  const updateUpload = useCallback((id: string, patch: Partial<UploadFile>) => {
    setUploads((prev) => prev.map((u) => (u.id === id ? { ...u, ...patch } : u)));
  }, []);

  const addFiles = useCallback(
    (files: FileList | File[]) => {
      const arr = Array.from(files);
      const items: UploadFile[] = arr.map((file) => ({
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        file,
        videoId: null,
        uploadId: null,
        key: null,
        bytesUploaded: 0,
        totalBytes: file.size,
        status: "pending",
        error: null,
        isMultipart: file.size >= MULTIPART_THRESHOLD,
        completedParts: [],
      }));

      setUploads((prev) => [...prev, ...items]);

      items.forEach((item) => {
        if (item.isMultipart) {
          void startMultipart(item);
        } else {
          void startSinglePart(item);
        }
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [libraryId],
  );

  // ── Single-part upload ────────────────────────────────────────────────────

  const startSinglePart = async (item: UploadFile) => {
    updateUpload(item.id, { status: "uploading" });
    try {
      const presign = await brollApi.presignUpload(libraryId, item.file.name, item.file.type || "video/mp4");
      updateUpload(item.id, { videoId: presign.videoId, key: presign.s3Key });

      await xhrPut(presign.uploadUrl, item.file, item.file.type || "video/mp4", item.id, (bytes) => {
        updateUpload(item.id, { bytesUploaded: bytes });
      });

      updateUpload(item.id, { status: "done", bytesUploaded: item.file.size });
      onFileAdded?.();
      // Auto-dismiss after 2s
      setTimeout(() => dismissDone(item.id), 2000);
    } catch (err) {
      if ((err as Error)?.name === "AbortError") return; // cancelled
      updateUpload(item.id, {
        status: "error",
        error: (err as Error)?.message ?? "Upload failed",
      });
    }
  };

  // ── Multipart upload ──────────────────────────────────────────────────────

  const startMultipart = async (item: UploadFile) => {
    updateUpload(item.id, { status: "uploading" });
    try {
      const { uploadId, key, videoId } = await brollApi.presignMultipart(
        libraryId,
        item.file.name,
        item.file.type || "video/mp4",
        item.file.size,
      );
      updateUpload(item.id, { uploadId, key, videoId });

      const totalParts = Math.ceil(item.file.size / PART_SIZE);
      const completedParts: { partNumber: number; etag: string }[] = [];
      let bytesUploaded = 0;

      // Process parts in batches of CONCURRENT_PARTS
      for (let i = 0; i < totalParts; i += CONCURRENT_PARTS) {
        const batch = Array.from(
          { length: Math.min(CONCURRENT_PARTS, totalParts - i) },
          (_, j) => i + j + 1, // 1-indexed
        );

        const { parts } = await brollApi.presignParts(libraryId, videoId, uploadId, key, batch);

        await Promise.all(
          parts.map(async ({ partNumber, url }) => {
            const start = (partNumber - 1) * PART_SIZE;
            const end = Math.min(start + PART_SIZE, item.file.size);
            const blob = item.file.slice(start, end);

            const etag = await xhrPutPart(url, blob, item.id, (partBytes) => {
              bytesUploaded += partBytes;
              updateUpload(item.id, { bytesUploaded: Math.min(bytesUploaded, item.file.size) });
            });
            completedParts.push({ partNumber, etag });
            updateUpload(item.id, { completedParts: [...completedParts] });
          }),
        );
      }

      // Sort parts by partNumber (required by S3)
      completedParts.sort((a, b) => a.partNumber - b.partNumber);

      await brollApi.completeMultipart(libraryId, videoId, uploadId, key, completedParts);

      updateUpload(item.id, { status: "done", bytesUploaded: item.file.size });
      onFileAdded?.();
      setTimeout(() => dismissDone(item.id), 2000);
    } catch (err) {
      if ((err as Error)?.name === "AbortError") return;
      updateUpload(item.id, {
        status: "error",
        error: (err as Error)?.message ?? "Upload failed",
      });
    }
  };

  // ── Cancel ────────────────────────────────────────────────────────────────

  const cancelUpload = useCallback(
    async (id: string) => {
      const ctrl = xhrMapRef.current.get(id);
      if (ctrl) {
        ctrl.abort();
        xhrMapRef.current.delete(id);
      }
      setUploads((prev) => {
        const item = prev.find((u) => u.id === id);
        if (item?.isMultipart && item.videoId && item.uploadId && item.key) {
          // Fire-and-forget abort — no need to await
          void brollApi.abortMultipart(libraryId, item.videoId, item.uploadId, item.key);
        }
        return prev.filter((u) => u.id !== id);
      });
    },
    [libraryId],
  );

  const dismissDone = useCallback((id: string) => {
    setUploads((prev) => prev.filter((u) => u.id !== id));
  }, []);

  // ── XHR helpers ───────────────────────────────────────────────────────────

  const xhrPut = (
    url: string,
    body: Blob,
    contentType: string,
    uploadId: string,
    onProgress: (bytes: number) => void,
  ): Promise<void> =>
    new Promise((resolve, reject) => {
      const controller = new AbortController();
      xhrMapRef.current.set(uploadId, controller);

      const xhr = new XMLHttpRequest();
      xhr.open("PUT", url);
      xhr.setRequestHeader("Content-Type", contentType);
      let lastLoaded = 0;
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          onProgress(e.loaded - lastLoaded);
          lastLoaded = e.loaded;
        }
      };
      xhr.onload = () => {
        xhrMapRef.current.delete(uploadId);
        xhr.status >= 200 && xhr.status < 300 ? resolve() : reject(new Error(`S3 error: ${xhr.status}`));
      };
      xhr.onerror = () => { xhrMapRef.current.delete(uploadId); reject(new Error("Network error")); };
      controller.signal.addEventListener("abort", () => { xhr.abort(); reject(Object.assign(new Error("Aborted"), { name: "AbortError" })); });
      xhr.send(body);
    });

  const xhrPutPart = (
    url: string,
    body: Blob,
    uploadId: string,
    onProgress: (deltaBytes: number) => void,
  ): Promise<string> =>
    new Promise((resolve, reject) => {
      const controller = new AbortController();
      xhrMapRef.current.set(`${uploadId}-part-${Date.now()}`, controller);

      const xhr = new XMLHttpRequest();
      xhr.open("PUT", url);
      let lastLoaded = 0;
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          onProgress(e.loaded - lastLoaded);
          lastLoaded = e.loaded;
        }
      };
      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          const etag = xhr.getResponseHeader("ETag") ?? "";
          resolve(etag.replace(/"/g, ""));
        } else {
          reject(new Error(`Part upload failed: ${xhr.status}`));
        }
      };
      xhr.onerror = () => reject(new Error("Network error on part upload"));
      controller.signal.addEventListener("abort", () => {
        xhr.abort();
        reject(Object.assign(new Error("Aborted"), { name: "AbortError" }));
      });
      xhr.send(body);
    });

  // ── Derived values ────────────────────────────────────────────────────────

  const activeCount = uploads.filter((u) => u.status === "uploading").length;

  const totalProgress =
    uploads.length === 0
      ? 0
      : Math.round(
          (uploads.reduce((sum, u) => sum + u.bytesUploaded, 0) /
            Math.max(1, uploads.reduce((sum, u) => sum + u.totalBytes, 0))) *
            100,
        );

  return { uploads, addFiles, cancelUpload, dismissDone, activeCount, totalProgress };
}
