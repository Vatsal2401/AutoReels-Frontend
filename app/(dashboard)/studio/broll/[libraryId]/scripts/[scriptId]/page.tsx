"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ChevronRight, Loader2, Pencil, Check, X } from "lucide-react";
import { BrollLayout } from "@/components/layout/BrollLayout";
import { StatusBadge } from "@/components/broll/StatusBadge";
import { ScriptStepView } from "@/components/broll/ScriptStepView";
import { ExportMenu } from "@/components/broll/ExportMenu";
import { brollApi } from "@/lib/api/broll";
import { toast } from "sonner";

export default function ScriptDetailPage() {
  const { libraryId, scriptId } = useParams<{ libraryId: string; scriptId: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState("");

  const { data: library } = useQuery({
    queryKey: ["broll-library", libraryId],
    queryFn: () => brollApi.getLibrary(libraryId),
  });

  const { data: script, isLoading } = useQuery({
    queryKey: ["broll-script", libraryId, scriptId],
    queryFn: () => brollApi.getScript(libraryId, scriptId),
  });

  const { mutate: saveName, isPending: isSavingName } = useMutation({
    mutationFn: () => brollApi.updateScript(libraryId, scriptId, { name: nameInput.trim() }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["broll-script", libraryId, scriptId] });
      queryClient.invalidateQueries({ queryKey: ["broll-scripts", libraryId] });
      setEditingName(false);
      toast.success("Name updated");
    },
    onError: () => toast.error("Failed to update name"),
  });

  if (isLoading) {
    return (
      <BrollLayout>
        <div className="flex items-center gap-2 text-sm text-muted-foreground p-8">
          <Loader2 className="w-4 h-4 animate-spin" /> Loading…
        </div>
      </BrollLayout>
    );
  }

  if (!script) {
    return (
      <BrollLayout>
        <div className="p-8 text-sm text-destructive">Script not found.</div>
      </BrollLayout>
    );
  }

  return (
    <BrollLayout>
      <div className="flex flex-col h-full overflow-hidden">
        {/* ── Header ──────────────────────────────────────────────── */}
        <div className="border-b border-border bg-background shrink-0 px-5 pt-4 pb-0">
          {/* Breadcrumb */}
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground mb-2">
            <button
              onClick={() => router.push("/studio/broll")}
              className="hover:text-foreground transition-colors"
            >
              B-roll Libraries
            </button>
            <ChevronRight className="w-3.5 h-3.5" />
            <button
              onClick={() => router.push(`/studio/broll/${libraryId}`)}
              className="hover:text-foreground transition-colors truncate max-w-[180px]"
            >
              {library?.name ?? "Library"}
            </button>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-foreground font-medium truncate max-w-[180px]">{script.name}</span>
          </div>

          {/* Title + actions row */}
          <div className="flex items-center justify-between gap-4 pb-3">
            <div className="flex items-center gap-3 min-w-0">
              {editingName ? (
                <div className="flex items-center gap-2">
                  <input
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !isSavingName && nameInput.trim()) saveName();
                      if (e.key === "Escape") setEditingName(false);
                    }}
                    className="text-lg font-semibold bg-transparent border-b-2 border-primary outline-none min-w-0"
                    style={{ width: Math.max(120, nameInput.length * 9) + "px" }}
                    autoFocus
                  />
                  <button
                    onClick={() => saveName()}
                    disabled={isSavingName || !nameInput.trim()}
                    className="text-primary hover:text-primary/80 disabled:opacity-50"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                  <button onClick={() => setEditingName(false)} className="text-muted-foreground hover:text-foreground">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => { setNameInput(script.name); setEditingName(true); }}
                  className="flex items-center gap-2 group"
                >
                  <h1 className="text-lg font-semibold truncate max-w-xs">{script.name}</h1>
                  <Pencil className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                </button>
              )}
              <StatusBadge status={script.status} />
              {script.version > 1 && (
                <span className="text-xs text-muted-foreground">v{script.version}</span>
              )}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {(script.results?.length ?? 0) > 0 && (
                <ExportMenu libraryId={libraryId} scriptId={scriptId} scriptName={script.name} />
              )}
            </div>
          </div>
        </div>

        {/* ── Content ─────────────────────────────────────────────── */}
        <div className="flex-1 overflow-hidden p-5">
          <ScriptStepView script={script} libraryId={libraryId} />
        </div>
      </div>
    </BrollLayout>
  );
}
