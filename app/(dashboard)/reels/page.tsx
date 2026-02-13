"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/hooks/useAuth";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ReelFilters, type ReelStatusFilter, type ReelSort } from "@/components/reels/ReelFilters";
import { ReelGrid } from "@/components/reels/ReelGrid";
import { ReelCard } from "@/components/reels/ReelCard";
import { ReelEmptyState } from "@/components/reels/ReelEmptyState";
import { ReelSkeleton } from "@/components/reels/ReelSkeleton";
import { DeleteReelModal } from "@/components/reels/DeleteReelModal";
import { mediaApi } from "@/lib/api/media";
import type { Media } from "@/lib/api/media";
import { useReels } from "@/lib/hooks/useReels";
import { Loader2 } from "lucide-react";

export default function ReelsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<ReelStatusFilter>("all");
  const [sort, setSort] = useState<ReelSort>("newest");
  const [reelToDelete, setReelToDelete] = useState<Media | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const {
    reels,
    isLoading,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useReels(search, statusFilter, sort, !!isAuthenticated);

  const loadMoreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!hasNextPage || isFetchingNextPage) return;
    const el = loadMoreRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) fetchNextPage();
      },
      { rootMargin: "200px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, authLoading, router]);

  const handleDeleteConfirm = async () => {
    if (!reelToDelete) return;
    setIsDeleting(true);
    try {
      await mediaApi.deleteReel(reelToDelete.id);
      await queryClient.invalidateQueries({ queryKey: ["reels"] });
      setReelToDelete(null);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDuplicateSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ["reels"] });
  };

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("all");
  };

  const hasActiveFilters = search.trim() !== "" || statusFilter !== "all";

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <DashboardLayout>
      <div className="h-full flex flex-col min-h-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 lg:p-8 pb-4 shrink-0">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            My Reels
          </h1>
          <ReelFilters
            search={search}
            onSearchChange={setSearch}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            sort={sort}
            onSortChange={setSort}
          />
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar px-6 lg:px-8 pb-8">
          <div className="max-w-[1600px] mx-auto">
            {isLoading ? (
              <ReelSkeleton count={12} />
            ) : reels.length === 0 ? (
              <ReelEmptyState
                hasFilters={hasActiveFilters}
                onClearFilters={clearFilters}
              />
            ) : (
              <>
                <ReelGrid>
                  {reels.map((reel: Media) => (
                    <ReelCard
                      key={reel.id}
                      reel={reel}
                      onDeleteClick={setReelToDelete}
                      onDuplicateSuccess={handleDuplicateSuccess}
                    />
                  ))}
                </ReelGrid>
                <div ref={loadMoreRef} className="flex justify-center py-6">
                  {isFetchingNextPage && (
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <DeleteReelModal
        open={!!reelToDelete}
        onOpenChange={(open) => !open && setReelToDelete(null)}
        title={reelToDelete ? (reelToDelete.input_config?.topic as string) || "Untitled" : ""}
        onConfirm={handleDeleteConfirm}
        isLoading={isDeleting}
      />
    </DashboardLayout>
  );
}
