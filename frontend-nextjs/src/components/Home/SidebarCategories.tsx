'use client';

import React from 'react';
import { ALL_CATEGORIES } from '@/components/Home/constants';

export default function SidebarCategories({ onClick }: { onClick: (name: string) => void }) {
  return (
    <aside className="w-60">
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="bg-orange-500 text-white p-3 font-semibold">📂 DANH MỤC</div>
        <div className="max-h-96 overflow-y-auto">
          {ALL_CATEGORIES.map((cat, index) => (
            <button key={index} className="w-full text-left px-4 py-2 hover:bg-orange-50 hover:text-orange-600 transition-colors border-b border-gray-100 flex items-center space-x-2" onClick={() => onClick(cat.name)}>
              <div className={`w-6 h-6 rounded text-sm flex items-center justify-center ${cat.color}`}>{cat.icon}</div>
              <span className="text-sm">{cat.name}</span>
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}