'use client';

import { fetchWithAuth } from '@/lib/home/api';


export type UUID = string;

export type VoucherApplyRequest = {
  voucherShopId?: UUID | null;
  voucherPlatformId?: UUID | null;
  userId: string;
  orderAmount: string; // decimal string
  categoryId?: string | null;
};

export type VoucherApplyResponse = {
  success: boolean;
  message?: string;
  discountAmount?: string;
  finalAmount?: string;
};

export type PlatformVoucher = {
  id: string;
  code: string;
  title?: string;
  description?: string;
  minOrderAmount?: string;
  discountType?: 'PERCENT' | 'FIXED';
  discountValue?: string;
  startAt?: string;
  endAt?: string;
};

export type ShopVoucher = {
  id: string;
  code: string;
  title?: string;
  description?: string;
  minOrderAmount?: string;
  discountType?: 'PERCENT' | 'FIXED';
  discountValue?: string;
  startAt?: string;
  endAt?: string;
};

export type UserVoucherStatus = 'UNUSED' | 'USED' | 'EXPIRED';

export type UserVoucher = {
  id: string;
  platformVoucherId?: string | null;
  shopVoucherId?: string | null;
  userId: string;
  status: UserVoucherStatus;
  issuedAt?: string; // ISO datetime
  expireAt?: string; // ISO datetime
  usedAt?: string;   // ISO datetime
  voucherCode?: string;
  discountValue?: string; // decimal string
  discountType?: 'PERCENT' | 'FIXED' | string;
};

const DEFAULT_BASE = process.env.NEXT_PUBLIC_VOUCHER_BASE_URL || 'http://localhost:8080/voucher-service/api';

function baseUrl(apiBase?: string) {
  return (apiBase || DEFAULT_BASE).replace(/\/$/, '');
}

/**
 * Lấy tất cả vouchers của user
 * GET /api/user-vouchers/user/{userId}
 */
export async function listUserVouchers(userId: string, apiBase?: string) {
  const res = await fetchWithAuth(`${baseUrl(apiBase)}/user-vouchers/user/${encodeURIComponent(userId)}`, { method: 'GET' });
  if (!res.ok) throw new Error('Failed to load user vouchers');
  return res.json() as Promise<UserVoucher[]>;
}

/**
 * Shortcut: lấy vouchers chưa sử dụng
 * GET /api/user-vouchers/user/{userId}/unused
 */
export async function listUserUnusedVouchers(userId: string, apiBase?: string) {
  const res = await fetchWithAuth(`${baseUrl(apiBase)}/user-vouchers/user/${encodeURIComponent(userId)}/unused`, { method: 'GET' });
  if (!res.ok) throw new Error('Failed to load unused vouchers');
  return res.json() as Promise<UserVoucher[]>;
}

export async function listActivePlatformVouchers(apiBase?: string) {
  const res = await fetchWithAuth(`${baseUrl(apiBase)}/platform-vouchers/active`, { method: 'GET' });
  if (!res.ok) throw new Error('Failed to load platform vouchers');
  return res.json() as Promise<PlatformVoucher[]>;
}

export async function listActiveShopVouchers(shopId: string, apiBase?: string) {
  const res = await fetchWithAuth(`${baseUrl(apiBase)}/shop-vouchers/shop/${encodeURIComponent(shopId)}/active`, { method: 'GET' });
  if (!res.ok) throw new Error('Failed to load shop vouchers');
  return res.json() as Promise<ShopVoucher[]>;
}

export async function claimPlatformVoucher(voucherId: string, userId: string, apiBase?: string) {
  const url = `${baseUrl(apiBase)}/platform-vouchers/${encodeURIComponent(voucherId)}/claim?userId=${encodeURIComponent(userId)}`;
  const res = await fetchWithAuth(url, { method: 'POST' });
  if (!res.ok) throw new Error('Failed to claim platform voucher');
  return res.json();
}

export async function claimShopVoucher(voucherId: string, userId: string, apiBase?: string) {
  const url = `${baseUrl(apiBase)}/shop-vouchers/${encodeURIComponent(voucherId)}/claim?userId=${encodeURIComponent(userId)}`;
  const res = await fetchWithAuth(url, { method: 'POST' });
  if (!res.ok) throw new Error('Failed to claim shop voucher');
  return res.json();
}

export async function previewVoucher(req: VoucherApplyRequest, apiBase?: string) {
  const res = await fetchWithAuth(`${baseUrl(apiBase)}/user-vouchers/preview`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req),
  });
  if (!res.ok) throw new Error(`Preview voucher failed ${res.status}`);
  return res.json() as Promise<VoucherApplyResponse>;
}

