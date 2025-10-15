'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

type SidebarProps = {
  activeKey?: string;              // key hiển thị active (ví dụ 'dashboard' | 'orders' | ...)
  className?: string;
  onNavigate?: (path: string) => void; // optional override cho navigate (useful in tests)
};

const MENU_ITEMS: Array<{ key: string; label: string; path: string; icon: string }> = [
  { key: 'dashboard', label: 'Tổng quan', path: '/seller/sellerdashboard', icon: '📊' },
  { key: 'orders', label: 'Quản lý đơn hàng', path: '/seller/orders', icon: '📦' },
  { key: 'products', label: 'Quản lý sản phẩm', path: '/seller/productmanager', icon: '🛍️' },
  { key: 'financial', label: 'Tài chính', path: '/seller/financial', icon: '💰' },
  { key: 'saleanalytics', label: 'Phân tích bán hàng', path: '/seller/saleanalytics', icon: '📈' },
  { key: 'marketing', label: 'Marketing', path: '/seller/marketing', icon: '🎯' },
  { key: 'shopreviews', label: 'Đánh giá shop', path: '/seller/shopreviews', icon: '⭐' },
  { key: 'shipping', label: 'Vận chuyển', path: '/seller/shipping', icon: '🚚' },
  { key: 'settings', label: 'Cài đặt shop', path: '/seller/settings', icon: '⚙️' },
];

export default function Sidebar({ activeKey, className = '', onNavigate }: SidebarProps) {
  const pathname = usePathname();

  // Nếu không truyền activeKey, cố gắng dò từ pathname hiện tại
  const resolvedActiveKey = activeKey ?? MENU_ITEMS.find((mi) => pathname?.startsWith(mi.path))?.key;

  const handleClick = (e: React.MouseEvent, path: string) => {
    // Nếu onNavigate được cung cấp (ví dụ trong test), ngăn Link mặc định và gọi callback
    if (onNavigate) {
      e.preventDefault();
      onNavigate(path);
    }
  };

  const itemClass = (key: string) =>
    `sidebar-item flex items-center px-4 py-3 text-sm font-medium ${resolvedActiveKey === key ? 'active' : 'text-gray-700'}`;

  return (
    <aside className={`w-64 bg-white shadow-sm min-h-screen ${className}`}>
      <nav className="py-4" aria-label="Quản lý bán hàng">
        <div className="px-4 mb-4">
          <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Quản lý bán hàng</h2>
        </div>

        <ul className="space-y-1">
          {MENU_ITEMS.map((mi) => (
            <li key={mi.key}>
              <Link href={mi.path} legacyBehavior>
                <a
                  onClick={(e) => handleClick(e, mi.path)}
                  className={itemClass(mi.key)}
                  aria-current={resolvedActiveKey === mi.key ? 'page' : undefined}
                >
                  <span className="mr-3" aria-hidden>
                    {mi.icon}
                  </span>
                  <span className="flex-1 text-left">{mi.label}</span>
                </a>
              </Link>
            </li>
          ))}
        </ul>

      </nav>
    </aside>
  );
}
