"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { UploadQueueRow } from "./UploadQueueRow";
import type { UploadFile } from "@/lib/hooks/useUploadManager";

interface UploadQueueProps {
  uploads: UploadFile[];
  onCancel: (id: string) => void;
}

export function UploadQueue({ uploads, onCancel }: UploadQueueProps) {
  const [collapsed, setCollapsed] = useState(false);

  if (uploads.length === 0) return null;

  const uploading = uploads.filter((u) => u.status === "uploading").length;
  const done = uploads.filter((u) => u.status === "done").length;

  return (
    <div className="border-b border-border bg-muted/20 shrink-0">
      {/* Section header */}
      <button
        onClick={() => setCollapsed((v) => !v)}
        className="w-full flex items-center justify-between px-6 py-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
      >
        <span>
          Uploads ({uploads.length}){" "}
          {uploading > 0 && (
            <span className="text-primary">{uploading} uploading…</span>
          )}
          {uploading === 0 && done === uploads.length && (
            <span className="text-green-600">All done</span>
          )}
        </span>
        <ChevronDown
          className={cn("w-3.5 h-3.5 transition-transform", collapsed && "-rotate-90")}
        />
      </button>

      {!collapsed && (
        <div>
          {uploads.map((item) => (
            <UploadQueueRow
              key={item.id}
              item={item}
              onCancel={() => onCancel(item.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
