/* ================================================================== */
/* src/components/OrderSummary.tsx */
import React from 'react';
import { Shield } from 'lucide-react';
import { CartItem, Voucher, PaymentMethod, Address } from '../types';

interface Props {
  items: CartItem[];
  vouchers: Voucher[];
  shippingFee: number;
  paymentMethod: PaymentMethod;
  onPlaceOrder: () => void;
  loading: boolean;
  address?: Address | null;
}

const OrderSummary: React.FC<Props> = ({ items, vouchers, shippingFee, paymentMethod, onPlaceOrder, loading, address }) => {
  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const voucherDiscount = vouchers.reduce((sum, voucher) => {
    if (voucher.type === 'PERCENTAGE') {
      const discount = subtotal * voucher.discount / 100;
      return sum + Math.min(discount, voucher.maxDiscount || discount);
    }
    return sum + voucher.discount;
  }, 0);
  const finalShipping = Math.max(0, shippingFee - vouchers.filter(v => v.description.includes('Freeship')).reduce((s, v) => s + v.discount, 0));
  const total = subtotal - voucherDiscount + finalShipping;

  return (
    <div className="bg-white rounded-lg p-4 border sticky top-4">
      <h3 className="font-medium mb-4">Tóm Tắt Đơn Hàng</h3>
      <div className="space-y-3 text-sm">
        <div className="flex justify-between"><span>Tạm tính</span><span>₫{subtotal.toLocaleString()}</span></div>
        {voucherDiscount > 0 && <div className="flex justify-between text-orange-600"><span>Voucher giảm giá</span><span>-₫{voucherDiscount.toLocaleString()}</span></div>}
        <div className="flex justify-between"><span>Phí vận chuyển</span><span>₫{finalShipping.toLocaleString()}</span></div>
        <hr className="my-3" />
        <div className="flex justify-between font-medium text-lg"><span>Tổng cộng</span><span className="text-orange-600">₫{total.toLocaleString()}</span></div>
      </div>

      <button onClick={onPlaceOrder} disabled={loading || items.length === 0 || !address} className="w-full bg-orange-500 text-white py-3 rounded-lg font-medium mt-6 hover:bg-orange-600 disabled:opacity-50">
        {loading ? 'Đang xử lý...' : 'Đặt Hàng'}
      </button>

      <div className="flex items-center justify-center space-x-1 text-xs text-gray-500 mt-3"><Shield className="w-4 h-4" /><span>Bảo mật thanh toán với SSL</span></div>
    </div>
  );
};

export default OrderSummary;
