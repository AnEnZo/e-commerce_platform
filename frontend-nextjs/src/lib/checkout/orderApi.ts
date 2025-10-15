import { fetchWithAuth } from "@/lib/home/api";

export type CreateOrderItem = {
  productId: string;
  quantity: number;
  unitPrice: string; // send as string to avoid float issues
  totalPrice: string;
};

export type CreateOrderBody = {
  userId: string;
  shopId: string;
  receiverName: string;
  receiverPhone: string;
  addressId: string;
  note?: string;
  voucherShopCode?: string;
  voucherPlatformCode?: string;
  categoryId?: string;
  discountAmount?: string;
  totalAmount: string;
  items: CreateOrderItem[];
};

const DEFAULT_BASE = process.env.NEXT_PUBLIC_ORDER_BASE_URL || "http://localhost:8080/order-service/api";

function normalizeBase(base?: string) {
  return (base || DEFAULT_BASE).replace(/\/$/, "");
}

export async function createOrder(body: CreateOrderBody, apiBase?: string, headers?: Record<string, string>) {
  const base = normalizeBase(apiBase);
  const res = await fetchWithAuth(`${base}/orders`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(headers || {}),
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`Create order failed ${res.status}`);
  return res.json();
}
