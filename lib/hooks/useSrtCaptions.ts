"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchAndParseSrt } from "@/lib/editor/parseSrt";

export function useSrtCaptions(captionUrl: string | null | undefined) {
  const query = useQuery({
    queryKey: ["srt-captions", captionUrl],
    queryFn: () => {
      if (!captionUrl) throw new Error("No caption URL");
      return fetchAndParseSrt(captionUrl);
    },
    enabled: !!captionUrl,
    staleTime: 5 * 60 * 1000,
  });

  return {
    cues: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}
