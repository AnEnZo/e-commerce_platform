
import React, { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import '../css/OrdersManager.css';
import Sidebar from '@/components/shop/Sidebar';

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipping'
  | 'delivered'
  | 'cancelled'
  | 'returned';

export interface OrderItem {
  id: string;
  name: string;
  sku?: string;
  price: string;
  qty: number;
}

export interface Order {
  id: string;
  customerName: string;
  phone?: string;
  city?: string;
  items: OrderItem[];
  total: string;
  shippingFee?: string;
  paymentMethod: 'COD' | 'Transfer' | 'Card';
  status: OrderStatus;
  createdAt: string; // ISO or human readable
  urgent?: boolean;
}

const initialOrders: Order[] = [
  {
    id: 'DH001234',
    customerName: 'Nguyễn Văn A',
    phone: '0987654321',
    city: 'Hà Nội',
    items: [
      { id: 'p1', name: 'iPhone 15 Pro Max 256GB', sku: 'IP15PM-256-TN', price: '₫25.990.000', qty: 1 },
    ],
    total: '₫26.020.000',
    shippingFee: '₫30.000',
    paymentMethod: 'COD',
    status: 'pending',
    createdAt: '2024-12-13T14:30:00',
    urgent: true,
  },
  {
    id: 'DH001235',
    customerName: 'Trần Thị B',
    phone: '0912345678',
    city: 'TP.HCM',
    items: [{ id: 'p2', name: 'Laptop Gaming ASUS', price: '₫22.990.000', qty: 1 }],
    total: '₫22.990.000',
    shippingFee: '₫0',
    paymentMethod: 'Transfer',
    status: 'processing',
    createdAt: '2024-12-15T10:00:00',
  },
  {
    id: 'DH001236',
    customerName: 'Lê Văn C',
    phone: '0923456789',
    city: 'Đà Nẵng',
    items: [{ id: 'p3', name: 'AirPods Pro', price: '₫5.990.000', qty: 2 }],
    total: '₫11.980.000',
    shippingFee: '₫25.000',
    paymentMethod: 'COD',
    status: 'shipping',
    createdAt: '2024-12-14T09:00:00',
  },
];

const OrdersManager: React.FC = () => {
  const [orders] = useState<Order[]>(initialOrders);
  const [filter, setFilter] = useState<'all' | OrderStatus>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  function filteredOrders() {
    if (filter === 'all') return orders;
    return orders.filter((o) => o.status === filter);
  }

  function openOrderDetail(orderId: string) {
    const o = orders.find((x) => x.id === orderId) || null;
    setSelectedOrder(o);
  }

  function closeOrderDetail() {
    setSelectedOrder(null);
  }

  function confirmOrder(orderId: string) {
    if (confirm(`Bạn có chắc chắn muốn xác nhận đơn hàng ${orderId}?`)) {
      alert(`Đơn hàng ${orderId} đã được xác nhận (demo).`);
    }
  }

  function cancelOrder(orderId: string) {
    const reason = prompt(`Lý do hủy đơn hàng ${orderId}:`);
    if (reason) alert(`Đơn ${orderId} đã hủy. Lý do: ${reason} (demo)`);
  }

  return (
    <div className="orders-manager-root">
      <Header />

      <div className="shopee-bg min-h-screen">

       <div className="flex">
         <Sidebar activeKey="orders" />
           <div className="container mx-auto px-4 lg:px-8 py-6">
            <main className="flex-1">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">Quản lý đơn hàng</h1>
                  <p className="text-gray-600">Theo dõi và xử lý tất cả đơn hàng của shop</p>
                </div>
                <div className="flex items-center space-x-3">
                  <button onClick={() => alert('Xuất báo cáo (demo)')} className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center space-x-2">📊 Xuất báo cáo</button>
                  <button onClick={() => window.print()} className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center space-x-2">🖨️ In đơn hàng</button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white p-6 rounded-lg card-shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm">Chờ xác nhận</p>
                      <p className="text-2xl font-bold text-yellow-600">{orders.filter(o => o.status === 'pending').length}</p>
                      <p className="text-xs text-gray-500 mt-1">Cần xử lý ngay</p>
                    </div>
                    <div className="text-3xl">⏳</div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg card-shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm">Đang xử lý</p>
                      <p className="text-2xl font-bold text-blue-600">{orders.filter(o => o.status === 'processing').length}</p>
                      <p className="text-xs text-gray-500 mt-1">Đang chuẩn bị hàng</p>
                    </div>
                    <div className="text-3xl">📦</div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg card-shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm">Đang giao</p>
                      <p className="text-2xl font-bold text-purple-600">{orders.filter(o => o.status === 'shipping').length}</p>
                      <p className="text-xs text-gray-500 mt-1">Đang vận chuyển</p>
                    </div>
                    <div className="text-3xl">🚚</div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg card-shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm">Hoàn thành</p>
                      <p className="text-2xl font-bold text-green-600">{orders.filter(o => o.status === 'delivered').length}</p>
                      <p className="text-xs text-gray-500 mt-1">Tổng</p>
                    </div>
                    <div className="text-3xl">✅</div>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg card-shadow mb-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                  <div className="flex-1 max-w-md">
                    <div className="relative">
                      <input type="text" placeholder="Tìm kiếm theo mã đơn hàng, tên khách hàng..." className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent" />
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm text-gray-600">Trạng thái:</span>
                    <button className={`filter-btn ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>Tất cả</button>
                    <button className={`filter-btn ${filter === 'pending' ? 'active' : ''}`} onClick={() => setFilter('pending')}>Chờ xác nhận</button>
                    <button className={`filter-btn ${filter === 'confirmed' ? 'active' : ''}`} onClick={() => setFilter('confirmed')}>Đã xác nhận</button>
                    <button className={`filter-btn ${filter === 'processing' ? 'active' : ''}`} onClick={() => setFilter('processing')}>Đang xử lý</button>
                    <button className={`filter-btn ${filter === 'shipping' ? 'active' : ''}`} onClick={() => setFilter('shipping')}>Đang giao</button>
                    <button className={`filter-btn ${filter === 'delivered' ? 'active' : ''}`} onClick={() => setFilter('delivered')}>Đã giao</button>
                    <button className={`filter-btn ${filter === 'cancelled' ? 'active' : ''}`} onClick={() => setFilter('cancelled')}>Đã hủy</button>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input type="date" className="border border-gray-300 rounded-lg px-3 py-2 text-sm" />
                    <span className="text-gray-500">đến</span>
                    <input type="date" className="border border-gray-300 rounded-lg px-3 py-2 text-sm" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg card-shadow">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="table-header">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Đơn hàng</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Khách hàng</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sản phẩm</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tổng tiền</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thanh toán</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ngày đặt</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredOrders().map((o) => (
                        <tr key={o.id} className={`hover:bg-gray-50 ${o.urgent ? 'urgent-order' : ''}`}>
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-2">
                              <span className="font-medium text-gray-900">#{o.id}</span>
                              {o.urgent && <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">Gấp</span>}
                            </div>
                            <div className="text-sm text-gray-500">{o.paymentMethod === 'COD' ? 'COD' : o.paymentMethod}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div>
                              <div className="font-medium text-gray-900">{o.customerName}</div>
                              <div className="text-sm text-gray-500">{o.phone}</div>
                              <div className="text-sm text-gray-500">{o.city}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-3">
                              <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center text-xl">{o.items[0] ? '📦' : ''}</div>
                              <div>
                                <div className="font-medium text-gray-900">{o.items[0]?.name}</div>
                                <div className="text-sm text-gray-500">Số lượng: {o.items.reduce((s, it) => s + it.qty, 0)}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="font-medium text-gray-900">{o.total}</div>
                            <div className="text-sm text-gray-500">Phí ship: {o.shippingFee || 'Miễn phí'}</div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${o.paymentMethod === 'COD' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>{o.paymentMethod === 'COD' ? 'COD' : 'Đã thanh toán'}</span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full status-${o.status}`}>{o.status === 'pending' ? 'Chờ xác nhận' : o.status}</span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900">{new Date(o.createdAt).toLocaleDateString()}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-2">
                              <button onClick={() => openOrderDetail(o.id)} className="text-blue-600 hover:text-blue-800 text-sm">Chi tiết</button>
                              <button onClick={() => confirmOrder(o.id)} className="text-green-600 hover:text-green-800 text-sm font-medium">Xác nhận</button>
                              <button onClick={() => cancelOrder(o.id)} className="text-red-600 hover:text-red-800 text-sm">Hủy</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="px-6 py-4 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-700">Hiển thị <span className="font-medium">1</span> đến <span className="font-medium">{orders.length}</span> trong tổng số <span className="font-medium">{orders.length}</span> đơn hàng</div>
                    <div className="flex items-center space-x-2">
                      <button className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">Trước</button>
                      <button className="px-3 py-2 text-sm bg-shopee-orange text-white rounded-lg">1</button>
                      <button className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">2</button>
                      <button className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">3</button>
                      <span className="px-2">...</span>
                      <button className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">54</button>
                      <button className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">Sau</button>
                    </div>
                  </div>
                </div>

              </div>
            </main>
          </div>
        </div>
      </div>

      <Footer />

      {/* Order Detail Modal */}
      <div className={`modal ${selectedOrder ? 'show' : ''}`} onClick={(e) => { if (e.target === e.currentTarget) closeOrderDetail(); }}>
        <div className="modal-content">
          {selectedOrder && (
            <div>
              <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Chi tiết đơn hàng #{selectedOrder.id}</h2>
                <button onClick={closeOrderDetail} className="text-gray-400 hover:text-gray-600">✕</button>
              </div>

              <div className="p-6">
                {/* Timeline */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Trạng thái đơn hàng</h3>
                  <div className="timeline">
                    <div className="timeline-item">
                      <div className={`timeline-dot ${selectedOrder.status === 'pending' ? 'current' : ''}`}></div>
                      <div>
                        <div className="font-medium text-gray-900">Chờ xác nhận</div>
                        <div className="text-sm text-gray-500">{new Date(selectedOrder.createdAt).toLocaleString()}</div>
                      </div>
                    </div>
                    {/* other steps are static placeholders in demo */}
                  </div>
                </div>

                {/* Customer & Order Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Thông tin khách hàng</h3>
                    <div className="space-y-3">
                      <div><span className="text-sm text-gray-600">Họ tên:</span><span className="ml-2 font-medium">{selectedOrder.customerName}</span></div>
                      <div><span className="text-sm text-gray-600">Số điện thoại:</span><span className="ml-2 font-medium">{selectedOrder.phone}</span></div>
                      <div><span className="text-sm text-gray-600">Địa chỉ:</span><span className="ml-2 font-medium">{selectedOrder.city}</span></div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Thông tin đơn hàng</h3>
                    <div className="space-y-3">
                      <div><span className="text-sm text-gray-600">Mã đơn hàng:</span><span className="ml-2 font-medium">#{selectedOrder.id}</span></div>
                      <div><span className="text-sm text-gray-600">Ngày đặt:</span><span className="ml-2 font-medium">{new Date(selectedOrder.createdAt).toLocaleString()}</span></div>
                      <div><span className="text-sm text-gray-600">Phương thức thanh toán:</span><span className="ml-2 font-medium">{selectedOrder.paymentMethod}</span></div>
                    </div>
                  </div>
                </div>

                {/* Items */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Sản phẩm đặt mua</h3>
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Sản phẩm</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Đơn giá</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Số lượng</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Thành tiền</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {selectedOrder.items.map(it => (
                          <tr key={it.id}>
                            <td className="px-4 py-4">
                              <div className="flex items-center space-x-3">
                                <div className="w-16 h-16 bg-gray-100 rounded flex items-center justify-center text-2xl">📦</div>
                                <div>
                                  <div className="font-medium text-gray-900">{it.name}</div>
                                  <div className="text-sm text-gray-500">SKU: {it.sku}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-4">{it.price}</td>
                            <td className="px-4 py-4">{it.qty}</td>
                            <td className="px-4 py-4">{it.price}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Summary */}
                <div className="order-summary text-white p-6 rounded-lg">
                  <h3 className="text-lg font-semibold mb-4">Tổng kết đơn hàng</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between"><span>Tạm tính:</span><span>{selectedOrder.total}</span></div>
                    <div className="flex justify-between"><span>Phí vận chuyển:</span><span>{selectedOrder.shippingFee || '₫0'}</span></div>
                    <div className="border-t border-white/20 pt-2 mt-2"><div className="flex justify-between text-lg font-semibold"><span>Tổng cộng:</span><span>{selectedOrder.total}</span></div></div>
                  </div>
                </div>

                <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200 mt-8">
                  <button onClick={() => window.print()} className="bg-blue-600 text-white px-6 py-2 rounded-lg">In đơn hàng</button>
                  <button onClick={() => confirmOrder(selectedOrder.id)} className="bg-green-600 text-white px-6 py-2 rounded-lg">Xác nhận đơn hàng</button>
                  <button onClick={() => cancelOrder(selectedOrder.id)} className="bg-red-600 text-white px-6 py-2 rounded-lg">Hủy đơn hàng</button>
                </div>

              </div>
            </div>
          )}
        </div>
      </div>

    </div>
  );
};

export default OrdersManager;