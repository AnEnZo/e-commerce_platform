import { fetchWithAuth } from "@/lib/home/api";
import type { Address } from "@/types/checkout";

const DEFAULT_BASE = process.env.NEXT_PUBLIC_ORDER_BASE_URL || "http://localhost:8080/order-service/api";

function normalizeBase(base?: string) {
  return (base || DEFAULT_BASE).replace(/\/$/, "");
}

const addressService = {
  async getUserAddresses(userId: string, apiBase?: string): Promise<Address[]> {
    const base = normalizeBase(apiBase);
    const res = await fetchWithAuth(`${base}/addresses/user/${encodeURIComponent(userId)}`);
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    return res.json();
  },

  async createAddress(address: Omit<Address, 'id'>, apiBase?: string): Promise<Address> {
    const base = normalizeBase(apiBase);
    const res = await fetchWithAuth(`${base}/addresses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(address),
    });
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    return res.json();
  },

  async setDefaultAddress(userId: string, addressId: string, apiBase?: string): Promise<Address> {
    // No explicit endpoint in backend; emulate by updating address with isDefault=true
    const base = normalizeBase(apiBase);
    const res = await fetchWithAuth(`${base}/addresses/${encodeURIComponent(addressId)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, isDefault: true }),
    });
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    return res.json();
  },
};

export default addressService;