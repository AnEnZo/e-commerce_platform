export interface MetricData {
  icon: string;
  title: string;
  value: string;
  change: string;
  trend: 'up' | 'down' | 'neutral';
  changeValue: string;
}

export interface ProductData {
  icon: string;
  name: string;
  variant: string;
  revenue: string;
  orders: string;
  sold: number;
  soldChange: string;
  conversionRate: string;
  conversionChange: string;
  rating: number;
  reviewCount: number;
  trend: 'up' | 'down' | 'neutral';
  trendLabel: string;
  performance: 'excellent' | 'good' | 'average' | 'poor';
  performanceLabel: string;
}

export interface CustomerSegment {
  label: string;
  description: string;
  count: number;
  percentage: string;
  color: 'green' | 'blue' | 'yellow' | 'gray';
}

export interface ConversionStep {
  label: string;
  value: number;
  percentage?: string;
  width: number;
}

export interface InsightItem {
  type: 'excellent' | 'good' | 'warning' | 'danger';
  title: string;
  description: string;
}

export interface ChartPeriod {
  id: 'daily' | 'weekly' | 'monthly';
  label: string;
}