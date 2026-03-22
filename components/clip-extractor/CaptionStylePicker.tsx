"use client";

import { cn } from "@/lib/utils/format";
import type { CaptionStyle } from "@/lib/api/clip-extractor";

const STYLES: { id: CaptionStyle; label: string; description: string; preview: string }[] = [
  {
    id: "bold",
    label: "Bold",
    description: "Gold active word, black box",
    preview: "bg-black text-yellow-400 font-black",
  },
  {
    id: "minimal",
    label: "Minimal",
    description: "Clean white, no background",
    preview: "bg-transparent text-white font-normal border border-white/20",
  },
  {
    id: "neon",
    label: "Neon",
    description: "Cyan glow, dark outline",
    preview: "bg-black/30 text-cyan-400 font-bold",
  },
  {
    id: "classic",
    label: "Classic",
    description: "Yellow captions, dark bar",
    preview: "bg-black/70 text-yellow-300 font-semibold",
  },
];

interface CaptionStylePickerProps {
  value: CaptionStyle;
  onChange: (style: CaptionStyle) => void;
}

export function CaptionStylePicker({ value, onChange }: CaptionStylePickerProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {STYLES.map((style) => (
        <button
          key={style.id}
          type="button"
          onClick={() => onChange(style.id)}
          className={cn(
            "relative flex flex-col gap-2 rounded-xl border-2 p-4 text-left transition-all",
            value === style.id
              ? "border-primary bg-primary/5"
              : "border-border hover:border-primary/50 hover:bg-accent/30",
          )}
        >
          {/* Preview swatch */}
          <div
            className={cn(
              "flex h-10 w-full items-center justify-center rounded-lg text-sm",
              style.preview,
            )}
          >
            <span>Word</span>
            <span className="mx-1 opacity-50">by</span>
            <span>word</span>
          </div>

          <div>
            <p className="text-sm font-medium">{style.label}</p>
            <p className="text-xs text-muted-foreground">{style.description}</p>
          </div>

          {value === style.id && (
            <div className="absolute right-2 top-2 h-4 w-4 rounded-full bg-primary text-[10px] text-primary-foreground flex items-center justify-center">
              ✓
            </div>
          )}
        </button>
      ))}
    </div>
  );
}
