import apiClient from './client';

export type UgcStyle =
  | 'selfie_review'
  | 'unboxing'
  | 'problem_solution'
  | 'before_after'
  | 'tiktok_story';

export interface UgcActor {
  id: string;
  name: string;
  gender: string;
  age_group: string;
  region: string;
  style: string;
  portrait_s3_key: string;
  preview_s3_key: string | null;
  portrait_url?: string;
  preview_url?: string;
  usage_count: number;
}

export interface CreateUgcVideoDto {
  productName: string;
  productDescription: string;
  benefits?: string[];
  targetAudience: string;
  callToAction: string;
  actorId: string;
  ugcStyle: UgcStyle;
  voiceId?: string;
  musicId?: string;
  productImageKeys?: string[];
}

export const ugcApi = {
  listActors: async (filters?: {
    gender?: string;
    ageGroup?: string;
    region?: string;
    style?: string;
  }): Promise<UgcActor[]> => {
    const params = new URLSearchParams();
    if (filters?.gender) params.set('gender', filters.gender);
    if (filters?.ageGroup) params.set('ageGroup', filters.ageGroup);
    if (filters?.region) params.set('region', filters.region);
    if (filters?.style) params.set('style', filters.style);
    const res = await apiClient.get<UgcActor[]>(`/ugc/actors?${params.toString()}`);
    return res.data;
  },

  createVideo: async (dto: CreateUgcVideoDto) => {
    const res = await apiClient.post<{ id: string; status: string }>('/ugc/create', dto);
    return res.data;
  },

  listAbTests: async (mediaId: string) => {
    const res = await apiClient.get<any[]>(`/ugc/${mediaId}/ab-tests`);
    return res.data;
  },
};
