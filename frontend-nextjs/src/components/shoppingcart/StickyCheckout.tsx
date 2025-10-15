// src/components/StickyCheckout.tsx
import React from "react";

type Props = {
  itemsCount: number;
  totals: { totalAmount: number; count: number };
  selectAll: boolean;
  onToggleSelectAll: () => void;
  onDeleteSelected: () => void;
  onCheckout: () => void;
};

export default function StickyCheckout({ itemsCount, totals, selectAll, onToggleSelectAll, onDeleteSelected, onCheckout }: Props) {
  function formatVnd(amount: number) {
    return "₫" + amount.toLocaleString();
  }

  return (
    <div className="sticky-checkout bg-white border-t bottom-0">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <input id="select-all-bottom" type="checkbox" checked={selectAll} onChange={onToggleSelectAll} className="checkbox-custom" />
            <label htmlFor="select-all-bottom" className="text-sm">Chọn Tất Cả ({itemsCount})</label>
            <button className="text-sm text-gray-600 hover:text-gray-800" onClick={onDeleteSelected}>Xóa</button>
            <button className="text-sm text-shopee-orange hover:text-red-600">Lưu vào mục Đã thích</button>
          </div>

          <div className="flex items-center space-x-6">
            <div className="text-right">
              <div className="text-sm text-gray-600">
                Tổng thanh toán ({totals.count} sản phẩm):
                <span className="text-2xl text-shopee-orange font-medium ml-2">{formatVnd(totals.totalAmount)}</span>
              </div>
            </div>
            <button className="bg-orange-500 text-black px-12 py-3 rounded-sm font-medium text-sm hover:bg-red-600 transition-colors" onClick={onCheckout}>Mua Hàng</button>
          </div>
        </div>
      </div>
    </div>
  );
}
