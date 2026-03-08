"use client";

import { useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Check,
  ChevronDown,
  Loader2,
  Lock,
  Play,
  RefreshCw,
  RotateCcw,
  Search,
  Sparkles,
  Unlock,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { brollApi, type BrollMatchResult, type BrollScript, type ClipMatch } from "@/lib/api/broll";
import { SlidePanel } from "./shared/SlidePanel";

interface ScriptStepViewProps {
  script: BrollScript;
  libraryId: string;
}

// ─── Score pill ───────────────────────────────────────────────────────────────

function ScorePill({ score }: { score: number | null }) {
  if (score == null) return <span className="text-muted-foreground text-xs">—</span>;
  const pct = Math.round(score * 100);
  const cls =
    pct >= 80
      ? "bg-green-100 text-green-700 border-green-200"
      : pct >= 65
      ? "bg-yellow-100 text-yellow-700 border-yellow-200"
      : "bg-red-100 text-red-700 border-red-200";
  return (
    <span
      className={cn(
        "inline-flex items-center px-1.5 py-0.5 rounded-full text-[11px] font-medium border tabular-nums",
        cls,
      )}
    >
      {pct}%
    </span>
  );
}

// ─── Inline clip preview (modal overlay) ─────────────────────────────────────

function ClipPreviewModal({
  libraryId,
  videoId,
  filename,
  frameTime,
  onClose,
}: {
  libraryId: string;
  videoId: string | null;
  filename: string | null;
  frameTime: number | null;
  onClose: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [url, setUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useState(() => {
    if (!videoId) { setLoading(false); return; }
    brollApi.getVideoPreviewUrl(libraryId, videoId)
      .then((d) => setUrl(d.signedUrl))
      .catch(() => null)
      .finally(() => setLoading(false));
  });

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative bg-background rounded-xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <div className="min-w-0">
            <p className="text-sm font-semibold truncate">{filename ?? "Preview"}</p>
            {frameTime != null && (
              <p className="text-xs text-muted-foreground">@ {frameTime.toFixed(1)}s</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="h-7 w-7 flex items-center justify-center rounded hover:bg-muted text-muted-foreground transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="bg-black aspect-video flex items-center justify-center">
          {loading ? (
            <Loader2 className="w-7 h-7 animate-spin text-white/40" />
          ) : url ? (
            <video
              ref={videoRef}
              src={url}
              controls
              autoPlay
              className="w-full h-full object-contain"
              onLoadedData={() => { if (videoRef.current && frameTime != null) videoRef.current.currentTime = frameTime; }}
            />
          ) : (
            <p className="text-white/50 text-xs">Preview unavailable</p>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Clip picker panel (Replace Clip) ─────────────────────────────────────────

function ClipPickerPanel({
  open,
  onClose,
  libraryId,
  scriptId,
  result,
  onApply,
}: {
  open: boolean;
  onClose: () => void;
  libraryId: string;
  scriptId: string;
  result: BrollMatchResult;
  onApply: () => void;
}) {
  const [query, setQuery] = useState(result.scriptLine);
  const [debouncedQuery, setDebouncedQuery] = useState(result.scriptLine);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [previewClip, setPreviewClip] = useState<ClipMatch | null>(null);
  const queryClient = useQueryClient();

  const { data: clips = [], isFetching } = useQuery({
    queryKey: ["broll-search", libraryId, debouncedQuery],
    queryFn: () => brollApi.searchClips(libraryId, debouncedQuery, 12),
    enabled: open && !!debouncedQuery.trim(),
  });

  const { mutate: applyClip, isPending: isApplying } = useMutation({
    mutationFn: (clip: ClipMatch) =>
      brollApi.overrideResult(libraryId, scriptId, result.lineIndex, {
        overrideVideoId: clip.file_path, // use file_path as ID fallback
        overrideFilename: clip.filename,
        overrideS3Key: clip.file_path,
        overrideFrameTime: clip.frame_time,
        overrideNote: "manual replacement",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["broll-script", libraryId, scriptId] });
      toast.success("Clip replaced");
      onApply();
    },
    onError: () => toast.error("Failed to apply clip"),
  });

  const handleQueryChange = (val: string) => {
    setQuery(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setDebouncedQuery(val), 500);
  };

  return (
    <>
      <SlidePanel
        open={open}
        onClose={onClose}
        title="Replace Clip"
        subtitle={`Line ${result.lineIndex + 1}: ${result.scriptLine.slice(0, 60)}${result.scriptLine.length > 60 ? "…" : ""}`}
        width="w-[480px]"
      >
        <div className="flex flex-col h-full">
          {/* Search box */}
          <div className="px-5 py-3 border-b border-border">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <input
                value={query}
                onChange={(e) => handleQueryChange(e.target.value)}
                placeholder="Search clips by description…"
                className="w-full h-9 pl-9 pr-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
              {isFetching && (
                <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 animate-spin text-muted-foreground" />
              )}
            </div>
          </div>

          {/* Mini preview */}
          {previewClip && (
            <div className="px-5 py-3 border-b border-border bg-muted/30">
              <p className="text-xs font-medium mb-2">
                {previewClip.filename} @ {previewClip.frame_time.toFixed(1)}s
              </p>
              <div className="flex gap-3">
                <div className="w-32 aspect-video bg-black rounded-md flex items-center justify-center shrink-0">
                  <Play className="w-5 h-5 text-white/50" />
                </div>
                <div className="flex flex-col justify-between py-0.5">
                  <ScorePill score={previewClip.similarity_score} />
                  <button
                    onClick={() => applyClip(previewClip)}
                    disabled={isApplying}
                    className="h-8 px-4 rounded-md bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 disabled:opacity-60 transition-colors"
                  >
                    {isApplying ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Use This Clip"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Results grid */}
          <div className="flex-1 overflow-y-auto p-5">
            {clips.length === 0 && !isFetching ? (
              <p className="text-xs text-muted-foreground text-center pt-8">
                {debouncedQuery.trim() ? "No clips found — try different keywords" : "Enter a query to search"}
              </p>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {clips.map((clip, i) => (
                  <button
                    key={i}
                    onClick={() => setPreviewClip(clip)}
                    className={cn(
                      "rounded-lg border overflow-hidden text-left transition-all hover:border-primary/60 hover:shadow-sm",
                      previewClip?.filename === clip.filename && previewClip.frame_time === clip.frame_time
                        ? "border-primary ring-1 ring-primary/30"
                        : "border-border",
                    )}
                  >
                    <div className="aspect-video bg-muted/50 flex items-center justify-center">
                      <Play className="w-4 h-4 text-muted-foreground/50" />
                    </div>
                    <div className="px-2.5 py-2">
                      <p className="text-xs font-medium truncate">{clip.filename}</p>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-[11px] text-muted-foreground">
                          @ {clip.frame_time.toFixed(1)}s
                        </span>
                        <ScorePill score={clip.similarity_score} />
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </SlidePanel>
    </>
  );
}

// ─── Match result card ────────────────────────────────────────────────────────

function MatchResultCard({
  result,
  libraryId,
  scriptId,
  stepNum,
}: {
  result: BrollMatchResult;
  libraryId: string;
  scriptId: string;
  stepNum: number;
}) {
  const queryClient = useQueryClient();
  const [showAlt, setShowAlt] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [previewTarget, setPreviewTarget] = useState<{
    videoId: string | null;
    filename: string | null;
    frameTime: number | null;
  } | null>(null);

  const effectiveFilename = result.overrideFilename ?? result.primaryFilename;
  const effectiveFrameTime = result.overrideFrameTime ?? result.primaryFrameTime;
  const effectiveVideoId = result.overrideVideoId ?? result.primaryVideoId;
  const isOverridden = result.overrideVideoId != null;

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["broll-script", libraryId, scriptId] });

  const { mutate: toggleLock, isPending: isLocking } = useMutation({
    mutationFn: () => brollApi.lockResult(libraryId, scriptId, result.lineIndex, !result.isLocked),
    onSuccess: invalidate,
    onError: () => toast.error("Failed to toggle lock"),
  });

  const { mutate: clearOverride } = useMutation({
    mutationFn: () =>
      brollApi.overrideResult(libraryId, scriptId, result.lineIndex, {
        overrideVideoId: result.primaryVideoId ?? "",
        overrideFilename: result.primaryFilename ?? "",
        overrideS3Key: result.primaryS3Key ?? "",
        overrideFrameTime: result.primaryFrameTime ?? 0,
      }),
    onSuccess: invalidate,
    onError: () => toast.error("Failed to revert"),
  });

  const { mutate: useAlt } = useMutation({
    mutationFn: () =>
      brollApi.overrideResult(libraryId, scriptId, result.lineIndex, {
        overrideVideoId: result.altVideoId ?? "",
        overrideFilename: result.altFilename ?? "",
        overrideS3Key: result.altFilename ?? "",
        overrideFrameTime: result.altFrameTime ?? 0,
      }),
    onSuccess: () => { invalidate(); setShowAlt(false); toast.success("Alt clip applied"); },
    onError: () => toast.error("Failed to apply alt clip"),
  });

  const hasMatch = !!effectiveFilename;

  return (
    <>
      <div
        className={cn(
          "border rounded-lg overflow-hidden transition-all",
          result.isLocked
            ? "border-amber-300/50 bg-amber-50/30"
            : "border-border bg-background",
        )}
      >
        {/* Header: step num + script line + lock */}
        <div className="flex items-start gap-2.5 px-4 py-3 border-b border-border/60">
          <span className="shrink-0 w-5 h-5 rounded-full bg-muted text-muted-foreground text-[10px] font-semibold flex items-center justify-center mt-0.5">
            {stepNum}
          </span>
          <p className="flex-1 text-sm leading-relaxed text-foreground min-w-0">{result.scriptLine}</p>
          <button
            onClick={() => toggleLock()}
            disabled={isLocking}
            title={result.isLocked ? "Locked — won't change on re-run" : "Lock this clip"}
            className={cn(
              "shrink-0 h-6 w-6 rounded flex items-center justify-center transition-colors",
              result.isLocked
                ? "text-amber-600 bg-amber-100 hover:bg-amber-200"
                : "text-muted-foreground hover:bg-muted",
            )}
          >
            {result.isLocked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
          </button>
        </div>

        {/* Clip section */}
        <div className="px-4 py-3">
          {hasMatch ? (
            <div className="rounded-md border border-border bg-muted/20">
              {/* Primary / override row */}
              <div className="flex items-center gap-2.5 px-3 py-2.5">
                <button
                  onClick={() => setPreviewTarget({ videoId: effectiveVideoId, filename: effectiveFilename, frameTime: effectiveFrameTime })}
                  className="shrink-0 w-7 h-7 rounded bg-primary/10 text-primary flex items-center justify-center hover:bg-primary/20 transition-colors"
                >
                  <Play className="w-3 h-3 fill-current" />
                </button>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <p className="text-xs font-medium truncate">{effectiveFilename}</p>
                    {isOverridden && (
                      <span className="text-[10px] text-muted-foreground shrink-0">(replaced)</span>
                    )}
                  </div>
                  <p className="text-[11px] text-muted-foreground">@ {effectiveFrameTime?.toFixed(1)}s</p>
                </div>

                <ScorePill score={result.primaryScore} />

                {/* Actions */}
                {!result.isLocked && (
                  <div className="flex items-center gap-1 shrink-0">
                    {isOverridden && (
                      <button
                        onClick={() => clearOverride()}
                        title="Revert to original"
                        className="h-6 w-6 rounded flex items-center justify-center text-muted-foreground hover:bg-muted transition-colors"
                      >
                        <RotateCcw className="w-3 h-3" />
                      </button>
                    )}
                    <button
                      onClick={() => setPickerOpen(true)}
                      className="flex items-center gap-1 h-6 px-2 rounded text-[11px] font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                    >
                      Replace
                    </button>
                    {result.altFilename && (
                      <button
                        onClick={() => setShowAlt((v) => !v)}
                        className={cn(
                          "flex items-center gap-0.5 h-6 px-2 rounded text-[11px] font-medium transition-colors",
                          showAlt
                            ? "bg-muted text-foreground"
                            : "text-muted-foreground hover:bg-muted",
                        )}
                      >
                        Alt
                        <ChevronDown className={cn("w-3 h-3 transition-transform", showAlt && "rotate-180")} />
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Alt clip row */}
              {showAlt && result.altFilename && (
                <div className="border-t border-border px-3 py-2.5 flex items-center gap-2.5 bg-muted/30">
                  <button
                    onClick={() => setPreviewTarget({ videoId: result.altVideoId, filename: result.altFilename, frameTime: result.altFrameTime })}
                    className="shrink-0 w-6 h-6 rounded bg-muted text-muted-foreground flex items-center justify-center hover:bg-muted-foreground/20 transition-colors"
                  >
                    <Play className="w-2.5 h-2.5 fill-current" />
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">{result.altFilename}</p>
                    <p className="text-[11px] text-muted-foreground">@ {result.altFrameTime?.toFixed(1)}s</p>
                  </div>
                  <ScorePill score={result.altScore} />
                  <button
                    onClick={() => useAlt()}
                    className="shrink-0 h-6 px-2.5 rounded bg-primary text-primary-foreground text-[11px] font-medium flex items-center gap-1 hover:bg-primary/90 transition-colors"
                  >
                    <Check className="w-2.5 h-2.5" /> Use
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="rounded-md border border-dashed border-border px-3 py-2.5 flex items-center justify-between">
              <p className="text-xs text-muted-foreground italic">No clip matched</p>
              {!result.isLocked && (
                <button
                  onClick={() => setPickerOpen(true)}
                  className="text-xs text-primary hover:underline"
                >
                  Search manually
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Clip preview modal */}
      {previewTarget && (
        <ClipPreviewModal
          libraryId={libraryId}
          videoId={previewTarget.videoId}
          filename={previewTarget.filename}
          frameTime={previewTarget.frameTime}
          onClose={() => setPreviewTarget(null)}
        />
      )}

      {/* Replace clip panel */}
      <ClipPickerPanel
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        libraryId={libraryId}
        scriptId={scriptId}
        result={result}
        onApply={() => setPickerOpen(false)}
      />
    </>
  );
}

// ─── Script editor ────────────────────────────────────────────────────────────

function ScriptEditor({
  script,
  libraryId,
  onSaved,
}: {
  script: BrollScript;
  libraryId: string;
  onSaved: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(script.scriptText);

  const { mutate: save, isPending } = useMutation({
    mutationFn: () => brollApi.updateScript(libraryId, script.id, { scriptText: text }),
    onSuccess: () => { onSaved(); setEditing(false); toast.success("Script saved"); },
    onError: () => toast.error("Failed to save"),
  });

  const lineCount = text.split("\n").filter((l) => l.trim()).length;

  if (editing) {
    return (
      <div className="space-y-2">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={Math.max(8, lineCount + 2)}
          className="w-full rounded-md border border-primary bg-background px-3 py-2.5 text-sm font-mono resize-y focus:outline-none focus:ring-2 focus:ring-primary/20"
          placeholder={"One line per row — each becomes a clip.\n\nExample:\nPeople shop, they layer up\nNothing fits and everyone panics"}
          autoFocus
        />
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">{lineCount} line{lineCount !== 1 ? "s" : ""}</p>
          <div className="flex gap-2">
            <button
              onClick={() => { setText(script.scriptText); setEditing(false); }}
              className="h-8 px-3 rounded-md text-sm border border-input hover:bg-muted/50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => save()}
              disabled={isPending}
              className="h-8 px-3 rounded-md text-sm bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-60 transition-colors"
            >
              {isPending ? "Saving…" : "Save"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={() => setEditing(true)}
      className="group cursor-text rounded-md border border-dashed border-border hover:border-primary/50 px-3 py-2.5 transition-colors"
    >
      {script.scriptText ? (
        <pre className="text-sm text-foreground/80 font-mono whitespace-pre-wrap leading-relaxed max-h-40 overflow-hidden">
          {script.scriptText}
        </pre>
      ) : (
        <p className="text-sm text-muted-foreground italic">Click to add script text…</p>
      )}
      <p className="text-xs text-primary opacity-0 group-hover:opacity-100 transition-opacity mt-1.5">
        Click to edit
      </p>
    </div>
  );
}

// ─── Main view ────────────────────────────────────────────────────────────────

export function ScriptStepView({ script, libraryId }: ScriptStepViewProps) {
  const queryClient = useQueryClient();
  const results = (script.results ?? []).sort((a, b) => a.lineIndex - b.lineIndex);
  const lineCount = script.scriptText.split("\n").filter((l) => l.trim()).length;
  const hasResults = results.length > 0;

  const { mutate: runMatch, isPending: isRunning } = useMutation({
    mutationFn: () => brollApi.runScript(libraryId, script.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["broll-script", libraryId, script.id] });
      toast.success("Match complete");
    },
    onError: (err: unknown) => {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        "Matching failed";
      toast.error(msg);
    },
  });

  return (
    <div className="flex gap-6 h-full min-h-0">
      {/* ── Left column: script editor ──────────────────────────── */}
      <div className="w-72 shrink-0 flex flex-col gap-3">
        <div className="rounded-lg border border-border bg-background overflow-hidden">
          <div className="px-4 py-3 border-b border-border flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold">Script</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {lineCount > 0 ? `${lineCount} lines` : "Empty"}
                {hasResults && ` · v${script.version}`}
              </p>
            </div>
          </div>
          <div className="p-4">
            <ScriptEditor
              script={script}
              libraryId={libraryId}
              onSaved={() =>
                queryClient.invalidateQueries({ queryKey: ["broll-script", libraryId, script.id] })
              }
            />
          </div>
        </div>

        {/* Run button */}
        <button
          onClick={() => runMatch()}
          disabled={isRunning || !script.scriptText.trim()}
          className={cn(
            "w-full h-9 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2",
            isRunning || !script.scriptText.trim()
              ? "bg-muted text-muted-foreground cursor-not-allowed"
              : "bg-primary text-primary-foreground hover:bg-primary/90",
          )}
        >
          {isRunning ? (
            <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Matching…</>
          ) : hasResults ? (
            <><RefreshCw className="w-3.5 h-3.5" /> Re-run Match</>
          ) : (
            <><Sparkles className="w-3.5 h-3.5" /> Run Match</>
          )}
        </button>

        {hasResults && (
          <div className="rounded-lg border border-border px-4 py-3 text-xs text-muted-foreground space-y-1">
            <div className="flex justify-between">
              <span>Lines</span>
              <span className="font-medium text-foreground">{script.totalLines}</span>
            </div>
            <div className="flex justify-between">
              <span>Matched</span>
              <span className="font-medium text-foreground">{script.matchedLines}</span>
            </div>
            <div className="flex justify-between">
              <span>Version</span>
              <span className="font-medium text-foreground">v{script.version}</span>
            </div>
          </div>
        )}
      </div>

      {/* ── Right column: results ────────────────────────────────── */}
      <div className="flex-1 min-w-0 overflow-y-auto">
        {isRunning && (
          <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/30 px-4 py-3 text-sm text-muted-foreground mb-4">
            <Loader2 className="w-4 h-4 animate-spin shrink-0 text-primary" />
            Matching {lineCount} lines against your library…
          </div>
        )}

        {hasResults && !isRunning && (
          <div className="space-y-2.5">
            {results.map((r) => (
              <MatchResultCard
                key={r.id}
                result={r}
                libraryId={libraryId}
                scriptId={script.id}
                stepNum={r.lineIndex + 1}
              />
            ))}
          </div>
        )}

        {!hasResults && !isRunning && script.scriptText.trim() && (
          <div className="flex flex-col items-center justify-center h-64 rounded-lg border border-dashed border-border text-center px-6">
            <Sparkles className="w-8 h-8 text-muted-foreground/40 mb-3" />
            <p className="text-sm font-medium">Ready to match</p>
            <p className="text-xs text-muted-foreground mt-1 max-w-xs">
              Click "Run Match" to automatically find the best B-roll clip for each script line.
            </p>
          </div>
        )}

        {!script.scriptText.trim() && (
          <div className="flex flex-col items-center justify-center h-64 rounded-lg border border-dashed border-border text-center px-6">
            <p className="text-sm text-muted-foreground">Add script text on the left to get started.</p>
          </div>
        )}
      </div>
    </div>
  );
}
