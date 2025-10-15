'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

export type SidebarProps = {
  activeKey?: string; // optional override to force active item
  className?: string;
  onNavigate?: (path: string) => void; // optional override (useful for tests)
};

export const MENU_ITEMS: Array<{ key: string; label: string; path: string; icon: string }> = [
  { key: 'Dashboard', label: 'Dashboard', path: '/seller/sellerdashboard', icon: 'fa-chart-pie' },
  { key: 'DonHang', label: 'Đơn hàng', path: '/seller/orders', icon: 'fa-shopping-cart' },
  { key: 'SanPham', label: 'Sản phẩm', path: '/seller/productmanager', icon: 'fa-box' },
  { key: 'User', label: 'User', path: '/seller/users', icon: 'fa-users' },
  { key: 'Shop', label: 'Shop/Nhà bán', path: '/seller/shops', icon: 'fa-store-alt' },
  { key: 'TaiChinh', label: 'Tài chính', path: '/seller/financial', icon: 'fa-coins' },
  { key: 'BaoCao', label: 'Báo cáo', path: '/seller/saleanalytics', icon: 'fa-chart-bar' },
  { key: 'VanHanh', label: 'Quản lý vận hành', path: '/seller/operations', icon: 'fa-cogs' },
  { key: 'KhuyenMai', label: 'Khuyến mãi toàn sàn', path: '/seller/marketing', icon: 'fa-tags' },
];

const Sidebar: React.FC<SidebarProps> = ({ activeKey: activeKeyProp, onNavigate, className = '' }) => {
  const pathname = usePathname() ?? '/';
  const router = useRouter();

  // derive active key from pathname if caller didn't provide one
  const activeKey = React.useMemo(() => {
    if (activeKeyProp) return activeKeyProp;
    const matched = MENU_ITEMS.find((item) => pathname === item.path || pathname.startsWith(item.path + '/') || pathname.startsWith(item.path));
    return matched?.key ?? 'Dashboard';
  }, [pathname, activeKeyProp]);

  const handleNavigate = (path: string) => {
    if (onNavigate) return onNavigate(path);
    // client-side navigation using Next.js router
    router.push(path);
  };

  return (
    <aside className={`w-64 bg-white shadow-xl border-r border-gray-200 ${className}`} aria-label="Sidebar">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
            <i className="fas fa-store text-white text-lg" aria-hidden />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-800">Shop247</h1>
            <p className="text-sm text-gray-500">Admin Panel</p>
          </div>
        </div>
      </div>

      <nav className="mt-6 px-4">
        <div className="space-y-2">
          {MENU_ITEMS.map((item) => {
            const isActive = activeKey === item.key;
            const baseClass = `sidebar-item flex items-center px-4 py-3 rounded-lg transition-all duration-200 ${isActive ? 'bg-orange-500 text-white' : 'text-gray-700 hover:bg-orange-500 hover:text-white'}`;

            // If consumer provided onNavigate prop we call it instead of using <Link> to keep tests deterministic
            if (onNavigate) {
              return (
                <a
                  key={item.key}
                  href={item.path}
                  onClick={(e) => {
                    e.preventDefault();
                    handleNavigate(item.path);
                  }}
                  className={baseClass}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <i className={`fas ${item.icon} w-5 h-5 mr-3`} aria-hidden />
                  <span className="font-medium">{item.label}</span>
                </a>
              );
            }

            // Default: render Next.js Link for proper SEO / prefetch behaviour
            return (
              <Link key={item.key} href={item.path} className={baseClass} aria-current={isActive ? 'page' : undefined}>
                <i className={`fas ${item.icon} w-5 h-5 mr-3`} aria-hidden />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}

          <div className="mt-6">
            <p className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Vận hành</p>
            {/* reserved for grouped sections */}
          </div>
        </div>
      </nav>
    </aside>
  );
};

export default Sidebar;
