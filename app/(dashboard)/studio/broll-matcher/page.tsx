"use client";

import { useRef, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { brollApi, type MatchResponse, type ScriptLineResult } from "@/lib/api/broll";
import { CheckCircle2, Download, Film, Loader2, ChevronDown, ChevronRight, Library, Upload, X } from "lucide-react";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function downloadCsv(csv: string) {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "broll-matches.csv";
  a.click();
  URL.revokeObjectURL(url);
}

function parseLines(text: string): string[] {
  return text
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0);
}

function scoreColor(score: number): string {
  if (score >= 0.8) return "text-green-600";
  if (score >= 0.65) return "text-yellow-600";
  return "text-red-500";
}

// ─── Library Status ───────────────────────────────────────────────────────────

function LibraryStatus() {
  const [open, setOpen] = useState(false);
  const { data, isLoading, error } = useQuery({
    queryKey: ["broll-library"],
    queryFn: () => brollApi.listVideos(),
    enabled: open,
    staleTime: 30_000,
  });

  return (
    <div className="border border-border rounded-xl overflow-hidden">
      <button
        className="w-full flex items-center gap-2 px-4 py-3 text-sm font-medium text-left hover:bg-muted/40 transition-colors"
        onClick={() => setOpen((v) => !v)}
      >
        <Library className="w-4 h-4 text-muted-foreground" />
        Library Status
        {open ? (
          <ChevronDown className="w-4 h-4 ml-auto text-muted-foreground" />
        ) : (
          <ChevronRight className="w-4 h-4 ml-auto text-muted-foreground" />
        )}
      </button>

      {open && (
        <div className="border-t border-border px-4 py-4">
          {isLoading && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" /> Loading…
            </div>
          )}
          {error && (
            <p className="text-sm text-destructive">
              Could not reach B-roll service. Check that it&apos;s running.
            </p>
          )}
          {data && (
            <div className="space-y-3">
              <div className="grid grid-cols-4 gap-2 text-center">
                {[
                  { label: "Total", value: data.total, cls: "text-foreground" },
                  { label: "Ingested", value: data.done, cls: "text-green-600" },
                  { label: "Pending", value: data.pending, cls: "text-yellow-600" },
                  { label: "Error", value: data.error, cls: "text-red-500" },
                ].map(({ label, value, cls }) => (
                  <div key={label} className="rounded-lg bg-muted/50 py-2">
                    <div className={cn("text-lg font-bold", cls)}>{value}</div>
                    <div className="text-xs text-muted-foreground">{label}</div>
                  </div>
                ))}
              </div>
              {data.videos.length > 0 && (
                <div className="max-h-48 overflow-y-auto text-xs space-y-1">
                  {data.videos.slice(0, 50).map((v) => (
                    <div key={v.id} className="flex items-center gap-2">
                      <span
                        className={cn(
                          "w-1.5 h-1.5 rounded-full shrink-0",
                          v.status === "done"
                            ? "bg-green-500"
                            : v.status === "error"
                              ? "bg-red-500"
                              : "bg-yellow-400"
                        )}
                      />
                      <span className="truncate text-muted-foreground">{v.filename}</span>
                      <span className="ml-auto shrink-0 text-muted-foreground/60">
                        {v.frame_count} frames
                      </span>
                    </div>
                  ))}
                  {data.videos.length > 50 && (
                    <p className="text-muted-foreground/60 pt-1">…and {data.videos.length - 50} more</p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Video Uploader ───────────────────────────────────────────────────────────

interface UploadItem {
  file: File;
  progress: number;  // 0-100
  status: "pending" | "uploading" | "done" | "error";
  error?: string;
}

function VideoUploader() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [items, setItems] = useState<UploadItem[]>([]);
  const [dragging, setDragging] = useState(false);

  const VIDEO_EXTS = new Set([".mp4", ".mov", ".avi", ".mkv", ".webm"]);
  const isVideoFile = (f: File) =>
    f.type.startsWith("video/") ||
    VIDEO_EXTS.has(f.name.slice(f.name.lastIndexOf(".")).toLowerCase());

  const addFiles = (files: FileList | null) => {
    if (!files) return;
    const newItems: UploadItem[] = Array.from(files)
      .filter(isVideoFile)
      .map((file) => ({ file, progress: 0, status: "pending" }));
    if (newItems.length === 0) return;
    setItems((prev) => [...prev, ...newItems]);
    newItems.forEach((item, i) => uploadOne(item.file, items.length + i));
  };

  const uploadOne = async (file: File, idx: number) => {
    setItems((prev) =>
      prev.map((it, i) => (i === idx ? { ...it, status: "uploading" } : it))
    );
    try {
      await brollApi.uploadVideo(file, (pct) => {
        setItems((prev) =>
          prev.map((it, i) => (i === idx ? { ...it, progress: pct } : it))
        );
      });
      setItems((prev) =>
        prev.map((it, i) => (i === idx ? { ...it, status: "done", progress: 100 } : it))
      );
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? err?.message ?? "Upload failed";
      setItems((prev) =>
        prev.map((it, i) => (i === idx ? { ...it, status: "error", error: msg } : it))
      );
    }
  };

  const remove = (idx: number) =>
    setItems((prev) => prev.filter((_, i) => i !== idx));

  return (
    <div className="space-y-4">
      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => { e.preventDefault(); setDragging(false); addFiles(e.dataTransfer.files); }}
        onClick={() => inputRef.current?.click()}
        className={cn(
          "border-2 border-dashed rounded-xl px-6 py-10 text-center cursor-pointer transition-colors",
          dragging ? "border-primary bg-primary/5" : "border-border hover:border-primary/50 hover:bg-muted/30"
        )}
      >
        <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-3" />
        <p className="text-sm font-medium">Drop video files here or click to browse</p>
        <p className="text-xs text-muted-foreground mt-1">MP4, MOV, WebM — up to 500 MB each</p>
        <input
          ref={inputRef}
          type="file"
          accept="video/*,.mov,.mp4,.avi,.mkv,.webm"
          multiple
          className="hidden"
          onChange={(e) => addFiles(e.target.files)}
        />
      </div>

      {/* Upload list */}
      {items.length > 0 && (
        <div className="space-y-2">
          {items.map((item, i) => (
            <div key={i} className="flex items-center gap-3 rounded-lg border border-border px-3 py-2.5">
              <Film className="w-4 h-4 text-muted-foreground shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">{item.file.name}</div>
                {item.status === "uploading" && (
                  <div className="mt-1 h-1 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all"
                      style={{ width: `${item.progress}%` }}
                    />
                  </div>
                )}
                {item.status === "error" && (
                  <div className="text-xs text-destructive mt-0.5">{item.error}</div>
                )}
                {item.status === "done" && (
                  <div className="text-xs text-muted-foreground mt-0.5">Uploaded — indexing in background</div>
                )}
              </div>
              {item.status === "uploading" && (
                <span className="text-xs text-muted-foreground shrink-0">{item.progress}%</span>
              )}
              {item.status === "done" && (
                <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
              )}
              {item.status !== "uploading" && (
                <button onClick={() => remove(i)} className="text-muted-foreground hover:text-foreground">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Results Table ────────────────────────────────────────────────────────────

function ResultsTable({ data }: { data: MatchResponse }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold">{data.results.length} script lines matched</h2>
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5"
          onClick={() => downloadCsv(data.csv)}
        >
          <Download className="w-3.5 h-3.5" />
          Download CSV
        </Button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left px-4 py-2.5 font-medium text-muted-foreground w-8">#</th>
              <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Script Line</th>
              <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Top Match</th>
              <th className="text-right px-4 py-2.5 font-medium text-muted-foreground w-20">Score</th>
              <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Alt Match</th>
              <th className="text-right px-4 py-2.5 font-medium text-muted-foreground w-20">Score</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {data.results.map((row: ScriptLineResult, i: number) => {
              const top = row.matches[0];
              const alt = row.matches[1];
              return (
                <tr key={i} className="hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3 text-muted-foreground">{i + 1}</td>
                  <td className="px-4 py-3 max-w-xs">
                    <span className="line-clamp-2">{row.script_line}</span>
                  </td>
                  <td className="px-4 py-3">
                    {top ? (
                      <div>
                        <div className="font-medium truncate max-w-[180px]">{top.filename}</div>
                        <div className="text-xs text-muted-foreground">
                          @{top.frame_time}s
                          {top.duration_seconds != null && ` · ${top.duration_seconds.toFixed(1)}s clip`}
                        </div>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className={cn("px-4 py-3 text-right font-mono font-medium", top ? scoreColor(top.similarity_score) : "")}>
                    {top ? top.similarity_score.toFixed(3) : "—"}
                  </td>
                  <td className="px-4 py-3">
                    {alt ? (
                      <div>
                        <div className="font-medium truncate max-w-[180px]">{alt.filename}</div>
                        <div className="text-xs text-muted-foreground">
                          @{alt.frame_time}s
                          {alt.duration_seconds != null && ` · ${alt.duration_seconds.toFixed(1)}s clip`}
                        </div>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className={cn("px-4 py-3 text-right font-mono font-medium", alt ? scoreColor(alt.similarity_score) : "")}>
                    {alt ? alt.similarity_score.toFixed(3) : "—"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function BrollMatcherPage() {
  const [scriptText, setScriptText] = useState("");
  const parsedLines = parseLines(scriptText);

  const { mutate, data, isPending, error, reset } = useMutation({
    mutationFn: () => brollApi.matchScript(parsedLines),
  });

  const handleMatch = () => {
    if (parsedLines.length === 0) return;
    reset();
    mutate();
  };

  const errorMessage =
    error instanceof Error
      ? (error as any)?.response?.data?.message ?? error.message
      : null;

  return (
    <DashboardLayout>
      <div className="h-full overflow-y-auto custom-scrollbar bg-muted/20 min-h-full">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8">
          {/* Header */}
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Film className="w-5 h-5 text-primary" />
              <h1 className="text-2xl font-bold tracking-tight">B-roll Matcher</h1>
            </div>
            <p className="text-sm text-muted-foreground">
              Paste your script — each line is matched to the best B-roll clip using CLIP embeddings.
            </p>
          </div>

          {/* Upload B-roll Videos */}
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4">
            <div>
              <h2 className="text-sm font-semibold mb-0.5">Upload B-roll Videos</h2>
              <p className="text-xs text-muted-foreground">
                Videos are indexed once — reuse them for any script. Indexing runs in the background (~1 min per clip).
              </p>
            </div>
            <VideoUploader />
          </div>

          {/* Script Input */}
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">
                Script Lines
                {parsedLines.length > 0 && (
                  <span className="ml-2 text-xs text-muted-foreground font-normal">
                    {parsedLines.length} line{parsedLines.length !== 1 ? "s" : ""} parsed
                  </span>
                )}
              </label>
              <Textarea
                value={scriptText}
                onChange={(e) => setScriptText(e.target.value)}
                placeholder={"People shop, they layer up\nNothing fits and everyone panics\nThis changes everything"}
                rows={8}
                className="font-mono text-sm resize-y"
              />
              <p className="text-xs text-muted-foreground mt-1.5">
                One script line per row. Each line is matched independently.
              </p>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-border">
              <span className="text-xs text-muted-foreground">
                {parsedLines.length === 0 ? "Enter at least one line to match" : `Ready to match ${parsedLines.length} lines`}
              </span>
              <Button
                onClick={handleMatch}
                disabled={parsedLines.length === 0 || isPending}
                className="gap-1.5 min-w-[120px]"
              >
                {isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Matching…
                  </>
                ) : (
                  "Find B-roll"
                )}
              </Button>
            </div>
          </div>

          {/* Error */}
          {errorMessage && (
            <div className="rounded-lg bg-destructive/10 border border-destructive/30 px-4 py-3 text-sm text-destructive">
              {errorMessage}
            </div>
          )}

          {/* Results */}
          {data && (
            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
              <ResultsTable data={data} />
            </div>
          )}

          {/* Library Status (collapsible) */}
          <LibraryStatus />
        </div>
      </div>
    </DashboardLayout>
  );
}
