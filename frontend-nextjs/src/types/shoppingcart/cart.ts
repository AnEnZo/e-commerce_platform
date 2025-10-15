// src/types/cart.ts
export type CartItemDTO = {
  id?: string;
  variantId: string;
  productName?: string;
  productImageUrl?: string;
  shopName?: string;
  shopId?: string;
  color?: string;
  size?: string;
  quantity: number;
  createdAt?: string;
  updatedAt?: string;
  price?: number | string;
  unitPrice?: number | string;
  productPrice?: number | string;
  priceVnd?: number | string;
};

export type ShoppingCartDTO = {
  id?: string;
  userId?: string;
  items?: CartItemDTO[];
  createdAt?: string;
  updatedAt?: string;
};
