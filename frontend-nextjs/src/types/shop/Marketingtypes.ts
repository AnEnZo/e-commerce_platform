// types/marketing.ts

export interface Campaign {
  id: string;
  name: string;
  platform: 'Facebook' | 'Google' | 'TikTok' | 'Zalo' | 'Shopee';
  status: 'active' | 'paused' | 'ended' | 'draft';
  budget: {
    daily: number;
    spent: number;
    percentage: number;
  };
  metrics: {
    ctr: number;
    roas: number;
  };
}

export interface Metric {
  icon: string;
  title: string;
  value: string;
  subtitle: string;
  trend: {
    value: string;
    direction: 'up' | 'down' | 'neutral';
  };
}

export interface AudienceSegment {
  id: string;
  name: string;
  status: 'high-potential' | 'growing' | 'stable' | 'declining';
  interests: string[];
  size: string;
  avgIncome: string;
  engagement: number;
}

export interface CreativePerformance {
  id: string;
  name: string;
  type: 'video' | 'image' | 'carousel';
  duration?: string;
  platform: string;
  ctr: number;
  cvr: number;
  performance: 'excellent' | 'good' | 'average' | 'poor';
}

export interface KeywordData {
  keyword: string;
  searchVolume: string;
  cpc: string;
  competition: 'low' | 'medium' | 'high';
  isOpportunity?: boolean;
  trending?: string;
}

export interface CampaignFormData {
  name: string;
  platform: string;
  objective: string;
  startDate: string;
  endDate: string;
  targeting: {
    ageFrom: number;
    ageTo: number;
    genders: string[];
    location: string;
    interests: string[];
  };
  creative: {
    type: 'image' | 'video' | 'carousel';
    headline: string;
    description: string;
    cta: string;
  };
  budget: {
    type: 'daily' | 'lifetime';
    amount: number;
    bidStrategy: string;
  };
}

/**
 * Generic chart dataset — T is the data item type (number, string, object, ...)
 * Use this when you don't want to depend on a specific charting library.
 */
export interface ChartDataset<T = number | null> {
  label?: string;
  data: T[];
  // optional visual / config fields commonly used across libraries:
  backgroundColor?: string | string[];
  borderColor?: string | string[];
  borderWidth?: number;
  tension?: number; // for line charts
  fill?: boolean;
  // any additional library-specific props can be placed into metadata (type-safe-ish)
  meta?: Record<string, unknown>;
}

/** Now datasets is typed — không dùng `any` nữa */
export interface ChartData<T = number | null> {
  labels: string[];
  datasets: ChartDataset<T>[];
}

export interface SidebarItem {
  icon: string;
  label: string;
  href: string;
  badge?: number;
  active?: boolean;
}
