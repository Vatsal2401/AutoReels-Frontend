import apiClient from './client';

export type StoryGenre =
  | 'horror'
  | 'motivational'
  | 'crime'
  | 'urban_legend'
  | 'comedy'
  | 'sci_fi'
  | 'romance'
  | 'thriller'
  | 'historical'
  | 'documentary'
  | 'mystery';

export const STORY_GENRES: Array<{ value: StoryGenre; label: string; emoji: string }> = [
  { value: 'horror', label: 'Horror', emoji: '👻' },
  { value: 'motivational', label: 'Motivational', emoji: '🔥' },
  { value: 'crime', label: 'Crime', emoji: '🔍' },
  { value: 'urban_legend', label: 'Urban Legend', emoji: '🌙' },
  { value: 'comedy', label: 'Comedy', emoji: '😂' },
  { value: 'sci_fi', label: 'Sci-Fi', emoji: '🚀' },
  { value: 'romance', label: 'Romance', emoji: '💕' },
  { value: 'thriller', label: 'Thriller', emoji: '⚡' },
  { value: 'historical', label: 'Historical', emoji: '📜' },
  { value: 'documentary', label: 'Documentary', emoji: '🎥' },
  { value: 'mystery', label: 'Mystery', emoji: '🔎' },
];

export type StoryImageStyle =
  | 'cartoon'
  | 'cinematic'
  | 'dark_anime'
  | 'dark_fantasy'
  | 'watercolor'
  | 'pixel_art'
  | 'neon_noir'
  | 'realistic_photo';

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
  {
    value: 'dark_fantasy',
    label: 'Dark Fantasy',
    emoji: '🐉',
    prompt: 'dark fantasy digital painting, epic dramatic lighting, detailed mystical environment',
  },
  {
    value: 'watercolor',
    label: 'Watercolor',
    emoji: '🖌️',
    prompt: 'soft watercolor illustration, painterly washes, delicate linework, pastel tones',
  },
  {
    value: 'pixel_art',
    label: 'Pixel Art',
    emoji: '👾',
    prompt: 'pixel art style, 16-bit retro, vibrant colors, crisp pixels, detailed pixelated scene',
  },
  {
    value: 'neon_noir',
    label: 'Neon Noir',
    emoji: '🌆',
    prompt: 'neon noir, rain-slicked streets, vibrant neon glow, moody shadows, cyberpunk aesthetic',
  },
  {
    value: 'realistic_photo',
    label: 'Realistic Photo',
    emoji: '📸',
    prompt: 'photorealistic photography, ultra-detailed, natural lighting, shot on DSLR, 8K',
  },
];

export interface CreateStoryDto {
  prompt: string;
  genre: StoryGenre;
  sceneCount: 3 | 5 | 7 | 10;
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
