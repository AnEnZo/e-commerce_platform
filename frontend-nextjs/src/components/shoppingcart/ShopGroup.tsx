// src/components/ShopGroup.tsx
import React, { JSX } from "react";
import { CartItemDTO } from "@/types/shoppingcart/cart";
import CartItem from "./CartItem";

type Props = {
  shopName: string;
  items: CartItemDTO[];
  selectedSet: Set<string>;
  onToggleItem: (item: CartItemDTO) => void;
  onToggleShop: (shopName: string) => void;
  onIncrease: (item: CartItemDTO) => void;
  onDecrease: (item: CartItemDTO) => void;
  onRemove: (item: CartItemDTO) => void;
  onManualChange: (item: CartItemDTO, raw: string) => void;
  // Không dùng `any` nữa — Partial vì CartItem có thể thiếu vài trường
  getItemPrice: (i: Partial<CartItemDTO>) => number;
};

export default function ShopGroup({
  shopName,
  items,
  selectedSet,
  onToggleItem,
  onToggleShop,
  onIncrease,
  onDecrease,
  onRemove,
  onManualChange,
  getItemPrice,
}: Props): JSX.Element {
  const allSelected = items.length > 0 && items.every((i) => selectedSet.has(i.variantId));

  return (
    <div className="bg-white rounded-sm shadow-sm mb-3">
      <div className="px-5 py-4 border-b border-gray-100">
        <div className="flex items-center space-x-3">
          <input
            type="checkbox"
            className="checkbox-custom shop-checkbox"
            checked={allSelected}
            onChange={() => onToggleShop(shopName)}
          />
          <div className="flex items-center space-x-2">
            <span className="text-shopee-orange">🏪</span>
            <span className="font-medium">{shopName}</span>
            <span className="shop-badge text-white text-xs px-2 py-1 rounded-sm">Mall</span>
          </div>
          <button className="text-shopee-orange text-sm hover:text-red-600 ml-auto">💬 Chat Ngay</button>
        </div>
      </div>

      {items.map((it) => (
        <CartItem
          key={it.variantId}
          item={it}
          selected={selectedSet.has(it.variantId)}
          onToggle={onToggleItem}
          onIncrease={onIncrease}
          onDecrease={onDecrease}
          onRemove={onRemove}
          onManualChange={onManualChange}
          getItemPrice={getItemPrice}
        />
      ))}
    </div>
  );
}
