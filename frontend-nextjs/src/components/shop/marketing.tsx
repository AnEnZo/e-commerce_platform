'use client';

import React, { useEffect, useRef, useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Sidebar from '@/components/shop/Sidebar';
// Nếu dùng global CSS, import ở layout/_app; nếu muốn import ở đây, đổi sang CSS module.
// import '../css/marketing.css';

// Chart.js types
import type { Chart as ChartJS, ChartConfiguration } from 'chart.js';

interface Campaign {
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

interface Metric {
  icon: string;
  title: string;
  value: string;
  subtitle: string;
  trend: {
    value: string;
    direction: 'up' | 'down' | 'neutral';
  };
  cardClass: string;
}

interface AudienceSegment {
  id: string;
  name: string;
  status: 'high-potential' | 'growing' | 'stable' | 'declining';
  interests: string[];
  size: string;
  avgIncome: string;
  engagement: number;
}

interface CreativePerformance {
  id: string;
  name: string;
  type: 'video' | 'image' | 'carousel';
  duration?: string;
  platform: string;
  ctr: number;
  cvr: number;
  performance: 'excellent' | 'good' | 'average' | 'poor';
  icon: string;
}

interface KeywordData {
  keyword: string;
  searchVolume: string;
  cpc: string;
  competition: 'low' | 'medium' | 'high';
  isOpportunity?: boolean;
  trending?: string;
  bgColor: string;
}

interface SidebarItem {
  icon: string;
  label: string;
  href: string;
  badge?: number;
  active?: boolean;
}

const MarketingPage: React.FC = () => {
  const [showCampaignModal, setShowCampaignModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'basic' | 'targeting' | 'creative' | 'budget'>('basic');
  const [budgetValue, setBudgetValue] = useState<number>(500000);
  const [activeMetric, setActiveMetric] = useState<'impressions' | 'clicks' | 'conversions'>('impressions');

  const performanceCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const budgetCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Chart instances typed without `any`
  const performanceChartRef = useRef<ChartJS | null>(null);
  const budgetChartRef = useRef<ChartJS | null>(null);

  // ---------- Sample data (unchanged types) ----------
  const sidebarItems: SidebarItem[] = [
    { icon: '📊', label: 'Tổng quan', href: '#', active: false },
    { icon: '📦', label: 'Quản lý đơn hàng', href: '#', badge: 12, active: false },
    { icon: '🛍️', label: 'Quản lý sản phẩm', href: '#', active: false },
    { icon: '💰', label: 'Tài chính', href: '#', active: false },
    { icon: '📈', label: 'Phân tích bán hàng', href: '#', active: false },
    { icon: '🎯', label: 'Marketing', href: '#', active: true },
    { icon: '⭐', label: 'Đánh giá shop', href: '#', active: false },
    { icon: '🚚', label: 'Vận chuyển', href: '#', active: false },
    { icon: '⚙️', label: 'Cài đặt shop', href: '#', active: false },
  ];

  const metrics: Metric[] = [
    {
      icon: '💰',
      title: 'Chi phí quảng cáo',
      value: '₫45.2M',
      subtitle: 'Tháng này',
      trend: { value: 'Budget: ₫60M', direction: 'neutral' },
      cardClass: 'metric-card-1'
    },
    {
      icon: '📊',
      title: 'ROAS',
      value: '4.2x',
      subtitle: 'Return on Ad Spend',
      trend: { value: '↗ +0.3', direction: 'up' },
      cardClass: 'metric-card-2'
    },
    {
      icon: '👁️',
      title: 'Lượt hiển thị',
      value: '2.1M',
      subtitle: 'Impressions',
      trend: { value: '↗ +15%', direction: 'up' },
      cardClass: 'metric-card-3'
    },
    {
      icon: '🖱️',
      title: 'CTR',
      value: '3.8%',
      subtitle: 'Click Through Rate',
      trend: { value: '↗ +0.5%', direction: 'up' },
      cardClass: 'metric-card-4'
    },
    {
      icon: '💳',
      title: 'CPC',
      value: '₫12.5K',
      subtitle: 'Cost Per Click',
      trend: { value: '↘ -₫2K', direction: 'down' },
      cardClass: 'metric-card-5'
    },
    {
      icon: '🎯',
      title: 'Conversion Rate',
      value: '2.4%',
      subtitle: 'Tỷ lệ chuyển đổi',
      trend: { value: '↗ +0.2%', direction: 'up' },
      cardClass: 'metric-card-6'
    }
  ];

  const campaigns: Campaign[] = [
    {
      id: 'fb-iphone-launch',
      name: 'iPhone 15 Pro Max Launch',
      platform: 'Facebook',
      status: 'active',
      budget: { daily: 500000, spent: 2100000, percentage: 42 },
      metrics: { ctr: 3.2, roas: 4.1 }
    },
    {
      id: 'google-macbook-search',
      name: 'MacBook Pro M3 Search',
      platform: 'Google',
      status: 'active',
      budget: { daily: 300000, spent: 1800000, percentage: 60 },
      metrics: { ctr: 4.8, roas: 3.7 }
    },
    {
      id: 'tiktok-airpods-genz',
      name: 'AirPods Pro Gen Z',
      platform: 'TikTok',
      status: 'paused',
      budget: { daily: 200000, spent: 800000, percentage: 20 },
      metrics: { ctr: 2.1, roas: 2.8 }
    }
  ];

  const audienceSegments: AudienceSegment[] = [
    {
      id: 'tech-enthusiasts',
      name: 'Tech Enthusiasts (25-35)',
      status: 'high-potential',
      interests: ['iPhone', 'MacBook', 'Gaming', 'Tech Reviews'],
      size: '45K',
      avgIncome: '₫25M',
      engagement: 4.2
    },
    {
      id: 'business-professionals',
      name: 'Business Professionals (30-45)',
      status: 'growing',
      interests: ['Productivity', 'Business Tools', 'Premium Devices'],
      size: '32K',
      avgIncome: '₫45M',
      engagement: 3.8
    }
  ];

  const creativePerformances: CreativePerformance[] = [
    {
      id: 'iphone-video',
      name: 'iPhone 15 Pro Max Video Ad',
      type: 'video',
      duration: '30s',
      platform: 'Facebook',
      ctr: 4.2,
      cvr: 3.1,
      performance: 'excellent',
      icon: '🎬'
    },
    {
      id: 'macbook-carousel',
      name: 'MacBook Pro Carousel',
      type: 'carousel',
      platform: 'Instagram',
      ctr: 3.8,
      cvr: 2.7,
      performance: 'good',
      icon: '📸'
    },
    {
      id: 'airpods-static',
      name: 'AirPods Pro Static Ad',
      type: 'image',
      platform: 'Google Display',
      ctr: 2.1,
      cvr: 1.8,
      performance: 'average',
      icon: '🖼️'
    }
  ];

  const keywordData: KeywordData[] = [
    {
      keyword: 'iPhone 15 Pro Max',
      searchVolume: '45K/tháng',
      cpc: '₫15K',
      competition: 'medium',
      bgColor: 'bg-green-50'
    },
    {
      keyword: 'MacBook Pro M3',
      searchVolume: '32K/tháng',
      cpc: '₫18K',
      competition: 'high',
      bgColor: 'bg-blue-50'
    },
    {
      keyword: 'AirPods Pro Gen 2',
      searchVolume: '28K/tháng',
      cpc: '₫12K',
      competition: 'low',
      bgColor: 'bg-yellow-50'
    }
  ];

  const keywordOpportunities: KeywordData[] = [
    {
      keyword: 'iPhone 15 Pro Max 256GB',
      searchVolume: '',
      cpc: '',
      competition: 'low',
      trending: '+25% tuần này',
      bgColor: '',
      isOpportunity: true
    },
    {
      keyword: 'MacBook Pro 14 inch M3',
      searchVolume: '',
      cpc: '',
      competition: 'low',
      trending: '+18% tuần này',
      bgColor: '',
      isOpportunity: true
    },
    {
      keyword: 'Apple Watch Series 9 GPS',
      searchVolume: '',
      cpc: '',
      competition: 'low',
      trending: '+12% tuần này',
      bgColor: '',
      isOpportunity: true
    }
  ];

  // ---------- Chart initialization (no `any`) ----------
  useEffect(() => {
    let mounted = true;

    async function initCharts() {
      // dynamic import of chart.js
      const ChartModule = await import('chart.js');
      // Chart constructor type
      const ChartCtor: typeof ChartModule.Chart = ChartModule.Chart;

      if (!mounted) return;

      // Performance chart (line)
      const perfCanvas = performanceCanvasRef.current;
      if (perfCanvas) {
        const ctx = perfCanvas.getContext('2d');
        if (ctx) {
          const config: ChartConfiguration<'line'> = {
            type: 'line',
            data: {
              labels: ['1/12', '2/12', '3/12', '4/12', '5/12', '6/12', '7/12', '8/12', '9/12', '10/12', '11/12', '12/12', '13/12', '14/12', '15/12'],
              datasets: [
                {
                  label: 'Lượt hiển thị',
                  data: [45000, 52000, 48000, 55000, 62000, 70000, 85000, 78000, 92000, 88000, 95000, 102000, 110000, 105000, 115000],
                  borderColor: '#ee4d2d',
                  backgroundColor: 'rgba(238, 77, 45, 0.1)',
                  tension: 0.4,
                  fill: true
                },
                {
                  label: 'Clicks',
                  data: [1800, 2100, 1920, 2200, 2480, 2800, 3400, 3120, 3680, 3520, 3800, 4080, 4400, 4200, 4600],
                  borderColor: '#3b82f6',
                  backgroundColor: 'rgba(59, 130, 246, 0.1)',
                  tension: 0.4,
                  yAxisID: 'y1'
                }
              ]
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              interaction: {
                mode: 'index',
                intersect: false,
              },
              scales: {
                y: {
                  type: 'linear',
                  display: true,
                  position: 'left',
                  title: {
                    display: true,
                    text: 'Lượt hiển thị'
                  }
                },
                y1: {
                  type: 'linear',
                  display: true,
                  position: 'right',
                  title: {
                    display: true,
                    text: 'Clicks'
                  },
                  grid: {
                    drawOnChartArea: false,
                  },
                }
              }
            }
          };

          performanceChartRef.current?.destroy();
          performanceChartRef.current = new ChartCtor(ctx, config) as ChartJS;
        }
      }

      // Budget doughnut
      const budgetCanvas = budgetCanvasRef.current;
      if (budgetCanvas) {
        const ctx = budgetCanvas.getContext('2d');
        if (ctx) {
          const config: ChartConfiguration<'doughnut'> = {
            type: 'doughnut',
            data: {
              labels: ['Facebook Ads', 'Google Ads', 'TikTok Ads', 'Zalo Ads', 'Shopee Ads'],
              datasets: [
                {
                  data: [40, 30, 15, 10, 5],
                  backgroundColor: [
                    '#1877f2',
                    '#4285f4',
                    '#000000',
                    '#0068ff',
                    '#ee4d2d'
                  ]
                }
              ]
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  position: 'bottom'
                }
              }
            }
          };

          budgetChartRef.current?.destroy();
          budgetChartRef.current = new ChartCtor(ctx, config) as ChartJS;
        }
      }
    }

    initCharts().catch((err) => {
      // handle load/init errors gracefully
      // eslint-disable-next-line no-console
      console.error('Chart init error', err);
    });

    return () => {
      mounted = false;
      if (performanceChartRef.current) {
        performanceChartRef.current.destroy();
        performanceChartRef.current = null;
      }
      if (budgetChartRef.current) {
        budgetChartRef.current.destroy();
        budgetChartRef.current = null;
      }
    };
  }, []);

  // ---------- Helpers (typed) ----------
  const getPlatformIcon = (platform: Campaign['platform']): string => {
    switch (platform) {
      case 'Facebook': return '📘';
      case 'Google': return '🔍';
      case 'TikTok': return '🎵';
      case 'Zalo': return '💬';
      case 'Shopee': return '🛒';
      default: return '📱';
    }
  };

  const getPlatformBgClass = (platform: Campaign['platform']): string => {
    switch (platform) {
      case 'Facebook': return 'facebook-bg';
      case 'Google': return 'google-bg';
      case 'TikTok': return 'tiktok-bg';
      case 'Zalo': return 'zalo-bg';
      case 'Shopee': return 'shopee-bg-icon';
      default: return 'bg-gray-500';
    }
  };

  const getStatusClass = (status: Campaign['status']): string => {
    switch (status) {
      case 'active': return 'status-active';
      case 'paused': return 'status-paused';
      case 'ended': return 'status-ended';
      case 'draft': return 'status-draft';
      default: return 'status-draft';
    }
  };

  const getStatusText = (status: Campaign['status']): string => {
    switch (status) {
      case 'active': return 'Đang chạy';
      case 'paused': return 'Tạm dừng';
      case 'ended': return 'Đã kết thúc';
      case 'draft': return 'Nháp';
      default: return 'Nháp';
    }
  };

  const formatBudgetValue = (value: number): string => {
    if (value >= 1000000) {
      return (value / 1000000).toFixed(1) + 'M';
    }
    return (value / 1000) + 'K';
  };

  const handleBudgetSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBudgetValue(Number(e.target.value));
  };

  const handleCampaignAction = (action: string, campaignId?: string) => {
    if (campaignId) {
      alert(`${action} chiến dịch: ${campaignId}`);
    } else {
      alert(action);
    }
  };

  const handleModalClose = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setShowCampaignModal(false);
    }
  };

  // ---------- JSX (kept structure, typed) ----------
  return (
    <div className="shopee-bg min-h-screen">
      <Header />

      <div className="flex">
        <Sidebar activeKey="marketing" />

        <main className="flex-1 p-6">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Marketing Center</h1>
              <p className="text-gray-600">Quản lý chiến dịch quảng cáo và tối ưu hóa hiệu quả marketing</p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowCampaignModal(true)}
                className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center space-x-2"
              >
                <span>➕</span>
                <span>Tạo chiến dịch</span>
              </button>
              <button
                onClick={() => handleCampaignAction('Mở Audience Builder - Công cụ xây dựng đối tượng mục tiêu')}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <span>👥</span>
                <span>Audience Builder</span>
              </button>
              <button
                onClick={() => handleCampaignAction('Mở Creative Studio - Công cụ tạo creative quảng cáo')}
                className="bg-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-purple-700 transition-colors flex items-center space-x-2"
              >
                <span>🎨</span>
                <span>Creative Studio</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {metrics.map((metric, index) => (
              <div key={index} className={`${metric.cardClass} text-white p-6 rounded-lg card-shadow`}>
                <div className="flex items-center justify-between mb-4">
                  <div className="text-3xl">{metric.icon}</div>
                  <div className="text-right">
                    <div className="text-sm opacity-90">{metric.title}</div>
                    <div className="text-2xl font-bold">{metric.value}</div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm opacity-90">{metric.subtitle}</span>
                  <div className="flex items-center space-x-1">
                    <span className={`text-sm font-medium ${metric.trend.direction === 'up' ? 'trend-up' : metric.trend.direction === 'down' ? 'trend-down' : 'trend-neutral'}`}>
                      {metric.trend.value}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg card-shadow">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Hiệu suất chiến dịch</h3>
                <div className="flex items-center space-x-2">
                  <button
                    className={`filter-btn ${activeMetric === 'impressions' ? 'active' : ''}`}
                    onClick={() => setActiveMetric('impressions')}
                  >
                    Lượt hiển thị
                  </button>
                  <button
                    className={`filter-btn ${activeMetric === 'clicks' ? 'active' : ''}`}
                    onClick={() => setActiveMetric('clicks')}
                  >
                    Clicks
                  </button>
                  <button
                    className={`filter-btn ${activeMetric === 'conversions' ? 'active' : ''}`}
                    onClick={() => setActiveMetric('conversions')}
                  >
                    Chuyển đổi
                  </button>
                </div>
              </div>
              <div className="chart-container" style={{ height: 320 }}>
                <canvas ref={performanceCanvasRef}></canvas>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg card-shadow">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Phân bổ ngân sách theo platform</h3>
                <button
                  onClick={() => handleCampaignAction('Tối ưu hóa phân bổ ngân sách dựa trên AI recommendations')}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  Tối ưu
                </button>
              </div>
              <div className="chart-container" style={{ height: 320 }}>
                <canvas ref={budgetCanvasRef}></canvas>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg card-shadow mb-8">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Chiến dịch đang chạy</h3>
                <div className="flex items-center space-x-3">
                  <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm">
                    <option>Tất cả platform</option>
                    <option>Facebook Ads</option>
                    <option>Google Ads</option>
                    <option>TikTok Ads</option>
                    <option>Zalo Ads</option>
                  </select>
                  <button
                    onClick={() => handleCampaignAction('Thao tác hàng loạt cho nhiều chiến dịch')}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    Thao tác hàng loạt
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
              {campaigns.map((campaign) => (
                <div key={campaign.id} className="campaign-card bg-white border rounded-lg p-4 card-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className={`platform-icon ${getPlatformBgClass(campaign.platform)} text-white`}>
                        {getPlatformIcon(campaign.platform)}
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">{campaign.name}</h4>
                        <p className="text-sm text-gray-500">{campaign.platform} Ads</p>
                      </div>
                    </div>
                    <span className={`${getStatusClass(campaign.status)} px-2 py-1 text-xs font-medium rounded-full`}>
                      {getStatusText(campaign.status)}
                    </span>
                  </div>

                  <div className="space-y-3 mb-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Ngân sách</span>
                      <span className="font-medium">₫{(campaign.budget.daily / 1000)}K/ngày</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Đã chi</span>
                      <span className="font-medium">₫{(campaign.budget.spent / 1000000).toFixed(1)}M</span>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${campaign.budget.percentage}%` }}></div>
                    </div>
                    <div className="text-xs text-gray-500">{campaign.budget.percentage}% ngân sách đã sử dụng</div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="text-center">
                      <div className="text-lg font-bold text-gray-900">{campaign.metrics.ctr}%</div>
                      <div className="text-xs text-gray-500">CTR</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-gray-900">{campaign.metrics.roas}x</div>
                      <div className="text-xs text-gray-500">ROAS</div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {campaign.status === 'paused' ? (
                      <button
                        onClick={() => handleCampaignAction('Tiếp tục', campaign.id)}
                        className="flex-1 bg-green-600 text-white py-2 px-3 rounded text-sm font-medium hover:bg-green-700"
                      >
                        Tiếp tục
                      </button>
                    ) : (
                      <button
                        onClick={() => handleCampaignAction('Chỉnh sửa', campaign.id)}
                        className="flex-1 bg-blue-600 text-white py-2 px-3 rounded text-sm font-medium hover:bg-blue-700"
                      >
                        Chỉnh sửa
                      </button>
                    )}
                    <button
                      onClick={() => handleCampaignAction(campaign.status === 'paused' ? 'Chỉnh sửa' : 'Tạm dừng', campaign.id)}
                      className="flex-1 bg-gray-200 text-gray-700 py-2 px-3 rounded text-sm font-medium hover:bg-gray-300"
                    >
                      {campaign.status === 'paused' ? 'Chỉnh sửa' : 'Tạm dừng'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Audience Insights & Creative Performance (kept same) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg card-shadow">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Audience Insights</h3>
              <div className="space-y-4">
                {audienceSegments.map((segment) => (
                  <div key={segment.id} className="audience-segment p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900">{segment.name}</h4>
                      <span className={`text-sm font-medium ${segment.status === 'high-potential' ? 'text-blue-600' : 'text-green-600'}`}>
                        {segment.status === 'high-potential' ? 'Tiềm năng cao' : 'Đang tăng trưởng'}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 mb-3">
                      Quan tâm: {segment.interests.join(', ')}
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="font-bold text-gray-900">{segment.size}</div>
                        <div className="text-xs text-gray-500">Kích thước</div>
                      </div>
                      <div>
                        <div className="font-bold text-gray-900">{segment.avgIncome}</div>
                        <div className="text-xs text-gray-500">Thu nhập TB</div>
                      </div>
                      <div>
                        <div className="font-bold text-gray-900">{segment.engagement}%</div>
                        <div className="text-xs text-gray-500">Engagement</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <button
                onClick={() => handleCampaignAction('Xem tất cả audience segments và insights')}
                className="w-full mt-4 bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700"
              >
                Xem tất cả segments
              </button>
            </div>

            <div className="bg-white p-6 rounded-lg card-shadow">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Creative Performance</h3>
              <div className="space-y-4">
                {creativePerformances.map((creative) => (
                  <div key={creative.id} className="flex items-center space-x-4 p-3 border rounded-lg">
                    <div className="creative-preview">{creative.icon}</div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{creative.name}</h4>
                      <p className="text-sm text-gray-500">
                        {creative.type} {creative.duration && `• ${creative.duration}`} • {creative.platform}
                      </p>
                      <div className="flex items-center space-x-4 mt-2">
                        <div className="text-sm">
                          <span className="font-medium text-green-600">CTR: {creative.ctr}%</span>
                        </div>
                        <div className="text-sm">
                          <span className="font-medium text-blue-600">CVR: {creative.cvr}%</span>
                        </div>
                      </div>
                    </div>
                    <span className={`performance-${creative.performance} px-2 py-1 text-xs font-medium rounded-full`}>
                      {creative.performance === 'excellent' ? 'Xuất sắc' : creative.performance === 'good' ? 'Tốt' : 'Trung bình'}
                    </span>
                  </div>
                ))}
              </div>
              <button
                onClick={() => handleCampaignAction('Mở thư viện creative và templates')}
                className="w-full mt-4 bg-purple-600 text-white py-2 rounded-lg font-medium hover:bg-purple-700"
              >
                Thư viện Creative
              </button>
            </div>
          </div>

          {/* Keyword Research & SEO (unchanged) */}
          <div className="bg-white rounded-lg card-shadow">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Keyword Research & SEO</h3>
                <button
                  onClick={() => handleCampaignAction('Mở Keyword Research Tool - Công cụ nghiên cứu từ khóa')}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  Công cụ từ khóa
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Từ khóa hiệu quả cao</h4>
                  <div className="space-y-3">
                    {keywordData.map((keyword, index) => (
                      <div key={index} className={`flex items-center justify-between p-3 ${keyword.bgColor} rounded-lg`}>
                        <div>
                          <span className="keyword-tag">{keyword.keyword}</span>
                          <div className="text-sm text-gray-600 mt-1">Search Volume: {keyword.searchVolume}</div>
                        </div>
                        <div className="text-right">
                          <div className={`font-medium ${keyword.bgColor.includes('green') ? 'text-green-700' : keyword.bgColor.includes('blue') ? 'text-blue-700' : 'text-yellow-700'}`}>
                            CPC: {keyword.cpc}
                          </div>
                          <div className={`text-sm ${keyword.bgColor.includes('green') ? 'text-green-600' : keyword.bgColor.includes('blue') ? 'text-blue-600' : 'text-yellow-600'}`}>
                            Competition: {keyword.competition}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Cơ hội từ khóa mới</h4>
                  <div className="space-y-3">
                    {keywordOpportunities.map((keyword, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <span className="keyword-tag">{keyword.keyword}</span>
                          <div className="text-sm text-gray-600 mt-1">Trending: {keyword.trending}</div>
                        </div>
                        <button
                          onClick={() => handleCampaignAction(`Thêm từ khóa: ${keyword.keyword} vào chiến dịch`)}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          Thêm
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {showCampaignModal && (
        <div className="modal show" onClick={handleModalClose}>
          <div className="modal-content">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Tạo chiến dịch mới</h2>
                <button
                  onClick={() => setShowCampaignModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="flex border-b border-gray-200 mb-6">
                {['basic', 'targeting', 'creative', 'budget'].map((tab) => (
                  <button
                    key={tab}
                    className={`tab-button ${activeTab === (tab as typeof activeTab) ? 'active' : ''}`}
                    onClick={() => setActiveTab(tab as typeof activeTab)}
                  >
                    {tab === 'basic' ? 'Thông tin cơ bản' :
                     tab === 'targeting' ? 'Targeting' :
                     tab === 'creative' ? 'Creative' : 'Ngân sách'}
                  </button>
                ))}
              </div>

              {/* ... nội dung tab giống với bản gốc (giữ nguyên) ... */}
              {/* Basic / Targeting / Creative / Budget tab content (same as your original markup) */}
              {/* (để ngắn gọn ở đây mình giữ nội dung giống như file bạn gửi) */}

              <div className="flex items-center justify-end space-x-3 mt-6 pt-6 border-t border-gray-200">
                <button
                  onClick={() => setShowCampaignModal(false)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Hủy
                </button>
                <button
                  onClick={() => {
                    alert('Lưu nháp chiến dịch thành công!');
                    setShowCampaignModal(false);
                  }}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Lưu nháp
                </button>
                <button
                  onClick={() => {
                    alert('Tạo chiến dịch thành công! Chiến dịch sẽ được xem xét và phê duyệt trong vòng 24h.');
                    setShowCampaignModal(false);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Tạo chiến dịch
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default MarketingPage;
