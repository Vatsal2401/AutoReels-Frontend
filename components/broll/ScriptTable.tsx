"use client";

import Link from "next/link";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2, Plus, ScrollText, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "./StatusBadge";
import { EmptyState } from "./shared/EmptyState";
import { InlineEditName } from "./shared/InlineEditName";
import { Tip } from "./shared/Tip";
import { brollApi, type BrollScript } from "@/lib/api/broll";

interface ScriptTableProps {
  libraryId: string;
  scripts: BrollScript[];
  indexedCount?: number;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function ScriptTable({ libraryId, scripts, indexedCount = 0 }: ScriptTableProps) {
  const queryClient = useQueryClient();

  const { mutate: createScript, isPending: isCreating } = useMutation({
    mutationFn: () => {
      const name = `Script · ${new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`;
      return brollApi.createScript(libraryId, { name });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["broll-scripts", libraryId] });
      queryClient.invalidateQueries({ queryKey: ["broll-library", libraryId] });
      toast.success("Script created");
    },
    onError: () => toast.error("Failed to create script"),
  });

  const { mutate: deleteScript } = useMutation({
    mutationFn: (sid: string) => brollApi.deleteScript(libraryId, sid),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["broll-scripts", libraryId] });
      queryClient.invalidateQueries({ queryKey: ["broll-library", libraryId] });
      toast.success("Script deleted");
    },
    onError: () => toast.error("Failed to delete script"),
  });

  return (
    <div className="flex flex-col gap-3 h-full p-5">
      {/* ── Toolbar ─────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-2.5 rounded-xl border border-border/60 bg-muted/30 px-3 py-2.5 sm:gap-3 sm:px-4 sm:py-3 shrink-0">
        <Button
          size="sm"
          className="h-9 gap-1.5"
          disabled={isCreating}
          onClick={() => createScript()}
        >
          {isCreating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
          Add Script
        </Button>
      </div>

      {/* ── Content ─────────────────────────────────────────────── */}
      {scripts.length === 0 && indexedCount === 0 ? (
        <EmptyState
          icon={ScrollText}
          title="Index your videos first"
          description="Scripts need at least one indexed video to find matching clips. Go to the Videos tab to index your footage."
        />
      ) : scripts.length === 0 ? (
        <EmptyState
          icon={ScrollText}
          title="No scripts yet"
          description="Create a script and the system will automatically find the best B-roll clip for each line."
          action={{ label: "Create Script", onClick: () => createScript() }}
        />
      ) : (
        <div className="flex-1 min-h-0 flex flex-col rounded-lg border border-border/60 bg-card shadow-[0_1px_2px_rgba(0,0,0,0.04)] overflow-hidden">
          <div className="flex-1 min-h-0 overflow-auto">
            <table className="w-full text-sm table-fixed min-w-[600px]">
              <thead className="sticky top-0 z-10 bg-muted/80 border-b border-border/70">
                <tr>
                  <th className="py-3 px-3 text-left font-semibold text-foreground text-xs">
                    Script Name
                  </th>
                  <th className="py-3 px-3 text-right font-semibold text-foreground text-xs w-16">
                    Lines
                  </th>
                  <th className="py-3 px-3 text-right font-semibold text-foreground text-xs w-24">
                    Matched
                  </th>
                  <th className="py-3 px-3 text-left font-semibold text-foreground text-xs w-28">
                    Status
                  </th>
                  <th className="py-3 px-3 text-left font-semibold text-foreground text-xs w-28">
                    Created
                  </th>
                  <th className="w-28" />
                </tr>
              </thead>
              <tbody>
                {scripts.map((s) => (
                  <tr
                    key={s.id}
                    className="border-b border-border/50 last:border-b-0 transition-colors hover:bg-muted/40 cursor-pointer group"
                    onClick={() => { window.location.href = `/studio/broll/${libraryId}/scripts/${s.id}`; }}
                  >
                    <td className="px-3 py-3.5 font-medium" onClick={(e) => e.stopPropagation()}>
                      <InlineEditName
                        value={s.name}
                        onSave={async (name) => {
                          await brollApi.updateScript(libraryId, s.id, { name });
                          queryClient.invalidateQueries({ queryKey: ["broll-scripts", libraryId] });
                        }}
                        className="group-hover:text-primary transition-colors"
                      />
                    </td>
                    <td className="px-3 py-3.5 text-right tabular-nums text-muted-foreground text-sm">
                      {s.totalLines || "—"}
                    </td>
                    <td className="px-3 py-3.5 text-right tabular-nums text-muted-foreground text-sm">
                      {s.totalLines > 0 ? `${s.matchedLines}/${s.totalLines}` : "—"}
                    </td>
                    <td className="px-3 py-3.5">
                      <StatusBadge status={s.status} />
                    </td>
                    <td className="px-3 py-3.5 text-muted-foreground text-sm">
                      {formatDate(s.createdAt)}
                    </td>
                    <td className="px-3 py-3.5" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center gap-1.5 justify-end">
                        <Tip label="Open script and run B-roll matching">
                          <Link
                            href={`/studio/broll/${libraryId}/scripts/${s.id}`}
                            className="inline-flex items-center justify-center h-7 px-2.5 rounded text-xs font-medium border border-border/70 bg-background hover:bg-muted/60 transition-colors"
                          >
                            Open
                          </Link>
                        </Tip>
                        <Tip label="Permanently delete this script and its match results">
                          <button
                            className="h-7 w-7 flex items-center justify-center rounded border border-border/70 bg-background hover:bg-destructive/10 hover:border-destructive/40 transition-colors text-muted-foreground hover:text-destructive"
                            onClick={() => {
                              if (confirm(`Delete script "${s.name}"?`)) deleteScript(s.id);
                            }}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </Tip>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}
