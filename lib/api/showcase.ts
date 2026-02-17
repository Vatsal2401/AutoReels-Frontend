import apiClient from "./client";

export type ShowcaseItemType = "reel" | "graphic_motion" | "text_to_image";

export interface ShowcaseItem {
  id: string;
  type: ShowcaseItemType;
  url: string | null;
  mediaId?: string;
  projectId?: string;
}

export interface ShowcaseResponse {
  items: ShowcaseItem[];
}

export const showcaseApi = {
  getShowcase: async (): Promise<ShowcaseResponse> => {
    const { data } = await apiClient.get<ShowcaseResponse>("/showcase");
    return data;
  },
};
