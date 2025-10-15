// src/lib/checkout/paymentApi.ts
export interface CreatePaymentRequest {
  // dùng orderIds nếu thanh toán nhiều đơn; hoặc orderId cho 1 đơn
  orderId?: string;
  orderIds?: string[];
  amount: string; // gửi dưới dạng string để backend parse BigDecimal
  currency?: string;
  payerMessage?: string;
  payeeNote?: string;
  partnerClientId?: string;
  idempotencyKey?: string;
  payerMsisdn?: string;
}

export interface CreatePaymentResponse {
  paymentId: string;        // UUID (string)
  qrCodeUrl?: string;
  momoReference?: string;
  expiresAt?: string;
  [k: string]: any;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_BASE || 'http://localhost:8080';

export async function initiatePayment(data: CreatePaymentRequest): Promise<CreatePaymentResponse> {
  const res = await fetch(`${API_BASE_URL}/payment-service/api/v1/payments/dynamicQr`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const payload = await res.json().catch(() => ({}));
    throw new Error(payload?.message || `Failed to initiate payment (${res.status})`);
  }

  return res.json();
}

export async function getPaymentDetails(paymentId: string): Promise<any> {
  const res = await fetch(`${API_BASE_URL}/payment-service/api/v1/payments/${encodeURIComponent(paymentId)}`);
  if (!res.ok) throw new Error('Failed to fetch payment details');
  return res.json();
}


export async function checkPaymentStatus(paymentId: string): Promise<{
  status: 'PENDING' | 'SUCCESS' | 'FAILED';
  message?: string;
  orderIds?: string[];
}> {
  const response = await fetch(`${API_BASE_URL}/payment-service/api/v1/payments/${paymentId}/status`);

  if (!response.ok) {
    throw new Error('Failed to check payment status');
  }

  return response.json();
}

export async function updateOrderStatus(orderId: string, status: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/order-service/api/v1/orders/${orderId}/status`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ status }),
  });

  if (!response.ok) {
    throw new Error('Failed to update order status');
  }
}
