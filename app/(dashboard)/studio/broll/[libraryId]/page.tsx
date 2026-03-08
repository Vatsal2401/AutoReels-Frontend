"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ChevronRight, Loader2 } from "lucide-react";
import { BrollLayout } from "@/components/layout/BrollLayout";
import { StatusBadge } from "@/components/broll/StatusBadge";
import { VideoList } from "@/components/broll/VideoList";
import { ScriptTable } from "@/components/broll/ScriptTable";
import { brollApi } from "@/lib/api/broll";
import { InlineEditName } from "@/components/broll/shared/InlineEditName";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type Tab = "videos" | "scripts" | "settings";

export default function LibraryDetailPage() {
  const { libraryId } = useParams<{ libraryId: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<Tab>("videos");

  const { data: library, isLoading } = useQuery({
    queryKey: ["broll-library", libraryId],
    queryFn: () => brollApi.getLibrary(libraryId),
  });

  const { data: scripts = [] } = useQuery({
    queryKey: ["broll-scripts", libraryId],
    queryFn: () => brollApi.listScripts(libraryId),
    enabled: tab === "scripts",
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

  if (!library) {
    return (
      <BrollLayout>
        <div className="p-8 text-sm text-destructive">Library not found.</div>
      </BrollLayout>
    );
  }

  const tabs: { id: Tab; label: string; count?: number }[] = [
    { id: "videos", label: "Videos", count: library.videoCount },
    { id: "scripts", label: "Scripts", count: library.scriptCount },
    { id: "settings", label: "Settings" },
  ];

  return (
    <BrollLayout>
      <div className="flex flex-col h-full overflow-hidden">
        {/* ── Header ──────────────────────────────────────────────── */}
        <div className="border-b border-border bg-background shrink-0">
          <div className="px-6 pt-4 pb-0">
            {/* Breadcrumb */}
            <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2.5">
              <button
                onClick={() => router.push("/studio/broll")}
                className="hover:text-foreground transition-colors"
              >
                B-roll Libraries
              </button>
              <ChevronRight className="w-3 h-3" />
              <span className="text-foreground truncate max-w-[200px]">{library.name}</span>
            </div>

            {/* Title + badge + stats row */}
            <div className="flex items-center justify-between gap-4 mb-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <h1 className="text-base font-semibold min-w-0">
                  <InlineEditName
                    value={library.name}
                    onSave={async (name) => {
                      await brollApi.updateLibrary(libraryId, { name });
                      queryClient.invalidateQueries({ queryKey: ["broll-library", libraryId] });
                      queryClient.invalidateQueries({ queryKey: ["broll-libraries"] });
                    }}
                  />
                </h1>
                <StatusBadge status={library.status} />
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0 divide-x divide-border">
                <span className="pr-3">
                  <span className="font-medium text-foreground tabular-nums">{library.videoCount}</span> videos
                </span>
                <span className="px-3">
                  <span className="font-medium text-foreground tabular-nums">{library.indexedCount}</span> indexed
                </span>
                <span className="pl-3">
                  <span className="font-medium text-foreground tabular-nums">{library.sceneCount}</span> scenes
                </span>
              </div>
            </div>
          </div>

          {/* Tab bar */}
          <nav className="flex px-6 gap-0">
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-2 text-sm border-b-2 -mb-px transition-colors",
                  tab === t.id
                    ? "border-primary text-foreground font-medium"
                    : "border-transparent text-muted-foreground hover:text-foreground font-normal"
                )}
              >
                {t.label}
                {t.count !== undefined && (
                  <span
                    className={cn(
                      "min-w-[18px] h-[18px] inline-flex items-center justify-center rounded text-[10px] px-1",
                      tab === t.id
                        ? "bg-foreground/10 text-foreground font-medium"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    {t.count}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* ── Tab content ─────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto">
          {tab === "videos" && (
            <VideoList
              libraryId={libraryId}
              onRefreshStats={() =>
                queryClient.invalidateQueries({ queryKey: ["broll-library", libraryId] })
              }
            />
          )}
          {tab === "scripts" && (
            <ScriptTable libraryId={libraryId} scripts={scripts} indexedCount={library.indexedCount} />
          )}
          {tab === "settings" && (
            <SettingsTab library={library} libraryId={libraryId} />
          )}
        </div>
      </div>
    </BrollLayout>
  );
}

function SettingsTab({
  library,
  libraryId,
}: {
  library: { name: string; description: string | null };
  libraryId: string;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [name, setName] = useState(library.name);
  const [description, setDescription] = useState(library.description ?? "");
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      await brollApi.updateLibrary(libraryId, { name: name.trim(), description: description.trim() || undefined });
      queryClient.invalidateQueries({ queryKey: ["broll-library", libraryId] });
      queryClient.invalidateQueries({ queryKey: ["broll-libraries"] });
      toast.success("Saved");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 max-w-lg space-y-6">
      <div className="space-y-4">
        <h2 className="text-sm font-semibold">Library Details</h2>
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium">
            Description{" "}
            <span className="font-normal text-muted-foreground">(optional)</span>
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
          />
        </div>
        <button
          onClick={save}
          disabled={saving || !name.trim()}
          className="h-9 px-4 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
        >
          {saving ? "Saving…" : "Save Changes"}
        </button>
      </div>

      <div className="border-t border-border pt-6">
        <h2 className="text-sm font-semibold text-destructive mb-3">Danger Zone</h2>
        <div className="rounded-lg border border-destructive/30 p-4 space-y-3">
          <div>
            <p className="text-sm font-medium">Delete Library</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Permanently removes all videos, scripts, and match results. Cannot be undone.
            </p>
          </div>
          <button
            onClick={() => {
              if (confirm("Delete this library and all its contents?")) {
                brollApi.deleteLibrary(libraryId).then(() => router.push("/studio/broll"));
              }
            }}
            className="h-8 px-3 rounded-md border border-destructive text-destructive text-sm font-medium hover:bg-destructive/10 transition-colors"
          >
            Delete Library
          </button>
        </div>
      </div>
    </div>
  );
}
