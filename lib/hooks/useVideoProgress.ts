"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { videosApi, Video, VideoStatus } from "@/lib/api/videos";

const TERMINAL_STATUSES: VideoStatus[] = ["completed", "failed"];

export function useVideoProgress(videoId: string | null) {
  const [shouldPoll, setShouldPoll] = useState(true);

  const {
    data: video,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["video", videoId],
    queryFn: () => {
      if (!videoId) throw new Error("Video ID is required");
      return videosApi.getVideo(videoId);
    },
    enabled: !!videoId && shouldPoll,
    refetchInterval: (query) => {
      const video = query.state.data as Video | undefined;
      if (!video) return 2000;
      if (TERMINAL_STATUSES.includes(video.status)) {
        setShouldPoll(false);
        return false;
      }
      return 2000; // Poll every 2 seconds
    },
  });

  useEffect(() => {
    if (video && TERMINAL_STATUSES.includes(video.status)) {
      setShouldPoll(false);
    }
  }, [video]);

  return {
    video: video || null,
    isLoading,
    error,
    refetch,
  };
}
