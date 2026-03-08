"use client";

import { CheckCircle2, Film, X, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { UploadFile } from "@/lib/hooks/useUploadManager";

interface UploadQueueRowProps {
  item: UploadFile;
  onCancel: () => void;
}

function formatBytes(bytes: number): string {
  if (bytes >= 1024 * 1024 * 1024) return `${(bytes / (1024 ** 3)).toFixed(1)} GB`;
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 ** 2)).toFixed(1)} MB`;
  return `${(bytes / 1024).toFixed(0)} KB`;
}

export function UploadQueueRow({ item, onCancel }: UploadQueueRowProps) {
  const pct =
    item.totalBytes > 0 ? Math.min(100, Math.round((item.bytesUploaded / item.totalBytes) * 100)) : 0;

  return (
    <div className="flex items-center gap-3 px-6 py-2.5 border-b border-border last:border-0">
      <Film className="w-3.5 h-3.5 text-muted-foreground shrink-0" />

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-1">
          <span className="text-xs font-medium truncate">{item.file.name}</span>
          <span className="text-xs text-muted-foreground tabular-nums shrink-0">
            {item.status === "uploading"
              ? `${pct}%`
              : item.status === "done"
              ? formatBytes(item.totalBytes)
              : item.status === "error"
              ? "Failed"
              : "Queued"}
          </span>
        </div>

        {item.status === "uploading" && (
          <div className="h-1 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-300"
              style={{ width: `${pct}%` }}
            />
          </div>
        )}
        {item.status === "done" && (
          <div className="h-1 bg-green-500/20 rounded-full overflow-hidden">
            <div className="h-full w-full bg-green-500 rounded-full" />
          </div>
        )}
        {item.status === "error" && item.error && (
          <p className="text-xs text-destructive truncate">{item.error}</p>
        )}
      </div>

      {/* Right icon / cancel */}
      <div className="shrink-0">
        {item.status === "done" ? (
          <CheckCircle2 className="w-4 h-4 text-green-500" />
        ) : item.status === "error" ? (
          <XCircle className="w-4 h-4 text-destructive" />
        ) : (
          <button
            onClick={onCancel}
            className={cn(
              "h-5 w-5 rounded flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors",
            )}
            title="Cancel upload"
          >
            <X className="w-3 h-3" />
          </button>
        )}
      </div>
    </div>
  );
}
