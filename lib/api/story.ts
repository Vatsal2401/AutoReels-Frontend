import apiClient from './client';

export type StoryGenre = 'horror' | 'motivational' | 'crime' | 'urban_legend' | 'comedy';

export const STORY_GENRES: Array<{ value: StoryGenre; label: string; emoji: string }> = [
  { value: 'horror', label: 'Horror', emoji: '👻' },
  { value: 'motivational', label: 'Motivational', emoji: '🔥' },
  { value: 'crime', label: 'Crime', emoji: '🔍' },
  { value: 'urban_legend', label: 'Urban Legend', emoji: '🌙' },
  { value: 'comedy', label: 'Comedy', emoji: '😂' },
];

export interface CreateStoryDto {
  prompt: string;
  genre: StoryGenre;
  sceneCount: 3 | 5 | 7;
  voiceId?: string;
  voiceLabel?: string;
  musicId?: string;
}

export const storyApi = {
  createStory: (dto: CreateStoryDto) =>
    apiClient
      .post<{ id: string; media_id: string; status: string }>('/story/create', dto)
      .then((r) => r.data),
};
