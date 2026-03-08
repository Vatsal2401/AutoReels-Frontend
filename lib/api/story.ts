import apiClient from './client';

export type StoryGenre = 'horror' | 'motivational' | 'crime' | 'urban_legend' | 'comedy';

export const STORY_GENRES: Array<{ value: StoryGenre; label: string; emoji: string }> = [
  { value: 'horror', label: 'Horror', emoji: '👻' },
  { value: 'motivational', label: 'Motivational', emoji: '🔥' },
  { value: 'crime', label: 'Crime', emoji: '🔍' },
  { value: 'urban_legend', label: 'Urban Legend', emoji: '🌙' },
  { value: 'comedy', label: 'Comedy', emoji: '😂' },
];

export type StoryImageStyle = 'cartoon' | 'cinematic' | 'dark_anime';

export const STORY_IMAGE_STYLES: Array<{ value: StoryImageStyle; label: string; emoji: string; prompt: string }> = [
  {
    value: 'cartoon',
    label: 'Cartoon',
    emoji: '🎨',
    prompt: 'cartoon comic illustration, bold black outlines, vibrant colors, animated storybook art style',
  },
  {
    value: 'cinematic',
    label: 'Cinematic',
    emoji: '🎬',
    prompt: 'cinematic photography, dramatic lighting, hyper-realistic, film grain, ultra-detailed',
  },
  {
    value: 'dark_anime',
    label: 'Dark Anime',
    emoji: '⚔️',
    prompt: 'dark anime illustration, detailed Japanese manga art, dramatic shadows, bold linework, high contrast',
  },
];

export interface CreateStoryDto {
  prompt: string;
  genre: StoryGenre;
  sceneCount: 3 | 5 | 7;
  voiceId?: string;
  voiceLabel?: string;
  musicId?: string;
  imageStyle?: string;
}

export const storyApi = {
  createStory: (dto: CreateStoryDto) =>
    apiClient
      .post<{ id: string; media_id: string; status: string }>('/story/create', dto)
      .then((r) => r.data),
};
