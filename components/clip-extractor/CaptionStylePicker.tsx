"use client";

import { cn } from "@/lib/utils/format";
import type { CaptionStyle } from "@/lib/api/clip-extractor";

const STYLES: {
  id: CaptionStyle;
  name: string;
  desc: string;
  activeColor: string;
  inactiveColor: string;
  bg: string;
  outline?: boolean;
}[] = [
  {
    id: "bold",
    name: "Bold",
    desc: "Gold highlight",
    activeColor: "#FFD700",
    inactiveColor: "#ffffff",
    bg: "bg-zinc-900",
  },
  {
    id: "minimal",
    name: "Minimal",
    desc: "Clean & subtle",
    activeColor: "#ffffff",
    inactiveColor: "#888888",
    bg: "bg-zinc-900",
  },
  {
    id: "neon",
    name: "Neon",
    desc: "Cyan glow",
    activeColor: "#00FFFF",
    inactiveColor: "#ffffff",
    bg: "bg-zinc-900",
  },
  {
    id: "classic",
    name: "Classic",
    desc: "Yellow on dark",
    activeColor: "#FFFF00",
    inactiveColor: "#ffffff",
    bg: "bg-black",
  },
];

interface CaptionStylePickerProps {
  value: CaptionStyle;
  onChange: (style: CaptionStyle) => void;
}

export function CaptionStylePicker({ value, onChange }: CaptionStylePickerProps) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
      {STYLES.map((s) => (
        <button
          key={s.id}
          type="button"
          onClick={() => onChange(s.id)}
          className={cn(
            "group relative flex flex-col items-center gap-2 rounded-xl border-2 p-3 transition-all",
            value === s.id
              ? "border-primary bg-primary/5"
              : "border-border hover:border-primary/40"
          )}
        >
          {/* Mini caption preview */}
          <div className={cn("w-full rounded-lg px-2 py-3 text-center", s.bg)}>
            <p className="text-[11px] font-black leading-tight tracking-wide">
              <span style={{ color: s.inactiveColor, opacity: 0.6 }}>say </span>
              <span style={{ color: s.activeColor }}>THIS</span>
              <span style={{ color: s.inactiveColor, opacity: 0.6 }}> now</span>
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs font-semibold">{s.name}</p>
            <p className="text-[10px] text-muted-foreground">{s.desc}</p>
          </div>
          {value === s.id && (
            <div className="absolute right-1.5 top-1.5 h-3 w-3 rounded-full bg-primary" />
          )}
        </button>
      ))}
    </div>
  );
}
