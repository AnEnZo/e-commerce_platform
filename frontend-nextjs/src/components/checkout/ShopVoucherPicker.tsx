'use client';

import React, { useEffect, useState } from 'react';
import {
  listActivePlatformVouchers,
  listActiveShopVouchers,
  claimPlatformVoucher,
  claimShopVoucher,
  previewVoucher,
  listUserUnusedVouchers,
  PlatformVoucher,
  ShopVoucher,
  UserVoucher as ApiUserVoucher,
  VoucherApplyResponse,
} from '@/lib/checkout/voucherApi';

type Props = {
  userId: string;
  shopId?: string | null;
  shopName: string;
  orderAmount: number;
  onSelected: (ids: { platformId?: string | null; shopId?: string | null }, preview?: VoucherApplyResponse | null) => void;
};

export default function ShopVoucherPicker({ userId, shopId, shopName, orderAmount, onSelected }: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [platformVouchers, setPlatformVouchers] = useState<PlatformVoucher[]>([]);
  const [shopVouchers, setShopVouchers] = useState<ShopVoucher[]>([]);
  const [userVouchers, setUserVouchers] = useState<ApiUserVoucher[]>([]);
  const [selectedPlatformId, setSelectedPlatformId] = useState<string | null>(null);
  const [selectedShopId, setSelectedShopId] = useState<string | null>(null);
  const [preview, setPreview] = useState<VoucherApplyResponse | null>(null);
  const [claimingId, setClaimingId] = useState<string | null>(null);

  async function openPicker() {
    setOpen(true);
    setLoading(true);
    try {
      const [platform, shop, userOwned] = await Promise.all([
        listActivePlatformVouchers(),
        shopId ? listActiveShopVouchers(shopId) : Promise.resolve([]),
        userId ? listUserUnusedVouchers(userId) : Promise.resolve([]),
      ]);
      setPlatformVouchers(platform || []);
      setShopVouchers(shop || []);
      setUserVouchers(userOwned || []);
    } finally {
      setLoading(false);
    }
  }

  async function handleClaim(type: 'platform' | 'shop', voucherId: string) {
    try {
      setClaimingId(voucherId);
      if (type === 'platform') await claimPlatformVoucher(voucherId, userId);
      else await claimShopVoucher(voucherId, userId);
      // refresh user's owned vouchers after claiming
      const owned = await listUserUnusedVouchers(userId);
      setUserVouchers(owned || []);
      alert('Đã nhận voucher');
    } catch (e: any) {
      const msg = e?.message || 'Nhận voucher thất bại';
      alert(msg);
    } finally {
      setClaimingId(null);
    }
  }

  async function handlePreview(nextPlatformId: string | null, nextShopId: string | null) {
    if (!userId) return;
    try {
      // previewVoucher expects voucherPlatformId / voucherShopId (UUIDs)
      const res = await previewVoucher({
        voucherPlatformId: nextPlatformId || undefined,
        voucherShopId: nextShopId || undefined,
        userId,
        orderAmount: String(orderAmount || 0),
      });
      setPreview(res);
    } catch (e) {
      console.warn('preview failed', e);
      setPreview(null);
    }
  }

  // call preview when selection changes
  useEffect(() => {
    if (open) {
      handlePreview(selectedPlatformId, selectedShopId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPlatformId, selectedShopId, orderAmount, open]);

  function toggleSelectPlatform(id: string) {
    setSelectedPlatformId(prev => (prev === id ? null : id));
  }

  function toggleSelectShop(id: string) {
    setSelectedShopId(prev => (prev === id ? null : id));
  }

  // when user clicks "Áp dụng" on one of their owned vouchers
  async function applyOwnedVoucher(v: ApiUserVoucher) {
    // prefer platform -> shop depending on fields available in user voucher
    const platformId = v.platformVoucherId || null;
    const shopIdSelected = v.shopVoucherId || null;
    setSelectedPlatformId(platformId);
    setSelectedShopId(shopIdSelected);
    // call preview and keep result
    await handlePreview(platformId, shopIdSelected);
  }

  function applyAndClose() {
    onSelected({ platformId: selectedPlatformId, shopId: selectedShopId }, preview);
    setOpen(false);
  }

  function clearSelection() {
    setSelectedPlatformId(null);
    setSelectedShopId(null);
    setPreview(null);
  }

  return (
    <div>
      <button onClick={openPicker} className="text-sm text-orange-600 hover:underline">Chọn voucher</button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold">Voucher cho {shopName}</h3>
              <button onClick={() => setOpen(false)} className="text-gray-500 hover:text-gray-700">✕</button>
            </div>

            {loading ? (
              <div className="p-6 text-center">Đang tải...</div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Platform vouchers (active) */}
                <div>
                  <h4 className="text-sm font-medium mb-2">Voucher toàn sàn</h4>
                  <div className="space-y-2 max-h-52 overflow-auto pr-1">
                    {platformVouchers.map(v => (
                      <div key={v.id} className={`border rounded p-3 flex items-center justify-between ${selectedPlatformId === v.id ? 'border-orange-500 bg-orange-50' : 'border-gray-200'}`}>
                        <div>
                          <div className="font-medium">{v.title || v.code}</div>
                          <div className="text-xs text-gray-500">{v.description}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button onClick={() => toggleSelectPlatform(v.id)} className="text-xs px-2 py-1 rounded border">{selectedPlatformId === v.id ? 'Bỏ chọn' : 'Chọn'}</button>
                          <button onClick={() => handleClaim('platform', v.id)} disabled={claimingId === v.id} className="text-xs px-2 py-1 rounded bg-orange-500 text-white">
                            {claimingId === v.id ? 'Đang...' : 'Claim'}
                          </button>
                        </div>
                      </div>
                    ))}
                    {platformVouchers.length === 0 && <div className="text-sm text-gray-500">Không có voucher</div>}
                  </div>
                </div>

                {/* Shop vouchers (active) */}
                <div>
                  <h4 className="text-sm font-medium mb-2">Voucher của shop</h4>
                  {shopId ? (
                    <div className="space-y-2 max-h-52 overflow-auto pr-1">
                      {shopVouchers.map(v => (
                        <div key={v.id} className={`border rounded p-3 flex items-center justify-between ${selectedShopId === v.id ? 'border-orange-500 bg-orange-50' : 'border-gray-200'}`}>
                          <div>
                            <div className="font-medium">{v.title || v.code}</div>
                            <div className="text-xs text-gray-500">{v.description}</div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button onClick={() => toggleSelectShop(v.id)} className="text-xs px-2 py-1 rounded border">{selectedShopId === v.id ? 'Bỏ chọn' : 'Chọn'}</button>
                            <button onClick={() => handleClaim('shop', v.id)} disabled={claimingId === v.id} className="text-xs px-2 py-1 rounded bg-orange-500 text-white">
                              {claimingId === v.id ? 'Đang...' : 'Claim'}
                            </button>
                          </div>
                        </div>
                      ))}
                      {shopVouchers.length === 0 && <div className="text-sm text-gray-500">Không có voucher</div>}
                    </div>
                  ) : (
                    <div className="text-sm text-gray-500">Không xác định shopId — không thể tải voucher shop</div>
                  )}
                </div>

                {/* User owned vouchers */}
                <div>
                  <h4 className="text-sm font-medium mb-2">Voucher của bạn</h4>
                  <div className="space-y-2 max-h-52 overflow-auto pr-1">
                    {userVouchers.map(uv => (
                      <div key={uv.id} className={`border rounded p-3 flex items-center justify-between ${((uv.platformVoucherId && selectedPlatformId === uv.platformVoucherId) || (uv.shopVoucherId && selectedShopId === uv.shopVoucherId)) ? 'border-orange-500 bg-orange-50' : 'border-gray-200'}`}>
                        <div>
                          <div className="font-medium">{uv.voucherCode || (uv.platformVoucherId || uv.shopVoucherId)}</div>
                          <div className="text-xs text-gray-500">{uv.discountValue ? `Giảm ${uv.discountValue}` : ''}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button onClick={() => applyOwnedVoucher(uv)} className="text-xs px-2 py-1 rounded border">Áp dụng</button>
                        </div>
                      </div>
                    ))}
                    {userVouchers.length === 0 && <div className="text-sm text-gray-500">Bạn chưa có voucher khả dụng</div>}
                  </div>
                </div>
              </div>
            )}

            <div className="mt-4 flex items-center justify-between">
              <div className="text-sm text-gray-600">
                {preview ? (
                  preview.success ? (
                    <span>
                      Tạm tính sau áp: <span className="font-semibold text-orange-600">{preview.finalAmount}</span> (giảm {preview.discountAmount})
                    </span>
                  ) : (
                    <span className="text-red-600">{preview.message || 'Không thể áp voucher'}</span>
                  )
                ) : (
                  <span className="text-gray-500">Chưa có preview</span>
                )}
              </div>

              <div className="flex gap-2">
                <button onClick={clearSelection} className="px-3 py-2 border rounded">Xóa chọn</button>
                <button onClick={applyAndClose} className="px-3 py-2 bg-orange-600 text-white rounded">Áp dụng</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
