import apiClient from './client';

// ─── Enums (mirror backend) ───────────────────────────────────────────────────

export type CampaignStatus = 'draft' | 'active' | 'paused' | 'archived';
export type CampaignGoalType =
  | 'grow_following'
  | 'lead_generation'
  | 'product_sales'
  | 'brand_awareness';

export type CampaignPostType =
  | 'reel'
  | 'carousel'
  | 'story'
  | 'ugc_video'
  | 'image'
  | 'graphic_motion';

export type ContentSource = 'new' | 'existing';

export type CampaignPostPipelineStatus =
  | 'draft'
  | 'generating'
  | 'ready'
  | 'awaiting_schedule'
  | 'scheduled'
  | 'publishing'
  | 'published'
  | 'failed';

// ─── Entities ─────────────────────────────────────────────────────────────────

export interface Campaign {
  id: string;
  user_id: string;
  name: string;
  status: CampaignStatus;
  goal_type: CampaignGoalType;
  goal_description: string | null;
  visual_style: string | null;
  icp_criteria: Record<string, any> | null;
  start_date: string | null;
  end_date: string | null;
  posting_cadence_days: number;
  target_platforms: string[];
  quality_score: number | null;
  cached_total_posts: number;
  cached_published_posts: number;
  cached_total_views: string;
  cached_avg_engagement: string | null;
  created_at: string;
  updated_at: string;
}

export interface CampaignPost {
  id: string;
  campaign_id: string;
  day_number: number;
  sort_order: number;
  post_type: CampaignPostType;
  content_source: ContentSource;
  source_entity_type: string | null;
  source_entity_id: string | null;
  rendered_s3_key: string | null;
  render_job_id: string | null;
  render_error: string | null;
  ai_generation_job_id: string | null;
  ai_generation_error: string | null;
  title: string | null;
  hook: string | null;
  caption: string | null;
  script: string | null;
  hashtags: string | null;
  target_platforms: string[];
  pipeline_status: CampaignPostPipelineStatus;
  pipeline_error: string | null;
  scheduled_at: string | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface CampaignAccount {
  id: string;
  campaign_id: string;
  connected_account_id: string;
  is_active: boolean;
  priority: number;
  override_soft_daily_posts: number | null;
  override_hard_daily_posts: number | null;
  override_soft_weekly_posts: number | null;
  override_hard_weekly_posts: number | null;
  notes: string | null;
  added_at: string;
  updated_at: string;
  connected_account?: {
    id: string;
    platform: string;
    account_name: string | null;
    account_avatar_url: string | null;
    is_active: boolean;
    needs_reauth: boolean;
  };
}

export interface CampaignAnalyticsSummary {
  totalPosts: number;
  publishedPosts: number;
  totalViews: number;
  totalLikes: number;
  totalComments: number;
  avgEngagementRate: number | null;
  followersGained: number;
}

// ─── DTOs ─────────────────────────────────────────────────────────────────────

export interface CreateCampaignDto {
  name: string;
  goal_type: CampaignGoalType;
  visual_style?: string;
  goal_description?: string;
  target_platforms?: string[];
  start_date?: string;
  end_date?: string;
  posting_cadence_days?: number;
}

export interface UpdateCampaignDto extends Partial<CreateCampaignDto> {
  status?: CampaignStatus;
}

export interface CreateCampaignPostDto {
  day_number: number;
  post_type: CampaignPostType;
  sort_order?: number;
  content_source?: ContentSource;
  source_entity_type?: string;
  source_entity_id?: string;
  title?: string;
  hook?: string;
  caption?: string;
  script?: string;
  hashtags?: string;
  target_platforms?: string[];
}

export interface UpdateCampaignPostDto extends Partial<CreateCampaignPostDto> {
  scheduled_at?: string;
}

export interface AddCampaignAccountDto {
  connected_account_id: string;
  priority?: number;
  override_soft_daily_posts?: number;
  override_hard_daily_posts?: number;
  override_soft_weekly_posts?: number;
  override_hard_weekly_posts?: number;
  notes?: string;
}

export interface ScheduleCampaignPostDto {
  scheduled_at: string; // ISO string
}

export interface ScheduleResult {
  scheduledCount: number;
  blockedAccounts: Array<{ accountId: string; accountName: string | null; reason: string }>;
  softLimitWarnings: Array<{ accountId: string; accountName: string | null; dailyCount: number; weeklyCount: number }>;
}

// ─── API ──────────────────────────────────────────────────────────────────────

export const campaignsApi = {
  // ── Campaigns ──────────────────────────────────────────────────────────────
  list: async (): Promise<Campaign[]> => {
    const res = await apiClient.get<Campaign[]>('/campaigns');
    return res.data;
  },

  get: async (id: string): Promise<Campaign> => {
    const res = await apiClient.get<Campaign>(`/campaigns/${id}`);
    return res.data;
  },

  create: async (dto: CreateCampaignDto): Promise<Campaign> => {
    const res = await apiClient.post<Campaign>('/campaigns', dto);
    return res.data;
  },

  update: async (id: string, dto: UpdateCampaignDto): Promise<Campaign> => {
    const res = await apiClient.patch<Campaign>(`/campaigns/${id}`, dto);
    return res.data;
  },

  archive: async (id: string): Promise<void> => {
    await apiClient.delete(`/campaigns/${id}`);
  },

  // ── Posts ──────────────────────────────────────────────────────────────────
  listPosts: async (campaignId: string): Promise<CampaignPost[]> => {
    const res = await apiClient.get<CampaignPost[]>(`/campaigns/${campaignId}/posts`);
    return res.data;
  },

  getPost: async (campaignId: string, postId: string): Promise<CampaignPost> => {
    const res = await apiClient.get<CampaignPost>(`/campaigns/${campaignId}/posts/${postId}`);
    return res.data;
  },

  createPost: async (campaignId: string, dto: CreateCampaignPostDto): Promise<CampaignPost> => {
    const res = await apiClient.post<CampaignPost>(`/campaigns/${campaignId}/posts`, dto);
    return res.data;
  },

  updatePost: async (campaignId: string, postId: string, dto: UpdateCampaignPostDto): Promise<CampaignPost> => {
    const res = await apiClient.patch<CampaignPost>(`/campaigns/${campaignId}/posts/${postId}`, dto);
    return res.data;
  },

  deletePost: async (campaignId: string, postId: string): Promise<void> => {
    await apiClient.delete(`/campaigns/${campaignId}/posts/${postId}`);
  },

  schedulePost: async (campaignId: string, postId: string, dto: ScheduleCampaignPostDto): Promise<ScheduleResult> => {
    const res = await apiClient.post<ScheduleResult>(`/campaigns/${campaignId}/posts/${postId}/schedule`, dto);
    return res.data;
  },

  // ── Accounts ──────────────────────────────────────────────────────────────
  listAccounts: async (campaignId: string): Promise<CampaignAccount[]> => {
    const res = await apiClient.get<CampaignAccount[]>(`/campaigns/${campaignId}/accounts`);
    return res.data;
  },

  addAccount: async (campaignId: string, dto: AddCampaignAccountDto): Promise<CampaignAccount> => {
    const res = await apiClient.post<CampaignAccount>(`/campaigns/${campaignId}/accounts`, dto);
    return res.data;
  },

  removeAccount: async (campaignId: string, accountId: string): Promise<void> => {
    await apiClient.delete(`/campaigns/${campaignId}/accounts/${accountId}`);
  },

  // ── Analytics ─────────────────────────────────────────────────────────────
  getAnalyticsSummary: async (campaignId: string): Promise<CampaignAnalyticsSummary> => {
    const res = await apiClient.get<CampaignAnalyticsSummary>(`/campaigns/${campaignId}/analytics/summary`);
    return res.data;
  },

  getDailyBreakdown: async (campaignId: string, from?: string, to?: string) => {
    const params: Record<string, string> = {};
    if (from) params.from = from;
    if (to) params.to = to;
    const res = await apiClient.get(`/campaigns/${campaignId}/analytics/daily`, { params });
    return res.data;
  },

  getPlatformBreakdown: async (campaignId: string): Promise<Record<string, { views: number; likes: number; posts: number }>> => {
    const res = await apiClient.get(`/campaigns/${campaignId}/analytics/platforms`);
    return res.data;
  },

  getPostsTable: async (campaignId: string) => {
    const res = await apiClient.get(`/campaigns/${campaignId}/analytics/posts`);
    return res.data;
  },
};
