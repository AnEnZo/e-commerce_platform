'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Sidebar from '@/components/shop/Sidebar';
// Nếu bạn vẫn dùng CSS global UserOrdersPage.css, import nó trong app/layout.tsx:
// import '@/css/UserOrdersPage.css';

type OrderStatus = 'pending' | 'confirmed' | 'shipping' | 'delivered' | 'cancelled' | 'returned';
type TabKey = 'all' | OrderStatus;

interface Order {
  id: string;
  shop: string;
  status: OrderStatus;
  code: string;
  title: string;
  variant?: string;
  price: string;
  originalPrice?: string;
  qty: number;
  orderDate: string;
  total: string;
  trackingCode?: string;
  timeline?: { title: string; time?: string; state?: 'completed' | 'active' }[];
  cancelInfo?: { reason: string; time: string };
}

const SAMPLE_ORDERS: Order[] = [
  {
    id: '1',
    shop: 'TechStore Official',
    status: 'pending',
    code: 'DH240001',
    title: 'iPhone 15 Pro Max 256GB - Titan Tự Nhiên',
    variant: 'Titan Tự Nhiên, 256GB',
    price: '29.990.000₫',
    originalPrice: '32.990.000₫',
    qty: 1,
    orderDate: '15/12/2024 14:30',
    total: '29.990.000₫',
  },
  {
    id: '2',
    shop: 'ElectroMart',
    status: 'shipping',
    code: 'DH239995',
    title: 'MacBook Air M2 13 inch 256GB - Midnight',
    variant: 'Midnight, 256GB, 8GB RAM',
    price: '26.990.000₫',
    originalPrice: '28.990.000₫',
    qty: 1,
    orderDate: '12/12/2024 16:45',
    total: '26.990.000₫',
    trackingCode: 'SPX123456789',
    timeline: [
      { title: 'Đơn hàng đã được lấy', time: '13/12/2024 09:30', state: 'completed' },
      { title: 'Đang vận chuyển đến kho phân loại', time: '13/12/2024 15:20', state: 'completed' },
      { title: 'Đang giao hàng', time: 'Dự kiến: 15/12/2024 trước 18:00', state: 'active' },
    ],
  },
  {
    id: '3',
    shop: 'AudioWorld',
    status: 'delivered',
    code: 'DH239988',
    title: 'AirPods Pro 2nd Generation với MagSafe Case (USB-C)',
    variant: 'Trắng, USB-C',
    price: '5.990.000₫',
    originalPrice: '6.490.000₫',
    qty: 1,
    orderDate: '08/12/2024 10:15',
    total: '5.990.000₫',
  },
  {
    id: '4',
    shop: 'GadgetStore',
    status: 'cancelled',
    code: 'DH239980',
    title: 'Samsung Galaxy S24 Ultra 256GB - Titan Gray',
    variant: 'Titan Gray, 256GB',
    price: '28.990.000₫',
    qty: 1,
    orderDate: '05/12/2024 08:30',
    total: '28.990.000₫',
    cancelInfo: { reason: 'Khách hàng thay đổi ý định mua hàng', time: '05/12/2024 09:15' },
  },
];

type Toast = { id: number; message: string; type?: 'info' | 'success' | 'error' | 'warning' };

const OrdersPage: React.FC = () => {
  const [orders] = useState<Order[]>(SAMPLE_ORDERS);
  const [tab, setTab] = useState<TabKey>('all');
  const [showFilter, setShowFilter] = useState<boolean>(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const toastIdRef = useRef<number>(1);
  const router = useRouter();

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      const target = e.target as Node | null;
      const dropdown = document.querySelector('.filter-dropdown');
      if (dropdown && target && !dropdown.contains(target)) {
        setShowFilter(false);
      }
    }
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  function addToast(message: string, type: Toast['type'] = 'info') {
    const id = toastIdRef.current++;
    setToasts(prev => [...prev, { id, message, type }]);
    // auto remove after 3s
    window.setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000);
  }

  function switchTab(status: TabKey) {
    setTab(status);
  }

  function toggleFilter() {
    setShowFilter(prev => !prev);
  }

  function cancelOrder(orderId: string) {
    if (typeof window !== 'undefined' && window.confirm('Bạn có chắc chắn muốn hủy đơn hàng này?')) {
      addToast(`Đơn hàng ${orderId} đã được hủy thành công!`, 'success');
    }
  }

  function contactShop(orderId: string) {
    addToast('Đang mở chat với shop...', 'info');
  }

  function trackOrder(orderId: string) {
    addToast(`Đang mở trang theo dõi đơn hàng ${orderId}...`, 'info');
  }

  function buyAgain(orderId: string) {
    addToast('Đã thêm sản phẩm vào giỏ hàng!', 'success');
  }

  function viewReview(orderId: string) {
    addToast('Đang mở trang đánh giá...', 'info');
  }

  function requestReturn(orderId: string) {
    if (typeof window !== 'undefined' && window.confirm('Bạn có muốn yêu cầu trả hàng cho đơn hàng này?')) {
      addToast('Yêu cầu trả hàng đã được gửi!', 'success');
    }
  }

  const filteredOrders = orders.filter(o => {
    if (tab === 'all') return true;
    return o.status === tab;
  });

  const formatStatusLabel = (s: TabKey | string) => {
    if (s === 'all') return 'Tất cả';
    switch (s) {
      case 'pending': return 'Chờ xác nhận';
      case 'confirmed': return 'Đã xác nhận';
      case 'shipping': return 'Đang giao';
      case 'delivered': return 'Đã giao';
      case 'cancelled': return 'Đã hủy';
      case 'returned': return 'Trả hàng/Hoàn tiền';
      default: return String(s);
    }
  };

  return (
    <div className="orders-page shopee-bg">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="breadcrumb">
          <button onClick={() => router.push('/home')} className="hover:text-shopee-orange">Trang chủ</button>
          <span className="text-gray-400">/</span>
          <span className="current">Đơn hàng của tôi</span>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Đơn hàng của tôi</h1>
              <p className="text-gray-600">Quản lý và theo dõi tất cả đơn hàng của bạn</p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="search-box">
                <input type="text" placeholder="Tìm theo mã đơn hàng, tên sản phẩm..." className="w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500" />
                <svg className="search-icon w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>

              <div className="filter-dropdown relative">
                <button onClick={toggleFilter} className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                  </svg>
                  <span>Bộ lọc</span>
                </button>

                <div className={`filter-content absolute right-0 mt-2 w-72 bg-white border border-gray-200 rounded-lg shadow-lg z-50 ${showFilter ? 'show' : ''}`}>
                  <div className="p-4">
                    <h4 className="font-medium text-gray-900 mb-3">Thời gian</h4>
                    <div className="space-y-2">
                      <label className="flex items-center">
                        <input type="radio" name="timeFilter" value="all" defaultChecked className="text-orange-600" />
                        <span className="ml-2 text-sm">Tất cả</span>
                      </label>
                      <label className="flex items-center">
                        <input type="radio" name="timeFilter" value="week" className="text-orange-600" />
                        <span className="ml-2 text-sm">7 ngày qua</span>
                      </label>
                      <label className="flex items-center">
                        <input type="radio" name="timeFilter" value="month" className="text-orange-600" />
                        <span className="ml-2 text-sm">30 ngày qua</span>
                      </label>
                      <label className="flex items-center">
                        <input type="radio" name="timeFilter" value="quarter" className="text-orange-600" />
                        <span className="ml-2 text-sm">3 tháng qua</span>
                      </label>
                    </div>

                    <h4 className="font-medium text-gray-900 mb-3 mt-4">Giá trị đơn hàng</h4>
                    <div className="space-y-2">
                      <label className="flex items-center">
                        <input type="checkbox" className="text-orange-600" />
                        <span className="ml-2 text-sm">Dưới 500K</span>
                      </label>
                      <label className="flex items-center">
                        <input type="checkbox" className="text-orange-600" />
                        <span className="ml-2 text-sm">500K - 1M</span>
                      </label>
                      <label className="flex items-center">
                        <input type="checkbox" className="text-orange-600" />
                        <span className="ml-2 text-sm">1M - 5M</span>
                      </label>
                      <label className="flex items-center">
                        <input type="checkbox" className="text-orange-600" />
                        <span className="ml-2 text-sm">Trên 5M</span>
                      </label>
                    </div>

                    <div className="flex space-x-2 mt-4">
                      <button className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">Đặt lại</button>
                      <button className="flex-1 px-3 py-2 text-sm bg-orange-500 text-white rounded-lg hover:bg-orange-600">Áp dụng</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">24</div>
                <div className="text-sm text-gray-600">Tổng đơn hàng</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">3</div>
                <div className="text-sm text-gray-600">Chờ xác nhận</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">2</div>
                <div className="text-sm text-gray-600">Đang giao</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">18</div>
                <div className="text-sm text-gray-600">Đã giao</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">1</div>
                <div className="text-sm text-gray-600">Đã hủy</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">0</div>
                <div className="text-sm text-gray-600">Trả hàng</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm mb-6">
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8 px-6">
                {(['all', 'pending', 'confirmed', 'shipping', 'delivered', 'cancelled', 'returned'] as TabKey[]).map(s => (
                  <button key={s} className={`tab-button ${tab === s ? 'active' : ''}`} onClick={() => switchTab(s)}>
                    {formatStatusLabel(s)}
                    {s === 'pending' && <span className="ml-1 bg-yellow-100 text-yellow-600 text-xs px-2 py-1 rounded-full">3</span>}
                    {s === 'shipping' && <span className="ml-1 bg-blue-100 text-blue-600 text-xs px-2 py-1 rounded-full">2</span>}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          <div id="ordersList" className="space-y-4">
            {filteredOrders.length === 0 && (
              <div id="emptyState" className="empty-state bg-white rounded-lg">
                <div className="text-6xl mb-4">📦</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Không có đơn hàng</h3>
                <p className="text-gray-500 mb-4">Bạn chưa có đơn hàng nào trong danh mục này.</p>
                <button className="shopee-orange text-white px-6 py-2 rounded-lg font-medium shopee-orange-hover" onClick={() => router.push('/')}>Tiếp tục mua sắm</button>
              </div>
            )}

            {filteredOrders.map(order => (
              <div key={order.id} className="order-card bg-white rounded-lg p-6" data-status={order.status}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
                      <span className="font-medium text-gray-900">{order.shop}</span>
                    </div>
                    <button className="text-blue-600 hover:text-blue-800 text-sm" onClick={() => contactShop(order.code)}>
                      <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                      Chat
                    </button>
                  </div>

                  <div className="flex items-center space-x-3">
                    <span className={`order-status ${order.status === 'pending' ? 'status-pending' : order.status === 'confirmed' ? 'status-confirmed' : order.status === 'shipping' ? 'status-shipping' : order.status === 'delivered' ? 'status-delivered' : order.status === 'cancelled' ? 'status-cancelled' : 'status-returned'}`}>{order.status.replace(/\b\w/g, l => l.toUpperCase())}</span>
                    <span className="text-sm text-gray-500">#{order.code}</span>
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-4">
                  <div className="flex items-start space-x-4">
                    <img src={`data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80'%3E%3Crect width='80' height='80' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-size='10' fill='%236b7280'%3E${encodeURIComponent(order.title.split(' ')[0])}%3C/text%3E%3C/svg%3E`} alt={order.title} className={`product-image ${order.status === 'cancelled' ? 'opacity-60' : ''}`} />
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 mb-1">{order.title}</h3>
                      {order.variant && <p className="text-sm text-gray-600 mb-2">Phân loại: {order.variant}</p>}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <span className="text-lg font-bold text-shopee-orange">{order.price}</span>
                          {order.originalPrice && <span className="text-sm text-gray-500 line-through">{order.originalPrice}</span>}
                        </div>
                        <span className="text-sm text-gray-600">x{order.qty}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-4 mt-4">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600"><span>Đặt hàng: {order.orderDate}</span></div>
                    <div className="flex items-center space-x-4"><span className="text-sm text-gray-600">Tổng tiền:</span><span className="text-xl font-bold text-shopee-orange">{order.total}</span></div>
                  </div>

                  <div className="flex items-center justify-between mt-4">
                    <div className="text-sm text-gray-600">{order.status === 'pending' ? <>Thời gian xác nhận còn lại: <span className="text-red-600 font-medium">23:45:12</span></> : order.trackingCode ? <>Mã vận đơn: <span className="font-medium text-blue-600">{order.trackingCode}</span></> : null}</div>

                    <div className="order-actions">
                      {order.status === 'pending' && <button onClick={() => cancelOrder(order.code)} className="action-button action-danger">Hủy đơn hàng</button>}
                      {order.status !== 'delivered' && <button onClick={() => contactShop(order.code)} className="action-button action-secondary">Liên hệ shop</button>}
                      {order.status === 'shipping' && <button onClick={() => trackOrder(order.code)} className="action-button action-primary">Theo dõi đơn hàng</button>}
                      {order.status === 'delivered' && <>
                        <button onClick={() => buyAgain(order.code)} className="action-button action-primary">Mua lại</button>
                        <button onClick={() => viewReview(order.code)} className="action-button action-secondary">Xem đánh giá</button>
                        <button onClick={() => requestReturn(order.code)} className="action-button action-secondary">Trả hàng</button>
                      </>}
                      {order.status === 'cancelled' && <button onClick={() => buyAgain(order.code)} className="action-button action-primary">Mua lại</button>}
                    </div>
                  </div>

                  {order.cancelInfo && (
                    <div className="bg-red-50 rounded-lg p-4 mt-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        <span className="font-medium text-red-900">Lý do hủy đơn</span>
                      </div>
                      <p className="text-sm text-red-700">{order.cancelInfo.reason}</p>
                      <p className="text-xs text-red-600 mt-1">Hủy lúc: {order.cancelInfo.time}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-8">
            <button className="text-shopee-orange border border-orange-300 px-6 py-2 rounded-lg font-medium hover:bg-orange-50 transition-colors">Xem thêm đơn hàng</button>
          </div>
        </div>
      </main>

      <Footer />

      {/* Toasts */}
      <div className="toasts-container fixed bottom-6 right-6 space-y-2 z-50">
        {toasts.map(t => (
          <div key={t.id} className={`toast ${t.type ?? 'info'} bg-white px-4 py-2 rounded shadow`}>{t.message}</div>
        ))}
      </div>
    </div>
  );
};

export default OrdersPage;
