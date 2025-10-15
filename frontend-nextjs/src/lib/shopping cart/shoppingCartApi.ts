// src/api/shoppingCartApi.ts
// Updated to use fetchWithAuth (XSRF header + credentials: 'include') and to be Next.js friendly

import { ShoppingCartDTO } from "@/types/shoppingcart/cart";
import { fetchWithAuth, getCookie } from "@/lib/home/api";

// Dedicated base URL for Shopping Cart service
const SHOPPING_CART_BASE_URL =
  process.env.NEXT_PUBLIC_SHOPPING_CART_BASE_URL ||
  "http://localhost:8080/shopping-cart-service/api";

const normalizeBase = (apiBaseUrl?: string) =>
  (apiBaseUrl || SHOPPING_CART_BASE_URL).replace(/\/$/, "");

export async function fetchCart(
  apiBaseUrl: string | undefined,
  userId: string,
  headers?: Record<string, string>
): Promise<ShoppingCartDTO> {
  const base = normalizeBase(apiBaseUrl);
  const res = await fetchWithAuth(`${base}/carts/${encodeURIComponent(userId)}`, { headers });
  if (!res.ok) throw new Error(`Failed to load cart: ${res.status}`);
  return res.json();
}

export async function addItem(
  apiBaseUrl: string | undefined,
  userId: string,
  variantId: string,
  qty = 1,
  headers?: Record<string, string>
): Promise<ShoppingCartDTO> {
  const base = normalizeBase(apiBaseUrl);
  const xsrf = getCookie('XSRF-TOKEN');
  const mergedHeaders = {
    ...(headers ?? {}),
    "Content-Type": "application/json",
    ...(xsrf ? { "X-XSRF-TOKEN": xsrf } : {}),
  } as Record<string, string>;
  const res = await fetchWithAuth(`${base}/carts/${encodeURIComponent(userId)}/items`, {
    method: "POST",
    headers: mergedHeaders,
    body: JSON.stringify({ variantId, quantity: qty }),
  });
  if (!res.ok) throw new Error(`Add item failed ${res.status}`);
  return res.json();
}

export async function removeOne(
  apiBaseUrl: string | undefined,
  userId: string,
  variantId: string,
  headers?: Record<string, string>
): Promise<ShoppingCartDTO> {
  const base = normalizeBase(apiBaseUrl);
  const xsrf = getCookie('XSRF-TOKEN');
  const mergedHeaders = { ...(headers ?? {}), ...(xsrf ? { "X-XSRF-TOKEN": xsrf } : {}) } as Record<string, string>;
  const res = await fetchWithAuth(`${base}/carts/${encodeURIComponent(userId)}/items/${encodeURIComponent(variantId)}`, {
    method: "DELETE",
    headers: mergedHeaders,
  });
  if (!res.ok) throw new Error(`Remove one failed ${res.status}`);
  return res.json();
}

export async function removeCompletely(
  apiBaseUrl: string | undefined,
  userId: string,
  variantId: string,
  headers?: Record<string, string>
): Promise<ShoppingCartDTO> {
  const base = normalizeBase(apiBaseUrl);
  const xsrf = getCookie('XSRF-TOKEN');
  const mergedHeaders = { ...(headers ?? {}), ...(xsrf ? { "X-XSRF-TOKEN": xsrf } : {}) } as Record<string, string>;
  const res = await fetchWithAuth(`${base}/carts/${encodeURIComponent(userId)}/items/${encodeURIComponent(variantId)}/force`, {
    method: "DELETE",
    headers: mergedHeaders,
  });
  if (!res.ok) throw new Error(`Remove completely failed ${res.status}`);
  return res.json();
}

export async function updateQuantity(
  apiBaseUrl: string | undefined,
  userId: string,
  variantId: string,
  quantity: number,
  headers?: Record<string, string>
): Promise<ShoppingCartDTO> {
  const base = normalizeBase(apiBaseUrl);
  const xsrf = getCookie('XSRF-TOKEN');
  const mergedHeaders = {
    ...(headers ?? {}),
    "Content-Type": "application/json",
    ...(xsrf ? { "X-XSRF-TOKEN": xsrf } : {}),
  } as Record<string, string>;
  const res = await fetchWithAuth(`${base}/carts/${encodeURIComponent(userId)}/items`, {
    method: "PUT",
    headers: mergedHeaders,
    body: JSON.stringify({ variantId, quantity }),
  });
  if (!res.ok) throw new Error(`Update quantity failed ${res.status}`);
  return res.json();
}
