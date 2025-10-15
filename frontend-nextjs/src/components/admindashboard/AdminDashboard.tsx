'use client';

import React, { useEffect, useState, useRef, JSX } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Sidebar, { MENU_ITEMS } from '@/components/admindashboard/SidebarAdmin';
import styles from '@/style/AdminDashboard.module.css';

export default function AdminDashboard(): JSX.Element {
  const pathname = usePathname() ?? '/';
  const router = useRouter();

  const [activeKey, setActiveKey] = useState<string>('Dashboard');
  const [mainTitle, setMainTitle] = useState<string>('Dashboard');
  const [notifications] = useState<number>(3);
  // typed ref for the button element (no `any`)
  const bellRef = useRef<HTMLButtonElement | null>(null);

  // Map current pathname -> menu key
  useEffect(() => {
    const matched = MENU_ITEMS.find(item => item.path === pathname || pathname.startsWith(item.path + '/') || pathname.startsWith(item.path));
    setActiveKey(matched ? matched.key : 'Dashboard');
  }, [pathname]);

  useEffect(() => {
    const item = MENU_ITEMS.find(i => i.key === activeKey);
    setMainTitle(item ? item.label : 'Dashboard');
  }, [activeKey]);

  const handleBellClick = () => {
    if (!bellRef.current) return;
    const el = bellRef.current;
    el.classList.add('animate-bounce');
    setTimeout(() => el.classList.remove('animate-bounce'), 1000);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          activeKey={activeKey}
          onNavigate={(path) => {
            const matched = MENU_ITEMS.find(m => m.path === path);
            setActiveKey(matched ? matched.key : 'Dashboard');
            router.push(path);
          }}
        />

        <main className="flex-1 flex flex-col overflow-hidden">
          <div className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">{mainTitle}</h2>
                <p className="text-gray-600">Chào mừng trở lại! Đây là tổng quan hệ thống của bạn.</p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <input type="text" placeholder="Tìm kiếm..." className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500" />
                  <i className="fas fa-search absolute left-3 top-3 text-gray-400" />
                </div>

                {/* ref now on the button (typed as HTMLButtonElement) — no more `any` */}
                <button ref={bellRef} onClick={handleBellClick} className="relative p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg">
                  <i className="fas fa-bell text-xl" />
                  {notifications > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">{notifications}</span>
                  )}
                </button>

                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                    <i className="fas fa-user text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">Admin User</p>
                    <p className="text-xs text-gray-500">Quản trị viên</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <section className="flex-1 overflow-y-auto p-6">
            {/* ... giữ nguyên phần nội dung (stats, recent orders, top products) ... */}
            {/* Thêm components/sections ở đây hoặc chuyển nội dung của dashboard sang các component con. */}
          </section>

          <Footer />
        </main>
      </div>
    </div>
  );
}
