"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ChevronLeft,
  ChevronRight,
  Film,
  Loader2,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { BrollLayout } from "@/components/layout/BrollLayout";
import { InlineEditName } from "@/components/broll/shared/InlineEditName";
import { Tip } from "@/components/broll/shared/Tip";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { brollApi, type BrollLibrary } from "@/lib/api/broll";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const PAGE_SIZE_OPTIONS = [10, 20, 25, 50];
const DEFAULT_PAGE_SIZE = 25;

const STATUS_LABEL: Record<string, string> = {
  draft: "Draft",
  uploading: "Uploading",
  processing: "Processing",
  indexed: "Ready",
  error: "Error",
};
const STATUS_DOT: Record<string, string> = {
  draft: "bg-muted-foreground/60",
  uploading: "bg-blue-500",
  processing: "bg-amber-500",
  indexed: "bg-emerald-500",
  error: "bg-red-500",
};

// ─── Circular index-progress ring ────────────────────────────────────────────

function IndexRing({ indexed, total }: { indexed: number; total: number }) {
  const size = 38;
  const r = (size - 6) / 2;
  const circ = 2 * Math.PI * r;
  const pct = total > 0 ? Math.round((indexed / total) * 100) : 0;
  const offset = circ - (pct / 100) * circ;
  const stroke = pct === 100 ? "#22c55e" : pct > 0 ? "#6366f1" : "#e5e7eb";

  return (
    <div className="flex items-center gap-2">
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#f3f4f6" strokeWidth={5} />
          <circle
            cx={size / 2} cy={size / 2} r={r} fill="none"
            stroke={stroke} strokeWidth={5} strokeLinecap="round"
            strokeDasharray={circ} strokeDashoffset={offset}
            style={{ transition: "stroke-dashoffset 0.4s ease" }}
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-[9px] font-bold tabular-nums"
          style={{ color: pct === 0 ? "#9ca3af" : "#374151" }}>
          {pct}%
        </span>
      </div>
      <span className="text-xs text-muted-foreground tabular-nums">{indexed}/{total}</span>
    </div>
  );
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "2-digit" });
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function BrollLibrariesPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const { data: libraries = [], isLoading } = useQuery({
    queryKey: ["broll-libraries"],
    queryFn: () => brollApi.listLibraries(),
  });

  const { mutate: deleteLib } = useMutation({
    mutationFn: (id: string) => brollApi.deleteLibrary(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["broll-libraries"] });
      setSelectedIds(new Set());
      toast.success("Library deleted");
    },
    onError: () => toast.error("Failed to delete library"),
  });

  const { mutate: createLib, isPending: isCreating } = useMutation({
    mutationFn: () => {
      const name = `Library · ${new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`;
      return brollApi.createLibrary({ name });
    },
    onSuccess: (lib) => {
      queryClient.invalidateQueries({ queryKey: ["broll-libraries"] });
      router.push(`/studio/broll/${lib.id}`);
    },
    onError: () => toast.error("Failed to create library"),
  });

  const filtered = useMemo(
    () =>
      libraries.filter((lib) => {
        if (search.trim() && !lib.name.toLowerCase().includes(search.trim().toLowerCase())) return false;
        if (statusFilter !== "all" && lib.status !== statusFilter) return false;
        return true;
      }),
    [libraries, search, statusFilter],
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated = useMemo(
    () => filtered.slice((page - 1) * pageSize, page * pageSize),
    [filtered, page, pageSize],
  );

  const toggleSelectAll = () => {
    if (selectedIds.size === paginated.length) setSelectedIds(new Set());
    else setSelectedIds(new Set(paginated.map((l) => l.id)));
  };

  const toggleOne = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  return (
    <BrollLayout>
      <div className="h-full flex flex-col bg-background">
        <div className="w-full max-w-[1800px] mx-auto flex flex-col flex-1 min-h-0 px-3 sm:px-4 lg:px-5 pb-5">

          {/* ── Control bar ─────────────────────────────────────────── */}
          <div className="shrink-0 pt-5 pb-4">
            <div className="flex flex-wrap items-center gap-2.5 rounded-xl border border-border/60 bg-muted/30 px-3 py-2.5 sm:gap-3 sm:px-4 sm:py-3">
              <div className="relative flex-1 min-w-[160px] max-w-[220px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
                <Input
                  placeholder="Search libraries..."
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                  className="h-9 w-full pl-9 pr-3 text-sm bg-background border-border/80 focus-visible:ring-2 focus-visible:ring-primary/20"
                />
              </div>

              <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
                <SelectTrigger className="h-9 w-auto min-w-[7.5rem] gap-2 rounded-lg border-border/80 bg-background pl-3 pr-3 text-sm shadow-none focus:ring-2 focus:ring-primary/20">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent align="start" className="rounded-lg border-border/80">
                  <SelectItem value="all">All statuses</SelectItem>
                  {Object.entries(STATUS_LABEL).map(([val, label]) => (
                    <SelectItem key={val} value={val}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {selectedIds.size > 0 && (
                <Button
                  variant="outline" size="sm"
                  className="h-9 shrink-0 border-border/80 text-muted-foreground hover:text-foreground"
                  onClick={() => setSelectedIds(new Set())}
                >
                  Clear ({selectedIds.size})
                </Button>
              )}

              <div className="flex-1" />

              <Button
                onClick={() => createLib()}
                disabled={isCreating}
                size="sm"
                className="h-9 gap-1.5 shrink-0"
              >
                {isCreating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                Create Library
              </Button>
            </div>
          </div>

          {isLoading ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-3">
              <Loader2 className="h-7 w-7 animate-spin text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Loading libraries...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center border border-dashed border-border/70 rounded-xl bg-muted/20 py-16 text-center">
              <Film className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-sm font-medium text-muted-foreground mb-3">
                {libraries.length === 0 ? "No libraries yet" : "No libraries match your filters."}
              </p>
              {libraries.length === 0 ? (
                <Button variant="outline" size="sm" className="rounded-lg" onClick={() => createLib()}>
                  Create Library
                </Button>
              ) : (
                <Button variant="outline" size="sm" className="rounded-lg"
                  onClick={() => { setSearch(""); setStatusFilter("all"); setPage(1); }}>
                  Clear filters
                </Button>
              )}
            </div>
          ) : (
            <>
              {/* ── Table ─────────────────────────────────────────────── */}
              <div className="flex-1 min-h-0 flex flex-col rounded-lg border border-border/60 bg-card shadow-[0_1px_2px_rgba(0,0,0,0.04)] overflow-hidden">
                <div className="flex-1 min-h-0 overflow-auto">
                  <table className="w-full text-sm table-fixed min-w-[700px]">
                    <colgroup>
                      <col style={{ width: "3%" }} />
                      <col style={{ width: "28%" }} />
                      <col style={{ width: "16%" }} />
                      <col style={{ width: "8%" }} />
                      <col style={{ width: "8%" }} />
                      <col style={{ width: "8%" }} />
                      <col style={{ width: "8%" }} />
                      <col style={{ width: "13%" }} />
                      <col style={{ width: "8%" }} />
                    </colgroup>
                    <thead className="sticky top-0 z-10 bg-muted/80 border-b border-border/70">
                      <tr>
                        <th className="py-3 pl-4 pr-2 text-left">
                          <input
                            type="checkbox"
                            checked={paginated.length > 0 && selectedIds.size === paginated.length}
                            onChange={toggleSelectAll}
                            className="rounded border-border"
                          />
                        </th>
                        <th className="py-3 px-3 text-left font-semibold text-foreground text-xs">Library Name</th>
                        <th className="py-3 px-3 text-left font-semibold text-foreground text-xs">Index Progress</th>
                        <th className="py-3 px-3 text-right font-semibold text-foreground text-xs">Videos</th>
                        <th className="py-3 px-3 text-right font-semibold text-foreground text-xs">Indexed</th>
                        <th className="py-3 px-3 text-right font-semibold text-foreground text-xs">Scenes</th>
                        <th className="py-3 px-3 text-right font-semibold text-foreground text-xs">Scripts</th>
                        <th className="py-3 px-3 text-right font-semibold text-foreground text-xs">Created</th>
                        <th className="py-3 pr-4 pl-2" />
                      </tr>
                    </thead>
                    <tbody>
                      {paginated.map((lib) => (
                        <LibraryRow
                          key={lib.id}
                          lib={lib}
                          isSelected={selectedIds.has(lib.id)}
                          onToggleSelect={() => toggleOne(lib.id)}
                          onOpen={() => router.push(`/studio/broll/${lib.id}`)}
                          onDelete={() => { if (confirm(`Delete "${lib.name}"?`)) deleteLib(lib.id); }}
                          onRename={async (name) => {
                            await brollApi.updateLibrary(lib.id, { name });
                            queryClient.invalidateQueries({ queryKey: ["broll-libraries"] });
                          }}
                        />
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* ── Pagination ────────────────────────────────────────── */}
              <div className="shrink-0 mt-4">
                <div className="rounded-xl border border-border/60 bg-muted/20 px-3 py-3 sm:px-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">
                        Showing {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, filtered.length)} of {filtered.length}
                      </span>
                      <span className="text-muted-foreground/60 hidden sm:inline">·</span>
                      <Select value={String(pageSize)} onValueChange={(v) => { setPageSize(Number(v)); setPage(1); }}>
                        <SelectTrigger className="h-8 w-[72px] rounded-lg border-border/80 bg-background text-sm shadow-none focus:ring-2 focus:ring-primary/20">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent align="start" className="min-w-[var(--radix-select-trigger-width)]">
                          {PAGE_SIZE_OPTIONS.map((n) => (
                            <SelectItem key={n} value={String(n)} className="text-sm">{n}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">Page</span>
                        <Input
                          type="number" min={1} max={totalPages} value={page}
                          onChange={(e) => {
                            const v = parseInt(e.target.value, 10);
                            if (!isNaN(v) && v >= 1) setPage(Math.min(totalPages, v));
                          }}
                          className="w-11 h-8 px-2 text-center text-sm rounded-lg border-border/80"
                        />
                        <span className="text-sm text-muted-foreground">of {totalPages}</span>
                      </div>
                      <div className="flex items-center gap-0.5">
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-lg"
                          onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                          let p: number;
                          if (totalPages <= 5) p = i + 1;
                          else if (page <= 3) p = i + 1;
                          else if (page >= totalPages - 2) p = totalPages - 4 + i;
                          else p = page - 2 + i;
                          return (
                            <Button key={p} variant={page === p ? "secondary" : "ghost"} size="sm"
                              className="h-8 min-w-[2rem] px-2 text-xs rounded-lg" onClick={() => setPage(p)}>
                              {p}
                            </Button>
                          );
                        })}
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-lg"
                          onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

    </BrollLayout>
  );
}

// ─── Row ─────────────────────────────────────────────────────────────────────

function LibraryRow({
  lib, isSelected, onToggleSelect, onOpen, onDelete, onRename,
}: {
  lib: BrollLibrary;
  isSelected: boolean;
  onToggleSelect: () => void;
  onOpen: () => void;
  onDelete: () => void;
  onRename: (name: string) => Promise<void>;
}) {
  const dot = STATUS_DOT[lib.status] ?? "bg-muted-foreground/60";
  const label = STATUS_LABEL[lib.status] ?? lib.status;

  const num = (v: number) =>
    v > 0 ? (
      <span className="font-medium tabular-nums text-foreground">{v}</span>
    ) : (
      <span className="text-muted-foreground">—</span>
    );

  return (
    <tr
      className={cn(
        "border-b border-border/50 last:border-b-0 transition-colors hover:bg-muted/40 cursor-pointer",
        isSelected && "bg-primary/5",
      )}
      onClick={(e) => {
        if ((e.target as HTMLElement).closest('input[type="checkbox"]')) return;
        onOpen();
      }}
    >
      <td className="py-3 pl-4 pr-2" onClick={(e) => e.stopPropagation()}>
        <input type="checkbox" checked={isSelected} onChange={onToggleSelect} className="rounded border-border" />
      </td>

      <td className="py-3 px-3" onClick={(e) => e.stopPropagation()}>
        <InlineEditName
          value={lib.name}
          onSave={onRename}
          className="font-medium text-foreground text-sm leading-tight"
        />
        <div className="flex items-center gap-1.5 mt-0.5">
          <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", dot)} />
          <span className="text-xs text-muted-foreground">{label}</span>
        </div>
      </td>

      <td className="py-3 px-3">
        <IndexRing indexed={lib.indexedCount} total={lib.videoCount} />
      </td>

      <td className="py-3 px-3 text-right text-sm">{num(lib.videoCount)}</td>
      <td className="py-3 px-3 text-right text-sm">{num(lib.indexedCount)}</td>
      <td className="py-3 px-3 text-right text-sm">{num(lib.sceneCount)}</td>
      <td className="py-3 px-3 text-right text-sm">{num(lib.scriptCount)}</td>

      <td className="py-3 px-3 text-right text-xs text-muted-foreground whitespace-nowrap">
        {formatDate(lib.createdAt)}
      </td>

      <td className="py-3 pr-4 pl-2" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-1.5 justify-end">
          <Tip label="Open library to upload videos and run scripts">
            <button
              onClick={onOpen}
              className="inline-flex items-center justify-center h-7 px-2.5 rounded text-xs font-medium border border-border/70 bg-background hover:bg-muted/60 transition-colors"
            >
              Open
            </button>
          </Tip>
          <Tip label="Permanently delete this library and all its videos and scripts">
            <button
              onClick={onDelete}
              className="h-7 w-7 flex items-center justify-center rounded border border-border/70 bg-background hover:bg-destructive/10 hover:border-destructive/40 transition-colors text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </Tip>
        </div>
      </td>
    </tr>
  );
}
