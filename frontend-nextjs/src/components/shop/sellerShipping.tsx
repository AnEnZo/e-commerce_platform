import React, { JSX, useEffect, useRef, useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import '../css/sellerShipping.css';
import Chart from 'chart.js/auto';
import Sidebar from '@/components/shop/Sidebar';

export default function ShippingPage(): JSX.Element {
  const shippingCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const performanceCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const shippingChartRef = useRef<Chart | null>(null);
  const performanceChartRef = useRef<Chart | null>(null);

  const [trackingModalOpen, setTrackingModalOpen] = useState(false);
  const [trackingOrderId, setTrackingOrderId] = useState<string | null>(null);
  const [chartPeriod, setChartPeriod] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [selectedShippingMethod, setSelectedShippingMethod] = useState<'standard' | 'fast' | 'express'>('standard');

  useEffect(() => {
    // Initialize charts once
    if (shippingCanvasRef.current && !shippingChartRef.current) {
      const ctx = shippingCanvasRef.current.getContext('2d');
      if (ctx) {
        shippingChartRef.current = new Chart(ctx, {
          type: 'line',
          data: {
            labels: ['6:00', '9:00', '12:00', '15:00', '18:00', '21:00'],
            datasets: [
              {
                label: 'Đơn hàng được giao',
                data: [12, 28, 45, 67, 89, 94],
                borderColor: '#ee4d2d',
                backgroundColor: 'rgba(238, 77, 45, 0.1)',
                tension: 0.4,
                fill: true,
              },
              {
                label: 'Đơn hàng mới',
                data: [8, 15, 32, 48, 62, 71],
                borderColor: '#3b82f6',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                tension: 0.4,
              },
            ],
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
                beginAtZero: true,
                title: {
                  display: true,
                  text: 'Số lượng đơn hàng',
                },
              },
            },
          },
        });
      }
    }

    if (performanceCanvasRef.current && !performanceChartRef.current) {
      const ctx = performanceCanvasRef.current.getContext('2d');
      if (ctx) {
        performanceChartRef.current = new Chart(ctx, {
          type: 'doughnut',
          data: {
            labels: ['Đã giao', 'Đang giao', 'Chờ xử lý', 'Hoàn trả'],
            datasets: [
              {
                data: [847, 247, 89, 23],
                backgroundColor: ['#10b981', '#8b5cf6', '#f59e0b', '#ef4444'],
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: 'bottom',
              },
            },
          },
        });
      }
    }

    return () => {
      // cleanup charts
      if (shippingChartRef.current) {
        shippingChartRef.current.destroy();
        shippingChartRef.current = null;
      }
      if (performanceChartRef.current) {
        performanceChartRef.current.destroy();
        performanceChartRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    // simulate periodic status updates (cleanup on unmount)
    const id = setInterval(() => {
      // place to poll or receive websocket updates
      // console.log('Updating shipping status...');
    }, 30000);
    return () => clearInterval(id);
  }, []);

  // Handlers
  function openTrackingModal(orderId?: string) {
    setTrackingOrderId(orderId ?? null);
    setTrackingModalOpen(true);
  }

  function closeTrackingModal() {
    setTrackingModalOpen(false);
    setTrackingOrderId(null);
  }

  function processOrder(orderId: string) {
    // TODO: call API to change state
    alert(`Xử lý đơn hàng ${orderId} - Chuyển sang trạng thái \"Đang chuẩn bị\"`);
  }

  function printLabel(orderId: string) {
    alert(`In nhãn vận chuyển cho đơn hàng ${orderId}`);
  }

  function contactCustomer(orderId: string) {
    alert(`Mở chat với khách hàng của đơn hàng ${orderId}`);
  }

  function assignShipper(orderId: string) {
    alert(`Gán shipper cho đơn hàng ${orderId}`);
  }

  function trackOrder(orderId: string) {
    openTrackingModal(orderId);
  }

  function trackRealtime(orderId: string) {
    openTrackingModal(orderId);
  }

  function contactShipper(orderId: string) {
    alert(`Liên hệ với shipper đang giao đơn hàng ${orderId}`);
  }

  function updateStatus(orderId: string) {
    alert(`Cập nhật trạng thái cho đơn hàng ${orderId}`);
  }

  function viewDeliveryProof(orderId: string) {
    alert(`Xem bằng chứng giao hàng cho đơn hàng ${orderId}`);
  }

  function requestFeedback(orderId: string) {
    alert(`Gửi yêu cầu đánh giá cho đơn hàng ${orderId}`);
  }

  function bulkPrintLabels() {
    alert('In nhãn hàng loạt cho 24 đơn hàng chờ xử lý');
  }

  function schedulePickup() {
    alert('Đặt lịch lấy hàng với đối tác vận chuyển');
  }

  function updateBulkStatus() {
    alert('Cập nhật trạng thái hàng loạt cho nhiều đơn hàng');
  }

  function manageReturns() {
    alert('Mở trang quản lý đơn hàng hoàn trả');
  }

  function openShippingCalculator() {
    alert('Mở công cụ tính phí vận chuyển chi tiết');
  }

  function optimizeRoutes() {
    alert('Chạy thuật toán tối ưu hóa tuyến đường giao hàng');
  }

  function exportShippingReport() {
    alert('Xuất báo cáo vận chuyển chi tiết');
  }

  function calculateShipping() {
    alert('Tính toán phí vận chuyển dựa trên thông tin đã nhập');
  }

  function viewRouteDetails() {
    alert('Xem chi tiết tuyến đường và phân tích tối ưu hóa');
  }

  function managePartners() {
    alert('Quản lý đối tác vận chuyển và đánh giá hiệu suất');
  }

  function viewDetailedPerformance() {
    alert('Xem phân tích hiệu suất giao hàng chi tiết');
  }

  function changeShippingChart(period: 'daily' | 'weekly' | 'monthly') {
    setChartPeriod(period);
    // Update chart data here if needed (call API or recompute)
  }

  function filterByLocation() {
    alert('Lọc đơn hàng theo khu vực giao hàng');
  }

  function loadMoreOrders() {
    alert('Tải thêm đơn hàng vận chuyển...');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="flex">
        {/* Sidebar */}
        <Sidebar activeKey="shipping" />

        {/* Main Content */}
        <main className="flex-1 p-6">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Quản lý Vận chuyển</h1>
              <p className="text-gray-600">Theo dõi đơn hàng, tối ưu hóa logistics và quản lý đối tác vận chuyển</p>
            </div>
            <div className="flex items-center space-x-3">
              <button onClick={openShippingCalculator} className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center space-x-2">
                <span>🧮</span>
                <span>Tính phí ship</span>
              </button>
              <button onClick={optimizeRoutes} className="bg-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-purple-700 transition-colors flex items-center space-x-2">
                <span>🗺️</span>
                <span>Tối ưu tuyến</span>
              </button>
              <button onClick={exportShippingReport} className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center space-x-2">
                <span>📊</span>
                <span>Báo cáo</span>
              </button>
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="performance-metric bg-white p-4 rounded-lg shadow-sm">
              <div className="metric-value text-blue-600 text-2xl font-bold">247</div>
              <div className="text-gray-600 mb-2">Đơn đang giao</div>
              <div className="metric-trend trend-up text-sm text-green-600">↗ +12% so với hôm qua</div>
            </div>

            <div className="performance-metric bg-white p-4 rounded-lg shadow-sm">
              <div className="metric-value text-green-600 text-2xl font-bold">94.2%</div>
              <div className="text-gray-600 mb-2">Tỷ lệ giao thành công</div>
              <div className="metric-trend trend-up text-sm text-green-600">↗ +2.1% so với tuần trước</div>
            </div>

            <div className="performance-metric bg-white p-4 rounded-lg shadow-sm">
              <div className="metric-value text-orange-600 text-2xl font-bold">2.3h</div>
              <div className="text-gray-600 mb-2">Thời gian xử lý TB</div>
              <div className="metric-trend trend-down text-sm text-red-600">↘ -0.5h so với tháng trước</div>
            </div>

            <div className="performance-metric bg-white p-4 rounded-lg shadow-sm">
              <div className="metric-value text-purple-600 text-2xl font-bold">₫45K</div>
              <div className="text-gray-600 mb-2">Chi phí vận chuyển TB</div>
              <div className="metric-trend trend-neutral text-sm text-gray-600">→ Không đổi</div>
            </div>
          </div>

          {/* Quick Actions & Route Optimization */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">🚀 Thao tác nhanh</h3>
              <div className="space-y-3">
                <button onClick={bulkPrintLabels} className="w-full text-left p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="font-medium text-sm">In nhãn hàng loạt</div>
                  <div className="text-xs text-gray-600">In nhãn cho 24 đơn hàng chờ xử lý</div>
                </button>
                <button onClick={schedulePickup} className="w-full text-left p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="font-medium text-sm">Đặt lịch lấy hàng</div>
                  <div className="text-xs text-gray-600">Lên lịch với đối tác vận chuyển</div>
                </button>
                <button onClick={updateBulkStatus} className="w-full text-left p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="font-medium text-sm">Cập nhật trạng thái</div>
                  <div className="text-xs text-gray-600">Cập nhật hàng loạt cho nhiều đơn</div>
                </button>
                <button onClick={manageReturns} className="w-full text-left p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="font-medium text-sm">Xử lý hoàn trả</div>
                  <div className="text-xs text-gray-600">3 đơn hàng cần xử lý hoàn trả</div>
                </button>
              </div>
            </div>

            <div className="route-optimization bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-xl font-semibold mb-3">🗺️ Tối ưu hóa tuyến đường</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm opacity-90">Tuyến Hà Nội - HCM</span>
                  <span className="delivery-vehicle">🚛</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm opacity-90">Tiết kiệm được</span>
                  <span className="font-bold">₫2.3M/tháng</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm opacity-90">Giảm thời gian</span>
                  <span className="font-bold">15%</span>
                </div>
              </div>
              <button onClick={viewRouteDetails} className="mt-4 bg-white bg-opacity-20 text-black px-4 py-2 rounded-lg text-sm font-medium hover:bg-opacity-30 w-full">
                Xem chi tiết tuyến đường
              </button>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">🤝 Đối tác vận chuyển</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="partner-logo">🚚</div>
                    <div>
                      <div className="font-medium text-sm">Giao Hàng Nhanh</div>
                      <div className="text-xs text-gray-600">Hoạt động</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-green-600">98.5%</div>
                    <div className="text-xs text-gray-500">Thành công</div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="partner-logo">📦</div>
                    <div>
                      <div className="font-medium text-sm">Viettel Post</div>
                      <div className="text-xs text-gray-600">Hoạt động</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-green-600">96.2%</div>
                    <div className="text-xs text-gray-500">Thành công</div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="partner-logo">🛵</div>
                    <div>
                      <div className="font-medium text-sm">Grab Express</div>
                      <div className="text-xs text-gray-600">Hoạt động</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-blue-600">94.8%</div>
                    <div className="text-xs text-gray-500">Thành công</div>
                  </div>
                </div>

                <button onClick={managePartners} className="w-full mt-3 text-center py-2 text-blue-600 hover:text-blue-800 text-sm font-medium">
                  Quản lý đối tác
                </button>
              </div>
            </div>
          </div>

          {/* Shipping Analytics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-sm" style={{ minHeight: 300 }}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">📈 Thống kê vận chuyển</h3>
                <div className="flex items-center space-x-2">
                  <button className={`filter-btn text-sm px-2 py-1 rounded ${chartPeriod === 'daily' ? 'bg-gray-200' : ''}`} onClick={() => changeShippingChart('daily')}>Hôm nay</button>
                  <button className={`filter-btn text-sm px-2 py-1 rounded ${chartPeriod === 'weekly' ? 'bg-gray-200' : ''}`} onClick={() => changeShippingChart('weekly')}>7 ngày</button>
                  <button className={`filter-btn text-sm px-2 py-1 rounded ${chartPeriod === 'monthly' ? 'bg-gray-200' : ''}`} onClick={() => changeShippingChart('monthly')}>30 ngày</button>
                </div>
              </div>
              <div className="chart-container h-56">
                <canvas ref={shippingCanvasRef} id="shippingChart" />
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm" style={{ minHeight: 300 }}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">🎯 Hiệu suất giao hàng</h3>
                <button onClick={viewDetailedPerformance} className="text-blue-600 hover:text-blue-800 text-sm font-medium">Chi tiết</button>
              </div>
              <div className="chart-container h-56">
                <canvas ref={performanceCanvasRef} id="performanceChart" />
              </div>
            </div>
          </div>

          {/* Order Management (kept mostly static as markup) */}
          <div className="bg-white rounded-lg shadow-sm mb-8">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">📦 Quản lý đơn hàng vận chuyển</h3>
                <div className="flex items-center space-x-3">
                  <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm">
                    <option>Tất cả trạng thái</option>
                    <option>Chờ xử lý</option>
                    <option>Đang chuẩn bị</option>
                    <option>Đang giao</option>
                    <option>Đã giao</option>
                    <option>Hoàn trả</option>
                  </select>
                  <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm">
                    <option>Tất cả đối tác</option>
                    <option>Giao Hàng Nhanh</option>
                    <option>Viettel Post</option>
                    <option>Grab Express</option>
                  </select>
                  <button onClick={filterByLocation} className="text-blue-600 hover:text-blue-800 text-sm font-medium">Lọc theo khu vực</button>
                </div>
              </div>
            </div>

            <div className="p-6">
              {/* Priority Orders - sample two cards */}
              <div className="mb-6">
                <h4 className="font-medium text-gray-900 mb-3">🚨 Đơn hàng ưu tiên</h4>
                <div className="space-y-4">
                  <div className="order-card priority-high bg-white p-4 rounded-lg shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <span className="font-medium text-gray-900">#SP2024001247</span>
                        <span className="bg-red-100 text-red-800 px-2 py-1 text-xs font-medium rounded-full">Khẩn cấp</span>
                        <span className="bg-yellow-100 text-yellow-800 px-2 py-1 text-xs font-medium rounded-full">Chờ xử lý</span>
                      </div>
                      <span className="text-sm text-gray-500">2 giờ trước</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <div className="text-sm text-gray-600">Khách hàng</div>
                        <div className="font-medium">Nguyễn Văn A</div>
                        <div className="text-sm text-gray-500">📱 0901234567</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">Địa chỉ giao hàng</div>
                        <div className="font-medium">123 Trần Hưng Đạo</div>
                        <div className="text-sm text-gray-500">Quận 1, TP.HCM</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">Sản phẩm</div>
                        <div className="font-medium">iPhone 15 Pro Max</div>
                        <div className="text-sm text-gray-500">₫32,990,000</div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <button onClick={() => processOrder('SP2024001247')} className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700">Xử lý ngay</button>
                        <button onClick={() => printLabel('SP2024001247')} className="bg-gray-600 text-white px-3 py-1 rounded text-sm hover:bg-gray-700">In nhãn</button>
                        <button onClick={() => contactCustomer('SP2024001247')} className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700">Liên hệ</button>
                      </div>
                      <div className="text-sm text-gray-600">
                        Hạn giao: <span className="font-medium text-red-600">Hôm nay 18:00</span>
                      </div>
                    </div>
                  </div>

                  <div className="order-card priority-medium bg-white p-4 rounded-lg shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <span className="font-medium text-gray-900">#SP2024001248</span>
                        <span className="bg-orange-100 text-orange-800 px-2 py-1 text-xs font-medium rounded-full">Quan trọng</span>
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 text-xs font-medium rounded-full">Đang chuẩn bị</span>
                      </div>
                      <span className="text-sm text-gray-500">4 giờ trước</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <div className="text-sm text-gray-600">Khách hàng</div>
                        <div className="font-medium">Trần Thị B</div>
                        <div className="text-sm text-gray-500">📱 0987654321</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">Địa chỉ giao hàng</div>
                        <div className="font-medium">456 Nguyễn Huệ</div>
                        <div className="text-sm text-gray-500">Quận 1, TP.HCM</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">Sản phẩm</div>
                        <div className="font-medium">MacBook Pro M3</div>
                        <div className="text-sm text-gray-500">₫52,990,000</div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <button onClick={() => assignShipper('SP2024001248')} className="bg-purple-600 text-white px-3 py-1 rounded text-sm hover:bg-purple-700">Gán shipper</button>
                        <button onClick={() => trackOrder('SP2024001248')} className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700">Theo dõi</button>
                        <button onClick={() => updateStatus('SP2024001248')} className="bg-gray-600 text-white px-3 py-1 rounded text-sm hover:bg-gray-700">Cập nhật</button>
                      </div>
                      <div className="text-sm text-gray-600">
                        Hạn giao: <span className="font-medium text-orange-600">Mai 16:00</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Regular Orders */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">📋 Đơn hàng thường</h4>
                <div className="space-y-4">
                  <div className="order-card priority-low bg-white p-4 rounded-lg shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <span className="font-medium text-gray-900">#SP2024001249</span>
                        <span className="bg-green-100 text-green-800 px-2 py-1 text-xs font-medium rounded-full">Thường</span>
                        <span className="bg-purple-100 text-purple-800 px-2 py-1 text-xs font-medium rounded-full">Đang giao</span>
                      </div>
                      <span className="text-sm text-gray-500">1 ngày trước</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <div className="text-sm text-gray-600">Khách hàng</div>
                        <div className="font-medium">Lê Văn C</div>
                        <div className="text-sm text-gray-500">📱 0912345678</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">Địa chỉ</div>
                        <div className="font-medium">789 Lê Lợi</div>
                        <div className="text-sm text-gray-500">Quận 3, TP.HCM</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">Sản phẩm</div>
                        <div className="font-medium">AirPods Pro Gen 2</div>
                        <div className="text-sm text-gray-500">₫6,990,000</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">Shipper</div>
                        <div className="font-medium">Nguyễn Shipper</div>
                        <div className="text-sm text-gray-500">🚚 Giao Hàng Nhanh</div>
                      </div>
                    </div>

                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">Tiến độ giao hàng</span>
                        <span className="text-sm text-gray-600">75%</span>
                      </div>
                      <div className="progress-bar bg-gray-200 h-2 rounded-full overflow-hidden">
                        <div className="progress-fill h-2 rounded-full" style={{ width: '75%', backgroundColor: '#3b82f6' }} />
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <button onClick={() => trackRealtime('SP2024001249')} className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700">Theo dõi realtime</button>
                        <button onClick={() => contactShipper('SP2024001249')} className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700">Liên hệ shipper</button>
                      </div>
                      <div className="text-sm text-gray-600">
                        Dự kiến: <span className="font-medium text-green-600">Hôm nay 20:00</span>
                      </div>
                    </div>
                  </div>

                  <div className="order-card bg-white p-4 rounded-lg shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <span className="font-medium text-gray-900">#SP2024001250</span>
                        <span className="bg-green-100 text-green-800 px-2 py-1 text-xs font-medium rounded-full">Thường</span>
                        <span className="bg-green-100 text-green-800 px-2 py-1 text-xs font-medium rounded-full">Đã giao</span>
                      </div>
                      <span className="text-sm text-gray-500">2 ngày trước</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <div className="text-sm text-gray-600">Khách hàng</div>
                        <div className="font-medium">Phạm Thị D</div>
                        <div className="text-sm text-gray-500">📱 0923456789</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">Địa chỉ</div>
                        <div className="font-medium">321 Pasteur</div>
                        <div className="text-sm text-gray-500">Quận 3, TP.HCM</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">Sản phẩm</div>
                        <div className="font-medium">iPhone 15 128GB</div>
                        <div className="text-sm text-gray-500">₫22,990,000</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">Đã giao</div>
                        <div className="font-medium">✅ Thành công</div>
                        <div className="text-sm text-gray-500">Hôm qua 15:30</div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <button onClick={() => viewDeliveryProof('SP2024001250')} className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700">Xem bằng chứng</button>
                        <button onClick={() => requestFeedback('SP2024001250')} className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700">Yêu cầu đánh giá</button>
                      </div>
                      <div className="text-sm text-green-600 font-medium">⭐ Giao thành công</div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-center mt-6">
                  <button onClick={loadMoreOrders} className="bg-gray-100 text-gray-700 px-6 py-2 rounded-lg font-medium hover:bg-gray-200">Xem thêm đơn hàng</button>
                </div>
              </div>
            </div>
          </div>

          {/* Warehouse & Inventory */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">🏪 Trạng thái kho hàng</h3>
              <div className="space-y-4">
                <div className="warehouse-card bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-bold">HN</span>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">Kho Hà Nội</h4>
                        <p className="text-sm text-gray-500">Khu vực Miền Bắc</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-green-600">Hoạt động</div>
                      <div className="text-xs text-gray-500">24/7</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Tồn kho:</span>
                      <span className="font-medium ml-1">1,247 sản phẩm</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Chờ xuất:</span>
                      <span className="font-medium ml-1">89 đơn</span>
                    </div>
                  </div>
                </div>

                {/* other warehouses omitted for brevity */}
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">🧮 Tính phí vận chuyển</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Từ</label>
                    <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
                      <option>TP.HCM</option>
                      <option>Hà Nội</option>
                      <option>Đà Nẵng</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Đến</label>
                    <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
                      <option>Chọn tỉnh/thành</option>
                      <option>TP.HCM</option>
                      <option>Hà Nội</option>
                      <option>Đà Nẵng</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Khối lượng (kg)</label>
                    <input type="number" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="0.5" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Giá trị (₫)</label>
                    <input type="number" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="1000000" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phương thức vận chuyển</label>
                  <div className="space-y-2">
                    <div className={`shipping-method p-3 rounded-lg border ${selectedShippingMethod === 'standard' ? 'border-orange-400 bg-orange-50' : 'border-gray-200'}`} onClick={() => setSelectedShippingMethod('standard')}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <input type="radio" name="shipping" checked={selectedShippingMethod === 'standard'} readOnly />
                          <div>
                            <div className="font-medium text-sm">Giao hàng tiêu chuẩn</div>
                            <div className="text-xs text-gray-600">3-5 ngày làm việc</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-orange-600">₫25,000</div>
                        </div>
                      </div>
                    </div>

                    <div className={`shipping-method p-3 rounded-lg border ${selectedShippingMethod === 'fast' ? 'border-orange-400 bg-orange-50' : 'border-gray-200'}`} onClick={() => setSelectedShippingMethod('fast')}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <input type="radio" name="shipping" checked={selectedShippingMethod === 'fast'} readOnly />
                          <div>
                            <div className="font-medium text-sm">Giao hàng nhanh</div>
                            <div className="text-xs text-gray-600">1-2 ngày làm việc</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-blue-600">₫45,000</div>
                        </div>
                      </div>
                    </div>

                    <div className={`shipping-method p-3 rounded-lg border ${selectedShippingMethod === 'express' ? 'border-orange-400 bg-orange-50' : 'border-gray-200'}`} onClick={() => setSelectedShippingMethod('express')}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <input type="radio" name="shipping" checked={selectedShippingMethod === 'express'} readOnly />
                          <div>
                            <div className="font-medium text-sm">Giao hàng hỏa tốc</div>
                            <div className="text-xs text-gray-600">Trong ngày</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-purple-600">₫85,000</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <button onClick={calculateShipping} className="w-full bg-orange-600 text-white py-2 rounded-lg font-medium hover:bg-orange-700">Tính phí vận chuyển</button>
              </div>
            </div>
          </div>

        </main>
      </div>

      <Footer />

      {/* Tracking Modal (React controlled) */}
      {trackingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="modal-content bg-white rounded-lg w-11/12 md:w-2/3 lg:w-1/2">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Theo dõi đơn hàng {trackingOrderId}</h2>
              <button onClick={closeTrackingModal} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>

            <div className="p-6">
              <div className="route-map mb-6">
                <h3 className="text-lg font-semibold mb-3">🗺️ Vị trí hiện tại</h3>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="font-medium">Shipper: Nguyễn Văn Shipper</div>
                    <div className="text-sm opacity-90">📱 0901234567</div>
                  </div>
                  <div className="delivery-vehicle">🚛</div>
                </div>
                <div className="text-sm opacity-90">Đang di chuyển từ Quận 1 đến Quận 3, TP.HCM</div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900">📋 Lịch sử vận chuyển</h3>

                <div className="tracking-step active flex items-start">
                  <div className="tracking-dot w-3 h-3 rounded-full bg-blue-600 mt-1" />
                  <div className="ml-6">
                    <div className="font-medium text-gray-900">Đang giao hàng</div>
                    <div className="text-sm text-gray-600">Shipper đang trên đường giao hàng</div>
                    <div className="text-xs text-gray-500">Hôm nay, 16:30</div>
                  </div>
                </div>

                {/* other steps... */}

                <div className="mt-6 flex items-center justify-end space-x-3">
                  <button onClick={() => contactShipper(trackingOrderId ?? '')} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">Liên hệ shipper</button>
                  <button onClick={closeTrackingModal} className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50">Đóng</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
