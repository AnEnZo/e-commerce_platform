/* src/pages/CheckoutPage.tsx */
import React, { useEffect, useMemo, useState } from 'react';
import AddressSection from '@/components/checkout/AddressSection';
import ProductList from '@/components/checkout/ProductList';
import ShopVoucherPicker from '@/components/checkout/ShopVoucherPicker';
import PaymentSection from '@/components/checkout/PaymentSection';
import OrderSummary from '@/components/checkout/OrderSummary';
import { CartItem, Address, PaymentMethod } from '@/types/checkout';
import { authService } from '@/services/authService';
import { useShoppingCart } from '@/hooks/shoppingcart/useShoppingCart';
import { createOrder } from '@/lib/checkout/orderApi';
import { initiatePayment } from '@/lib/checkout/paymentApi';
import { useRouter } from 'next/navigation';
import { groupBy } from '@/utils/groupBy';

const ORDER_SHOP_ID = process.env.NEXT_PUBLIC_DEFAULT_SHOP_ID || '';

const CheckoutPage: React.FC = () => {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  // per-shop selected voucher codes
  const [selectedPlatformByGroup, setSelectedPlatformByGroup] = useState<Record<string, string | null>>({});
  const [selectedShopByGroup, setSelectedShopByGroup] = useState<Record<string, string | null>>({});
  const [previewByGroup, setPreviewByGroup] = useState<Record<string, { finalAmount?: string; discountAmount?: string; success?: boolean; message?: string }>>({});
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod>({ id: 'momo', name: 'Ví MoMo', icon: '🍑', description: 'Thanh toán qua ví điện tử MoMo', type: 'MOMO' });
  const [loading, setLoading] = useState(false);

  // Prefer items passed from cart via sessionStorage; fallback to cart hook if none
  const { getItemPrice } = useShoppingCart({ userId: userId ?? undefined });
  const [passedItems, setPassedItems] = useState<CartItem[]>([]);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem('checkoutItems');
      if (raw) {
        const parsed = JSON.parse(raw) as { items: Array<{ id: string; name: string; image: string; quantity: number; price: number; shopName: string; shopId?: string }>; ts: number };
        const items = (parsed.items || []).map(i => ({ ...i, selected: true }));
        setPassedItems(items);
      }
    } catch {}
  }, []);

  useEffect(() => {
    const checkAuthentication = async () => {
      try {
        setAuthLoading(true);
        const authResponse = await authService.validateToken();
        if (authResponse.valid && authResponse.userID) {
          setIsAuthenticated(true);
          setUserId(authResponse.userID);
        } else {
          setIsAuthenticated(false);
          setUserId(null);
        }
      } catch (error) {
        console.error('Authentication error:', error);
        setIsAuthenticated(false);
        setUserId(null);
      } finally {
        setAuthLoading(false);
      }
    };
    checkAuthentication();
  }, []);

  const itemsForDisplay: CartItem[] = useMemo(() => passedItems, [passedItems]);

  const itemsByShop = useMemo(() => {
    const map = new Map<string, { key: string; shopName: string; shopId?: string; items: CartItem[] }>();
    for (const it of itemsForDisplay) {
      const key = `${it.shopId || 'unknown'}::${it.shopName || 'Shop'}`;
      if (!map.has(key)) {
        map.set(key, { key, shopName: it.shopName || 'Shop', shopId: it.shopId, items: [] });
      }
      map.get(key)!.items.push(it);
    }
    return map;
  }, [itemsForDisplay]);

  const groupedItems = useMemo(() => {
    return groupBy(passedItems, 'shopId');
  }, [passedItems]);

  const calculateShopTotal = (shopId: string) => {
    const items = groupedItems[shopId] || [];
    return items.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const handleVoucherError = (shopId: string, message: string) => {
    setPreviewByGroup(prev => ({
      ...prev,
      [shopId]: {
        ...prev[shopId],
        success: false,
        message,
      },
    }));
  };

  const shippingFee = 30000;

  function handleSelectedVoucher(groupKey: string, codes: { platform?: string | null; shop?: string | null }, preview?: { finalAmount?: string; discountAmount?: string; success?: boolean; message?: string } | null) {
    setSelectedPlatformByGroup(prev => ({ ...prev, [groupKey]: codes.platform ?? null }));
    setSelectedShopByGroup(prev => ({ ...prev, [groupKey]: codes.shop ?? null }));
    if (preview) setPreviewByGroup(prev => ({ ...prev, [groupKey]: preview }));
  }

  function parseMoney(value?: string | number | null): number {
    if (typeof value === 'number') return isFinite(value) ? value : 0;
    if (!value) return 0;
    const n = parseFloat(String(value).replace(/[,\s]/g, ''));
    return isNaN(n) ? 0 : n;
  }

  const totalDiscountFromVouchers = useMemo(() => {
    return Object.values(previewByGroup).reduce((sum, p) => sum + parseMoney(p?.discountAmount), 0);
  }, [previewByGroup]);

  const appliedVouchers = useMemo(() => {
    if (totalDiscountFromVouchers <= 0) return [];
    return [
      {
        id: 'applied-voucher',
        title: 'Voucher đã áp dụng',
        description: 'Giảm theo mã đã chọn',
        discount: totalDiscountFromVouchers,
        minOrder: 0,
        type: 'FIXED' as const,
        expireAt: new Date().toISOString(),
      },
    ];
  }, [totalDiscountFromVouchers]);

  async function handlePlaceOrder() {
    if (!userId) return alert('Vui lòng đăng nhập để đặt hàng');
    if (!selectedAddress) return alert('Vui lòng chọn địa chỉ giao hàng');
    if (itemsForDisplay.length === 0) return alert('Không có sản phẩm nào được chọn');

    setLoading(true);
    try {
      const ordersByShop = Array.from(itemsByShop.values());
      const orderPromises = ordersByShop.map(async (shopGroup) => {
        const groupSubtotal = shopGroup.items.reduce((s, i) => s + i.price * i.quantity, 0);
        const groupPreview = previewByGroup[shopGroup.key];
        const groupDiscount = parseMoney(groupPreview?.discountAmount);
        const groupFinal = Math.max(0, groupSubtotal - groupDiscount + shippingFee);

        const orderItems = shopGroup.items.map(i => ({
          productId: i.id,
          quantity: i.quantity,
          unitPrice: String(i.price),
          totalPrice: String(i.price * i.quantity),
        }));

        const orderBody = {
          userId,
          shopId: shopGroup.shopId || ORDER_SHOP_ID,
          receiverName: selectedAddress.receiverName,
          receiverPhone: selectedAddress.phoneNumber,
          addressId: selectedAddress.id,
          note: '',
          totalAmount: String(groupFinal),
          voucherShopCode: selectedShopByGroup[shopGroup.key] || undefined,
          voucherPlatformCode: selectedPlatformByGroup[shopGroup.key] || undefined,
          discountAmount: String(groupDiscount),
          shippingFee: String(shippingFee),
          items: orderItems,
          paymentMethod: selectedPaymentMethod.type,
        };

        const order = await createOrder(orderBody);
        return order;
      });

      const createdOrders = await Promise.all(orderPromises);
      const orderIds = createdOrders.map(order => order.id).filter(Boolean);

      if (orderIds.length === 0) {
        throw new Error('Không thể tạo đơn hàng');
      }

      const totalAmount = ordersByShop.reduce((total, shopGroup) => {
        const groupSubtotal = shopGroup.items.reduce((s, i) => s + i.price * i.quantity, 0);
        const groupPreview = previewByGroup[shopGroup.key];
        const groupDiscount = parseMoney(groupPreview?.discountAmount);
        return total + Math.max(0, groupSubtotal - groupDiscount + shippingFee);
      }, 0);

      // khi tạo payment
      if (selectedPaymentMethod.type === 'MOMO') {
        try {
          const payResp = await initiatePayment({
            orderIds, // <-- gửi mảng order ids (backend DTO hỗ trợ List<UUID>)
            amount: String(totalAmount),
            currency: 'VND', // hoặc 'EUR' tuỳ nhu cầu
            payerMessage: `Thanh toán ${orderIds.length} đơn hàng`,
            payeeNote: orderIds.join(','),
            partnerClientId: 'web',
          });

          if (payResp?.paymentId) {
            // Nếu backend trả qrCodeUrl thì chuyển sang trang hiển thị QR
            router.push(`/checkout/payment?paymentId=${encodeURIComponent(payResp.paymentId)}&orderIds=${encodeURIComponent(orderIds.join(','))}`);
            return;
          } else {
            throw new Error('Backend không trả paymentId');
          }
        } catch (e: any) {
          // đã tạo order nhưng tạo payment fail
          const msg = e?.message || 'Tạo thanh toán thất bại';
          alert(`Đã tạo đơn hàng, nhưng ${msg}. Bạn có thể thanh toán lại trong phần đơn hàng.`);
          router.push('/orders');
          return;
        }
      }else if (selectedPaymentMethod.type === 'COD') {
        alert('Đặt hàng thành công!');
        router.push('/orders');
        return;
      }
    } catch (err) {
      console.error(err);
      const msg = (err as any)?.message || 'Có lỗi xảy ra';
      alert(`Đặt hàng thất bại: ${msg}`);
    } finally {
      setLoading(false);
    }
  }

  if (authLoading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="text-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div><p className="mt-4 text-gray-600">Đang xác thực...</p></div></div>
  );

  if (!isAuthenticated || !userId) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center"><h2 className="text-xl font-semibold mb-4">Vui lòng đăng nhập</h2><p className="text-gray-600 mb-6">Bạn cần đăng nhập để tiếp tục thanh toán</p><button onClick={() => window.location.href = '/login'} className="bg-orange-500 text-white py-2 px-6 rounded-lg">Đăng nhập</button></div></div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <nav className="text-sm text-gray-500">
            <button
              type="button"
              onClick={() => (window.location.href = '/cart')}
              className="hover:text-orange-600 transition-colors"
            >
              Giỏ Hàng
            </button>
            <span className="mx-2 text-gray-300">/</span>
            <span className="text-orange-600 font-medium">Thanh Toán</span>
          </nav>
          <h1 className="mt-3 text-2xl sm:text-3xl font-bold tracking-tight text-gray-900">
            Thanh Toán
          </h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <AddressSection userId={userId} onSelectAddress={(a) => setSelectedAddress(a)} />
            {/* Render per-shop product lists */}
            {Array.from(itemsByShop.values()).map((group) => (
              <div key={group.key} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600 font-medium">{group.shopName}</div>
                  <div className="text-xs text-gray-500">
                    {previewByGroup[group.key]?.success ? (
                      <span>Giảm {previewByGroup[group.key]?.discountAmount} • Sau áp {previewByGroup[group.key]?.finalAmount}</span>
                    ) : null}
                  </div>
                </div>
                <ProductList items={group.items} />
                <div>
                  <ShopVoucherPicker
                    userId={userId!}
                    shopId={group.shopId}
                    shopName={group.shopName}
                    orderAmount={group.items.reduce((s, i) => s + i.price * i.quantity, 0)}
                    onSelected={(codes, preview) => handleSelectedVoucher(group.key, codes, preview || undefined)}
                  />
                </div>
              </div>
            ))}
            <PaymentSection methods={[
              { id: 'momo', name: 'Ví MoMo', icon: '🍑', description: 'Thanh toán qua ví điện tử MoMo', type: 'MOMO' },
              { id: 'bank', name: 'Chuyển khoản ngân hàng', icon: '🏦', description: 'Chuyển khoản qua Internet Banking', type: 'BANK_TRANSFER' },
              { id: 'cod', name: 'Thanh toán khi nhận hàng', icon: '💵', description: 'Thanh toán bằng tiền mặt khi nhận hàng', type: 'COD' }
            ]} selected={selectedPaymentMethod} onSelect={(m) => setSelectedPaymentMethod(m)} />
            <div className="bg-white rounded-lg p-4 border"><h3 className="font-medium mb-3">Lời Nhắn Cho Người Bán</h3><textarea className="w-full p-3 border rounded" rows={3} /></div>
          </div>

          <div className="lg:col-span-1">
            <OrderSummary items={itemsForDisplay} vouchers={appliedVouchers} shippingFee={shippingFee} paymentMethod={selectedPaymentMethod} onPlaceOrder={handlePlaceOrder} loading={loading} address={selectedAddress} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
