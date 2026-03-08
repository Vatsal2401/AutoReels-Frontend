"use client";

import { useEffect, useRef, useState } from "react";
import { Pencil, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface InlineEditNameProps {
  value: string;
  onSave: (name: string) => Promise<void> | void;
  className?: string;
  inputClassName?: string;
}

export function InlineEditName({ value, onSave, className, inputClassName }: InlineEditNameProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const [saving, setSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) {
      setDraft(value);
      setTimeout(() => inputRef.current?.select(), 0);
    }
  }, [editing, value]);

  const save = async () => {
    const trimmed = draft.trim();
    if (!trimmed || trimmed === value) { setEditing(false); return; }
    setSaving(true);
    try {
      await onSave(trimmed);
    } finally {
      setSaving(false);
      setEditing(false);
    }
  };

  const cancel = () => { setDraft(value); setEditing(false); };

  if (editing) {
    return (
      <div className="flex items-center gap-1.5 min-w-0" onClick={(e) => e.stopPropagation()}>
        <input
          ref={inputRef}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") save();
            if (e.key === "Escape") cancel();
          }}
          disabled={saving}
          className={cn(
            "min-w-0 flex-1 bg-background border border-primary/60 rounded px-2 py-0.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20",
            inputClassName,
          )}
        />
        <button
          onClick={save}
          disabled={saving}
          className="h-6 w-6 flex items-center justify-center rounded hover:bg-muted transition-colors text-emerald-600 shrink-0"
        >
          <Check className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={cancel}
          className="h-6 w-6 flex items-center justify-center rounded hover:bg-muted transition-colors text-muted-foreground shrink-0"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  return (
    <div className={cn("flex items-center gap-1.5 min-w-0 group/name", className)}>
      <span className="truncate">{value}</span>
      <button
        onClick={(e) => { e.stopPropagation(); setEditing(true); }}
        className="opacity-0 group-hover/name:opacity-100 h-5 w-5 flex items-center justify-center rounded hover:bg-muted transition-opacity transition-colors text-muted-foreground hover:text-foreground shrink-0"
        title="Rename"
      >
        <Pencil className="w-3 h-3" />
      </button>
    </div>
  );
}
