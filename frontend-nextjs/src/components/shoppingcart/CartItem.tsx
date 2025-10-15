// src/components/CartItem.tsx
import React, { JSX } from "react";
import { CartItemDTO } from "@/types/shoppingcart/cart";

type Props = {
  item: CartItemDTO;
  selected: boolean;
  onToggle: (item: CartItemDTO) => void;
  onIncrease: (item: CartItemDTO) => void;
  onDecrease: (item: CartItemDTO) => void;
  onRemove: (item: CartItemDTO) => void;
  onManualChange: (item: CartItemDTO, raw: string) => void;
  // Không dùng `any` nữa — cho phép Partial để linh hoạt nếu thiếu trường
  getItemPrice: (item: Partial<CartItemDTO>) => number;
};

export default function CartItem({
  item,
  selected,
  onToggle,
  onIncrease,
  onDecrease,
  onRemove,
  onManualChange,
  getItemPrice,
}: Props): JSX.Element {
  const price = getItemPrice(item);
  const qty = typeof item.quantity === "number" ? item.quantity : 0;
  const total = price * qty;

  function formatVnd(amount: number) {
    return "₫" + amount.toLocaleString();
  }

  return (
    <div
      className="bg-white border border-gray-200 rounded-lg mb-3 px-4 py-4 hover:shadow-md transition-shadow hover:bg-gray-50"
      style={{ boxShadow: "0 1px 2px rgba(16,24,40,0.03)" }}
    >
      <div className="flex items-center">
        <div className="flex items-center space-x-4 flex-1">
          <input
            type="checkbox"
            className="checkbox-custom item-checkbox"
            checked={selected}
            onChange={() => onToggle(item)}
          />
          <div className="product-image bg-gray-100 rounded flex items-center justify-center text-3xl w-20 h-20 overflow-hidden">
            {item.productImageUrl ? (
              // giữ <img> vì bạn đang dùng client-side rendering
              <img
                src={item.productImageUrl}
                alt={item.productName || "image"}
                className="w-full h-full object-cover rounded"
              />
            ) : (
              <span>📦</span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-normal text-gray-800 mb-1 line-clamp-2">
              {item.productName}
            </h3>
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-xs text-gray-500">Phân loại hàng:</span>
              <span className="text-xs text-gray-700">
                {item.color ? `Màu: ${item.color}` : ''}
                {item.color && item.size ? ' • ' : ''}
                {item.size ? `Size: ${item.size}` : ''}
                {(!item.color && !item.size) ? (item.id || item.variantId) : ''}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="bg-shopee-orange text-white text-xs px-1 py-0.5 rounded-sm">
                Yêu thích
              </span>
              <span className="bg-green-500 text-white text-xs px-1 py-0.5 rounded-sm">
                7 ngày trả hàng
              </span>
            </div>
          </div>
        </div>

        <div className="hidden md:flex items-center">
          <div className="w-32 text-center ml-20">
            <div className="text-gray-400 text-xs line-through">{formatVnd(Math.round(price * 1.3))}</div>
            <div className="text-shopee-orange font-medium">{formatVnd(price)}</div>
          </div>

          <div className="w-32 flex items-center justify-center ml-8">
            <button
              type="button"
              className="quantity-btn rounded-l"
              aria-label="Giảm số lượng"
              onClick={(e) => {
                e.preventDefault();
                onDecrease(item);
              }}
            >
              -
            </button>
            <input
              type="number"
              value={qty}
              min={0}
              onChange={(e) => onManualChange(item, e.target.value)}
              className="quantity-input w-12 h-8 text-center border-t border-b border-gray-300 text-sm"
            />
            <button
              type="button"
              className="quantity-btn rounded-r"
              aria-label="Tăng số lượng"
              onClick={(e) => {
                e.preventDefault();
                onIncrease(item);
              }}
            >
              +
            </button>
          </div>

          <div className="w-32 text-center ml-8">
            <div className="text-shopee-orange font-medium">{formatVnd(total)}</div>
          </div>

          <div className="w-20 text-center ml-8">
            <button className="text-red-500 hover:text-red-700 text-sm" onClick={() => onRemove(item)}>
              Xóa
            </button>
          </div>
        </div>
      </div>

      {/* Mobile layout */}
      <div className="md:hidden mt-3 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="text-shopee-orange font-medium">₫{total.toLocaleString()}</div>
          <div className="text-gray-400 text-sm line-through">₫{Math.round(price * 1.3).toLocaleString()}</div>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex items-center">
            <button
              type="button"
              className="quantity-btn rounded-l"
              aria-label="Giảm số lượng"
              onClick={(e) => {
                e.preventDefault();
                onDecrease(item);
              }}
            >
              -
            </button>
            <input
              type="number"
              value={qty}
              min={0}
              onChange={(e) => onManualChange(item, e.target.value)}
              className="quantity-input w-12 h-8 text-center border-t border-b border-gray-300 text-sm"
            />
            <button
              type="button"
              className="quantity-btn rounded-r"
              aria-label="Tăng số lượng"
              onClick={(e) => {
                e.preventDefault();
                onIncrease(item);
              }}
            >
              +
            </button>
          </div>
          <button className="text-red-500 hover:text-red-700 text-sm" onClick={() => onRemove(item)}>
            Xóa
          </button>
        </div>
      </div>
    </div>
  );
}
