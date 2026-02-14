"use client";

import React, { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/format";
import { ArrowLeft, Loader2, Save, Film } from "lucide-react";

export interface EditorTopBarProps {
  /** Back link href (e.g. /reels) */
  backHref: string;
  backLabel?: string;
  /** Current project title */
  title: string;
  /** Called when user commits a new title (e.g. on blur or Enter) */
  onTitleChange?: (title: string) => void;
  /** Badge: draft | completed | rendering | failed */
  statusLabel: string;
  statusDisplay?: "draft" | "completed" | "rendering" | "failed";
  /** Last saved timestamp for "Saved" indicator */
  lastSavedAt: Date | null;
  onSave: () => void;
  saving: boolean;
  onExport?: () => void;
  exporting?: boolean;
  showExport?: boolean;
}

/** Minimal top bar for full-screen editor. Max height 56px. */
export function EditorTopBar({
  backHref,
  backLabel = "My Reels",
  title,
  onTitleChange,
  statusLabel,
  statusDisplay = "draft",
  lastSavedAt,
  onSave,
  saving,
  onExport,
  exporting = false,
  showExport = false,
}: EditorTopBarProps) {
  const [editingTitle, setEditingTitle] = useState(false);
  const [inputValue, setInputValue] = useState(title);

  useEffect(() => {
    if (!editingTitle) setInputValue(title);
  }, [title, editingTitle]);

  const handleBlur = useCallback(() => {
    setEditingTitle(false);
    const t = inputValue.trim() || "Untitled";
    if (t !== title && onTitleChange) onTitleChange(t);
    setInputValue(t);
  }, [inputValue, title, onTitleChange]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        (e.target as HTMLInputElement).blur();
      }
    },
    []
  );

  return (
    <header
      className="shrink-0 h-14 max-h-[56px] flex items-center justify-between gap-4 px-4 bg-white border-b border-[#e8eaed] shadow-sm"
      role="banner"
    >
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <Link href={backHref}>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-2 text-muted-foreground hover:text-foreground hover:bg-[#f6f7f9] transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-1.5" />
            {backLabel}
          </Button>
        </Link>
        <span className="text-muted-foreground/60 text-sm">/</span>
        {editingTitle && onTitleChange ? (
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            className="text-sm font-medium text-foreground bg-transparent border-b border-[#e5e7eb] focus:outline-none focus:border-violet-500 max-w-[220px] py-0.5"
            aria-label="Project title"
          />
        ) : (
          <button
            type="button"
            onClick={() => onTitleChange && setEditingTitle(true)}
            className="text-sm font-medium text-foreground truncate max-w-[220px] text-left hover:bg-[#f6f7f9] rounded px-1.5 py-0.5 -ml-1.5 transition-colors"
          >
            {title || "Untitled"}
          </button>
        )}
        <span
          className={cn(
            "shrink-0 px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wide",
            statusDisplay === "completed" && "bg-emerald-500/15 text-emerald-700",
            statusDisplay === "draft" && "bg-[#e5e7eb] text-[#64748b]",
            statusDisplay === "rendering" && "bg-primary/15 text-primary",
            statusDisplay === "failed" && "bg-destructive/15 text-destructive"
          )}
        >
          {statusLabel}
        </span>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {lastSavedAt && (
          <span className="text-[11px] text-emerald-600 font-medium mr-1">Saved</span>
        )}
        <Button
          variant="outline"
          size="sm"
          onClick={onSave}
          disabled={saving}
          className="h-8 px-3 border-[#e8eaed] hover:bg-[#f6f7f9]"
        >
          {saving ? (
            <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
          ) : (
            <Save className="h-3.5 w-3.5 mr-1.5" />
          )}
          Save
        </Button>
        {showExport && (
          <Button
            size="sm"
            onClick={onExport}
            disabled={exporting}
            className="h-8 px-4 bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            {exporting ? (
              <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
            ) : (
              <Film className="h-3.5 w-3.5 mr-1.5" />
            )}
            Export
          </Button>
        )}
      </div>
    </header>
  );
}
