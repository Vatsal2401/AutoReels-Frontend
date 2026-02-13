"use client";

import { useQuery } from "@tanstack/react-query";
import { mediaApi } from "@/lib/api/media";

export function useEditorProject(mediaId: string | null, enabled: boolean) {
  const query = useQuery({
    queryKey: ["editor-project", mediaId],
    queryFn: () => {
      if (!mediaId) throw new Error("Media ID required");
      return mediaApi.getEditorProject(mediaId);
    },
    enabled: !!mediaId && enabled,
  });

  return {
    project: query.data ?? null,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}
