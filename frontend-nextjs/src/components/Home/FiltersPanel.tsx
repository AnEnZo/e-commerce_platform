'use client';

import React from 'react';
import type { SearchCriteria } from '@/types/Home/types';


export default function FiltersPanel({ criteria, setCriteria, onApply, onReset, categories }: { criteria: SearchCriteria; setCriteria: (c: SearchCriteria) => void; onApply: () => void; onReset: () => void; categories: string[]; }) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-semibold">BỘ LỌC TÌM KIẾM</h4>
        <button
            className="text-sm text-gray-500 hover:text-gray-700 border border-gray-400 rounded px-3 py-1"
            onClick={onReset}
          >
            Reset
          </button>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Theo Danh Mục</label>
          <select value={criteria.categoryName || ''} onChange={(e) => setCriteria({ ...criteria, categoryName: e.target.value || undefined })} className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500">
            <option value=""></option>
            {categories.map((c, i) => <option key={i} value={c}>{c}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Khoảng Giá</label>
          <div className="flex gap-2">
            <input type="number" placeholder="₫ TỪ" value={criteria.minPrice ?? ''} onChange={(e) => setCriteria({ ...criteria, minPrice: e.target.value ? Number(e.target.value) : null })} className="w-1/2 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm" />
            <input type="number" placeholder="₫ ĐẾN" value={criteria.maxPrice ?? ''} onChange={(e) => setCriteria({ ...criteria, maxPrice: e.target.value ? Number(e.target.value) : null })} className="w-1/2 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Đánh Giá</label>
          <div className="space-y-2">
            {[5,4,3,2,1].map(r => (
              <button key={r} className={`w-full text-left px-3 py-2 rounded border text-sm ${criteria.minRating === r ? 'border-orange-500 bg-orange-50 text-orange-600' : 'border-gray-300 hover:border-orange-300'}`} onClick={() => setCriteria({ ...criteria, minRating: criteria.minRating === r ? null : r })}>{'⭐'.repeat(r)} trở lên</button>
            ))}
          </div>
        </div>

        <div>
          <label className="flex items-center"><input type="checkbox" checked={criteria.inStockOnly || false} onChange={(e) => setCriteria({ ...criteria, inStockOnly: e.target.checked })} className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded mr-2" /> <span className="text-sm text-gray-700">Còn hàng</span></label>
        </div>

        <button onClick={onApply} className="w-full bg-orange-500 text-white py-3 px-4 rounded-md hover:bg-orange-600 transition-colors font-medium">ÁP DỤNG</button>
      </div>
    </div>
  );
}