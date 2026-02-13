"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { mediaApi } from "@/lib/api/media";
import type { Media } from "@/lib/api/media";
import type { ReelStatusFilter, ReelSort } from "@/components/reels/ReelFilters";

const PAGE_SIZE = 20;

function apiStatusToDisplay(apiStatus: string): string {
  if (apiStatus === "pending") return "draft";
  if (apiStatus === "processing") return "rendering";
  return apiStatus;
}

function filterBySearch(reels: Media[], search: string): Media[] {
  if (!search.trim()) return reels;
  const q = search.trim().toLowerCase();
  return reels.filter((r) => {
    const topic = (r.input_config?.topic as string) || "";
    return topic.toLowerCase().includes(q);
  });
}

function filterByStatus(reels: Media[], statusFilter: ReelStatusFilter): Media[] {
  if (statusFilter === "all") return reels;
  return reels.filter((r) => apiStatusToDisplay(r.status) === statusFilter);
}

function sortReels(reels: Media[], sort: ReelSort): Media[] {
  const copy = [...reels];
  if (sort === "newest") {
    copy.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  } else if (sort === "oldest") {
    copy.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  } else if (sort === "duration") {
    const durOrder: Record<string, number> = { "30-60": 1, "60-90": 2, "90-120": 3 };
    copy.sort((a, b) => {
      const da = durOrder[(a.input_config?.duration as string) || "30-60"] ?? 0;
      const db = durOrder[(b.input_config?.duration as string) || "60-90"] ?? 0;
      return da - db;
    });
  }
  return copy;
}

export function useReels(
  search: string,
  statusFilter: ReelStatusFilter,
  sort: ReelSort,
  enabled: boolean
) {
  const query = useInfiniteQuery({
    queryKey: ["reels", "infinite"],
    queryFn: ({ pageParam }) =>
      mediaApi.getReelsPage({ limit: PAGE_SIZE, cursor: pageParam ?? undefined }),
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    initialPageParam: null as string | null,
    enabled,
  });

  const allItems =
    query.data?.pages.flatMap((p) => p.items) ?? [];
  const reels = sortReels(
    filterByStatus(filterBySearch(allItems, search), statusFilter),
    sort
  );

  return {
    reels,
    allReels: allItems,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
    fetchNextPage: query.fetchNextPage,
    hasNextPage: query.hasNextPage,
    isFetchingNextPage: query.isFetchingNextPage,
  };
}
