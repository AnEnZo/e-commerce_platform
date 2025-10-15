'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { checkPaymentStatus } from '@/lib/checkout/paymentApi';

export default function PaymentPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState('pending');
  const [error, setError] = useState('');
  const paymentId = searchParams.get('paymentId');

  useEffect(() => {
    if (!paymentId) {
      router.push('/checkout');
      return;
    }

    const checkStatus = async () => {
      try {
        const response = await checkPaymentStatus(paymentId);
        if (response.status === 'SUCCESS') {
          setStatus('success');
          setTimeout(() => router.push('/orders'), 2000);
        } else if (response.status === 'FAILED') {
          setStatus('failed');
          setError(response.message || 'Thanh toán thất bại');
        }
      } catch (error) {
        console.error('Error checking payment status:', error);
      }
    };

    const interval = setInterval(checkStatus, 5000);
    return () => clearInterval(interval);
  }, [paymentId, router]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
        <div className="text-center">
          {status === 'pending' && (
            <>
              <h2 className="text-2xl font-bold mb-4">Quét mã QR để thanh toán</h2>
              <div className="mb-4">
                <img
                  src={`/api/payment/qr/${paymentId}`}
                  alt="Mã QR MoMo"
                  className="mx-auto w-64 h-64"
                />
              </div>
              <p className="text-gray-600">Vui lòng mở ứng dụng MoMo và quét mã QR để hoàn tất thanh toán</p>
              <div className="mt-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
                <p className="mt-2 text-sm text-gray-500">Đang chờ thanh toán...</p>
              </div>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="text-green-500 text-5xl mb-4">✓</div>
              <h2 className="text-2xl font-bold text-green-600 mb-2">Thanh toán thành công!</h2>
              <p className="text-gray-600">Bạn sẽ được chuyển đến trang đơn hàng...</p>
            </>
          )}

          {status === 'failed' && (
            <>
              <div className="text-red-500 text-5xl mb-4">×</div>
              <h2 className="text-2xl font-bold text-red-600 mb-2">Thanh toán thất bại</h2>
              <p className="text-gray-600">{error}</p>
              <button
                onClick={() => router.push('/orders')}
                className="mt-4 bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600"
              >
                Xem đơn hàng
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
