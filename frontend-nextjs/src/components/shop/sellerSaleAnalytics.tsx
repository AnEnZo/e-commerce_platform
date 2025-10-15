import React, { useState, useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import '../css/sellerSaleAnalytics.css';
import Sidebar from '@/components/shop/Sidebar';

import type {
  MetricData,
  ProductData,
  CustomerSegment,
  ConversionStep,
  InsightItem,
  ChartPeriod
} from '@/types/shop/SaleAnalyticstypes';

const SalesAnalytics: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState<'daily' | 'weekly' | 'monthly'>('daily');

  // Chart refs
  const salesTrendRef = useRef<HTMLCanvasElement>(null);
  const orderStatusRef = useRef<HTMLCanvasElement>(null);
  const trafficRef = useRef<HTMLCanvasElement>(null);

  // Chart instances
  const salesTrendChart = useRef<Chart | null>(null);
  const orderStatusChart = useRef<Chart | null>(null);
  const trafficChart = useRef<Chart | null>(null);

  // Data
  const metricsData: MetricData[] = [
    {
      icon: '📊',
      title: 'Tổng doanh thu',
      value: '₫2.45M',
      change: 'So với tháng trước',
      trend: 'up',
      changeValue: '+15.2%'
    },
    {
      icon: '🛒',
      title: 'Đơn hàng',
      value: '1,234',
      change: 'So với tháng trước',
      trend: 'up',
      changeValue: '+8.7%'
    },
    {
      icon: '💰',
      title: 'Giá trị TB/Đơn',
      value: '₫1.98M',
      change: 'So với tháng trước',
      trend: 'up',
      changeValue: '+5.9%'
    },
    {
      icon: '👥',
      title: 'Khách hàng mới',
      value: '456',
      change: 'So với tháng trước',
      trend: 'up',
      changeValue: '+22.1%'
    },
    {
      icon: '🔄',
      title: 'Tỷ lệ quay lại',
      value: '34.5%',
      change: 'So với tháng trước',
      trend: 'down',
      changeValue: '-2.3%'
    },
    {
      icon: '⭐',
      title: 'Đánh giá TB',
      value: '4.8/5',
      change: 'So với tháng trước',
      trend: 'up',
      changeValue: '+0.2'
    }
  ];

  const insightsData: InsightItem[] = [
    {
      type: 'excellent',
      title: 'Hiệu suất tuyệt vời',
      description: 'Doanh thu tăng 15.2% so với tháng trước, vượt mục tiêu 12%'
    },
    {
      type: 'warning',
      title: 'Cần chú ý',
      description: 'Tỷ lệ khách hàng quay lại giảm 2.3%. Khuyến nghị tăng cường chương trình loyalty'
    },
    {
      type: 'good',
      title: 'Cơ hội tăng trưởng',
      description: 'iPhone 15 Pro Max có xu hướng tăng mạnh. Nên tăng inventory và marketing'
    }
  ];

  const productsData: ProductData[] = [
    {
      icon: '📱',
      name: 'iPhone 15 Pro Max',
      variant: '256GB Titan Tự Nhiên',
      revenue: '₫519.8M',
      orders: '20 đơn hàng',
      sold: 20,
      soldChange: '+15% so với tháng trước',
      conversionRate: '12.5%',
      conversionChange: '+2.1%',
      rating: 4.9,
      reviewCount: 45,
      trend: 'up',
      trendLabel: 'Tăng mạnh',
      performance: 'excellent',
      performanceLabel: 'Xuất sắc'
    },
    {
      icon: '💻',
      name: 'MacBook Pro M3',
      variant: '14-inch 512GB',
      revenue: '₫459.8M',
      orders: '12 đơn hàng',
      sold: 12,
      soldChange: '+8% so với tháng trước',
      conversionRate: '8.7%',
      conversionChange: '+1.2%',
      rating: 4.8,
      reviewCount: 28,
      trend: 'up',
      trendLabel: 'Tăng',
      performance: 'good',
      performanceLabel: 'Tốt'
    },
    {
      icon: '🎧',
      name: 'AirPods Pro',
      variant: 'Gen 2 USB-C',
      revenue: '₫179.4M',
      orders: '30 đơn hàng',
      sold: 30,
      soldChange: '+25% so với tháng trước',
      conversionRate: '15.2%',
      conversionChange: '+3.1%',
      rating: 4.7,
      reviewCount: 67,
      trend: 'up',
      trendLabel: 'Tăng mạnh',
      performance: 'excellent',
      performanceLabel: 'Xuất sắc'
    },
    {
      icon: '⌚',
      name: 'Apple Watch Series 9',
      variant: '45mm GPS',
      revenue: '₫134.9M',
      orders: '15 đơn hàng',
      sold: 15,
      soldChange: '-5% so với tháng trước',
      conversionRate: '6.8%',
      conversionChange: '-1.2%',
      rating: 4.6,
      reviewCount: 23,
      trend: 'down',
      trendLabel: 'Giảm',
      performance: 'average',
      performanceLabel: 'Trung bình'
    },
    {
      icon: '📱',
      name: 'iPad Pro M2',
      variant: '11-inch 256GB',
      revenue: '₫113.9M',
      orders: '6 đơn hàng',
      sold: 6,
      soldChange: 'Không đổi',
      conversionRate: '4.2%',
      conversionChange: '0%',
      rating: 4.5,
      reviewCount: 12,
      trend: 'neutral',
      trendLabel: 'Ổn định',
      performance: 'average',
      performanceLabel: 'Trung bình'
    }
  ];

  const customerSegments: CustomerSegment[] = [
    {
      label: 'VIP',
      description: 'Mua >10M/tháng',
      count: 45,
      percentage: '3.6%',
      color: 'green'
    },
    {
      label: 'Thường xuyên',
      description: 'Mua 3-10M/tháng',
      count: 234,
      percentage: '18.9%',
      color: 'blue'
    },
    {
      label: 'Thỉnh thoảng',
      description: 'Mua 1-3M/tháng',
      count: 567,
      percentage: '45.9%',
      color: 'yellow'
    },
    {
      label: 'Mới',
      description: 'Lần đầu mua',
      count: 388,
      percentage: '31.4%',
      color: 'gray'
    }
  ];

  const conversionSteps: ConversionStep[] = [
    {
      label: 'Lượt xem sản phẩm',
      value: 12450,
      width: 100
    },
    {
      label: 'Thêm vào giỏ hàng',
      value: 3680,
      percentage: '29.6%',
      width: 29.6
    },
    {
      label: 'Bắt đầu thanh toán',
      value: 1890,
      percentage: '15.2%',
      width: 15.2
    },
    {
      label: 'Hoàn thành đơn hàng',
      value: 1234,
      percentage: '9.9%',
      width: 9.9
    }
  ];

  const chartPeriods: ChartPeriod[] = [
    { id: 'daily', label: 'Ngày' },
    { id: 'weekly', label: 'Tuần' },
    { id: 'monthly', label: 'Tháng' }
  ];



  const supportItems = [
    { icon: '❓', label: 'Trung tâm hỗ trợ' },
    { icon: '💬', label: 'Chat với hỗ trợ' }
  ];

  useEffect(() => {
    initializeCharts();
    generateHeatmap();

    // Cleanup charts on unmount
    return () => {
      if (salesTrendChart.current) salesTrendChart.current.destroy();
      if (orderStatusChart.current) orderStatusChart.current.destroy();
      if (trafficChart.current) trafficChart.current.destroy();
    };
  }, []);

  const initializeCharts = () => {
    // Sales Trend Chart
    if (salesTrendRef.current) {
      const ctx = salesTrendRef.current.getContext('2d');
      if (ctx) {
        salesTrendChart.current = new Chart(ctx, {
          type: 'line',
          data: {
            labels: ['1/12', '2/12', '3/12', '4/12', '5/12', '6/12', '7/12', '8/12', '9/12', '10/12', '11/12', '12/12', '13/12', '14/12', '15/12'],
            datasets: [{
              label: 'Doanh thu (triệu ₫)',
              data: [120, 150, 180, 140, 200, 250, 300, 280, 320, 290, 350, 380, 420, 390, 450],
              borderColor: '#ee4d2d',
              backgroundColor: 'rgba(238, 77, 45, 0.1)',
              tension: 0.4,
              fill: true
            }, {
              label: 'Số đơn hàng',
              data: [45, 52, 48, 55, 62, 70, 85, 78, 92, 88, 95, 102, 110, 105, 115],
              borderColor: '#3b82f6',
              backgroundColor: 'rgba(59, 130, 246, 0.1)',
              tension: 0.4,
              yAxisID: 'y1'
            }]
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
                  text: 'Doanh thu (triệu ₫)'
                }
              },
              y1: {
                type: 'linear',
                display: true,
                position: 'right',
                title: {
                  display: true,
                  text: 'Số đơn hàng'
                },
                grid: {
                  drawOnChartArea: false,
                },
              }
            }
          }
        });
      }
    }

    // Order Status Chart
    if (orderStatusRef.current) {
      const ctx = orderStatusRef.current.getContext('2d');
      if (ctx) {
        orderStatusChart.current = new Chart(ctx, {
          type: 'doughnut',
          data: {
            labels: ['Hoàn thành', 'Đang giao', 'Đang xử lý', 'Chờ xác nhận', 'Đã hủy'],
            datasets: [{
              data: [65, 20, 8, 5, 2],
              backgroundColor: [
                '#10b981',
                '#3b82f6',
                '#f59e0b',
                '#ef4444',
                '#6b7280'
              ]
            }]
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
        });
      }
    }

    // Traffic Sources Chart
    if (trafficRef.current) {
      const ctx = trafficRef.current.getContext('2d');
      if (ctx) {
        trafficChart.current = new Chart(ctx, {
          type: 'pie',
          data: {
            labels: ['Tìm kiếm tự nhiên', 'Facebook Ads', 'Google Ads', 'Trực tiếp', 'Email', 'Khác'],
            datasets: [{
              data: [35, 25, 15, 12, 8, 5],
              backgroundColor: [
                '#ee4d2d',
                '#1877f2',
                '#4285f4',
                '#10b981',
                '#f59e0b',
                '#6b7280'
              ]
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: 'bottom',
                labels: {
                  boxWidth: 12,
                  font: {
                    size: 11
                  }
                }
              }
            }
          }
        });
      }
    }
  };

  const generateHeatmap = () => {
    const heatmapContainer = document.getElementById('sales-heatmap');
    if (heatmapContainer) {
      const levels = [0, 1, 2, 3, 4, 1, 2, 2, 3, 4, 3, 2, 1, 0, 1, 3, 4, 4, 2, 1, 0, 2, 3, 4, 3, 2, 1, 0, 1, 2, 3, 4, 2, 1, 0];

      heatmapContainer.innerHTML = '';
      levels.forEach(level => {
        const cell = document.createElement('div');
        cell.className = `heatmap-cell heatmap-level-${level}`;
        cell.title = `Doanh số: ${level * 25 + Math.floor(Math.random() * 25)} đơn hàng`;
        heatmapContainer.appendChild(cell);
      });
    }
  };

  const handlePeriodChange = (period: 'daily' | 'weekly' | 'monthly') => {
    setSelectedPeriod(period);
    console.log(`Changing sales chart to ${period} view`);
    // Here you would update the chart data based on period
  };

  const exportAnalytics = () => {
    alert('Xuất báo cáo phân tích bán hàng thành file Excel');
  };

  const scheduleReport = () => {
    alert('Mở cài đặt lên lịch báo cáo tự động');
  };

  const viewOrderDetails = () => {
    alert('Xem chi tiết phân tích trạng thái đơn hàng');
  };

  const viewAllProducts = () => {
    alert('Xem báo cáo chi tiết tất cả sản phẩm');
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return '📈';
      case 'down': return '📉';
      default: return '➡️';
    }
  };

  const getTrendArrow = (trend: string) => {
    switch (trend) {
      case 'up': return '↗';
      case 'down': return '↘';
      default: return '→';
    }
  };

  const getSegmentColorClasses = (color: string) => {
    const colorMap = {
      green: 'bg-green-50 text-green-800',
      blue: 'bg-blue-50 text-blue-800',
      yellow: 'bg-yellow-50 text-yellow-800',
      gray: 'bg-gray-50 text-gray-800'
    };
    return colorMap[color as keyof typeof colorMap] || 'bg-gray-50 text-gray-800';
  };

  const getSegmentTextColor = (color: string) => {
    const colorMap = {
      green: 'text-green-600',
      blue: 'text-blue-600',
      yellow: 'text-yellow-600',
      gray: 'text-gray-600'
    };
    return colorMap[color as keyof typeof colorMap] || 'text-gray-600';
  };

  const getInsightIndicatorClass = (type: string) => {
    const typeMap = {
      excellent: 'kpi-excellent',
      good: 'kpi-good',
      warning: 'kpi-warning',
      danger: 'kpi-danger'
    };
    return typeMap[type as keyof typeof typeMap] || 'kpi-good';
  };

  return (
    <div className="shopee-bg min-h-screen">
      <Header />

      <div className="flex">
        {/* Sidebar */}
        <Sidebar activeKey="saleanalytics" />

        {/* Main Content */}
        <main className="flex-1 p-6">
          {/* Page Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Phân tích bán hàng</h1>
              <p className="text-gray-600">Insights và báo cáo chi tiết về hiệu quả kinh doanh</p>
            </div>
            <div className="flex items-center space-x-3">
              <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm">
                <option>30 ngày qua</option>
                <option>7 ngày qua</option>
                <option>3 tháng qua</option>
                <option>6 tháng qua</option>
                <option>1 năm qua</option>
              </select>
              <button
                onClick={exportAnalytics}
                className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center space-x-2"
              >
                <span>📊</span>
                <span>Xuất báo cáo</span>
              </button>
              <button
                onClick={scheduleReport}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <span>⏰</span>
                <span>Lên lịch</span>
              </button>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {metricsData.map((metric, index) => (
              <div key={index} className={`metric-card-${index + 1} text-white p-6 rounded-lg card-shadow`}>
                <div className="flex items-center justify-between mb-4">
                  <div className="text-3xl">{metric.icon}</div>
                  <div className="text-right">
                    <div className="text-sm opacity-90">{metric.title}</div>
                    <div className="text-2xl font-bold">{metric.value}</div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm opacity-90">{metric.change}</span>
                  <div className="flex items-center space-x-1">
                    <span className={`comparison-arrow trend-${metric.trend}`}>
                      {getTrendArrow(metric.trend)}
                    </span>
                    <span className="text-sm font-medium">{metric.changeValue}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* AI Insights */}
          <div className="insight-card p-6 rounded-lg card-shadow mb-8">
            <div className="flex items-start space-x-4">
              <div className="text-3xl">🤖</div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">AI Insights & Khuyến nghị</h3>
                <div className="space-y-3">
                  {insightsData.map((insight, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className={`kpi-indicator ${getInsightIndicatorClass(insight.type)}`}></div>
                      <div>
                        <div className="font-medium text-gray-900">{insight.title}</div>
                        <div className="text-sm text-gray-600">{insight.description}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Sales Trend */}
            <div className="bg-white p-6 rounded-lg card-shadow">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Xu hướng doanh thu</h3>
                <div className="flex items-center space-x-2">
                  {chartPeriods.map((period) => (
                    <button
                      key={period.id}
                      className={`filter-btn ${selectedPeriod === period.id ? 'active' : ''}`}
                      onClick={() => handlePeriodChange(period.id)}
                    >
                      {period.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="chart-container">
                <canvas ref={salesTrendRef}></canvas>
              </div>
            </div>

            {/* Order Status */}
            <div className="bg-white p-6 rounded-lg card-shadow">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Phân bổ trạng thái đơn hàng</h3>
                <button
                  onClick={viewOrderDetails}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  Chi tiết
                </button>
              </div>
              <div className="chart-container">
                <canvas ref={orderStatusRef}></canvas>
              </div>
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Conversion Funnel */}
            <div className="bg-white p-6 rounded-lg card-shadow">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Phễu chuyển đổi</h3>
              <div className="space-y-4">
                {conversionSteps.map((step, index) => (
                  <div key={index}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-600">{step.label}</span>
                      <span className="text-sm font-medium">
                        {step.value.toLocaleString()}{step.percentage && ` (${step.percentage})`}
                      </span>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{width: `${step.width}%`}}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Traffic Sources */}
            <div className="bg-white p-6 rounded-lg card-shadow">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Nguồn traffic</h3>
              <div className="small-chart-container">
                <canvas ref={trafficRef}></canvas>
              </div>
            </div>

            {/* Customer Segments */}
            <div className="bg-white p-6 rounded-lg card-shadow">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Phân khúc khách hàng</h3>
              <div className="space-y-4">
                {customerSegments.map((segment, index) => (
                  <div key={index} className={`flex items-center justify-between p-3 rounded-lg ${getSegmentColorClasses(segment.color)}`}>
                    <div>
                      <div className="font-medium">{segment.label}</div>
                      <div className={`text-sm ${getSegmentTextColor(segment.color)}`}>{segment.description}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">{segment.count}</div>
                      <div className={`text-sm ${getSegmentTextColor(segment.color)}`}>{segment.percentage}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Top Products */}
          <div className="bg-white rounded-lg card-shadow mb-8">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Sản phẩm bán chạy</h3>
                <div className="flex items-center space-x-3">
                  <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm">
                    <option>Theo doanh thu</option>
                    <option>Theo số lượng</option>
                    <option>Theo lợi nhuận</option>
                  </select>
                  <button
                    onClick={viewAllProducts}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    Xem tất cả
                  </button>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="table-header">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Sản phẩm
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Doanh thu
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Đã bán
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tỷ lệ chuyển đổi
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Đánh giá
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Xu hướng
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Hiệu suất
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {productsData.map((product, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="product-image">{product.icon}</div>
                          <div>
                            <div className="font-medium text-gray-900">{product.name}</div>
                            <div className="text-sm text-gray-500">{product.variant}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{product.revenue}</div>
                        <div className="text-sm text-gray-500">{product.orders}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{product.sold}</div>
                        <div className={`text-sm ${product.soldChange.includes('+') ? 'text-gray-500' : product.soldChange.includes('-') ? 'text-red-500' : 'text-gray-500'}`}>
                          {product.soldChange}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{product.conversionRate}</div>
                        <div className={`text-sm ${product.conversionChange.includes('+') ? 'text-green-600' : product.conversionChange.includes('-') ? 'text-red-600' : 'text-gray-500'}`}>
                          {product.conversionChange}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-1">
                          <span className="text-yellow-400">⭐</span>
                          <span className="font-medium">{product.rating}</span>
                          <span className="text-sm text-gray-500">({product.reviewCount})</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className={`flex items-center space-x-1 trend-${product.trend}`}>
                          <span>{getTrendIcon(product.trend)}</span>
                          <span className="text-sm font-medium">{product.trendLabel}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`performance-${product.performance} px-2 py-1 text-xs font-medium rounded-full`}>
                          {product.performanceLabel}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Sales Heatmap */}
          <div className="bg-white p-6 rounded-lg card-shadow">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Bản đồ nhiệt bán hàng</h3>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <span>Ít</span>
                  <div className="heatmap-cell heatmap-level-0"></div>
                  <div className="heatmap-cell heatmap-level-1"></div>
                  <div className="heatmap-cell heatmap-level-2"></div>
                  <div className="heatmap-cell heatmap-level-3"></div>
                  <div className="heatmap-cell heatmap-level-4"></div>
                  <span>Nhiều</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-1 mb-4">
              <div className="text-xs text-gray-500 text-center">CN</div>
              <div className="text-xs text-gray-500 text-center">T2</div>
              <div className="text-xs text-gray-500 text-center">T3</div>
              <div className="text-xs text-gray-500 text-center">T4</div>
              <div className="text-xs text-gray-500 text-center">T5</div>
              <div className="text-xs text-gray-500 text-center">T6</div>
              <div className="text-xs text-gray-500 text-center">T7</div>
            </div>

            <div className="grid grid-cols-7 gap-1" id="sales-heatmap">
              {/* Heatmap cells will be generated by JavaScript */}
            </div>

            <div className="mt-4 text-sm text-gray-600">
              <strong>Insights:</strong> Thứ 6 và Chủ nhật là những ngày có doanh số cao nhất.
              Khuyến nghị tăng cường marketing vào các ngày này.
            </div>
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
};

export default SalesAnalytics;