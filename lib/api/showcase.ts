import apiClient from "./client";

export interface ShowcaseResponse {
  reel: { mediaId: string; url: string | null };
  graphicMotion: { projectId: string; url: string | null };
  textToImage: { url: string };
}

export const showcaseApi = {
  getShowcase: async (): Promise<ShowcaseResponse> => {
    const { data } = await apiClient.get<ShowcaseResponse>("/showcase");
    return data;
  },
};
