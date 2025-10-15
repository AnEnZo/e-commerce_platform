'use client';

import React, { JSX, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Sidebar from '@/components/shop/Sidebar';

// Nếu bạn dùng CSS module cho page này, import ở đây:
// import styles from './dashboard.module.css';

// Type an toàn cho payload JWT
type JwtPayload = Record<string, string | number | boolean | null | undefined> | null;

type Lang = 'vi' | 'en';

interface ShopDTO {
  id?: string;
  name?: string;
  ownerId?: string;
  address?: string;
  imageUrl?: string;
  sellerType?: string;
  fullName?: string;
  phone?: string;
  email?: string;
  verificationStatus?: string;
  createdAt?: string;
  updatedAt?: string;
  // thêm field khác nếu cần
}

function safeJsonParse(s: string): unknown | null {
  try {
    return JSON.parse(s);
  } catch {
    return null;
  }
}

/**
 * Giải mã JWT payload (client-side). Trả về JwtPayload (không dùng any).
 */
function decodeJwtPayload(token: string | null): JwtPayload {
  if (!token) return null;
  try {
    const parts = token.split('.');
    if (parts.length < 2) return null;
    const base64Payload = parts[1];
    // thay thế URL-safe base64
    const normalized = base64Payload.replace(/-/g, '+').replace(/_/g, '/');
    const pad = normalized.length % 4;
    const padded = pad ? normalized + '='.repeat(4 - pad) : normalized;
    // atob chỉ có trên browser — component này là client
    const json = atob(padded);
    const parsed = safeJsonParse(json);
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      // phù hợp với JwtPayload
      return parsed as JwtPayload;
    }
    return null;
  } catch (e) {
    // không ném lỗi ra ngoài — trả null
    // eslint-disable-next-line no-console
    console.warn('decodeJwtPayload error', e);
    return null;
  }
}

/**
 * Lấy giá trị id dạng string từ payload theo nhiều key khả dĩ.
 * Nếu tìm được number -> chuyển thành string.
 */
function getStringFromPayload(payload: JwtPayload, keys: string[]): string | null {
  if (!payload) return null;
  for (const k of keys) {
    const val = payload[k];
    if (val === undefined || val === null) continue;
    if (typeof val === 'string' && val.trim() !== '') return val;
    if (typeof val === 'number') return String(val);
    // đôi khi payload chứa object có id, bỏ qua
  }
  return null;
}

export default function DashboardSeller(): JSX.Element {
  const router = useRouter();

  const [lang, setLang] = useState<Lang>('vi');
  const [shop, setShop] = useState<ShopDTO | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Đọc biến môi trường client-side
  const SHOP_API_BASE = process.env.NEXT_PUBLIC_SHOP_API_BASE ?? 'http://localhost:8080/product-service/api/shops';

  function openLogin(): void {
    router.push('/');
  }

  useEffect(() => {
    let mounted = true;

    async function loadShop(): Promise<void> {
      setLoading(true);
      // chỉ lấy sessionStorage trên browser
      const token = typeof window !== 'undefined' ? sessionStorage.getItem('access_token') : null;
      if (!token) {
        router.push('/');
        return;
      }

      const payload = decodeJwtPayload(token);

      const candidateKeys = ['userID', 'userId', 'user_id', 'uid', 'sub', 'id'];
      const ownerId = getStringFromPayload(payload, candidateKeys);

      if (!ownerId) {
        // eslint-disable-next-line no-console
        console.warn('Không tìm được user id trong token', payload);
        sessionStorage.clear();
        router.push('/');
        return;
      }

      const url = `${SHOP_API_BASE}/owner/${ownerId}`;

      try {
        const res = await fetch(url, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
          },
          // mode, credentials... để tuỳ theo API. Nếu API cần cookie, cần flow khác (SSR/cookie HttpOnly).
        });

        const contentType = res.headers.get('content-type') ?? '';
        const text = await res.text();

        if (!res.ok) {
          // eslint-disable-next-line no-console
          console.error('API lỗi', res.status, text.slice(0, 1000));
          if (res.status === 404) {
            router.push('/sellerregister');
            return;
          }
          if (res.status === 401 || res.status === 403) {
            sessionStorage.clear();
            router.push('/');
            return;
          }
          if (contentType.includes('text/html')) {
            if (mounted) setFetchError('Server trả về HTML (kiểm tra URL/proxy).');
          } else {
            if (mounted) setFetchError(`Lỗi server (${res.status})`);
          }
          return;
        }

        // Nếu content-type không có application/json, cố gắng parse
        let parsed: unknown | null = null;
        if (contentType.includes('application/json')) {
          parsed = safeJsonParse(text);
        } else {
          // backend đôi khi trả JSON nhưng thiếu content-type
          parsed = safeJsonParse(text);
        }

        if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
          if (mounted) {
            // chuyển đổi kiểu an toàn sang ShopDTO
            const maybeShop = parsed as Record<string, unknown>;
            const shopObj: ShopDTO = {
              id: maybeShop.id ? String(maybeShop.id) : undefined,
              name: maybeShop.name ? String(maybeShop.name) : undefined,
              ownerId: maybeShop.ownerId ? String(maybeShop.ownerId) : undefined,
              address: maybeShop.address ? String(maybeShop.address) : undefined,
              imageUrl: maybeShop.imageUrl ? String(maybeShop.imageUrl) : undefined,
              sellerType: maybeShop.sellerType ? String(maybeShop.sellerType) : undefined,
              fullName: maybeShop.fullName ? String(maybeShop.fullName) : undefined,
              phone: maybeShop.phone ? String(maybeShop.phone) : undefined,
              email: maybeShop.email ? String(maybeShop.email) : undefined,
              verificationStatus: maybeShop.verificationStatus ? String(maybeShop.verificationStatus) : undefined,
              createdAt: maybeShop.createdAt ? String(maybeShop.createdAt) : undefined,
              updatedAt: maybeShop.updatedAt ? String(maybeShop.updatedAt) : undefined,
            };
            setShop(shopObj);
            setFetchError(null);
          }
        } else {
          if (mounted) setFetchError('Server trả về dữ liệu không hợp lệ (không phải JSON).');
        }
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('Fetch error', err);
        if (mounted) setFetchError('Không thể kết nối tới server');
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadShop();

    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router, SHOP_API_BASE]);

  const orders = [
    { id: '#DH001234', customer: 'Nguyễn Văn A', product: 'iPhone 15 Pro Max', price: '₫25.990.000', status: 'pending', date: '15/12/2024' },
    { id: '#DH001235', customer: 'Trần Thị B', product: 'Laptop Gaming ASUS', price: '₫22.990.000', status: 'confirmed', date: '15/12/2024' },
    { id: '#DH001236', customer: 'Lê Văn C', product: 'AirPods Pro', price: '₫5.990.000', status: 'shipping', date: '14/12/2024' },
    { id: '#DH001237', customer: 'Phạm Thị D', product: 'Apple Watch Series 9', price: '₫8.990.000', status: 'delivered', date: '14/12/2024' },
    { id: '#DH001238', customer: 'Hoàng Văn E', product: 'iPad Pro M2', price: '₫18.990.000', status: 'pending', date: '13/12/2024' },
  ] as const;

  if (loading) {
    return (
      <div className="shopee-bg min-h-screen flex items-center justify-center">
        <div>Đang tải thông tin cửa hàng...</div>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="shopee-bg min-h-screen p-6">
        <Header lang={lang} setLang={setLang} openLogin={openLogin} />
        <main className="container mx-auto">
          <div className="bg-white p-6 rounded shadow">
            <h2 className="text-lg font-semibold">Lỗi</h2>
            <p className="text-sm text-gray-600">{fetchError}</p>
            <div className="mt-4">
              <button onClick={() => window.location.reload()} className="px-4 py-2 bg-orange-500 text-white rounded">
                Thử lại
              </button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!shop) {
    // Thường sẽ redirect trước, nhưng thêm guard an toàn
    return null;
  }

  return (
    <div className="shopee-bg min-h-screen">
      <Header lang={lang} setLang={setLang} openLogin={openLogin} />

      <div className="flex">
        <Sidebar activeKey="dashboard" />

        <main className="flex-1 p-6">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Tổng quan</h1>
            <p className="text-gray-600">
              Xin chào {shop.name ?? shop.fullName ?? 'Người bán'}! Đây là tổng quan về hoạt động bán hàng của bạn
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="stat-card text-white p-6 rounded-lg card-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/80 text-sm">Doanh thu hôm nay</p>
                  <p className="text-2xl font-bold">₫2.450.000</p>
                  <p className="text-white/80 text-xs mt-1">+12% so với hôm qua</p>
                </div>
                <div className="text-3xl">💰</div>
              </div>
            </div>

            <div className="stat-card-green text-white p-6 rounded-lg card-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/80 text-sm">Đơn hàng mới</p>
                  <p className="text-2xl font-bold">24</p>
                  <p className="text-white/80 text-xs mt-1">+8% so với hôm qua</p>
                </div>
                <div className="text-3xl">📦</div>
              </div>
            </div>

            <div className="stat-card-orange text-white p-6 rounded-lg card-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/80 text-sm">Sản phẩm đã bán</p>
                  <p className="text-2xl font-bold">156</p>
                  <p className="text-white/80 text-xs mt-1">+15% so với hôm qua</p>
                </div>
                <div className="text-3xl">🛍️</div>
              </div>
            </div>

            <div className="stat-card-purple text-gray-800 p-6 rounded-lg card-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Lượt xem shop</p>
                  <p className="text-2xl font-bold">1.234</p>
                  <p className="text-gray-600 text-xs mt-1">+5% so với hôm qua</p>
                </div>
                <div className="text-3xl">👁️</div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg card-shadow">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Doanh thu 7 ngày qua</h3>
              <div className="chart-container">
                <div className="text-center">
                  <div className="text-4xl mb-2">📈</div>
                  <p>Biểu đồ doanh thu</p>
                  <p className="text-sm text-gray-500">Dữ liệu sẽ được hiển thị ở đây</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg card-shadow">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Sản phẩm bán chạy</h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center text-xl">📱</div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">iPhone 15 Pro Max</p>
                    <p className="text-sm text-gray-500">Đã bán: 45 sản phẩm</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-green-600">₫25.990.000</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center text-xl">💻</div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">Laptop Gaming ASUS</p>
                    <p className="text-sm text-gray-500">Đã bán: 32 sản phẩm</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-green-600">₫22.990.000</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center text-xl">🎧</div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">AirPods Pro</p>
                    <p className="text-sm text-gray-500">Đã bán: 28 sản phẩm</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-green-600">₫5.990.000</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center text-xl">⌚</div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">Apple Watch Series 9</p>
                    <p className="text-sm text-gray-500">Đã bán: 21 sản phẩm</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-green-600">₫8.990.000</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg card-shadow">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Đơn hàng gần đây</h3>
                <button
                  type="button"
                  onClick={() => router.push('/seller/orders')}
                  className="text-shopee-orange hover:text-red-600 text-sm font-medium"
                >
                  Xem tất cả
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="table-header">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mã đơn hàng</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Khách hàng</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sản phẩm</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tổng tiền</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ngày đặt</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {orders.map((o) => (
                    <tr key={o.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{o.id}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{o.customer}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{o.product}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">{o.price}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${
                            o.status === 'pending'
                              ? 'status-pending'
                              : o.status === 'confirmed'
                              ? 'status-confirmed'
                              : o.status === 'shipping'
                              ? 'status-shipping'
                              : 'status-delivered'
                          }`}
                        >
                          {o.status === 'pending' ? 'Chờ xác nhận' : o.status === 'confirmed' ? 'Đã xác nhận' : o.status === 'shipping' ? 'Đang giao' : 'Đã giao'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{o.date}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button className="text-shopee-orange hover:text-red-600 font-medium">Xem chi tiết</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg card-shadow text-center">
              <div className="text-4xl mb-4">📦</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Thêm sản phẩm mới</h3>
              <p className="text-gray-600 text-sm mb-4">Đăng bán sản phẩm mới để tăng doanh thu</p>
              <button onClick={() => router.push('/seller/products/new')} className="shopee-orange text-white px-6 py-2 rounded-lg font-medium hover:bg-red-600 transition-colors">
                Thêm sản phẩm
              </button>
            </div>

            <div className="bg-white p-6 rounded-lg card-shadow text-center">
              <div className="text-4xl mb-4">🎯</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Tạo chương trình khuyến mãi</h3>
              <p className="text-gray-600 text-sm mb-4">Tăng lượt bán với các chương trình ưu đãi</p>
              <button onClick={() => router.push('/seller/marketing/create')} className="shopee-orange text-white px-6 py-2 rounded-lg font-medium hover:bg-red-600 transition-colors">
                Tạo khuyến mãi
              </button>
            </div>

            <div className="bg-white p-6 rounded-lg card-shadow text-center">
              <div className="text-4xl mb-4">📊</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Xem báo cáo chi tiết</h3>
              <p className="text-gray-600 text-sm mb-4">Phân tích dữ liệu để tối ưu kinh doanh</p>
              <button onClick={() => router.push('/seller/analytics/reports')} className="shopee-orange text-white px-6 py-2 rounded-lg font-medium hover:bg-red-600 transition-colors">
                Xem báo cáo
              </button>
            </div>
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
}
