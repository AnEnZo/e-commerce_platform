// src/lib/api.ts
import { BASE_URL } from '@/components/Home/constants';

/* Legacy no-op token helpers kept */
export function setToken(_token: string | null) { return; }
export function getToken() { return null; }

export function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match('(^|;)\\s*' + name + '\\s*=\\s*([^;]+)');
  return match ? decodeURIComponent(match[2]) : null;
}

/**
 * fetchWithAuth
 * - thêm header X-XSRF-TOKEN nếu cookie XSRF-TOKEN tồn tại (cookie phải non-HttpOnly)
 * - luôn gửi credentials: 'include' (để kèm cookie HttpOnly session)
 * - hợp nhất headers từ init và từ overrides nếu truyền vào
 */
export async function fetchWithAuth(input: RequestInfo | URL, init: RequestInit = {}): Promise<Response> {
  const headers = new Headers(init.headers || {});
  // Attach XSRF token header if present
  const xsrf = getCookie('XSRF-TOKEN');
  if (xsrf) headers.set('X-XSRF-TOKEN', xsrf);

  const merged: RequestInit = {
    ...init,
    headers,
    credentials: 'include' as RequestCredentials,
  };

  return fetch(input, merged);
}

/* --- Updated API functions that use fetchWithAuth (example helpers kept) --- */
export async function getFilters(headers?: Record<string, string>) {
  const res = await fetchWithAuth(`${BASE_URL}/search/filters`, { headers });
  if (!res.ok) throw new Error('Failed to load filters');
  return res.json();
}

/* ... (các hàm getProducts, getProductById, advancedSearch của bạn vẫn giữ nguyên) ... */


export async function getProducts(
  params: { page?: number; size?: number; sortBy?: string; sortDir?: string } = {},
  headers?: Record<string, string>
) {
  const { page = 0, size = 12, sortBy = 'salesCount', sortDir = 'desc' } = params;
  const url = `${BASE_URL}?page=${page}&size=${size}&sortBy=${encodeURIComponent(sortBy)}&sortDir=${encodeURIComponent(sortDir)}`;
  const res = await fetchWithAuth(url, { headers });
  if (!res.ok) throw new Error('Failed to load products');
  return res.json();
}

export async function getProductsByCategory(
  categoryName: string,
  params: { page?: number; size?: number; sortBy?: string; sortDir?: string } = {},
  headers?: Record<string, string>
) {
  const { page = 0, size = 12, sortBy = 'salesCount', sortDir = 'desc' } = params;
  const url = `${BASE_URL}/category/${encodeURIComponent(categoryName)}?page=${page}&size=${size}&sortBy=${encodeURIComponent(sortBy)}&sortDir=${encodeURIComponent(sortDir)}`;
  const res = await fetchWithAuth(url, { headers });
  if (!res.ok) throw new Error('Failed to load category products');
  return res.json();
}

export async function advancedSearch(
  criteria: unknown,
  params: { page?: number; size?: number; sortBy?: string; sortDir?: string } = {},
  headers?: Record<string, string>
) {
  const { page = 0, size = 12, sortBy = 'salesCount', sortDir = 'desc' } = params;
  const url = `${BASE_URL}/search/advanced?page=${page}&size=${size}&sortBy=${encodeURIComponent(sortBy)}&sortDir=${encodeURIComponent(sortDir)}`;
  const res = await fetchWithAuth(url, {
    method: 'POST',
    headers: { ...(headers ?? {}), 'Content-Type': 'application/json' },
    body: JSON.stringify(criteria)
  });
  if (!res.ok) throw new Error('Advanced search failed');
  return res.json();
}

export async function getProductById(id: string, headers?: Record<string, string>) {
  const res = await fetchWithAuth(`${BASE_URL}/${encodeURIComponent(id)}`, { headers });
  if (!res.ok) throw new Error('Failed to load product');
  return res.json();
}

export async function addItemToCart(userId: string, item: CartItemDTO, headers?: Record<string,string>) {
  if (!userId) throw new Error('Missing userId');
  const url = `http://localhost:8080/shopping-cart-service/api/carts/${encodeURIComponent(userId)}/items`;
  const res = await fetchWithAuth(url, {
    method: 'POST',
    headers: { ...(headers ?? {}), 'Content-Type': 'application/json' },
    body: JSON.stringify(item),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Failed to add item to cart: ${res.status} ${res.statusText} ${text}`);
  }
  return res.json(); // giả định backend trả về ShoppingCartDTO
}